const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const STATUSES = ['New', 'Confirmed', 'Processing', 'Dispatched', 'Completed', 'Cancelled'];
const PAYMENTS = ['Paid', 'COD', 'Mobile Wallet'];

const StoreOrder = sequelize.define('StoreOrder', {
    orderNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    customerName: { type: DataTypes.STRING, allowNull: false },
    customerPhone: { type: DataTypes.STRING },
    items: { type: DataTypes.JSON, defaultValue: [] },
    itemCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    total: { type: DataTypes.FLOAT, defaultValue: 0 },
    payment: { type: DataTypes.STRING, defaultValue: 'Paid' },
    status: { type: DataTypes.STRING, defaultValue: 'New' },
    note: { type: DataTypes.STRING },
    details: { type: DataTypes.JSON, defaultValue: {} },
    buyerId: { type: DataTypes.UUID },
    ShopId: { type: DataTypes.INTEGER, defaultValue: 1 }
});

StoreOrder.STATUSES = STATUSES;
StoreOrder.PAYMENTS = PAYMENTS;

module.exports = StoreOrder;
