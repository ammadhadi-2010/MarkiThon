const sequelize = require('../config/database');
const Product = require('../models/Product');
const RetailBill = require('../models/RetailBill');
const RetailBillItem = require('../models/RetailBillItem');
const WholesaleOrder = require('../models/WholesaleOrder');
const WholesaleOrderItem = require('../models/WholesaleOrderItem');
const { toNum } = require('../utils/profit');
const { logStock } = require('../utils/stockHistory');
const { saleFromLine } = require('../utils/units');
const { asInvoice, productInclude } = require('../utils/invoiceMap');
const { activeShopId, sameShop, foreignProductError } = require('../utils/shopScope');

async function prepareLines(items, t) {
    if (!Array.isArray(items) || !items.length) {
        throw new Error('Add at least one product line.');
    }
    let subTotal = 0;
    const prepared = [];
    for (const line of items) {
        const product = await Product.findByPk(line.productId, { transaction: t });
        if (!product) throw new Error(`Product ${line.productId} was not found.`);
        if (!sameShop(product, await activeShopId())) throw foreignProductError();
        const sale = saleFromLine(line, product);
        if (sale.sold <= 0) throw new Error(`Quantity is invalid for ${product.title}.`);
        prepared.push({ product, ...sale });
        subTotal += sale.total;
    }
    return { prepared, subTotal };
}

async function restock(items, type, ref, ShopId, t) {
    for (const item of items || []) {
        const product = await Product.findByPk(item.ProductId, { transaction: t });
        if (!product || !sameShop(product, await activeShopId())) continue;
        const qty = toNum(item.quantityMeters);
        product.stockMeters = toNum(product.stockMeters) + qty;
        await product.save({ transaction: t });
        await logStock({
            productId: product.id,
            type,
            quantity: qty,
            balance: product.stockMeters,
            ref,
            ShopId: await activeShopId()
        }, t);
    }
}

async function deduct(prepared, type, ref, ShopId, t) {
    for (const line of prepared) {
        if (toNum(line.product.stockMeters) < line.meters) {
            throw new Error(`${line.product.title} has insufficient stock. Available: ${line.product.stockMeters} Meter`);
        }
        line.product.stockMeters = toNum(line.product.stockMeters) - line.meters;
        await line.product.save({ transaction: t });
        await logStock({
            productId: line.product.id,
            type,
            quantity: -line.meters,
            balance: line.product.stockMeters,
            ref,
            ShopId: await activeShopId()
        }, t);
    }
}

function moneyParts(subTotal, discount, discountType) {
    const value = toNum(discount);
    const cut = discountType === 'percent' ? subTotal * (value / 100) : value;
    const grandTotal = Math.max(subTotal - cut, 0);
    return { discountValue: cut, grandTotal };
}

exports.updateRetail = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const bill = await RetailBill.findByPk(req.params.id, {
            include: [{ model: RetailBillItem, as: 'items', include: [productInclude] }],
            transaction: t
        });
        if (!bill) {
            await t.rollback();
            return res.status(404).json({ message: 'Bill not found.' });
        }
        const { customerName, customerPhone, items, discount, discountType, paymentMethod, notes, ShopId } = req.body;
        await restock(bill.items, 'Retail Sale', bill.billNumber, ShopId || bill.ShopId || 1, t);
        const { prepared, subTotal } = await prepareLines(items, t);
        const { discountValue, grandTotal } = moneyParts(subTotal, discount, discountType);
        await deduct(prepared, 'Retail Sale', bill.billNumber, ShopId || bill.ShopId || 1, t);
        await RetailBillItem.destroy({ where: { RetailBillId: bill.id }, transaction: t });
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
        }
        await bill.update({
            customerName: customerName || bill.customerName,
            customerPhone,
            subTotal,
            discount: discountValue,
            grandTotal,
            paymentMethod: paymentMethod || bill.paymentMethod,
            notes
        }, { transaction: t });
        await t.commit();
        res.status(200).json({ message: 'Retail bill updated.', bill: asInvoice(await bill.reload({ include: [{ model: RetailBillItem, as: 'items', include: [productInclude] }] }), 'retail') });
    } catch (error) {
        await t.rollback();
        const status = error.status || 500;
        res.status(status).json({ message: error.message || 'Error updating bill' });
    }
};

exports.updateWholesale = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const order = await WholesaleOrder.findByPk(req.params.id, {
            include: [{ model: WholesaleOrderItem, as: 'items', include: [productInclude] }],
            transaction: t
        });
        if (!order) {
            await t.rollback();
            return res.status(404).json({ message: 'Order not found.' });
        }
        const { customerName, customerPhone, items, discount, discountType, paymentMethod, notes, ShopId } = req.body;
        if (!customerName) {
            await t.rollback();
            return res.status(400).json({ message: 'Customer name is required.' });
        }
        await restock(order.items, 'Wholesale Sale', order.orderNumber, ShopId || order.ShopId || 1, t);
        const { prepared, subTotal } = await prepareLines(items, t);
        const { discountValue, grandTotal } = moneyParts(subTotal, discount, discountType);
        await deduct(prepared, 'Wholesale Sale', order.orderNumber, ShopId || order.ShopId || 1, t);
        await WholesaleOrderItem.destroy({ where: { WholesaleOrderId: order.id }, transaction: t });
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
        }
        await order.update({
            customerName,
            customerPhone,
            subTotal,
            discount: discountValue,
            grandTotal,
            paymentMethod: paymentMethod || order.paymentMethod,
            notes
        }, { transaction: t });
        await t.commit();
        res.status(200).json({ message: 'Wholesale order updated.', order });
    } catch (error) {
        await t.rollback();
        const status = error.status || 500;
        res.status(status).json({ message: error.message || 'Error updating order' });
    }
};
