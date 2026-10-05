const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wholesaler = sequelize.define('Wholesaler', {
    name: { type: DataTypes.STRING, allowNull: false },
    shopName: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    creditLimit: { type: DataTypes.FLOAT, defaultValue: 0 },
    notes: { type: DataTypes.TEXT },
    ShopId: { type: DataTypes.INTEGER, defaultValue: 1 }
});

module.exports = Wholesaler;
