const { formatRs, formatLocalDate } = require('./reportDisplay');
const { toNum } = require('./profit');

function mapExpenseRow(row) {
    const amount = toNum(row.amount);
    return {
        date: row.spentOn || row.date,
        dateLabel: formatLocalDate(row.spentOn || row.date),
        title: row.title,
        category: row.category,
        staff: row.staffName || row.staff || '-',
        amount,
        amountLabel: formatRs(amount)
    };
}

function mapExpenseRows(list) {
    return (list || []).map(mapExpenseRow);
}

function csvExpenseRows(rows) {
    return (rows || []).map((row) => ({
        Date: row.dateLabel,
        'Title / Reason': row.title,
        Category: row.category,
        'Staff Member': row.staff,
        'Amount (Rs.)': row.amountLabel
    }));
}

module.exports = { mapExpenseRows, csvExpenseRows };
