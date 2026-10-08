const { Op } = require('sequelize');
const Product = require('../models/Product');
const { relatedDestroy } = require('./purgeProduct');
const { collectProductMedia, purgeUrls } = require('./purgeMedia');
const { normKey } = require('./productDedupe');

function scoreRow(row) {
    let score = 0;
    if (row.storePublished !== false) score += 4;
    if (Number(row.stockMeters) > 0) score += 2;
    if (row.storeFeatured) score += 1;
    if (row.updatedAt) score += new Date(row.updatedAt).getTime() / 1e13;
    return score;
}

async function purgeDuplicateProducts(options = {}) {
    const dryRun = Boolean(options.dryRun);
    const rows = await Product.findAll({ order: [['updatedAt', 'DESC']] });
    const keep = new Map();
    const remove = [];
    rows.forEach((row) => {
        const title = normKey(row.title);
        if (!title) return;
        const key = String(row.ShopId || 1) + '::' + title;
        const current = keep.get(key);
        if (!current) {
            keep.set(key, row);
            return;
        }
        if (scoreRow(row) > scoreRow(current)) {
            remove.push(current);
            keep.set(key, row);
        } else {
            remove.push(row);
        }
    });
    const ids = remove.map((row) => row.id);
    if (!ids.length) {
        return { removed: 0, kept: keep.size, ids: [], dryRun };
    }
    if (dryRun) {
        return {
            removed: ids.length,
            kept: keep.size,
            ids: ids.map(String),
            titles: remove.map((row) => row.title),
            dryRun: true
        };
    }
    const urls = remove.flatMap((row) => collectProductMedia(row));
    await relatedDestroy(ids);
    await Product.destroy({ where: { id: { [Op.in]: ids } } });
    await purgeUrls(urls);
    return { removed: ids.length, kept: keep.size, ids: ids.map(String), dryRun: false };
}

module.exports = { purgeDuplicateProducts };
