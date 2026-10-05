const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockVoucher = sequelize.define('StockVoucher', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    billNo: { type: DataTypes.STRING, allowNull: false },
    receivedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    supplierId: { type: DataTypes.INTEGER, allowNull: false },
    supplierName: { type: DataTypes.STRING },
    productId: { type: DataTypes.UUID, allowNull: false },
    productTitle: { type: DataTypes.STRING },
    stockUnit: { type: DataTypes.STRING, defaultValue: 'Meter' },
    sellUnit: { type: DataTypes.STRING, defaultValue: 'Gaz' },
    purchasePrice: { type: DataTypes.FLOAT, defaultValue: 0 },
    wholesalePrice: { type: DataTypes.FLOAT, defaultValue: 0 },
    retailPrice: { type: DataTypes.FLOAT, defaultValue: 0 },
    quantity: { type: DataTypes.FLOAT, defaultValue: 0 },
    total: { type: DataTypes.FLOAT, defaultValue: 0 },
    amountPaid: { type: DataTypes.FLOAT, defaultValue: 0 },
    paymentMode: { type: DataTypes.STRING, defaultValue: 'full' },
    payMethod: { type: DataTypes.STRING, defaultValue: 'Cash' },
    variants: { type: DataTypes.TEXT, defaultValue: '[]' },
    ShopId: { type: DataTypes.INTEGER, defaultValue: 1 }
});

module.exports = StockVoucher;
