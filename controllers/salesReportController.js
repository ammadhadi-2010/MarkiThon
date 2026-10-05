const { Op } = require('sequelize');
const WholesaleOrder = require('../models/WholesaleOrder');
const RetailBill = require('../models/RetailBill');
const Sale = require('../models/Sale');
const StockHistory = require('../models/StockHistory');
const Product = require('../models/Product');
const ReportDownload = require('../models/ReportDownload');
const Expense = require('../models/Expense');
const { toNum } = require('../utils/profit');
const { parseRange, createdBetween, datedBetween } = require('../utils/dateRange');
const { loadSoldLines, seriesFromLines, fillDailySeries, lastDaysSeries } = require('../utils/salesLines');
const { shopCategories, categoryLabel } = require('../utils/shopCatalog');
const { activeShopId } = require('../utils/shopScope');

function growth(current, previous) {
    if (!previous) return current ? 100 : 0;
    return Number((((current - previous) / Math.abs(previous)) * 100).toFixed(1));
}

function shiftRange(from, to) {
    const span = to.getTime() - from.getTime();
    return { from: new Date(from.getTime() - span), to: new Date(from.getTime() - 1) };
}

async function periodTotals(from, to) {
    const where = createdBetween(from, to);
    const [wholesale, retail, pos, purchases, lines, expenseSum] = await Promise.all([
        WholesaleOrder.sum('grandTotal', { where }),
        RetailBill.sum('grandTotal', { where }),
        Sale.sum('totalAmount', { where }),
        StockHistory.findAll({ where: { type: 'Purchase', ...datedBetween(from, to) } }),
        loadSoldLines(from, to),
        Expense.sum('amount', { where: { spentOn: { [Op.between]: [from, to] } } })
    ]);
    const sales = toNum(wholesale) + toNum(retail) + toNum(pos);
    const [wsCount, rtCount, posCount] = await Promise.all([
        WholesaleOrder.count({ where }),
        RetailBill.count({ where }),
        Sale.count({ where })
    ]);
    const purchaseValue = purchases.reduce((sum, row) => sum + Math.abs(toNum(row.quantityChange ?? row.quantity)) * 800, 0);
    const expenses = toNum(expenseSum);
    const profit = lines.reduce((sum, line) => sum + (line.total - line.cost), 0) - expenses;
    return { sales, purchases: purchaseValue, expenses, profit, orders: wsCount + rtCount + posCount, lines };
}

exports.summary = async (req, res) => {
    try {
        const range = parseRange(req.query);
        const prev = shiftRange(range.from, range.to);
        const [current, previous] = await Promise.all([
            periodTotals(range.from, range.to),
            periodTotals(prev.from, prev.to)
        ]);
        res.status(200).json({
            totalSales: current.sales,
            totalPurchases: current.purchases,
            netProfit: current.profit,
            totalExpenses: current.expenses,
            totalOrders: current.orders,
            points: lastDaysSeries(current.lines, 14),
            growth: {
                sales: growth(current.sales, previous.sales),
                purchases: growth(current.purchases, previous.purchases),
                profit: growth(current.profit, previous.profit),
                orders: growth(current.orders, previous.orders)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales summary', error: error.message });
    }
};

exports.byCategory = async (req, res) => {
    try {
        const { from, to } = parseRange(req.query);
        const shopId = await activeShopId();
        const [lines, products] = await Promise.all([
            loadSoldLines(from, to),
            Product.findAll({ where: { ShopId: shopId } })
        ]);
        const categories = shopCategories(products);
        const totals = {};
        categories.forEach((name) => { totals[name] = 0; });
        lines.forEach((line) => {
            const key = categories.includes(line.category) ? line.category : 'Other';
            totals[key] = (totals[key] || 0) + line.total;
        });
        products.forEach((p) => {
            const key = categoryLabel(p);
            if (totals[key] === undefined) totals[key] = 0;
        });
        const rows = Object.keys(totals).map((name) => ({ name, total: totals[name] }));
        const grand = rows.reduce((sum, row) => sum + row.total, 0);
        res.status(200).json({
            total: grand,
            rows: rows.map((row) => ({
                ...row,
                percent: grand ? Number(((row.total / grand) * 100).toFixed(1)) : 0
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching category sales', error: error.message });
    }
};

exports.topSelling = async (req, res) => {
    try {
        const { from, to } = parseRange(req.query);
        const lines = await loadSoldLines(from, to);
        const map = {};
        lines.forEach((line) => {
            const id = line.productId || line.title;
            if (!map[id]) map[id] = { ...line, qty: 0, total: 0 };
            map[id].qty += line.qty;
            map[id].total += line.total;
        });
        const rows = Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);
        res.status(200).json({ rows });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching top selling products', error: error.message });
    }
};

exports.overview = async (req, res) => {
    try {
        const grain = ['daily', 'weekly', 'monthly'].includes(req.query.grain) ? req.query.grain : 'daily';
        const { from, to } = parseRange(req.query);
        const lines = await loadSoldLines(from, to);
        const raw = seriesFromLines(lines, grain);
        const points = grain === 'daily' ? fillDailySeries(from, to, raw) : raw;
        res.status(200).json({ grain, points });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales overview', error: error.message });
    }
};

exports.recentDownloads = async (req, res) => {
    try {
        let rows = await ReportDownload.findAll({ order: [['createdAt', 'DESC']], limit: 8 });
        if (!rows.length) {
            const month = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
            const seed = ['Sales', 'Stock', 'Purchase', 'Profit', 'Customer'].map((type) => ({
                title: `${type} Report - ${month}`,
                reportType: type.toLowerCase(),
                rangeLabel: month
            }));
            rows = await ReportDownload.bulkCreate(seed);
        }
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching report downloads', error: error.message });
    }
};

exports.logDownload = async (req, res) => {
    try {
        const row = await ReportDownload.create({
            title: req.body.title || 'Sales Report',
            reportType: req.body.reportType || 'sales',
            rangeLabel: req.body.rangeLabel || ''
        });
        res.status(201).json({ message: 'Download logged.', row });
    } catch (error) {
        res.status(500).json({ message: 'Error logging download', error: error.message });
    }
};
