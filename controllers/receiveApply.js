const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const { toNum } = require('../utils/profit');
const { logSupplierPurchase, logSupplierPayment } = require('../utils/supplierPurchase');
const { parseRecvVariants, receiveColorRow } = require('./receiveVariants');
const { activeShopId, sameShop, foreignProductError } = require('../utils/shopScope');

function pickDate(body) {
    const receivedAt = new Date();
    if (!body.receivedAt) return receivedAt;
    const picked = new Date(body.receivedAt);
    if (Number.isNaN(picked.getTime())) return receivedAt;
    picked.setHours(receivedAt.getHours(), receivedAt.getMinutes(), receivedAt.getSeconds());
    return picked;
}

function paidNow(mode, amount, total) {
    if (mode === 'credit') return 0;
    if (mode === 'partial') return Math.min(Math.max(toNum(amount), 0), total);
    return total;
}

async function applyStockReceive(body, t) {
    const product = await Product.findByPk(body.productId, { transaction: t });
    if (!product) {
        const err = new Error('Master product was not found.');
        err.status = 404;
        throw err;
    }
    const shopId = await activeShopId();
    if (!sameShop(product, shopId)) throw foreignProductError();
    const variants = parseRecvVariants(body);
    const qty = variants.reduce((s, v) => s + v.qty, 0);
    if (qty <= 0) {
        const err = new Error('Add at least one color with quantity.');
        err.status = 400;
        throw err;
    }
    const supplierId = Number(body.supplierId);
    const supplier = supplierId ? await Supplier.findByPk(supplierId, { transaction: t }) : null;
    if (!supplier) {
        const err = new Error('Select a supplier for this receipt.');
        err.status = 400;
        throw err;
    }
    const rate = toNum(body.purchasePrice);
    if (rate < 0) {
        const err = new Error('Purchase rate is invalid.');
        err.status = 400;
        throw err;
    }
    const unit = body.stockUnit || 'Meter';
    const sellUnit = body.sellUnit || product.sellUnit;
    const billNo = String(body.billNo || '').trim() || `GRN-${Date.now().toString().slice(-6)}`;
    const receivedAt = pickDate(body);
    const computed = qty * rate;
    const rounded = body.purchaseTotal === undefined || body.purchaseTotal === ''
        ? computed
        : toNum(body.purchaseTotal);
    const total = rounded >= 0 ? rounded : computed;
    const mode = String(body.paymentMode || 'full');
    const paid = paidNow(mode, body.amountPaid, total);
    const posted = [];
    for (const variant of variants) {
        posted.push(await receiveColorRow({
            base: product,
            variant,
            unit,
            sellUnit,
            rate,
            wholesale: body.wholesalePrice,
            retail: body.retailPrice,
            minRate: body.minSellingRate,
            supplierId,
            billNo,
            receivedAt,
            ShopId: shopId,
            t
        }));
    }
    product.purchasePrice = rate;
    if (body.wholesalePrice !== undefined && body.wholesalePrice !== '') {
        product.wholesalePrice = toNum(body.wholesalePrice);
    }
    if (body.retailPrice !== undefined && body.retailPrice !== '') {
        product.retailPrice = toNum(body.retailPrice);
    }
    if (body.minSellingRate !== undefined) {
        product.minSellingRate = toNum(body.minSellingRate);
    }
    product.supplierId = supplierId;
    product.stockUnit = unit;
    if (sellUnit) product.sellUnit = sellUnit;
    await product.save({ transaction: t });
    const colors = posted.map((r) => r.color).join(', ');
    await logSupplierPurchase({
        supplierId,
        qty,
        unitPrice: rate,
        amount: total,
        ref: billNo,
        brand: product.brand,
        productId: product.id,
        note: `Purchase ${billNo}: ${qty} ${unit} ${product.title} [${colors}]`,
        invoiceImage: body.invoiceImage,
        entryDate: receivedAt,
        transaction: t
    });
    await logSupplierPayment({
        supplierId,
        amount: paid,
        method: body.payMethod,
        ref: billNo,
        note: paid < total
            ? `Installment 1 on ${billNo} (remaining Rs. ${(total - paid).toFixed(0)})`
            : `Payment on ${billNo}`,
        paymentProof: mode === 'credit' ? '' : body.paymentProof,
        entryDate: receivedAt,
        transaction: t
    });
    return {
        product, supplier, posted, qty, unit, rate, total, paid, mode, billNo, receivedAt
    };
}

module.exports = { applyStockReceive };
