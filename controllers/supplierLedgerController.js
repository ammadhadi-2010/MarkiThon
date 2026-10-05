const { Op } = require('sequelize');
const Supplier = require('../models/Supplier');
const SupplierLedger = require('../models/SupplierLedger');
const StockVoucher = require('../models/StockVoucher');

const PAY_METHODS = ['Cash', 'Bank Transfer', 'JazzCash', 'EasyPaisa', 'Bank'];

function inRange(row, from, to) {
    const t = new Date(row.entryDate || row.createdAt).getTime();
    if (from && t < new Date(from).setHours(0, 0, 0, 0)) return false;
    if (to && t > new Date(to).setHours(23, 59, 59, 999)) return false;
    return true;
}

function summarize(entries) {
    const purchases = entries.filter((e) => e.type === 'PURCHASE');
    const payments = entries.filter((e) => e.type === 'PAYMENT');
    const totalPurchases = purchases.reduce((s, e) => s + Number(e.amount || 0), 0);
    const totalPaid = payments.reduce((s, e) => s + Number(e.amount || 0), 0);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const paidThisMonth = payments
        .filter((e) => new Date(e.entryDate || e.createdAt) >= monthStart)
        .reduce((s, e) => s + Number(e.amount || 0), 0);
    return {
        totalPurchases,
        totalPaid,
        payable: totalPurchases - totalPaid,
        paidThisMonth,
        refs: purchases.map((e) => e.ref).filter(Boolean),
        brands: [...new Set(purchases.map((e) => e.brand).filter(Boolean))]
    };
}

exports.withTotals = async function withTotals(suppliers, from, to) {
    const ids = suppliers.map((s) => s.id);
    const entries = ids.length
        ? await SupplierLedger.findAll({ where: { supplierId: { [Op.in]: ids } }, order: [['entryDate', 'DESC']] })
        : [];
    return suppliers.map((s) => {
        const json = s.toJSON ? s.toJSON() : s;
        const rows = entries.filter((e) => Number(e.supplierId) === Number(json.id) && inRange(e, from, to));
        return { ...json, ...summarize(rows) };
    });
};

exports.listLedger = async (req, res) => {
    try {
        const rows = await SupplierLedger.findAll({
            where: { supplierId: req.params.id },
            order: [['entryDate', 'DESC']]
        });
        res.status(200).json(rows.map((row) => {
            const json = row.toJSON ? row.toJSON() : row;
            return {
                id: json.id,
                type: json.type,
                amount: json.amount,
                method: json.method,
                note: json.note,
                ref: json.ref,
                brand: json.brand,
                entryDate: json.entryDate,
                createdAt: json.createdAt,
                txnId: json.txnId || '',
                hasInvoice: Boolean(json.invoiceImage),
                hasSlip: Boolean(json.paymentProof)
            };
        }));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching supplier ledger', error: error.message });
    }
};

exports.addPayment = async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found.' });
        const amount = Number(req.body.amount);
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Payment amount must be greater than zero.' });
        }
        const ref = String(req.body.ref || '').trim();
        if (!ref) {
            return res.status(400).json({ message: 'Select a bill number for this installment.' });
        }
        const related = await SupplierLedger.findAll({ where: { supplierId: supplier.id, ref } });
        const purchase = related.filter((e) => e.type === 'PURCHASE')
            .reduce((s, e) => s + Number(e.amount || 0), 0);
        const paid = related.filter((e) => e.type === 'PAYMENT')
            .reduce((s, e) => s + Number(e.amount || 0), 0);
        const due = purchase - paid;
        if (due <= 0) {
            return res.status(400).json({ message: 'This bill has no remaining balance.' });
        }
        if (amount - due > 0.009) {
            return res.status(400).json({
                message: `Installment cannot exceed remaining Rs. ${due.toLocaleString()}.`
            });
        }
        const slip = String(req.body.paymentProof || '').trim();
        const method = PAY_METHODS.includes(String(req.body.method || '').trim())
            ? String(req.body.method).trim()
            : 'Cash';
        const txnId = String(req.body.txnId || '').trim();
        const row = await SupplierLedger.create({
            supplierId: supplier.id,
            type: 'PAYMENT',
            amount,
            method,
            txnId: txnId || null,
            note: req.body.note || `Installment on ${ref}`,
            ref,
            paymentProof: slip ? slip.slice(0, 400000) : null,
            entryDate: req.body.entryDate ? new Date(req.body.entryDate) : new Date(),
            ShopId: 1
        });
        const paidNow = paid + amount;
        try {
            const voucher = await StockVoucher.findOne({ where: { billNo: ref } });
            if (voucher) {
                await voucher.update({
                    amountPaid: paidNow,
                    paymentMode: paidNow + 0.009 >= purchase ? 'full' : 'partial'
                });
            }
        } catch (error) {
            console.error('Stock voucher balance sync skipped', error.message);
        }
        const left = due - amount;
        res.status(201).json({
            message: left > 0
                ? `Installment recorded. Remaining on ${ref}: Rs. ${left.toLocaleString()}.`
                : `Bill ${ref} is fully paid.`,
            entry: {
                id: row.id,
                type: row.type,
                amount: row.amount,
                ref: row.ref,
                hasSlip: Boolean(row.paymentProof)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error recording payment', error: error.message });
    }
};
