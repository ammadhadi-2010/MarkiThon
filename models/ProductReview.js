const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductReview = sequelize.define('ProductReview', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    productId: { type: DataTypes.UUID, allowNull: false },
    reviewerName: { type: DataTypes.STRING, allowNull: false },
    stars: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false }
});

module.exports = ProductReview;
