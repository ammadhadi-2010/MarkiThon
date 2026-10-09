const Product = require('../models/Product');
const ShopProfile = require('../models/ShopProfile');
const { mapAdminProduct } = require('./adminProductMap');

async function liveProducts() {
    const [products, profiles] = await Promise.all([
        Product.findAll({
            attributes: [
                'id', 'title', 'sku', 'category', 'retailPrice', 'storeOnlinePrice', 'stockMeters',
                'sellUnit', 'stockUnit', 'imageUrl', 'storePublished', 'marketplaceStatus',
                'storeFeatured', 'storeNewArrival', 'storeSale', 'ShopId', 'createdAt'
            ],
            order: [['createdAt', 'DESC']],
            raw: true
        }),
        ShopProfile.findAll({ attributes: ['ShopId', 'shopName'], raw: true })
    ]);
    const names = {};
    profiles.forEach((row) => { names[row.ShopId] = row.shopName; });
    return products.map((row, index) => mapAdminProduct(row, names[row.ShopId], index));
}

module.exports = { liveProducts };
