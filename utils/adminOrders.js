const fs = require('fs');
const path = require('path');
const StoreOrder = require('../models/StoreOrder');
const ShopProfile = require('../models/ShopProfile');

const flagFile = path.join(__dirname, '../data/admin-order-flags.json');
const statuses = ['New', 'Confirmed', 'Processing', 'Dispatched', 'Completed', 'Cancelled'];

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

function countOrders(rows) {
    const count = (name) => rows.filter((row) => row.status === name).length;
    return {
        total: rows.length,
        new: count('New') + count('Confirmed'),
        processing: count('Processing') + count('Dispatched'),
        completed: count('Completed'),
        cancelled: count('Cancelled')
    };
}

async function liveOrders() {
    const [orders, profiles] = await Promise.all([
        StoreOrder.findAll({
            attributes: [
                'id', 'orderNumber', 'customerName', 'customerPhone', 'items',
                'total', 'status', 'note', 'ShopId', 'createdAt'
            ],
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

async function listOrders() {
    const flags = readFlags();
    let live = [];
    try {
        live = await liveOrders();
    } catch (error) {
        live = [];
    }
    const orders = live.map((row) => {
        const flag = flags[row.id];
        return flag && flag.status ? shape({ ...row, status: flag.status }) : row;
    });
    return { orders, counts: countOrders(orders) };
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

async function createOrder(body) {
    const clean = cleanOrder(body);
    if (!clean) return null;
    const stamp = Date.now();
    const row = await StoreOrder.create({
        orderNumber: 'MK-' + String(stamp).slice(-6),
        customerName: clean.customer,
        customerPhone: clean.phone,
        items: [],
        itemCount: 0,
        total: clean.total,
        status: clean.status,
        note: clean.note,
        details: { shopLabel: clean.shop },
        ShopId: 1
    });
    return shape({
        id: String(row.id),
        number: row.orderNumber,
        customer: row.customerName,
        phone: row.customerPhone || '',
        shop: clean.shop || 'Ammad Hadi Stor',
        total: Number(row.total) || 0,
        status: row.status || 'New',
        note: row.note || '',
        items: [],
        createdAt: row.createdAt,
        locked: true
    });
}

async function updateOrder(id, body) {
    const status = statuses.includes(body.status) ? body.status : '';
    if (!status) return null;
    const packed = await listOrders();
    const current = packed.orders.find((row) => row.id === id);
    if (!current) return { missing: true };
    const order = await StoreOrder.findByPk(id);
    if (order) {
        await order.update({ status });
        return shape({ ...current, status, locked: true });
    }
    const flags = readFlags();
    flags[id] = { status };
    saveFlags(flags);
    return shape({ ...current, status, locked: true });
}

module.exports = { listOrders, createOrder, updateOrder, countOrders };
