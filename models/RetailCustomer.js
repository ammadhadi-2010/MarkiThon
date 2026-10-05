const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RetailCustomer = sequelize.define('RetailCustomer', {
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    whatsapp: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    area: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'Active' },
    vip: { type: DataTypes.BOOLEAN, defaultValue: false },
    totalOrders: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalPurchase: { type: DataTypes.FLOAT, defaultValue: 0 },
    lastOrderAt: { type: DataTypes.DATE },
    email: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    pendingDue: { type: DataTypes.FLOAT, defaultValue: 0 },
    joinedAt: { type: DataTypes.DATE },
    details: { type: DataTypes.JSON, defaultValue: {} },
    ShopId: { type: DataTypes.INTEGER, defaultValue: 1 }
});

module.exports = RetailCustomer;
