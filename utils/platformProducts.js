const fs = require('fs');
const path = require('path');

const { liveProducts } = require('./platformProductLive');

const file = path.join(__dirname, '../data/platform-products.json');
const flagFile = path.join(__dirname, '../data/platform-product-flags.json');
const statuses = ['Published', 'Hidden', 'Pending'];
const tags = ['', 'Featured', 'New', 'Sale'];
const seed = [
    ['prod-sheet', 'Ammad Hadi Stor', 'Premium Cotton Bed Sheet Set', 'Cotton', 1800, 2400, 'Set', 450, 'Published', 'Featured', '2026-09-26', 'sheet'],
    ['prod-lawn', 'Zain Textiles', 'Lawn Fabric (Digital Print)', 'Lawn', 850, 1200, 'Gaz', 1200, 'Published', 'New', '2026-09-25', 'lawn'],
    ['prod-curtain', 'Royal Fabrics', 'Curtain Fabric', 'Fabrics', 1250, 1800, 'Meter', 800, 'Published', 'Sale', '2026-09-24', 'curtain'],
    ['prod-khaddar', 'Sana Collection', 'Khaddar Fabric', 'Fabrics', 850, 1200, 'Meter', 450, 'Published', '', '2026-09-23', 'khaddar'],
    ['prod-pillow', 'Luxury Pillow Set', 'Pillow Cover Set (2 Pcs)', 'Cotton', 850, 1200, 'Set', 750, 'Published', '', '2026-09-22', 'pillow'],
    ['prod-cotton', 'Fabric World', 'Cotton Fabric', 'Cotton', 600, 900, 'Meter', 1500, 'Published', '', '2026-09-21', 'cotton'],
    ['prod-towel', 'Modern Textiles', 'Towel Set (3 Pcs)', 'Cotton', 1200, 1600, 'Set', 320, 'Published', '', '2026-09-20', 'towel'],
    ['prod-dress', 'Fashion Hub', 'Women\'s Dress', 'Silk', 2800, 3500, 'Pcs', 180, 'Published', '', '2026-09-19', 'dress'],
    ['prod-wedding', 'Trendi Fashion', 'Cotton Wedding Set', 'Cotton', 3500, 4500, 'Set', 95, 'Published', '', '2026-09-18', 'wedding'],
    ['prod-dupatta', 'Sana Collection', 'Silk Dupatta', 'Silk', 1450, 1900, 'Pcs', 60, 'Hidden', '', '2026-09-12', 'silk'],
    ['prod-shirt', 'Zain Textiles', 'Printed Lawn Shirt', 'Lawn', 2200, 2800, 'Pcs', 40, 'Hidden', '', '2026-09-11', 'lawn'],
    ['prod-shawl', 'Fashion Hub', 'Embroidered Shawl', 'Silk', 3200, 4000, 'Pcs', 25, 'Pending', 'New', '2026-09-10', 'silk']
].map(([id, shop, title, category, price, was, unit, stock, status, tag, added, tone]) => ({
    id, shop, title, category, price, was, unit, stock, status, tag, added, tone
}));

function readProducts() {
    try {
        const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
        return Array.isArray(rows) ? rows : seed.map((row) => ({ ...row }));
    } catch (error) {
        return seed.map((row) => ({ ...row }));
    }
}

function writeProducts(rows) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(rows, null, 2));
}

function catalogRows() {
    const rows = readProducts();
    if (!fs.existsSync(file)) writeProducts(rows);
    return rows;
}

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
    const liveIds = new Set(live.map((row) => row.id));
    const shown = live.filter((row) => !flags[row.id] || !flags[row.id].removed).map((row) => applyFlag(row, flags[row.id]));
    const extras = catalogRows().filter((row) => !liveIds.has(row.id));
    return shown.concat(extras);
}

function cleanProduct(body, current) {
    const title = String(body.title || '').trim();
    const shop = String(body.shop || '').trim();
    const category = String(body.category || '').trim().slice(0, 40);
    const status = statuses.includes(body.status) ? body.status : 'Pending';
    const tag = tags.includes(body.tag) ? body.tag : '';
    const price = Number(body.price);
    const was = Number(body.was) || 0;
    const stock = Number(body.stock);
    const unit = String(body.unit || 'Pcs').trim().slice(0, 16) || 'Pcs';
    if (title.length < 2 || shop.length < 2 || category.length < 2 || !(price > 0) || stock < 0 || Number.isNaN(stock)) return null;
    return {
        title, shop, category, status, tag, price, was, stock, unit,
        tone: (current && current.tone) || 'sheet'
    };
}

function createProduct(body) {
    const clean = cleanProduct(body, null);
    if (!clean) return null;
    const rows = catalogRows();
    const row = { id: 'prod-' + Date.now(), added: new Date().toISOString().slice(0, 10), ...clean };
    rows.unshift(row);
    writeProducts(rows);
    return row;
}

async function updateProduct(id, body) {
    const current = (await listProducts()).find((row) => row.id === id);
    if (!current) return { missing: true };
    const status = statuses.includes(body.status) ? body.status : current.status;
    const tag = tags.includes(body.tag) ? body.tag : current.tag;
    if (current.locked) {
        const flags = readFlags();
        flags[id] = { ...(flags[id] || {}), status, tag, removed: false };
        saveFlags(flags);
        return { ...current, status, tag, locked: true };
    }
    const clean = cleanProduct({ ...body, status, tag }, current);
    if (!clean) return null;
    const rows = catalogRows();
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) return { missing: true };
    rows[index] = { ...rows[index], ...clean };
    writeProducts(rows);
    return rows[index];
}

async function bulkProducts(body) {
    const ids = new Set(Array.isArray(body.ids) ? body.ids : []);
    const action = body.action;
    if (!ids.size || (action !== 'delete' && !statuses.includes(action))) return null;
    const picked = (await listProducts()).filter((row) => ids.has(row.id));
    if (!picked.length) return null;
    const flags = readFlags();
    picked.forEach((row) => {
        if (!row.locked) return;
        flags[row.id] = { ...(flags[row.id] || {}), status: action === 'delete' ? row.status : action, removed: action === 'delete' };
    });
    saveFlags(flags);
    const drop = new Set(picked.filter((row) => !row.locked).map((row) => row.id));
    writeProducts(catalogRows().map((row) => {
        if (!ids.has(row.id) || drop.has(row.id)) return row;
        return action === 'delete' ? row : { ...row, status: action };
    }).filter((row) => !drop.has(row.id)));
    return listProducts();
}

module.exports = { listProducts, createProduct, updateProduct, bulkProducts };
