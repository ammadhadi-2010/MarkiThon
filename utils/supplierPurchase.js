const SupplierLedger = require('../models/SupplierLedger');

function proofUrl(value) {
    const text = String(value || '').trim();
    if (!text) return null;
    return text.length > 400000 ? text.slice(0, 400000) : text;
}

async function logSupplierPurchase(entry) {
    const amount = entry.amount != null && entry.amount !== ''
        ? Number(entry.amount)
        : Number(entry.qty || 0) * Number(entry.unitPrice || 0);
    if (!entry.supplierId || amount <= 0) return null;
    return SupplierLedger.create({
        supplierId: Number(entry.supplierId),
        type: 'PURCHASE',
        amount,
        method: null,
        note: entry.note || 'Stock purchase',
        invoiceImage: proofUrl(entry.invoiceImage),
        paymentProof: proofUrl(entry.paymentProof),
        ref: entry.ref || null,
        brand: entry.brand || null,
        productId: entry.productId || null,
        entryDate: entry.entryDate ? new Date(entry.entryDate) : new Date(),
        ShopId: 1
    }, entry.transaction ? { transaction: entry.transaction } : {});
}

async function logSupplierPayment(entry) {
    const paid = Number(entry.amount || 0);
    if (!entry.supplierId || paid <= 0) return null;
    return SupplierLedger.create({
        supplierId: Number(entry.supplierId),
        type: 'PAYMENT',
        amount: paid,
        method: entry.method === 'Bank' ? 'Bank' : 'Cash',
        note: entry.note || 'Purchase payment',
        paymentProof: proofUrl(entry.paymentProof),
        ref: entry.ref || null,
        entryDate: entry.entryDate ? new Date(entry.entryDate) : new Date(),
        ShopId: 1
    }, entry.transaction ? { transaction: entry.transaction } : {});
}

module.exports = { logSupplierPurchase, logSupplierPayment };
