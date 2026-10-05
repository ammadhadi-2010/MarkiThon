const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setting = sequelize.define('Setting', {
    shopName: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Ammad Hadi Stor' },
    ownerName: { type: DataTypes.STRING, defaultValue: 'Admin' },
    phone: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    ShopId: { type: DataTypes.INTEGER, defaultValue: 1 }
});

module.exports = Setting;
