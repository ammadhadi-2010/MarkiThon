const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SHOP_TYPES = ['Fabric Shop', 'Suit Shop', 'Home Textile', 'General Store', 'Mobile Accessories'];
const BUSINESS_TYPES = ['Retail', 'Wholesale', 'Both'];

const ShopProfile = sequelize.define('ShopProfile', {
    shopName: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Ammad Hadi Stor' },
    ownerName: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Ammad Hadi' },
    ownerCnic: { type: DataTypes.STRING, allowNull: true },
    shopSku: { type: DataTypes.STRING, allowNull: true },
    phoneNumber: { type: DataTypes.STRING, allowNull: false },
    emailAddress: { type: DataTypes.STRING, allowNull: false },
    marketName: { type: DataTypes.STRING, allowNull: false },
    shopNumber: { type: DataTypes.STRING, allowNull: false },
    shopAddress: { type: DataTypes.STRING, allowNull: false },
    imageUrl: { type: DataTypes.TEXT },
    shopType: { type: DataTypes.STRING, defaultValue: 'Fabric Shop' },
    businessType: { type: DataTypes.STRING, defaultValue: 'Both' },
    productTypes: { type: DataTypes.JSON, defaultValue: [] },
    websiteUrl: { type: DataTypes.STRING },
    whatsappNumber: { type: DataTypes.STRING },
    facebookPage: { type: DataTypes.STRING },
    instagramHandle: { type: DataTypes.STRING },
    youtubeChannel: { type: DataTypes.STRING },
    storeLocation: { type: DataTypes.STRING },
    latitude: { type: DataTypes.FLOAT },
    longitude: { type: DataTypes.FLOAT },
    marketPosition: { type: DataTypes.STRING },
    landmarkNote: { type: DataTypes.STRING },
    isSetupCompleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    accessPermissions: {
        type: DataTypes.JSON,
        defaultValue: ['Owner', 'Manager', 'Salesman', 'Inventory Staff', 'Accountant']
    },
    ShopId: { type: DataTypes.INTEGER, defaultValue: 1 },
    policyHighlights: { type: DataTypes.TEXT, allowNull: true },
    policyDeliveryTime: { type: DataTypes.STRING, allowNull: true },
    policyDeliveryCharge: { type: DataTypes.STRING, allowNull: true },
    policyDeliveryDetail: { type: DataTypes.TEXT, allowNull: true },
    policyReturn: { type: DataTypes.TEXT, allowNull: true }
});

const PRODUCT_TYPES = [
    'Fabric / Kapra',
    'Ready-Made Suits',
    'Bedsheet',
    'Blanket / Kambal',
    'Takiya / Pillow',
    'Quilt / Razai',
    'Garments',
    'Mobile Accessories',
    'Other Products'
];

ShopProfile.SHOP_TYPES = SHOP_TYPES;
ShopProfile.BUSINESS_TYPES = BUSINESS_TYPES;
ShopProfile.PRODUCT_TYPES = PRODUCT_TYPES;
module.exports = ShopProfile;
