const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ledger = sequelize.define('Ledger', {
    customerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    transactionType: {
        type: DataTypes.ENUM('BILL', 'PAYMENT'), // BILL = Udhaar, PAYMENT = Wapsi
        allowNull: false
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING
    }
});

module.exports = Ledger;