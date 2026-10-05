const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sale = sequelize.define('Sale', {
    customerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    customerPhone: {
        type: DataTypes.STRING
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    paidAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    dueAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
});

module.exports = Sale;