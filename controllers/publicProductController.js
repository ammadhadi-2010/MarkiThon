const Product = require('../models/Product');
const ProductReview = require('../models/ProductReview');
const ShopProfile = require('../models/ShopProfile');
const { resolvePolicy } = require('../utils/publicPolicy');
const { publicStory } = require('../utils/storeStory');

function imageList(row) {
    const urls = [];
    try {
        const stored = JSON.parse(row.storeImages || '[]');
        if (Array.isArray(stored)) stored.forEach((url) => url && urls.push(String(url)));
    } catch (error) {
        /* ignore malformed gallery json */
    }
    [row.storeStickerImage, row.imageUrl].forEach((url) => {
        if (url && !urls.includes(url)) urls.push(url);
    });
    return urls;
}

function variationList(row) {
    const names = [row.color, row.bedsheetSize, row.blanketSize, row.stockUnit]
        .map((value) => String(value || '').trim())
        .filter(Boolean);
    return names.length ? [...new Set(names)] : ['Standard'];
}

exports.getPublicProduct = async (req, res) => {
    try {
        const id = String(req.params.id || '');
        if (!/^[0-9a-f-]{36}$/i.test(id)) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        const product = await Product.findByPk(id);
        if (!product || product.storePublished === false) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        const row = product.toJSON();
        let profile = await ShopProfile.findOne({ where: { ShopId: row.ShopId || 1 } });
        if (!profile) profile = await ShopProfile.findOne({ order: [['id', 'ASC']] });
        const online = Number(row.storeOnlinePrice) > 0 ? Number(row.storeOnlinePrice) : Number(row.retailPrice) || 0;
        const compare = Number(row.storeDiscountPrice) > online ? Number(row.storeDiscountPrice) : online;
        const stock = Number(row.stockMeters) || 0;
        const images = imageList(row);
        const policy = resolvePolicy(row, profile);
        const reviews = await ProductReview.findAll({
            where: { productId: row.id },
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        const reviewRows = reviews.map((item) => ({
            id: item.id,
            reviewerName: item.reviewerName,
            stars: item.stars,
            description: item.description
        }));
        const rating = reviewRows.length
            ? (reviewRows.reduce((sum, item) => sum + item.stars, 0) / reviewRows.length).toFixed(1)
            : '';
        res.status(200).json({
            id: row.id,
            name: row.storeTitle || row.title,
            title: row.storeTitle || row.title,
            description: row.storeDescription || row.storeShortDescription || '',
            images,
            imageUrl: images[0] || '',
            retailPrice: compare,
            discountPrice: compare > online ? online : 0,
            salePrice: online,
            stock,
            stockStatus: stock <= 0 ? 'out' : stock <= 20 ? 'low' : 'in',
            variations: variationList(row),
            category: row.category || 'Products',
            shopName: (profile && profile.shopName) || 'Ammad Hadi Stor',
            storeNewArrival: Boolean(row.storeNewArrival),
            storeSale: Boolean(row.storeSale) || compare > online,
            highlights: policy.highlights,
            deliveryTime: policy.deliveryTime,
            deliveryCharges: policy.deliveryCharges,
            deliveryDetails: policy.deliveryDetails,
            returnPolicy: policy.returnPolicy,
            ...publicStory(row),
            reviews: reviewRows,
            rating,
            reviewCount: reviewRows.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};
