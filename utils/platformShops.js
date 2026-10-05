const fs = require('fs');
const path = require('path');
const { buildLiveShop, updateLiveShop } = require('./adminShopProfile');

const file = path.join(__dirname, '../data/platform-shops.json');
const seed = [
    ['shop-ammad', 'Ammad Hadi Stor', 'Ammad Ul Hadi', '+92 300 7012010', 'Standard', 6, 'Active'],
    ['shop-zain', 'Zain Textiles', 'Zain Khan', '+92 300 1234567', 'Standard', 3, 'Active'],
    ['shop-royal', 'Royal Fabrics', 'Bilal Ahmed', '+92 333 9876543', 'Premium', 12, 'Active'],
    ['shop-sana', 'Sana Collection', 'Sana Fatima', '+92 321 7654321', 'Standard', 3, 'Pending'],
    ['shop-fabric', 'Fabric World', 'Usman Ali', '+92 345 4455667', 'Premium', 6, 'Active'],
    ['shop-pillow', 'Luxury Pillow Set', 'Hina Butt', '+92 300 7788999', 'Standard', 3, 'Active'],
    ['shop-cotton', 'Cotton King', 'Tahir Mehmood', '+92 333 7788990', 'Premium', 12, 'Active'],
    ['shop-modern', 'Modern Textiles', 'Rabia Noor', '+92 304 5566778', 'Standard', 3, 'Active'],
    ['shop-fashion', 'Fashion Hub', 'Nadia Malik', '+92 311 4556677', 'Premium', 6, 'Pending'],
    ['shop-trendi', 'Trendi Fashion', 'Asif Raza', '+92 345 6677889', 'Standard', 3, 'Suspended']
].map(([id, name, owner, phone, pack, months, status]) => ({
    id, name, owner, phone, package: pack, months, status
}));

function readDirectory() {
    try {
        const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
        return Array.isArray(rows) ? rows : seed.map((row) => ({ ...row }));
    } catch (error) {
        return seed.map((row) => ({ ...row }));
    }
}

function writeDirectory(rows) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(rows, null, 2));
}

function directory() {
    const rows = readDirectory();
    if (!fs.existsSync(file)) writeDirectory(rows);
    return rows;
}

async function listManagedShops() {
    const live = await buildLiveShop();
    const rows = directory().filter((row) => !live || row.name !== live.name);
    return live ? [live, ...rows] : rows;
}

function cleanShop(body) {
    const name = String((body && body.name) || '').trim();
    const owner = String((body && body.owner) || '').trim();
    const phone = String((body && body.phone) || '').trim();
    const pack = body && body.package === 'Premium' ? 'Premium' : 'Standard';
    const months = Math.min(24, Math.max(1, Number(body && body.months) || 3));
    const status = ['Active', 'Pending', 'Suspended'].includes(body && body.status)
        ? body.status : 'Pending';
    if (name.length < 2 || owner.length < 2 || phone.length < 7) return null;
    return { name, owner, phone, package: pack, months, status };
}

function createManagedShop(body) {
    const next = cleanShop(body);
    if (!next) return null;
    const rows = directory();
    next.id = 'shop-' + Date.now();
    next.status = 'Pending';
    rows.push(next);
    writeDirectory(rows);
    return next;
}

async function updateManagedShop(id, body) {
    if (id === 'live-shop') {
        const shop = await updateLiveShop(body || {});
        return shop || null;
    }
    const rows = directory();
    const hit = rows.find((row) => row.id === id);
    if (!hit) return null;
    const next = cleanShop({ ...hit, ...body });
    if (!next) return null;
    Object.assign(hit, next);
    writeDirectory(rows);
    return hit;
}

async function findManagedShop(id) {
    const shop = (await listManagedShops()).find((row) => row.id === id);
    if (!shop) return null;
    const metrics = { tracked: false, products: 0, orders: 0, sales: 0 };
    if (shop.id === 'live-shop') {
        const Product = require('../models/Product');
        const StoreOrder = require('../models/StoreOrder');
        const where = { ShopId: 1 };
        const [products, orders, sales] = await Promise.all([
            Product.count({ where }),
            StoreOrder.count({ where }),
            StoreOrder.sum('total', { where })
        ]);
        metrics.tracked = true;
        metrics.products = products;
        metrics.orders = orders;
        metrics.sales = Number(sales) || 0;
    }
    return { shop, metrics };
}

module.exports = { listManagedShops, createManagedShop, updateManagedShop, findManagedShop };
