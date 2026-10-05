const sequelize = require('../config/database');
const Product = require('../models/Product');
const WholesaleOrder = require('../models/WholesaleOrder');
const WholesaleOrderItem = require('../models/WholesaleOrderItem');
const { toNum } = require('../utils/profit');
const { saleFromLine } = require('../utils/units');
const { logStock } = require('../utils/stockHistory');
const { asInvoice } = require('../utils/invoiceMap');
const { loadWholesale } = require('./billController');
const { recordSale } = require('./wholesalerLedgerController');
const { activeShopId, sameShop } = require('../utils/shopScope');

function discountAmount(subTotal, discount, discountType) {
    const value = toNum(discount);
    if (discountType === 'percent') return subTotal * (value / 100);
    return value;
}

async function nextOrderNumber() {
    const count = await WholesaleOrder.count();
    return `WS-${String(count + 1).padStart(4, '0')}`;
}

exports.createOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { customerName, customerPhone, items, discount, discountType, paymentMethod, notes, wholesalerId } = req.body;
        const shopId = await activeShopId();
        if (!customerName) {
            await t.rollback();
            return res.status(400).json({ message: 'Wholesaler name is required.' });
        }
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
        const orderNumber = await nextOrderNumber();
        const methods = ['Cash', 'Bank Transfer', 'JazzCash', 'EasyPaisa'];
        const method = methods.includes(paymentMethod) ? paymentMethod : 'Cash';

        const order = await WholesaleOrder.create({
            orderNumber,
            customerName,
            customerPhone,
            subTotal,
            discount: discountValue,
            grandTotal,
            paymentMethod: method,
            notes,
            WholesalerId: wholesalerId || null,
            ShopId: shopId
        }, { transaction: t });

        for (const line of prepared) {
            await WholesaleOrderItem.create({
                WholesaleOrderId: order.id,
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
                type: 'Wholesale Sale',
                quantity: -line.meters,
                balance: line.product.stockMeters,
                ref: orderNumber,
                ShopId: shopId
            }, t);
        }

        await t.commit();
        await recordSale({
            wholesalerId,
            amount: grandTotal,
            ref: orderNumber,
            paid: method === 'Cash'
        });
        res.status(201).json({ message: 'Wholesale order saved.', order });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Error creating wholesale order', error: error.message });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const order = await loadWholesale(req.params.id);
        if (!order || !sameShop(order, await activeShopId())) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.status(200).json(asInvoice(order, 'wholesale'));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wholesale order', error: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await WholesaleOrder.findAll({
            where: { ShopId: await activeShopId() },
            include: [{ model: WholesaleOrderItem, as: 'items' }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wholesale orders', error: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await WholesaleOrder.findByPk(req.params.id);
        if (!order || !sameShop(order, await activeShopId())) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        await WholesaleOrderItem.destroy({ where: { WholesaleOrderId: order.id } });
        await order.destroy();
        res.status(200).json({ message: 'Order deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
};
