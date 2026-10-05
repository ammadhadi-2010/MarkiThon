const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReportDownload = sequelize.define('ReportDownload', {
    title: { type: DataTypes.STRING, allowNull: false },
    reportType: { type: DataTypes.STRING, allowNull: false },
    rangeLabel: { type: DataTypes.STRING },
    ShopId: { type: DataTypes.INTEGER, defaultValue: 1 }
});

module.exports = ReportDownload;
