const fs = require('fs');
const path = require('path');
const RetailCustomer = require('../models/RetailCustomer');
const BuyerAccount = require('../models/BuyerAccount');
const StoreOrder = require('../models/StoreOrder');

const file = path.join(__dirname, '../data/admin-customers.json');
const flagFile = path.join(__dirname, '../data/admin-customer-flags.json');
const statuses = ['Active', 'Inactive'];

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

function digits(value) {
    return String(value || '').replace(/\D/g, '');
}

function norm(value) {
    return String(value || '').trim().toLowerCase();
}

function fresh(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function bucket() {
    return { orders: 0, spent: 0, history: [], name: '', phone: '' };
}

function indexOrders(orders) {
    const byPhone = {};
    const byName = {};
    orders.forEach((row) => {
        const phone = digits(row.customerPhone);
        const name = norm(row.customerName);
        const key = phone || name;
        if (!key) return;
        const map = phone ? byPhone : byName;
        const slot = map[key] || bucket();
        slot.orders += 1;
        slot.spent += Number(row.total) || 0;
        if (!slot.name) slot.name = row.customerName || '';
        if (!slot.phone) slot.phone = row.customerPhone || '';
        if (slot.history.length < 6) {
            slot.history.push({ number: row.orderNumber, total: Number(row.total) || 0, createdAt: row.createdAt });
        }
        map[key] = slot;
    });
    return { byPhone, byName };
}

function spendFor(phone, name, stats) {
    if (phone && stats.byPhone[phone]) return stats.byPhone[phone];
    if (!phone && name && stats.byName[name]) return stats.byName[name];
    return bucket();
}

function shape(row, hit) {
    return {
        id: row.id,
        name: row.name,
        phone: row.phone || '',
        address: row.address || '',
        city: row.city || '',
        status: row.status || 'Active',
        orders: hit.orders,
        spent: hit.spent,
        history: hit.history,
        createdAt: row.createdAt,
        fresh: fresh(row.createdAt),
        locked: row.locked !== false
    };
}

async function liveCustomers() {
    const [retail, buyers, orders] = await Promise.all([
        RetailCustomer.findAll({
            attributes: ['id', 'name', 'phone', 'whatsapp', 'address', 'area', 'city', 'status', 'createdAt'],
            order: [['createdAt', 'DESC']],
            raw: true
        }),
        BuyerAccount.findAll({
            attributes: ['id', 'name', 'phone', 'createdAt'],
            order: [['createdAt', 'DESC']],
            raw: true
        }),
        StoreOrder.findAll({
            attributes: ['orderNumber', 'customerName', 'customerPhone', 'total', 'createdAt'],
            order: [['createdAt', 'DESC']],
            raw: true
        })
    ]);
    const stats = indexOrders(orders);
    const seenPhone = new Set();
    const seenName = new Set();
    const rows = [];
    retail.forEach((row) => {
        const phone = digits(row.phone || row.whatsapp);
        const name = norm(row.name);
        if (phone) seenPhone.add(phone);
        if (name) seenName.add(name);
        const address = [row.address, row.area].filter(Boolean).join(', ');
        rows.push(shape({
            id: 'ret-' + row.id,
            name: row.name,
            phone: row.phone || row.whatsapp || '',
            address,
            city: row.city || '',
            status: row.status || 'Active',
            createdAt: row.createdAt,
            locked: true
        }, spendFor(phone, name, stats)));
    });
    buyers.forEach((row) => {
        const phone = digits(row.phone);
        if (phone && seenPhone.has(phone)) return;
        if (phone) seenPhone.add(phone);
        rows.push(shape({
            id: 'buy-' + row.id,
            name: row.name,
            phone: row.phone || '',
            address: '',
            city: '',
            status: 'Active',
            createdAt: row.createdAt,
            locked: true
        }, spendFor(phone, norm(row.name), stats)));
    });
    Object.keys(stats.byPhone).forEach((phone) => {
        if (seenPhone.has(phone)) return;
        const hit = stats.byPhone[phone];
        rows.push(shape({
            id: 'ordc-' + phone,
            name: hit.name || 'Customer',
            phone: hit.phone,
            address: '',
            city: '',
            status: 'Active',
            createdAt: hit.history[0] ? hit.history[0].createdAt : '',
            locked: true
        }, hit));
    });
    Object.keys(stats.byName).forEach((name) => {
        if (seenName.has(name)) return;
        const hit = stats.byName[name];
        rows.push(shape({
            id: 'ordn-' + name.replace(/\s+/g, '-'),
            name: hit.name || 'Customer',
            phone: '',
            address: '',
            city: '',
            status: 'Active',
            createdAt: hit.history[0] ? hit.history[0].createdAt : '',
            locked: true
        }, hit));
    });
    return rows;
}

function applyFlag(row, flag) {
    if (!flag || !flag.status) return row;
    return { ...row, status: flag.status };
}

async function listCustomers() {
    const flags = readJson(flagFile, {});
    let live = [];
    try {
        live = await liveCustomers();
    } catch (error) {
        live = [];
    }
    const liveIds = new Set(live.map((row) => row.id));
    const extras = readJson(file, []).filter((row) => !liveIds.has(row.id)).map((row) => ({
        ...row,
        orders: row.orders || 0,
        spent: row.spent || 0,
        history: row.history || [],
        fresh: fresh(row.createdAt),
        locked: false
    }));
    return live.map((row) => applyFlag(row, flags[row.id])).concat(extras.map((row) => applyFlag(row, flags[row.id])));
}

function cleanCustomer(body) {
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim().slice(0, 20);
    const city = String(body.city || '').trim().slice(0, 40);
    const address = String(body.address || '').trim().slice(0, 160);
    const status = statuses.includes(body.status) ? body.status : 'Active';
    if (name.length < 2) return null;
    return { name, phone, city, address, status };
}

function createCustomer(body) {
    const clean = cleanCustomer(body);
    if (!clean) return null;
    const rows = readJson(file, []);
    const row = {
        id: 'cus-' + Date.now(),
        ...clean,
        orders: 0,
        spent: 0,
        history: [],
        createdAt: new Date().toISOString(),
        locked: false
    };
    rows.unshift(row);
    writeJson(file, rows);
    return { ...row, fresh: true };
}

async function updateCustomer(id, body) {
    const status = statuses.includes(body.status) ? body.status : '';
    if (!status) return null;
    const current = (await listCustomers()).find((row) => row.id === id);
    if (!current) return { missing: true };
    if (current.locked) {
        const flags = readJson(flagFile, {});
        flags[id] = { status };
        writeJson(flagFile, flags);
        return { ...current, status, locked: true };
    }
    const rows = readJson(file, []);
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) return { missing: true };
    rows[index] = { ...rows[index], status };
    writeJson(file, rows);
    return { ...rows[index], status, locked: false };
}

module.exports = { listCustomers, createCustomer, updateCustomer };
