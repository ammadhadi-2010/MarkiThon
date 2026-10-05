const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BuyerAccount = sequelize.define('BuyerAccount', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'buyer' },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true },
    phone: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    authProvider: { type: DataTypes.STRING, allowNull: false, defaultValue: 'email' },
    googleSub: { type: DataTypes.STRING, unique: true },
    preferences: { type: DataTypes.JSON, defaultValue: {} }
});

function forceBuyerRole(row) {
    row.role = 'buyer';
}

BuyerAccount.beforeCreate(forceBuyerRole);
BuyerAccount.beforeUpdate(forceBuyerRole);

module.exports = BuyerAccount;
