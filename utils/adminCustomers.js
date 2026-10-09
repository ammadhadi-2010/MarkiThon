const fs = require('fs');
const path = require('path');
const RetailCustomer = require('../models/RetailCustomer');
const BuyerAccount = require('../models/BuyerAccount');
const StoreOrder = require('../models/StoreOrder');

const flagFile = path.join(__dirname, '../data/admin-customer-flags.json');
const statuses = ['Active', 'Inactive'];

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
    return { orders: 0, spent: 0, history: [], name: '', phone: '', createdAt: null };
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
        if (!slot.createdAt || new Date(row.createdAt) < new Date(slot.createdAt)) {
            slot.createdAt = row.createdAt;
        }
        if (slot.history.length < 8) {
            slot.history.push({
                number: row.orderNumber,
                total: Number(row.total) || 0,
                createdAt: row.createdAt
            });
        }
        map[key] = slot;
    });
    return { byPhone, byName };
}

function spendFor(phone, name, stats) {
    if (phone && stats.byPhone[phone]) return stats.byPhone[phone];
    if (name && stats.byName[name]) return stats.byName[name];
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
        createdAt: row.createdAt || hit.createdAt,
        fresh: fresh(row.createdAt || hit.createdAt),
        locked: true,
        source: row.source || 'marketplace'
    };
}

async function liveCustomers() {
    const [buyers, orders] = await Promise.all([
        BuyerAccount.findAll({
            attributes: ['id', 'name', 'phone', 'email', 'createdAt'],
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

    buyers.forEach((row) => {
        const phone = digits(row.phone);
        const name = norm(row.name);
        if (phone) seenPhone.add(phone);
        if (name) seenName.add(name);
        rows.push(shape({
            id: 'buy-' + row.id,
            name: row.name,
            phone: row.phone || '',
            address: row.email || '',
            city: '',
            status: 'Active',
            createdAt: row.createdAt,
            source: 'buyer'
        }, spendFor(phone, name, stats)));
    });

    Object.values(stats.byPhone).concat(Object.values(stats.byName)).forEach((hit) => {
        const phone = digits(hit.phone);
        const name = norm(hit.name);
        if (phone && seenPhone.has(phone)) return;
        if (!phone && name && seenName.has(name)) return;
        if (phone) seenPhone.add(phone);
        if (name) seenName.add(name);
        rows.push(shape({
            id: 'ord-' + (phone || name || hit.name),
            name: hit.name || 'Customer',
            phone: hit.phone || '',
            address: '',
            city: '',
            status: 'Active',
            createdAt: hit.createdAt,
            source: 'order'
        }, hit));
    });

    rows.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return rows;
}

function countCustomers(rows) {
    return {
        total: rows.length,
        active: rows.filter((row) => row.status === 'Active').length,
        inactive: rows.filter((row) => row.status === 'Inactive').length,
        fresh: rows.filter((row) => row.fresh).length,
        spent: rows.reduce((sum, row) => sum + (Number(row.spent) || 0), 0)
    };
}

async function listCustomers() {
    const flags = readFlags();
    let live = [];
    try {
        live = await liveCustomers();
    } catch (error) {
        live = [];
    }
    const rows = live.map((row) => {
        const flag = flags[row.id];
        return flag && flag.status ? { ...row, status: flag.status } : row;
    });
    return { customers: rows, counts: countCustomers(rows) };
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

async function createCustomer(body) {
    const clean = cleanCustomer(body);
    if (!clean) return null;
    const row = await RetailCustomer.create({
        name: clean.name,
        phone: clean.phone,
        address: clean.address,
        city: clean.city,
        status: clean.status,
        ShopId: 1
    });
    return shape({
        id: 'ret-' + row.id,
        name: row.name,
        phone: row.phone || '',
        address: row.address || '',
        city: row.city || '',
        status: row.status || 'Active',
        createdAt: row.createdAt,
        source: 'retail'
    }, bucket());
}

async function updateCustomer(id, body) {
    const status = statuses.includes(body.status) ? body.status : '';
    if (!status) return null;
    const packed = await listCustomers();
    const current = packed.customers.find((row) => row.id === id);
    if (!current) return { missing: true };
    const retailId = String(id).startsWith('ret-') ? String(id).slice(4) : '';
    if (retailId) {
        const retail = await RetailCustomer.findByPk(retailId);
        if (retail) {
            await retail.update({ status });
            return { ...current, status, locked: true };
        }
    }
    const flags = readFlags();
    flags[id] = { status };
    saveFlags(flags);
    return { ...current, status, locked: true };
}

module.exports = { listCustomers, createCustomer, updateCustomer, countCustomers };
