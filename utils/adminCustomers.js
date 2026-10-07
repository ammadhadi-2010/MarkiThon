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
        locked: true
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
            createdAt: row.createdAt
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
            createdAt: row.createdAt
        }, spendFor(phone, norm(row.name), stats)));
    });
    return rows;
}

async function listCustomers() {
    const flags = readFlags();
    let live = [];
    try {
        live = await liveCustomers();
    } catch (error) {
        live = [];
    }
    return live.map((row) => {
        const flag = flags[row.id];
        return flag && flag.status ? { ...row, status: flag.status } : row;
    });
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
        createdAt: row.createdAt
    }, bucket());
}

async function updateCustomer(id, body) {
    const status = statuses.includes(body.status) ? body.status : '';
    if (!status) return null;
    const current = (await listCustomers()).find((row) => row.id === id);
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

module.exports = { listCustomers, createCustomer, updateCustomer };
