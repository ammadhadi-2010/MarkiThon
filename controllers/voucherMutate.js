const sequelize = require('../config/database');
const StockVoucher = require('../models/StockVoucher');
const { withProductMargins } = require('../utils/profit');
const { metersToGaz, metersPerSellUnit } = require('../utils/units');
const { voucherFields, serializeVoucher } = require('../utils/stockVoucher');
const { revertVoucherStock } = require('../utils/voucherRevert');
const { applyStockReceive } = require('./receiveApply');

exports.updateVoucher = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const row = await StockVoucher.findByPk(req.params.id, { transaction: t });
        if (!row) {
            await t.rollback();
            return res.status(404).json({ message: 'Voucher was not found.' });
        }
        await revertVoucherStock(row.billNo, t);
        const body = req.body || {};
        const result = await applyStockReceive(body, t);
        await row.update(voucherFields(result, body), { transaction: t });
        await t.commit();
        const due = result.total - result.paid;
        const meters = result.posted.reduce((s, r) => s + r.meters, 0);
        res.json({
            message: 'Stock voucher updated.',
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
            },
            voucher: serializeVoucher(row)
        });
    } catch (error) {
        await t.rollback();
        const status = error.status || 500;
        res.status(status).json({
            message: status === 500 ? 'Error updating voucher' : error.message,
            error: error.message
        });
    }
};

exports.deleteVoucher = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const row = await StockVoucher.findByPk(req.params.id, { transaction: t });
        if (!row) {
            await t.rollback();
            return res.status(404).json({ message: 'Voucher was not found.' });
        }
        await revertVoucherStock(row.billNo, t);
        await row.destroy({ transaction: t });
        await t.commit();
        res.json({ message: 'Stock voucher deleted. Inventory and ledger were reverted.' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Error deleting voucher', error: error.message });
    }
};
