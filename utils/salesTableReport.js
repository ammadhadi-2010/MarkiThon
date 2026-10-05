const { Op } = require('sequelize');
const WholesaleOrder = require('../models/WholesaleOrder');
const RetailBill = require('../models/RetailBill');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const { toNum } = require('./profit');
const { createdBetween } = require('./dateRange');
const { loadSoldLines } = require('./salesLines');
const { formatRs, formatLocalDateTime } = require('./reportDisplay');

function mapSaleRow(channel, ref, customer, total, date) {
    const amount = toNum(total);
    return {
        channel,
        referenceId: ref || '-',
        customer: customer || 'Walk-in Customer',
        totalAmount: amount,
        dateTime: date,
        totalAmountLabel: formatRs(amount),
        dateTimeLabel: formatLocalDateTime(date)
    };
}

function csvSalesRows(rows) {
    return (rows || []).map((row) => ({
        Channel: row.channel,
        'Reference ID': row.referenceId,
        Customer: row.customer,
        'Total Amount': row.totalAmountLabel,
        'Date & Time': row.dateTimeLabel
    }));
}

function sumField(rows, key) {
    return (rows || []).reduce((sum, row) => sum + toNum(row[key]), 0);
}

async function buildSalesReport(from, to) {
    const where = createdBetween(from, to);
    const [wholesale, retail, pos, expenseSum, lines] = await Promise.all([
        WholesaleOrder.findAll({ where, order: [['createdAt', 'DESC']] }),
        RetailBill.findAll({ where, order: [['createdAt', 'DESC']] }),
        Sale.findAll({ where, order: [['createdAt', 'DESC']] }),
        Expense.sum('amount', { where: { spentOn: { [Op.between]: [from, to] } } }),
        loadSoldLines(from, to)
    ]);
    const rows = [
        ...wholesale.map((o) => mapSaleRow('Wholesale', o.orderNumber, o.customerName, o.grandTotal, o.createdAt)),
        ...retail.map((o) => mapSaleRow('Retail', o.billNumber, o.customerName, o.grandTotal, o.createdAt)),
        ...pos.map((o) => mapSaleRow('POS', `SALE-${o.id}`, o.customerName, o.totalAmount, o.createdAt))
    ].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    const totalSalesRevenue = sumField(wholesale, 'grandTotal') + sumField(retail, 'grandTotal');
    const totalExpenses = toNum(expenseSum);
    const cogs = (lines || []).reduce((sum, line) => sum + toNum(line.cost), 0);
    return {
        from,
        to,
        rows,
        count: rows.length,
        totalSalesRevenue,
        totalExpenses,
        cogs,
        estimatedNetProfit: totalSalesRevenue - cogs - totalExpenses
    };
}

module.exports = { buildSalesReport, csvSalesRows };
