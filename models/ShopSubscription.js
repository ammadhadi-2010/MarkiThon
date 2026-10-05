const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShopSubscription = sequelize.define('ShopSubscription', {
    selectedPackage: { type: DataTypes.STRING, defaultValue: 'Basic' },
    monthlyPrice: { type: DataTypes.FLOAT, defaultValue: 0 },
    yearlyPrice: { type: DataTypes.FLOAT, defaultValue: 0 },
    billingCycle: { type: DataTypes.STRING, defaultValue: 'monthly' },
    productLimit: { type: DataTypes.INTEGER, defaultValue: 50 },
    orderLimit: { type: DataTypes.INTEGER, defaultValue: 100 },
    limitOverrideProducts: { type: DataTypes.INTEGER, allowNull: true },
    limitOverrideOrders: { type: DataTypes.INTEGER, allowNull: true },
    extensionNote: { type: DataTypes.TEXT, allowNull: true },
    paymentMethod: { type: DataTypes.STRING, allowNull: true },
    transactionReference: { type: DataTypes.STRING, allowNull: true },
    paymentStatus: { type: DataTypes.STRING, defaultValue: 'free' },
    ShopId: { type: DataTypes.INTEGER, defaultValue: 1 }
});

module.exports = ShopSubscription;
