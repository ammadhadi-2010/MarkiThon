const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Wholesaler = require('./Wholesaler');

const WholesalerLedger = sequelize.define('WholesalerLedger', {
    wholesalerId: { type: DataTypes.INTEGER, allowNull: false },
    type: {
        type: DataTypes.ENUM('SALE', 'PAYMENT'),
        allowNull: false
    },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    note: { type: DataTypes.STRING },
    ref: { type: DataTypes.STRING },
    entryDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    ShopId: { type: DataTypes.INTEGER, defaultValue: 1 }
});

Wholesaler.hasMany(WholesalerLedger, { foreignKey: 'wholesalerId', as: 'ledger' });
WholesalerLedger.belongsTo(Wholesaler, { foreignKey: 'wholesalerId' });

module.exports = WholesalerLedger;
