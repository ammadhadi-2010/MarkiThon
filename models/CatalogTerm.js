const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CatalogTerm = sequelize.define('CatalogTerm', {
    kind: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    parentName: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
    shopId: { type: DataTypes.INTEGER, allowNull: false },
    ownerName: { type: DataTypes.STRING, allowNull: true },
    shopType: { type: DataTypes.STRING, allowNull: true }
}, {
    indexes: [{ unique: true, fields: ['kind', 'shopId', 'name', 'parentName'] }]
});

module.exports = CatalogTerm;
