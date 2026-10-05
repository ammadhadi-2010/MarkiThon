const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShopExpense = sequelize.define('ShopExpense', {
    shopRent: { type: DataTypes.FLOAT, defaultValue: 0 },
    electricityBill: { type: DataTypes.FLOAT, defaultValue: 0 },
    internetWifi: { type: DataTypes.FLOAT, defaultValue: 0 },
    staffSalaries: { type: DataTypes.FLOAT, defaultValue: 0 },
    otherExpenses: { type: DataTypes.FLOAT, defaultValue: 0 },
    totalMonthlyExpense: { type: DataTypes.FLOAT, defaultValue: 0 },
    additionalNotes: { type: DataTypes.TEXT },
    ShopId: { type: DataTypes.INTEGER, defaultValue: 1 }
});

module.exports = ShopExpense;
