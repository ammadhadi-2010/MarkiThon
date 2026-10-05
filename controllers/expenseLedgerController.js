const { Op } = require('sequelize');
const Expense = require('../models/Expense');
const Staff = require('../models/Staff');
const { CAT_SALARY, CAT_ADVANCE, monthRange, sumBy } = require('../utils/expenseStaff');

exports.staffLedger = async (req, res) => {
    try {
        const { from, to } = monthRange(req.query.date);
        const [staff, rows] = await Promise.all([
            Staff.findAll({
                where: { ShopId: 1, status: 'Active' },
                order: [['fullName', 'ASC']]
            }),
            Expense.findAll({ where: { spentOn: { [Op.between]: [from, to] } } })
        ]);
        const ledger = staff.map((s) => {
            const mine = rows.filter((e) => String(e.staffId) === String(s.id));
            const advanceThisMonth = sumBy(mine, (e) => e.category === CAT_ADVANCE);
            const salaryPaidThisMonth = sumBy(mine, (e) => e.category === CAT_SALARY);
            const baseSalary = Number(s.salary || 0);
            return {
                staffId: s.id,
                name: s.fullName,
                role: s.role,
                baseSalary,
                advanceThisMonth,
                salaryPaidThisMonth,
                netPayable: baseSalary - advanceThisMonth - salaryPaidThisMonth
            };
        });
        res.status(200).json({ from, to, rows: ledger });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching staff ledger', error: error.message });
    }
};
