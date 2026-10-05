const StockHistory = require('../models/StockHistory');

async function logStock(entry, transaction) {
    const quantity = Number(entry.quantityChange ?? entry.quantity) || 0;
    const productKey = entry.ProductId || entry.productId;
    const reference = entry.referenceNumber || entry.ref || null;

    return StockHistory.create({
        date: entry.date || new Date(),
        ProductId: productKey,
        productId: productKey,
        type: entry.type,
        quantityChange: quantity,
        quantity,
        balance: entry.balance,
        referenceNumber: reference,
        ref: reference,
        ShopId: entry.ShopId || 1
    }, { transaction });
}

function serializeLog(row) {
    const json = row.toJSON ? row.toJSON() : row;
    return {
        id: json.id,
        date: json.date || json.createdAt,
        ProductId: json.ProductId || json.productId,
        type: json.type,
        quantityChange: json.quantityChange ?? json.quantity,
        balance: json.balance,
        referenceNumber: json.referenceNumber || json.ref
    };
}

module.exports = { logStock, serializeLog };
