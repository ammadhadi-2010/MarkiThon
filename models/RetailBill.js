const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RetailBill = sequelize.define('RetailBill', {
    billNumber: { type: DataTypes.STRING, allowNull: false },
    customerName: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Walk-in Customer' },
    customerPhone: { type: DataTypes.STRING },
    subTotal: { type: DataTypes.FLOAT, defaultValue: 0 },
    discount: { type: DataTypes.FLOAT, defaultValue: 0 },
    grandTotal: { type: DataTypes.FLOAT, defaultValue: 0 },
    paymentMethod: {
        type: DataTypes.ENUM('Cash', 'JazzCash', 'EasyPaisa', 'Bank Transfer'),
        defaultValue: 'Cash'
    },
    notes: { type: DataTypes.TEXT },
    ShopId: { type: DataTypes.INTEGER, defaultValue: 1 }
});

module.exports = RetailBill;
