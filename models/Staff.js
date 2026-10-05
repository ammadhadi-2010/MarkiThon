const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const STAFF_ROLES = ['Manager', 'Salesman', 'Inventory Staff', 'Helper', 'Accountant'];

const Staff = sequelize.define('Staff', {
    fullName: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false },
    salary: { type: DataTypes.FLOAT, defaultValue: 0 },
    status: { type: DataTypes.STRING, defaultValue: 'Active' },
    permissions: { type: DataTypes.JSON, defaultValue: [] },
    ShopId: { type: DataTypes.INTEGER, defaultValue: 1 }
});

Staff.STAFF_ROLES = STAFF_ROLES;
module.exports = Staff;
