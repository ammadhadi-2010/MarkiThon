const { toNum } = require('./profit');

function parseVoucherVariants(raw) {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') return [];
    try {
        const rows = JSON.parse(raw || '[]');
        return Array.isArray(rows) ? rows : [];
    } catch (error) {
        return [];
    }
}

function payStatus(total, paid) {
    const bill = toNum(total);
    const got = toNum(paid);
    if (got <= 0) return 'Unpaid';
    if (got + 0.009 < bill) return 'Partial';
    return 'Paid';
}

function voucherFields(result, body) {
    const variants = (result.posted || []).map((r) => ({
        color: r.color,
        sku: r.sku,
        thaan: r.thaan,
        perThaan: r.per,
        qty: r.qty,
        meters: r.meters,
        weight: r.weight,
        weightUnit: r.weightUnit,
        size: r.size,
        dimensions: r.dimensions
    }));
    return {
        billNo: result.billNo,
        receivedAt: result.receivedAt,
        supplierId: result.supplier.id,
        supplierName: result.supplier.name,
        productId: result.product.id,
        productTitle: result.product.title,
        stockUnit: result.unit,
        sellUnit: body.sellUnit || result.product.sellUnit || 'Gaz',
        purchasePrice: result.rate,
        wholesalePrice: toNum(body.wholesalePrice),
        retailPrice: toNum(body.retailPrice),
        quantity: result.qty,
        total: result.total,
        amountPaid: result.paid,
        paymentMode: result.mode,
        payMethod: body.payMethod || 'Cash',
        variants: JSON.stringify(variants),
        ShopId: result.product.ShopId || 1
    };
}

function serializeVoucher(row) {
    try {
        const json = row && row.toJSON ? row.toJSON() : (row || {});
        const variants = parseVoucherVariants(json.variants);
        return {
            id: json.id,
            date: json.receivedAt,
            billNo: json.billNo,
            supplierId: json.supplierId,
            supplierName: json.supplierName || '-',
            productId: json.productId,
            productTitle: json.productTitle || '-',
            colors: variants.map((v) => v && v.color).filter(Boolean).join(', ') || '-',
            qty: json.quantity,
            unit: json.stockUnit || 'Meter',
            total: json.total,
            amountPaid: json.amountPaid,
            status: payStatus(json.total, json.amountPaid),
            paymentMode: json.paymentMode,
            payMethod: json.payMethod,
            purchasePrice: json.purchasePrice,
            wholesalePrice: json.wholesalePrice,
            retailPrice: json.retailPrice,
            sellUnit: json.sellUnit,
            variants
        };
    } catch (error) {
        return {
            id: row && row.id,
            date: null,
            billNo: '-',
            supplierName: '-',
            productTitle: '-',
            colors: '-',
            qty: 0,
            unit: 'Meter',
            total: 0,
            amountPaid: 0,
            status: 'Unpaid',
            variants: []
        };
    }
}

function invoiceFromVoucher(v) {
    const variants = v.variants || [];
    const rate = toNum(v.purchasePrice);
    return {
        number: v.billNo,
        customerName: v.supplierName,
        customerPhone: '',
        paymentMethod: v.status === 'Unpaid' ? 'Unpaid (Credit)' : (v.payMethod || 'Cash'),
        subTotal: v.total,
        discount: 0,
        grandTotal: v.total,
        createdAt: v.date,
        items: variants.map((r) => ({
            title: `${v.productTitle} · ${r.color}`,
            quantitySold: r.qty,
            sellUnit: v.unit,
            quantityMeters: r.meters,
            rate,
            total: toNum(r.qty) * rate
        })),
        stickers: {
            title: v.productTitle,
            sku: '',
            billNo: v.billNo,
            price: v.retailPrice,
            variants
        }
    };
}

module.exports = {
    parseVoucherVariants,
    payStatus,
    voucherFields,
    serializeVoucher,
    invoiceFromVoucher
};
