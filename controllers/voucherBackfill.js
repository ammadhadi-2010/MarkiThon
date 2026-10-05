const { Op } = require('sequelize');
const StockVoucher = require('../models/StockVoucher');
const StockHistory = require('../models/StockHistory');
const SupplierLedger = require('../models/SupplierLedger');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const { toNum } = require('../utils/profit');

async function existingBillNos() {
    const rows = await StockVoucher.findAll({ attributes: ['billNo'] });
    return new Set(rows.map((v) => String(v.billNo)));
}

function variantsFromLogs(logs, products) {
    return (logs || []).map((log) => {
        const pid = log.ProductId || log.productId;
        const child = pid ? products.get(String(pid)) : null;
        const qty = toNum(log.quantityChange != null ? log.quantityChange : log.quantity);
        return {
            color: child && child.color ? child.color : 'Default',
            sku: child && child.sku,
            thaan: 1,
            qty,
            meters: qty
        };
    });
}

async function backfillOne(row, have) {
    const billNo = String(row.ref || '').trim();
    if (!billNo || have.has(billNo) || !row.supplierId) return;
    const logs = await StockHistory.findAll({
        where: {
            type: 'Purchase',
            [Op.or]: [{ referenceNumber: billNo }, { ref: billNo }]
        }
    }).catch(() => []);
    const pays = await SupplierLedger.sum('amount', {
        where: { ref: billNo, type: 'PAYMENT' }
    }).catch(() => 0);
    const ids = [...new Set((logs || []).map((l) => l.ProductId || l.productId).filter(Boolean))];
    const found = ids.length ? await Product.findAll({ where: { id: ids } }) : [];
    const products = new Map(found.map((p) => [String(p.id), p]));
    const variants = variantsFromLogs(logs, products);
    const productId = row.productId || (logs[0] && (logs[0].ProductId || logs[0].productId));
    if (!productId) return;
    const base = await Product.findByPk(row.productId || productId);
    const supplier = await Supplier.findByPk(row.supplierId);
    const qty = variants.reduce((s, v) => s + v.qty, 0) || 1;
    await StockVoucher.create({
        billNo,
        receivedAt: row.entryDate || row.createdAt || new Date(),
        supplierId: row.supplierId,
        supplierName: supplier ? supplier.name : '-',
        productId,
        productTitle: base ? base.title : (row.note || 'Stock purchase'),
        stockUnit: base ? base.stockUnit : 'Meter',
        sellUnit: base ? base.sellUnit : 'Gaz',
        purchasePrice: qty ? toNum(row.amount) / qty : 0,
        quantity: qty,
        total: toNum(row.amount),
        amountPaid: toNum(pays),
        paymentMode: toNum(pays) <= 0 ? 'credit' : (toNum(pays) < toNum(row.amount) ? 'partial' : 'full'),
        variants: JSON.stringify(variants)
    });
    have.add(billNo);
}

async function backfillVouchers() {
    const purchases = await SupplierLedger.findAll({
        where: { type: 'PURCHASE' },
        order: [['entryDate', 'DESC']]
    });
    const have = await existingBillNos();
    for (const row of purchases || []) {
        try {
            await backfillOne(row, have);
        } catch (error) {
            console.error('Voucher backfill skipped for ref', row && row.ref, error.message);
        }
    }
}

module.exports = { backfillVouchers };
