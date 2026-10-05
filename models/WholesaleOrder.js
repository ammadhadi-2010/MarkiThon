const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WholesaleOrder = sequelize.define('WholesaleOrder', {
    orderNumber: { type: DataTypes.STRING, allowNull: false },
    customerName: { type: DataTypes.STRING, allowNull: false },
    customerPhone: { type: DataTypes.STRING },
    subTotal: { type: DataTypes.FLOAT, defaultValue: 0 },
    discount: { type: DataTypes.FLOAT, defaultValue: 0 },
    grandTotal: { type: DataTypes.FLOAT, defaultValue: 0 },
    paymentMethod: {
        type: DataTypes.ENUM('Cash', 'Bank Transfer', 'JazzCash', 'EasyPaisa'),
        defaultValue: 'Cash'
    },
    notes: { type: DataTypes.TEXT },
    WholesalerId: { type: DataTypes.INTEGER },
    ShopId: { type: DataTypes.INTEGER, defaultValue: 1 }
});

module.exports = WholesaleOrder;
