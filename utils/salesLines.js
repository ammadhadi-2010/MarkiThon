const WholesaleOrder = require('../models/WholesaleOrder');
const WholesaleOrderItem = require('../models/WholesaleOrderItem');
const RetailBill = require('../models/RetailBill');
const RetailBillItem = require('../models/RetailBillItem');
const Product = require('../models/Product');
const { toNum } = require('./profit');
const { createdBetween } = require('./dateRange');
const { unitLabel, categoryLabel } = require('./shopCatalog');

function mapLine(item, product) {
    const qty = toNum(item.quantityMeters);
    const total = toNum(item.total);
    const purchase = toNum(product && product.purchasePrice);
    return {
        productId: product && product.id,
        title: (product && product.title) || 'Unknown',
        imageUrl: product && product.imageUrl,
        sku: product && product.sku,
        category: categoryLabel(product || {}),
        unit: unitLabel(product && product.stockUnit),
        qty,
        total,
        cost: purchase * qty,
        date: item.createdAt
    };
}

async function loadSoldLines(from, to) {
    const where = createdBetween(from, to);
    const [wholesale, retail] = await Promise.all([
        WholesaleOrderItem.findAll({
            include: [
                { model: WholesaleOrder, required: true, where },
                { model: Product, required: false }
            ]
        }),
        RetailBillItem.findAll({
            include: [
                { model: RetailBill, required: true, where },
                { model: Product, required: false }
            ]
        })
    ]);
    return [
        ...wholesale.map((row) => mapLine(row, row.Product)),
        ...retail.map((row) => mapLine(row, row.Product))
    ];
}

function bucketKey(date, grain) {
    const d = new Date(date);
    if (grain === 'monthly') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (grain === 'weekly') {
        const tmp = new Date(d);
        tmp.setDate(d.getDate() - d.getDay());
        return tmp.toISOString().slice(0, 10);
    }
    return d.toISOString().slice(0, 10);
}

function seriesFromLines(lines, grain) {
    const map = {};
    lines.forEach((line) => {
        const key = bucketKey(line.date, grain);
        map[key] = (map[key] || 0) + line.total;
    });
    return Object.keys(map).sort().map((label) => ({ label, total: map[label] }));
}

function fillDailySeries(from, to, points) {
    const map = {};
    (points || []).forEach((p) => { map[p.label] = p.total; });
    const rows = [];
    const cursor = new Date(from);
    const end = new Date(to);
    cursor.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    while (cursor <= end) {
        const label = cursor.toISOString().slice(0, 10);
        rows.push({ label, total: map[label] || 0 });
        cursor.setDate(cursor.getDate() + 1);
    }
    return rows.length ? rows : [{ label: end.toISOString().slice(0, 10), total: 0 }];
}

function lastDaysSeries(lines, days) {
    const raw = seriesFromLines(lines, 'daily');
    const end = new Date();
    const from = new Date();
    from.setDate(end.getDate() - (days - 1));
    from.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return fillDailySeries(from, end, raw);
}

module.exports = { loadSoldLines, seriesFromLines, fillDailySeries, lastDaysSeries };
