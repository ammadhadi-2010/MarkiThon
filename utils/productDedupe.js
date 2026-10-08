const { Op } = require('sequelize');
const Product = require('../models/Product');

function normKey(value) {
    return String(value || '').trim().toLowerCase();
}

function productDedupeKey(row) {
    const id = row && (row.id || row.product_id || row.productId);
    if (id != null && String(id).trim()) return 'id:' + String(id).trim();
    const sku = normKey(row && row.sku);
    if (sku) return 'sku:' + sku;
    const barcode = normKey(row && row.barcode);
    if (barcode) return 'barcode:' + barcode;
    const title = normKey((row && (row.storeTitle || row.title || row.name)) || '');
    if (title) return 'title:' + title;
    return '';
}

function dedupeProducts(list) {
    const seen = new Set();
    const out = [];
    (Array.isArray(list) ? list : []).forEach((row) => {
        const key = productDedupeKey(row);
        if (!key || seen.has(key)) return;
        seen.add(key);
        out.push(row);
    });
    return out;
}

async function findShopProductConflict(shopId, fields, excludeId) {
    const or = [];
    const sku = String(fields.sku || '').trim();
    const barcode = String(fields.barcode || '').trim();
    const title = String(fields.title || '').trim();
    if (sku) or.push({ sku });
    if (barcode) or.push({ barcode });
    if (title) or.push({ title: { [Op.iLike]: title } });
    if (!or.length) return null;
    const where = { ShopId: shopId, [Op.or]: or };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    return Product.findOne({ where, order: [['updatedAt', 'DESC']] });
}

module.exports = { dedupeProducts, findShopProductConflict, productDedupeKey, normKey };
