const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShopDigitalSetup = sequelize.define('ShopDigitalSetup', {
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
    isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
    ShopId: { type: DataTypes.INTEGER, defaultValue: 1 },
    bannerEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    bannerImage: { type: DataTypes.TEXT },
    bannerSub: { type: DataTypes.STRING },
    bannerHeadline: { type: DataTypes.STRING },
    bannerDescription: { type: DataTypes.TEXT },
    bannerCtaText: { type: DataTypes.STRING },
    bannerCtaLink: { type: DataTypes.STRING },
    coverBanner: { type: DataTypes.TEXT },
    heroBanners: { type: DataTypes.JSON, defaultValue: [] },
    shopDescription: { type: DataTypes.TEXT },
    storeThemeId: { type: DataTypes.STRING, defaultValue: 'standard-retail' },
    themeAssets: { type: DataTypes.JSON, defaultValue: {} }
});

module.exports = ShopDigitalSetup;
