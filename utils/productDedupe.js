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

function blankColorWhere() {
    return { [Op.or]: [{ color: null }, { color: '' }] };
}

async function findShopProductConflict(shopId, fields, excludeId) {
    const sku = String(fields.sku || '').trim();
    const barcode = String(fields.barcode || '').trim();
    const title = String(fields.title || '').trim();
    const color = String(fields.color || '').trim();
    const base = { ShopId: shopId };
    if (excludeId) base.id = { [Op.ne]: excludeId };

    if (sku) {
        const bySku = await Product.findOne({
            where: { ...base, sku },
            order: [['updatedAt', 'DESC']]
        });
        if (bySku) return bySku;
    }
    if (barcode) {
        const byBarcode = await Product.findOne({
            where: { ...base, barcode },
            order: [['updatedAt', 'DESC']]
        });
        if (byBarcode) return byBarcode;
    }
    if (!title) return null;
    // Catalog identity (inventory save) matches title only among blank-color parents,
    // so color variants are never treated as duplicate catalog rows.
    const titleWhere = color
        ? { ...base, title: { [Op.iLike]: title }, color }
        : { ...base, title: { [Op.iLike]: title }, ...blankColorWhere() };
    return Product.findOne({ where: titleWhere, order: [['updatedAt', 'DESC']] });
}

module.exports = { dedupeProducts, findShopProductConflict, productDedupeKey, normKey };
