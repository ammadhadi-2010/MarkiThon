const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const { liveProducts } = require('./platformProductLive');

const flagFile = path.join(__dirname, '../data/platform-product-flags.json');
const statuses = ['Published', 'Hidden', 'Pending'];
const tags = ['', 'Featured', 'New', 'Sale'];

function readFlags() {
    try {
        const data = JSON.parse(fs.readFileSync(flagFile, 'utf8'));
        return data && typeof data === 'object' ? data : {};
    } catch (error) {
        return {};
    }
}

function saveFlags(flags) {
    fs.mkdirSync(path.dirname(flagFile), { recursive: true });
    fs.writeFileSync(flagFile, JSON.stringify(flags, null, 2));
}

function applyFlag(row, flag) {
    if (!flag) return row;
    return { ...row, status: flag.status || row.status, tag: flag.tag != null ? flag.tag : row.tag };
}

async function listProducts() {
    const flags = readFlags();
    let live = [];
    try {
        live = await liveProducts();
    } catch (error) {
        live = [];
    }
    return live
        .filter((row) => !flags[row.id] || !flags[row.id].removed)
        .map((row) => applyFlag(row, flags[row.id]));
}

function cleanProduct(body) {
    const title = String(body.title || '').trim();
    const category = String(body.category || '').trim().slice(0, 40);
    const status = statuses.includes(body.status) ? body.status : 'Pending';
    const tag = tags.includes(body.tag) ? body.tag : '';
    const price = Number(body.price);
    const stock = Number(body.stock);
    const unit = String(body.unit || 'Pcs').trim().slice(0, 16) || 'Pcs';
    if (title.length < 2 || category.length < 2 || !(price > 0) || stock < 0 || Number.isNaN(stock)) {
        return null;
    }
    return { title, category, status, tag, price, stock, unit };
}

async function createProduct(body) {
    const clean = cleanProduct(body || {});
    if (!clean) return null;
    const row = await Product.create({
        title: clean.title,
        category: clean.category,
        retailPrice: clean.price,
        stockMeters: clean.stock,
        sellUnit: clean.unit,
        storePublished: clean.status === 'Published',
        storeFeatured: clean.tag === 'Featured',
        storeNewArrival: clean.tag === 'New',
        storeSale: clean.tag === 'Sale',
        ShopId: 1
    });
    const listed = (await listProducts()).find((item) => String(item.id) === String(row.id));
    return listed || {
        id: String(row.id),
        shop: 'Ammad Hadi Stor',
        title: clean.title,
        category: clean.category,
        price: clean.price,
        stock: clean.stock,
        unit: clean.unit,
        status: clean.status,
        tag: clean.tag,
        locked: true
    };
}

async function updateProduct(id, body) {
    const current = (await listProducts()).find((row) => String(row.id) === String(id));
    if (!current) return { missing: true };
    const status = statuses.includes(body.status) ? body.status : current.status;
    const tag = tags.includes(body.tag) ? body.tag : current.tag;
    const product = await Product.findByPk(id);
    if (!product) {
        const flags = readFlags();
        flags[id] = { ...(flags[id] || {}), status, tag, removed: false };
        saveFlags(flags);
        return { ...current, status, tag, locked: true };
    }
    const price = Number(body.price);
    await product.update({
        title: String(body.title || product.title).trim() || product.title,
        category: String(body.category || product.category || 'Other').trim(),
        retailPrice: price > 0 ? price : product.retailPrice,
        stockMeters: Number.isFinite(Number(body.stock)) ? Number(body.stock) : product.stockMeters,
        sellUnit: String(body.unit || product.sellUnit || 'Pcs').trim(),
        storePublished: status !== 'Hidden',
        storeFeatured: tag === 'Featured',
        storeNewArrival: tag === 'New',
        storeSale: tag === 'Sale'
    });
    return (await listProducts()).find((row) => String(row.id) === String(id)) || current;
}

async function bulkProducts(body) {
    const ids = new Set((Array.isArray(body.ids) ? body.ids : []).map(String));
    const action = body.action;
    if (!ids.size || (action !== 'delete' && !statuses.includes(action))) return null;
    const picked = (await listProducts()).filter((row) => ids.has(String(row.id)));
    if (!picked.length) return null;
    if (action === 'delete') {
        await Product.destroy({ where: { id: [...ids] } });
        const flags = readFlags();
        ids.forEach((id) => { delete flags[id]; });
        saveFlags(flags);
    } else {
        for (const row of picked) {
            await updateProduct(row.id, { ...row, status: action });
        }
    }
    return listProducts();
}

module.exports = { listProducts, createProduct, updateProduct, bulkProducts };
