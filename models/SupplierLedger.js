const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupplierLedger = sequelize.define('SupplierLedger', {
    supplierId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM('PURCHASE', 'PAYMENT'), allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    method: { type: DataTypes.STRING },
    note: { type: DataTypes.STRING },
    invoiceImage: { type: DataTypes.TEXT },
    paymentProof: { type: DataTypes.TEXT },
    ref: { type: DataTypes.STRING },
    brand: { type: DataTypes.STRING },
    txnId: { type: DataTypes.STRING },
    productId: { type: DataTypes.UUID },
    entryDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    ShopId: { type: DataTypes.INTEGER, defaultValue: 1 }
});

module.exports = SupplierLedger;
