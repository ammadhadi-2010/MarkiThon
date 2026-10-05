const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const WholesaleOrder = require('./WholesaleOrder');
const Product = require('./Product');

const WholesaleOrderItem = sequelize.define('WholesaleOrderItem', {
    WholesaleOrderId: { type: DataTypes.INTEGER, allowNull: false },
    ProductId: { type: DataTypes.UUID, allowNull: false },
    quantityMeters: { type: DataTypes.FLOAT, allowNull: false },
    quantitySold: { type: DataTypes.FLOAT, allowNull: true },
    sellUnit: { type: DataTypes.STRING, allowNull: true },
    rate: { type: DataTypes.FLOAT, allowNull: false },
    total: { type: DataTypes.FLOAT, allowNull: false }
});

WholesaleOrder.hasMany(WholesaleOrderItem, { foreignKey: 'WholesaleOrderId', as: 'items' });
WholesaleOrderItem.belongsTo(WholesaleOrder, { foreignKey: 'WholesaleOrderId' });
WholesaleOrderItem.belongsTo(Product, { foreignKey: 'ProductId' });
Product.hasMany(WholesaleOrderItem, { foreignKey: 'ProductId' });

module.exports = WholesaleOrderItem;
