const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/** Single-row platform category tree (admin hierarchy). Never wipe on boot. */
const PlatformCategoryStore = sequelize.define('PlatformCategoryStore', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tree: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} }
});

module.exports = PlatformCategoryStore;
