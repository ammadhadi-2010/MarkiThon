const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const RetailBill = require('./RetailBill');
const Product = require('./Product');

const RetailBillItem = sequelize.define('RetailBillItem', {
    RetailBillId: { type: DataTypes.INTEGER, allowNull: false },
    ProductId: { type: DataTypes.UUID, allowNull: false },
    quantityMeters: { type: DataTypes.FLOAT, allowNull: false },
    quantitySold: { type: DataTypes.FLOAT, allowNull: true },
    sellUnit: { type: DataTypes.STRING, allowNull: true },
    rate: { type: DataTypes.FLOAT, allowNull: false },
    total: { type: DataTypes.FLOAT, allowNull: false }
});

RetailBill.hasMany(RetailBillItem, { foreignKey: 'RetailBillId', as: 'items' });
RetailBillItem.belongsTo(RetailBill, { foreignKey: 'RetailBillId' });
RetailBillItem.belongsTo(Product, { foreignKey: 'ProductId' });
Product.hasMany(RetailBillItem, { foreignKey: 'ProductId' });

module.exports = RetailBillItem;
