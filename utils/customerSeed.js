const { Op } = require('sequelize');
const RetailCustomer = require('../models/RetailCustomer');
const { featuredCustomers, CUST_AREAS, CUST_NAMES } = require('./customerSeedData');
const { withProfile } = require('./customerHistory');

function padPhone(index) {
    const n = String(1000000 + index).slice(-7);
    return '0301-' + n.slice(0, 3) + n.slice(3);
}

function fillerRow(index, purchase) {
    const inactive = index < 23;
    const orders = inactive ? (index % 2) + 1 : 2 + (index % 8);
    const day = new Date('2026-09-13T12:00:00');
    day.setDate(day.getDate() - (index % 12));
    const area = CUST_AREAS[index % CUST_AREAS.length];
    const base = CUST_NAMES[index % CUST_NAMES.length];
    const name = index < CUST_NAMES.length ? base : base + ' ' + (Math.floor(index / CUST_NAMES.length) + 1);
    return withProfile({
        name,
        phone: padPhone(index),
        whatsapp: padPhone(index),
        address: 'Street ' + (index + 4) + ', ' + area + ', Multan',
        area,
        vip: index % 19 === 0,
        status: inactive ? 'Inactive' : 'Active',
        totalOrders: orders,
        totalPurchase: purchase,
        lastOrderAt: day,
        ShopId: 1
    });
}

function splitPurchases(count, total) {
    const weights = Array.from({ length: count }, (_, i) => (i < 23 ? 1 : 2 + (i % 8)));
    const sum = weights.reduce((a, b) => a + b, 0);
    let used = 0;
    return weights.map((w, i) => {
        if (i === count - 1) return total - used;
        const part = Math.round((total * w) / sum);
        used += part;
        return part;
    });
}

function demoCustomers() {
    const featured = featuredCustomers().map(withProfile);
    const featuredSum = featured.reduce((s, r) => s + r.totalPurchase, 0);
    const need = 156 - featured.length;
    const parts = splitPurchases(need, 342750 - featuredSum);
    return featured.concat(parts.map((p, i) => fillerRow(i, p)));
}

async function syncFeatured(demos) {
    const featured = demos.slice(0, 10);
    for (const demo of featured) {
        const row = await RetailCustomer.findOne({ where: { phone: demo.phone } });
        if (row) await row.update(demo);
    }
}

async function syncFillerDates() {
    const cutoff = new Date('2026-09-15T00:00:00');
    const stale = await RetailCustomer.findAll({
        where: { phone: { [Op.like]: '0301-%' }, lastOrderAt: { [Op.gte]: cutoff } }
    });
    await Promise.all(stale.map((row, i) => {
        const day = new Date('2026-09-13T12:00:00');
        day.setDate(day.getDate() - (i % 12));
        return row.update({ lastOrderAt: day });
    }));
}

async function ensureDemoCustomers() {
    const demos = demoCustomers();
    const count = await RetailCustomer.count();
    if (!count) {
        await RetailCustomer.bulkCreate(demos);
        return;
    }
    await syncFeatured(demos);
    await syncFillerDates();
    if (count >= 156) return;
    const existing = await RetailCustomer.findAll({ attributes: ['phone'] });
    const have = new Set(existing.map((r) => String(r.phone || '').replace(/\D/g, '')));
    const extra = demos.filter((row) => !have.has(String(row.phone).replace(/\D/g, '')));
    if (extra.length) await RetailCustomer.bulkCreate(extra);
}

module.exports = { ensureDemoCustomers, demoCustomers };
