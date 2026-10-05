const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VendorAccount = sequelize.define('VendorAccount', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'vendor' },
    shopkeeperId: { type: DataTypes.STRING, unique: true },
    shopName: { type: DataTypes.STRING, allowNull: false },
    ownerName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    imageUrl: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Pending Admin Approval' },
    biometricEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    webauthnCredId: { type: DataTypes.STRING },
    webauthnPublicKey: { type: DataTypes.TEXT }
});

VendorAccount.beforeCreate((row) => {
    row.role = 'vendor';
});

VendorAccount.beforeUpdate((row) => {
    row.role = 'vendor';
});

module.exports = VendorAccount;
