const fs = require('fs');
const path = require('path');
const StoreOrder = require('../models/StoreOrder');
const ShopProfile = require('../models/ShopProfile');

const file = path.join(__dirname, '../data/admin-orders.json');
const flagFile = path.join(__dirname, '../data/admin-order-flags.json');
const statuses = ['New', 'Confirmed', 'Processing', 'Dispatched', 'Completed', 'Cancelled'];

function readJson(target, fallback) {
    try {
        const data = JSON.parse(fs.readFileSync(target, 'utf8'));
        return data == null ? fallback : data;
    } catch (error) {
        return fallback;
    }
}

function writeJson(target, data) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(data, null, 2));
}

function labelFor(status) {
    return status === 'Dispatched' ? 'Shipped' : status;
}

function briefItems(items) {
    if (!Array.isArray(items)) return [];
    return items.slice(0, 12).map((item) => ({
        title: item.title || item.name || item.productName || 'Item',
        qty: item.qty || item.quantity || item.count || 1
    }));
}

function shape(row) {
    const items = briefItems(row.items);
    return {
        ...row,
        items,
        products: items.map((item) => item.title).join(' '),
        label: labelFor(row.status)
    };
}

async function liveOrders() {
    const [orders, profiles] = await Promise.all([
        StoreOrder.findAll({
            attributes: ['id', 'orderNumber', 'customerName', 'customerPhone', 'items', 'total', 'status', 'note', 'ShopId', 'createdAt'],
            order: [['createdAt', 'DESC']],
            raw: true
        }),
        ShopProfile.findAll({ attributes: ['ShopId', 'shopName'], raw: true })
    ]);
    const names = {};
    profiles.forEach((row) => { names[row.ShopId] = row.shopName; });
    return orders.map((row) => shape({
        id: String(row.id),
        number: row.orderNumber,
        customer: row.customerName,
        phone: row.customerPhone || '',
        shop: names[row.ShopId] || 'Ammad Hadi Stor',
        total: Number(row.total) || 0,
        status: row.status || 'New',
        note: row.note || '',
        items: row.items,
        createdAt: row.createdAt,
        locked: true
    }));
}

function applyFlag(row, flag) {
    if (!flag || !flag.status) return row;
    return shape({ ...row, status: flag.status });
}

async function listOrders() {
    const flags = readJson(flagFile, {});
    let live = [];
    try {
        live = await liveOrders();
    } catch (error) {
        live = [];
    }
    const liveIds = new Set(live.map((row) => row.id));
    const extras = readJson(file, []).filter((row) => !liveIds.has(String(row.id)));
    return live.map((row) => applyFlag(row, flags[row.id])).concat(extras.map((row) => applyFlag(shape(row), flags[row.id])));
}

function cleanOrder(body) {
    const customer = String(body.customer || '').trim();
    const shop = String(body.shop || '').trim();
    const phone = String(body.phone || '').trim().slice(0, 20);
    const total = Number(body.total);
    const status = statuses.includes(body.status) ? body.status : 'New';
    if (customer.length < 2 || shop.length < 2 || Number.isNaN(total) || total < 0) return null;
    return { customer, shop, phone, total, status, note: String(body.note || '').trim().slice(0, 180) };
}

function createOrder(body) {
    const clean = cleanOrder(body);
    if (!clean) return null;
    const rows = readJson(file, []);
    const row = shape({
        id: 'ord-' + Date.now(),
        number: 'MK-' + String(Date.now()).slice(-6),
        ...clean,
        items: [],
        createdAt: new Date().toISOString(),
        locked: false
    });
    rows.unshift(row);
    writeJson(file, rows);
    return row;
}

async function updateOrder(id, body) {
    const status = statuses.includes(body.status) ? body.status : '';
    if (!status) return null;
    const current = (await listOrders()).find((row) => row.id === id);
    if (!current) return { missing: true };
    if (current.locked) {
        const flags = readJson(flagFile, {});
        flags[id] = { status };
        writeJson(flagFile, flags);
        return shape({ ...current, status, locked: true });
    }
    const rows = readJson(file, []);
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) return { missing: true };
    rows[index] = { ...rows[index], status };
    writeJson(file, rows);
    return shape(rows[index]);
}

module.exports = { listOrders, createOrder, updateOrder };
