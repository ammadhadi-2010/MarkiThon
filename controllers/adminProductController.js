const Product = require('../models/Product');
const ShopProfile = require('../models/ShopProfile');
const { purgeProductById } = require('../utils/purgeProduct');
const {
    normStatus,
    applyMarketplaceStatus,
    mapAdminProduct,
    countStatuses
} = require('../utils/adminProductMap');

async function loadMapped() {
    const [products, profiles] = await Promise.all([
        Product.findAll({
            attributes: [
                'id', 'title', 'sku', 'category', 'retailPrice', 'storeOnlinePrice', 'stockMeters',
                'sellUnit', 'stockUnit', 'imageUrl', 'storePublished', 'marketplaceStatus',
                'storeFeatured', 'storeNewArrival', 'storeSale', 'ShopId', 'createdAt'
            ],
            order: [['createdAt', 'DESC']]
        }),
        ShopProfile.findAll({ attributes: ['ShopId', 'shopName'], raw: true })
    ]);
    const names = {};
    profiles.forEach((row) => { names[row.ShopId] = row.shopName; });
    return products.map((row, index) =>
        mapAdminProduct(row.get ? row.get({ plain: true }) : row, names[row.ShopId], index));
}

exports.listProducts = async (req, res) => {
    try {
        const products = await loadMapped();
        res.status(200).json({ products, counts: countStatuses(products) });
    } catch (error) {
        res.status(500).json({ message: 'Could not load products.', error: error.message });
    }
};

exports.setStatus = async (req, res) => {
    try {
        const status = normStatus(req.body && req.body.status);
        if (!status) {
            return res.status(400).json({ message: 'Status must be published, hidden, or pending.' });
        }
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        await product.update(applyMarketplaceStatus(status));
        const products = await loadMapped();
        const row = products.find((item) => String(item.id) === String(product.id));
        res.status(200).json({
            message: `Product marked ${status}.`,
            product: row,
            products,
            counts: countStatuses(products)
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not update product status.', error: error.message });
    }
};

exports.removeProduct = async (req, res) => {
    try {
        const purged = await purgeProductById(req.params.id);
        if (!purged) return res.status(404).json({ message: 'Product not found.' });
        const products = await loadMapped();
        res.status(200).json({
            message: 'Product deleted.',
            ids: purged.ids,
            products,
            counts: countStatuses(products)
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not delete product.', error: error.message });
    }
};

exports.bulkProducts = async (req, res) => {
    try {
        const ids = [...new Set((Array.isArray(req.body && req.body.ids) ? req.body.ids : []).map(String))];
        const action = String(req.body && req.body.action || '').toLowerCase();
        const status = normStatus(action);
        if (!ids.length) return res.status(400).json({ message: 'Select at least one product.' });
        if (action !== 'delete' && !status) {
            return res.status(400).json({ message: 'Choose Publish, Hide, Pending, or Delete.' });
        }
        if (action === 'delete') {
            for (const id of ids) await purgeProductById(id);
        } else {
            const patch = applyMarketplaceStatus(status);
            await Product.update(patch, { where: { id: ids } });
        }
        const products = await loadMapped();
        res.status(200).json({
            message: action === 'delete' ? 'Selected products deleted.' : `Selected products marked ${status}.`,
            products,
            counts: countStatuses(products)
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not update products.', error: error.message });
    }
};
