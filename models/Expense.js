const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
    title: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, defaultValue: 'General' },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    spentOn: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    note: { type: DataTypes.STRING },
    staffId: { type: DataTypes.INTEGER, allowNull: true },
    staffName: { type: DataTypes.STRING, allowNull: true },
    offsetAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
    ShopId: { type: DataTypes.INTEGER, defaultValue: 1 }
});

module.exports = Expense;
