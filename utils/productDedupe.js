const { Op } = require('sequelize');
const Product = require('../models/Product');

function normKey(value) {
    return String(value || '').trim().toLowerCase();
}

function productDedupeKey(row) {
    const shop = normKey((row && (row.shopName || row.ShopId || row.shopId)) || '');
    const title = normKey((row && (row.storeTitle || row.title || row.name)) || '');
    if (title) return (shop ? shop + '::' : '') + title;
    const sku = normKey(row && row.sku);
    if (sku) return 'sku:' + sku;
    const id = row && (row.id || row.product_id || row.productId);
    if (id != null && String(id).trim()) return 'id:' + String(id).trim();
    return '';
}

function dedupeProducts(list) {
    const map = new Map();
    (Array.isArray(list) ? list : []).forEach((row) => {
        const title = String((row && (row.storeTitle || row.title || row.name)) || '').trim().toLowerCase();
        const shop = String((row && (row.shopName || row.ShopId || row.shopId)) || '').trim().toLowerCase();
        const key = title ? ((shop ? shop + '::' : '') + title) : productDedupeKey(row);
        if (!key || map.has(key)) return;
        map.set(key, row);
    });
    return Array.from(map.values());
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
