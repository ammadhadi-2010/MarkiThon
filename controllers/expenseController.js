const { Op } = require('sequelize');
const Expense = require('../models/Expense');
const Staff = require('../models/Staff');
const { parseRange } = require('../utils/dateRange');
const {
    CAT_SALARY, CAT_ADVANCE, EXPENSE_CATEGORIES, isStaffCategory, monthRange, sumBy
} = require('../utils/expenseStaff');

async function resolveStaff(body, category) {
    if (!isStaffCategory(category)) return null;
    const id = Number(body.staffId);
    if (!id) {
        const err = new Error('Select a staff member for salary or advance.');
        err.status = 400;
        throw err;
    }
    const staff = await Staff.findByPk(id);
    if (!staff) {
        const err = new Error('Staff member not found.');
        err.status = 404;
        throw err;
    }
    return staff;
}

async function salaryPayAmount(staff, spentOn, requested) {
    const { from, to } = monthRange(spentOn);
    const rows = await Expense.findAll({
        where: { staffId: staff.id, spentOn: { [Op.between]: [from, to] } }
    });
    const advance = sumBy(rows, (e) => e.category === CAT_ADVANCE);
    const paid = sumBy(rows, (e) => e.category === CAT_SALARY);
    const remaining = Math.max(Number(staff.salary || 0) - advance - paid, 0);
    const amount = requested > 0 ? requested : remaining;
    if (amount - remaining > 0.009) {
        const err = new Error(
            `Net salary payable is Rs. ${remaining.toLocaleString()} after advance deduction.`
        );
        err.status = 400;
        throw err;
    }
    if (amount <= 0) {
        const err = new Error('No remaining salary this month after advances.');
        err.status = 400;
        throw err;
    }
    return { amount, offsetAmount: Math.min(advance, Number(staff.salary || 0)) };
}

exports.addExpense = async (req, res) => {
    try {
        if (!req.body.title) return res.status(400).json({ message: 'Expense title is required.' });
        const category = EXPENSE_CATEGORIES.includes(req.body.category)
            ? req.body.category
            : 'General Shop Expense';
        const staff = await resolveStaff(req.body, category);
        let amount = Number(req.body.amount) || 0;
        let offsetAmount = 0;
        if (category === CAT_SALARY && staff) {
            const pay = await salaryPayAmount(staff, req.body.spentOn, amount);
            amount = pay.amount;
            offsetAmount = pay.offsetAmount;
        }
        const row = await Expense.create({
            title: req.body.title,
            category,
            amount,
            spentOn: req.body.spentOn || new Date(),
            note: req.body.note,
            staffId: staff ? staff.id : null,
            staffName: staff ? staff.fullName : '',
            offsetAmount,
            ShopId: req.body.ShopId || 1
        });
        const message = category === CAT_SALARY
            ? `Salary saved. Advance offset Rs. ${offsetAmount.toLocaleString()}. Net paid Rs. ${amount.toLocaleString()}.`
            : 'Expense saved.';
        res.status(201).json({ message, expense: row });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Error saving expense' });
    }
};

exports.listExpenses = async (req, res) => {
    try {
        const { from, to } = parseRange(req.query);
        const rows = await Expense.findAll({
            where: { spentOn: { [Op.between]: [from, to] } },
            order: [['spentOn', 'DESC']]
        });
        const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0);
        res.status(200).json({ rows, total, categories: EXPENSE_CATEGORIES });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
};
