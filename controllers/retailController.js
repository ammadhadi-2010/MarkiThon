const sequelize = require('../config/database');
const Product = require('../models/Product');
const RetailBill = require('../models/RetailBill');
const RetailBillItem = require('../models/RetailBillItem');
const RetailCustomer = require('../models/RetailCustomer');
const { toNum } = require('../utils/profit');
const { saleFromLine } = require('../utils/units');
const { logStock } = require('../utils/stockHistory');
const { recordSaleLedger } = require('./ledgerController');
const { asInvoice } = require('../utils/invoiceMap');
const { loadRetail } = require('./billController');
const { activeShopId, sameShop } = require('../utils/shopScope');

const { packCustomer, customerPayload } = require('../utils/customerPack');

const PAY_METHODS = ['Cash', 'JazzCash', 'EasyPaisa', 'Bank Transfer'];

function discountAmount(subTotal, discount, discountType) {
    const value = toNum(discount);
    return discountType === 'percent' ? subTotal * (value / 100) : value;
}

exports.addCustomer = async (req, res) => {
    try {
        const data = customerPayload(req);
        if (!data.name) {
            return res.status(400).json({ message: 'Customer name is required.' });
        }
        const customer = await RetailCustomer.create(data);
        res.status(201).json({ message: 'Customer saved.', customer: packCustomer(customer) });
    } catch (error) {
        res.status(500).json({ message: 'Error saving customer', error: error.message });
    }
};

exports.listCustomers = async (req, res) => {
    try {
        const customers = await RetailCustomer.findAll({ order: [['createdAt', 'DESC']] });
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};

exports.createBill = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { customerName, customerPhone, items, discount, discountType, paymentMethod, notes } = req.body;
        const shopId = await activeShopId();
        if (!Array.isArray(items) || !items.length) {
            await t.rollback();
            return res.status(400).json({ message: 'Add at least one product line.' });
        }

        let subTotal = 0;
        const prepared = [];
        for (const line of items) {
            const product = await Product.findByPk(line.productId, { transaction: t });
            if (!product) {
                await t.rollback();
                return res.status(404).json({ message: `Product ${line.productId} was not found.` });
            }
            if (!sameShop(product, shopId)) {
                await t.rollback();
                return res.status(403).json({ message: 'You can only bill products from this shop.' });
            }
            const sale = saleFromLine(line, product);
            if (sale.sold <= 0) {
                await t.rollback();
                return res.status(400).json({ message: `Quantity is invalid for ${product.title}.` });
            }
            if (product.stockMeters < sale.meters) {
                await t.rollback();
                return res.status(400).json({
                    message: `${product.title} has insufficient stock. Available: ${product.stockMeters} Meter`
                });
            }
            subTotal += sale.total;
            prepared.push({ product, ...sale });
        }

        const discountValue = discountAmount(subTotal, discount, discountType);
        const grandTotal = Math.max(subTotal - discountValue, 0);
        const count = await RetailBill.count({ transaction: t });
        const billNumber = `RT-${String(count + 1).padStart(4, '0')}`;
        const method = PAY_METHODS.includes(paymentMethod) ? paymentMethod : 'Cash';

        const bill = await RetailBill.create({
            billNumber,
            customerName: customerName || 'Walk-in Customer',
            customerPhone,
            subTotal,
            discount: discountValue,
            grandTotal,
            paymentMethod: method,
            notes,
            ShopId: shopId
        }, { transaction: t });

        for (const line of prepared) {
            await RetailBillItem.create({
                RetailBillId: bill.id,
                ProductId: line.product.id,
                quantityMeters: line.meters,
                quantitySold: line.sold,
                sellUnit: line.sellUnit,
                rate: line.rate,
                total: line.total
            }, { transaction: t });
            line.product.stockMeters = toNum(line.product.stockMeters) - line.meters;
            await line.product.save({ transaction: t });
            await logStock({
                productId: line.product.id,
                type: 'Retail Sale',
                quantity: -line.meters,
                balance: line.product.stockMeters,
                ref: billNumber,
                ShopId: shopId
            }, t);
        }

        await t.commit();
        await recordSaleLedger({
            customerName: bill.customerName,
            amount: grandTotal,
            description: `Retail ${billNumber}`,
            settled: true
        });
        res.status(201).json({ message: 'Retail bill saved.', bill });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Error creating retail bill', error: error.message });
    }
};

exports.listBills = async (req, res) => {
    try {
        const bills = await RetailBill.findAll({
            where: { ShopId: await activeShopId() },
            include: [{ model: RetailBillItem, as: 'items' }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(bills);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching retail bills', error: error.message });
    }
};

exports.getBill = async (req, res) => {
    try {
        const bill = await loadRetail(req.params.id);
        if (!bill || !sameShop(bill, await activeShopId())) {
            return res.status(404).json({ message: 'Bill not found.' });
        }
        res.status(200).json(asInvoice(bill, 'retail'));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bill', error: error.message });
    }
};

exports.deleteBill = async (req, res) => {
    try {
        const bill = await RetailBill.findByPk(req.params.id);
        if (!bill || !sameShop(bill, await activeShopId())) {
            return res.status(404).json({ message: 'Bill not found.' });
        }
        await RetailBillItem.destroy({ where: { RetailBillId: bill.id } });
        await bill.destroy();
        res.status(200).json({ message: 'Bill cancelled.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting bill', error: error.message });
    }
};
