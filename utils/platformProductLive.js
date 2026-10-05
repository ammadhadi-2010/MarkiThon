const Product = require('../models/Product');
const ShopProfile = require('../models/ShopProfile');

const tones = ['sheet', 'lawn', 'curtain', 'khaddar', 'pillow', 'cotton', 'towel', 'dress', 'wedding', 'silk'];

function toneFor(category, index) {
    const name = String(category || '').toLowerCase();
    if (name.includes('lawn')) return 'lawn';
    if (name.includes('silk')) return 'silk';
    if (name.includes('cotton')) return 'cotton';
    if (name.includes('fabric')) return 'curtain';
    return tones[index % tones.length];
}

function tagFor(row) {
    if (row.storeFeatured) return 'Featured';
    if (row.storeNewArrival) return 'New';
    if (row.storeSale) return 'Sale';
    return '';
}

async function liveProducts() {
    const [products, profiles] = await Promise.all([
        Product.findAll({
            attributes: [
                'id', 'title', 'sku', 'category', 'retailPrice', 'storeOnlinePrice', 'stockMeters',
                'sellUnit', 'storePublished', 'storeFeatured', 'storeNewArrival', 'storeSale',
                'ShopId', 'createdAt'
            ],
            order: [['createdAt', 'DESC']],
            raw: true
        }),
        ShopProfile.findAll({ attributes: ['ShopId', 'shopName'], raw: true })
    ]);
    const names = {};
    profiles.forEach((row) => { names[row.ShopId] = row.shopName; });
    return products.map((row, index) => {
        const retail = Number(row.retailPrice) || 0;
        const online = Number(row.storeOnlinePrice) || 0;
        const price = online > 0 ? online : retail;
        return {
            id: String(row.id),
            sku: row.sku || '',
            shop: names[row.ShopId] || 'Ammad Hadi Stor',
            title: row.title,
            category: row.category || 'Other',
            price,
            was: retail > price ? retail : 0,
            unit: row.sellUnit || 'Pcs',
            stock: Math.round(Number(row.stockMeters) || 0),
            status: row.storePublished === false ? 'Hidden' : 'Published',
            tag: tagFor(row),
            added: row.createdAt ? new Date(row.createdAt).toISOString().slice(0, 10) : '',
            tone: toneFor(row.category, index),
            locked: true
        };
    });
}

module.exports = { liveProducts };
