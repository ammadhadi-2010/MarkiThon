const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockHistory = sequelize.define('StockHistory', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    ProductId: { type: DataTypes.UUID, allowNull: true },
    productId: { type: DataTypes.UUID, allowNull: true },
    type: {
        type: DataTypes.ENUM('Purchase', 'Wholesale Sale', 'Retail Sale'),
        allowNull: false
    },
    quantityChange: { type: DataTypes.FLOAT, allowNull: true },
    quantity: { type: DataTypes.FLOAT, allowNull: true },
    balance: { type: DataTypes.FLOAT, allowNull: false },
    referenceNumber: { type: DataTypes.STRING },
    ref: { type: DataTypes.STRING },
    ShopId: { type: DataTypes.INTEGER, defaultValue: 1 }
});

module.exports = StockHistory;
