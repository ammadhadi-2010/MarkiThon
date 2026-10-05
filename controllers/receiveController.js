const sequelize = require('../config/database');
const StockVoucher = require('../models/StockVoucher');
const { withProductMargins } = require('../utils/profit');
const { metersToGaz, metersPerSellUnit } = require('../utils/units');
const { voucherFields } = require('../utils/stockVoucher');
const { applyStockReceive } = require('./receiveApply');

function receivePayload(result, body) {
    const due = result.total - result.paid;
    const meters = result.posted.reduce((s, r) => s + r.meters, 0);
    return {
        message: due > 0
            ? `Stock receipt saved. Remaining Rs. ${due.toLocaleString()} is due in Supplier Ledger.`
            : 'Stock receipt saved. Color variants and QR batches are ready.',
        product: withProductMargins(result.product),
        variants: result.posted.map((r) => ({
            color: r.color, sku: r.sku, qty: r.qty, thaan: r.thaan, meters: r.meters
        })),
        invoice: {
            number: result.billNo,
            customerName: result.supplier.name,
            customerPhone: result.supplier.phone || '',
            paymentMethod: result.mode === 'credit' ? 'Unpaid (Credit)' : (body.payMethod || 'Cash'),
            subTotal: result.total,
            discount: 0,
            grandTotal: result.total,
            createdAt: result.receivedAt,
            items: result.posted.map((r) => ({
                title: `${result.product.title} · ${r.color}`,
                quantitySold: r.qty,
                sellUnit: result.unit,
                quantityMeters: r.meters,
                rate: result.rate,
                total: r.qty * result.rate
            }))
        },
        conversion: {
            meters,
            gaz: metersToGaz(meters, result.product, result.unit),
            factor: metersPerSellUnit(result.product),
            balanceDue: due
        }
    };
}

exports.receiveStock = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const body = req.body || {};
        const result = await applyStockReceive(body, t);
        const voucher = await StockVoucher.create(voucherFields(result, body), { transaction: t });
        await t.commit();
        res.status(201).json({
            ...receivePayload(result, body),
            voucher: { id: voucher.id, billNo: voucher.billNo }
        });
    } catch (error) {
        await t.rollback();
        const status = error.status || 500;
        res.status(status).json({
            message: status === 500 ? 'Error saving stock receipt' : error.message,
            error: error.message
        });
    }
};
