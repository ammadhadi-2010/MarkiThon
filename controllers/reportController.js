const { Op } = require('sequelize');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const WholesaleOrder = require('../models/WholesaleOrder');
const RetailBill = require('../models/RetailBill');
const Sale = require('../models/Sale');
const StockHistory = require('../models/StockHistory');
const Expense = require('../models/Expense');
const { toNum, withProductMargins } = require('../utils/profit');
const { parseRange, createdBetween, datedBetween } = require('../utils/dateRange');
const { sendCsv } = require('../utils/csvExport');
const { buildSalesReport, csvSalesRows } = require('../utils/salesTableReport');
const { mapExpenseRows, csvExpenseRows } = require('../utils/expenseReportRows');
const { activeShopId } = require('../utils/shopScope');

async function ownedProducts(extra) {
    return Product.findAll(Object.assign({ where: { ShopId: await activeShopId() } }, extra || {}));
}

exports.sales = async (req, res) => {
    try {
        const { from, to } = parseRange(req.query);
        res.status(200).json(await buildSalesReport(from, to));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales report', error: error.message });
    }
};

exports.purchases = async (req, res) => {
    try {
        const { from, to } = parseRange(req.query);
        const logs = await StockHistory.findAll({
            where: { type: 'Purchase', ShopId: await activeShopId(), ...datedBetween(from, to) },
            order: [['date', 'DESC']]
        });
        const suppliers = await Supplier.findAll({ order: [['name', 'ASC']] });
        res.status(200).json({
            from,
            to,
            suppliers: suppliers.map((s) => ({ name: s.name, phone: s.phone, status: s.status })),
            rows: logs.map((l) => ({
                date: l.date,
                qty: l.quantityChange ?? l.quantity,
                balance: l.balance,
                ref: l.referenceNumber || l.ref
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching purchase report', error: error.message });
    }
};

exports.stock = async (req, res) => {
    try {
        const products = await ownedProducts({ order: [['title', 'ASC']] });
        const rows = products.map((p) => ({
            title: p.title,
            sku: p.sku,
            stock: p.stockMeters,
            unit: p.stockUnit,
            value: toNum(p.stockMeters) * toNum(p.purchasePrice)
        }));
        res.status(200).json({ rows, totalValue: rows.reduce((s, r) => s + r.value, 0) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stock report', error: error.message });
    }
};

exports.profit = async (req, res) => {
    try {
        const { from, to } = parseRange(req.query);
        const products = await ownedProducts({ order: [['title', 'ASC']] });
        const expenseTotal = toNum(await Expense.sum('amount', {
            where: { spentOn: { [Op.between]: [from, to] } }
        }));
        const rows = products.map((p) => {
            const json = withProductMargins(p);
            return {
                title: json.title,
                sku: json.sku,
                wholesaleProfit: json.wholesaleProfit.amount,
                retailProfit: json.retailProfit.amount,
                wholesalePercent: json.wholesaleProfit.percent,
                retailPercent: json.retailProfit.percent
            };
        });
        const grossRetail = rows.reduce((s, r) => s + toNum(r.retailProfit), 0);
        res.status(200).json({
            rows,
            expenseTotal,
            grossProfit: grossRetail,
            netProfit: grossRetail - expenseTotal
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profit report', error: error.message });
    }
};

exports.lowStock = async (req, res) => {
    try {
        const products = await ownedProducts();
        const rows = products.filter((p) => toNum(p.stockMeters) <= toNum(p.minWholesaleQty))
            .map((p) => ({
                title: p.title,
                sku: p.sku,
                stock: p.stockMeters,
                minQty: p.minWholesaleQty,
                unit: p.stockUnit
            }));
        res.status(200).json({ rows });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching low stock report', error: error.message });
    }
};

exports.customers = async (req, res) => {
    try {
        const { from, to } = parseRange(req.query);
        const where = createdBetween(from, to);
        const [wholesale, retail] = await Promise.all([
            WholesaleOrder.findAll({ where }),
            RetailBill.findAll({ where })
        ]);
        const map = {};
        [...wholesale, ...retail].forEach((row) => {
            const name = row.customerName || 'Walk-in Customer';
            if (!map[name]) map[name] = { customer: name, orders: 0, total: 0 };
            map[name].orders += 1;
            map[name].total += toNum(row.grandTotal);
        });
        const rows = Object.values(map).sort((a, b) => b.total - a.total);
        res.status(200).json({ rows });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer report', error: error.message });
    }
};

exports.suppliers = async (req, res) => {
    try {
        const rows = (await Supplier.findAll({ order: [['name', 'ASC']] }))
            .map((s) => ({ name: s.name, phone: s.phone, email: s.email, status: s.status, paid: 0 }));
        res.status(200).json({ rows });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching supplier report', error: error.message });
    }
};

exports.expenses = async (req, res) => {
    try {
        const { from, to } = parseRange(req.query);
        const rows = await Expense.findAll({
            where: { spentOn: { [Op.between]: [from, to] } },
            order: [['spentOn', 'DESC']]
        });
        const mapped = mapExpenseRows(rows);
        const total = mapped.reduce((sum, row) => sum + toNum(row.amount), 0);
        res.status(200).json({ from, to, total, rows: mapped });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expense report', error: error.message });
    }
};

async function rowsFor(type, query) {
    const { from, to } = parseRange(query);
    if (type === 'sales') return csvSalesRows((await buildSalesReport(from, to)).rows);
    if (type === 'stock') {
        const products = await ownedProducts();
        return products.map((p) => ({ title: p.title, sku: p.sku, stock: p.stockMeters }));
    }
    if (type === 'profit') {
        return (await ownedProducts()).map((p) => {
            const json = withProductMargins(p);
            return { title: json.title, wholesaleProfit: json.wholesaleProfit.amount, retailProfit: json.retailProfit.amount };
        });
    }
    if (type === 'low-stock') {
        return (await ownedProducts())
            .filter((p) => toNum(p.stockMeters) <= toNum(p.minWholesaleQty))
            .map((p) => ({ title: p.title, stock: p.stockMeters, minQty: p.minWholesaleQty }));
    }
    if (type === 'suppliers') {
        return (await Supplier.findAll()).map((s) => ({ name: s.name, phone: s.phone, status: s.status }));
    }
    if (type === 'expenses') {
        const rows = await Expense.findAll({
            where: { spentOn: { [Op.between]: [from, to] } },
            order: [['spentOn', 'DESC']]
        });
        return csvExpenseRows(mapExpenseRows(rows));
    }
    const logs = await StockHistory.findAll({
        where: { type: 'Purchase', ShopId: await activeShopId(), ...datedBetween(from, to) }
    });
    return logs.map((l) => ({ date: l.date, qty: l.quantityChange ?? l.quantity, ref: l.referenceNumber || l.ref }));
}

exports.exportReport = async (req, res) => {
    try {
        const type = String(req.query.type || 'sales');
        const rows = await rowsFor(type, req.query);
        sendCsv(res, `${type}-report.csv`, rows);
    } catch (error) {
        res.status(500).json({ message: 'Error exporting report', error: error.message });
    }
};

