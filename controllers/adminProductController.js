const { Op } = require('sequelize');
const Product = require('../models/Product');
const ShopProfile = require('../models/ShopProfile');
const { purgeProductById } = require('../utils/purgeProduct');
const {
    normStatus,
    applyMarketplaceStatus,
    groupAdminProducts,
    countStatuses,
    expandVariantIds
} = require('../utils/adminProductMap');

async function loadMapped() {
    const [products, profiles] = await Promise.all([
        Product.findAll({
            attributes: [
                'id', 'title', 'sku', 'category', 'color', 'retailPrice', 'storeOnlinePrice', 'stockMeters',
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
    return groupAdminProducts(products, names);
}

async function familyIdsForProduct(product) {
    if (!product) return [];
    const title = String(product.title || '').trim();
    if (!title) return [String(product.id)];
    const pack = await Product.findAll({
        attributes: ['id'],
        where: { ShopId: product.ShopId || 1, title },
        raw: true
    });
    return pack.length ? pack.map((row) => String(row.id)) : [String(product.id)];
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
        const ids = await familyIdsForProduct(product);
        await Product.update(applyMarketplaceStatus(status), { where: { id: { [Op.in]: ids } } });
        const products = await loadMapped();
        const row = products.find((item) =>
            String(item.id) === String(product.id)
            || (item.variantIds || []).includes(String(product.id)));
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
        const selected = [...new Set((Array.isArray(req.body && req.body.ids) ? req.body.ids : []).map(String))];
        const action = String(req.body && req.body.action || '').toLowerCase();
        const status = normStatus(action);
        if (!selected.length) return res.status(400).json({ message: 'Select at least one product.' });
        if (action !== 'delete' && !status) {
            return res.status(400).json({ message: 'Choose Publish, Hide, Pending, or Delete.' });
        }
        const listed = await loadMapped();
        const ids = expandVariantIds(listed, selected);
        if (action === 'delete') {
            const done = new Set();
            for (const id of ids) {
                if (done.has(id)) continue;
                const purged = await purgeProductById(id);
                (purged && purged.ids ? purged.ids : [id]).forEach((item) => done.add(String(item)));
            }
        } else {
            await Product.update(applyMarketplaceStatus(status), { where: { id: { [Op.in]: ids } } });
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
