const CAT_SALARY = 'Staff Salary';
const CAT_ADVANCE = 'Staff Advance / Udhaar';
const EXPENSE_CATEGORIES = [
    CAT_SALARY,
    CAT_ADVANCE,
    'Shop Rent & Bills',
    'Guest Hospitality / Tea',
    'Delivery & Transport',
    'General Shop Expense'
];

function isStaffCategory(category) {
    return category === CAT_SALARY || category === CAT_ADVANCE;
}

function monthRange(spentOn) {
    const d = spentOn ? new Date(spentOn) : new Date();
    const from = new Date(d.getFullYear(), d.getMonth(), 1);
    const to = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    return { from, to };
}

function sumBy(rows, pred) {
    return (rows || []).filter(pred).reduce((sum, row) => sum + Number(row.amount || 0), 0);
}

module.exports = {
    CAT_SALARY,
    CAT_ADVANCE,
    EXPENSE_CATEGORIES,
    isStaffCategory,
    monthRange,
    sumBy
};
