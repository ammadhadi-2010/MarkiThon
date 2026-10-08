const Product = require('../models/Product');
const { toNum, withProductMargins } = require('../utils/profit');
const { logStock } = require('../utils/stockHistory');
const { applyBedsheetFields } = require('../utils/bedsheetCatalog');
const { applyBlanketFields, isBlanketCategory } = require('../utils/blanketCatalog');
const { purgeProductById } = require('../utils/purgeProduct');
const { activeShopId, sameShop } = require('../utils/shopScope');
const { applyMobileFields } = require('../utils/mobileCatalog');
const { findShopProductConflict } = require('../utils/productDedupe');

function blank(value) {
    const text = String(value == null ? '' : value).trim();
    return text || null;
}

function identityFromBody(body) {
    const data = {
        title: body.title,
        brand: blank(body.brand),
        category: blank(body.category),
        subCategory: blank(body.subCategory),
        fabricType: blank(body.fabricType),
        barcode: blank(body.barcode),
        sku: blank(body.sku),
        imageUrl: (() => {
            const url = blank(body.imageUrl);
            if (url && url.length > 400000) {
                throw new Error('IMAGE_TOO_LARGE');
            }
            return url;
        })(),
        stockUnit: body.stockUnit || 'Meter',
        sellUnit: blank(body.sellUnit) || 'Gaz',
        metersPerSellUnit: toNum(body.metersPerSellUnit) > 0
            ? toNum(body.metersPerSellUnit)
            : (/^meter/i.test(String(body.sellUnit || 'Gaz')) ? 1 : 0.9144),
        supplierId: body.supplierId ? Number(body.supplierId) : null
    };
    if (body.minSellingRate !== undefined && body.minSellingRate !== '') {
        data.minSellingRate = Math.max(toNum(body.minSellingRate), 0);
    }
    return applyMobileFields(applyBlanketFields(applyBedsheetFields(data, body), body), body);
}

function rejectIfInvalid(data, res) {
    if (isBlanketCategory(data.category) && !(Number(data.blanketWeight) > 0)) {
        res.status(400).json({ message: 'Blanket weight (KG) is required.' });
        return true;
    }
    return false;
}

function skuTaken(error) {
    return error.name === 'SequelizeUniqueConstraintError'
        || /unique|duplicate/i.test(String(error.message || ''));
}

exports.addProduct = async (req, res) => {
    try {
        if (!req.body.title || !String(req.body.title).trim()) {
            return res.status(400).json({ message: 'Product name is required.' });
        }
        const data = identityFromBody(req.body);
        data.ShopId = await activeShopId();
        if (rejectIfInvalid(data, res)) return;
        if (!data.sku) data.sku = `AH-${Date.now().toString(36).toUpperCase()}`;
        const existing = await findShopProductConflict(data.ShopId, data);
        if (existing) {
            await existing.update({
                ...data,
                stockMeters: existing.stockMeters,
                purchasePrice: existing.purchasePrice,
                wholesalePrice: existing.wholesalePrice,
                retailPrice: existing.retailPrice,
                minWholesaleQty: existing.minWholesaleQty
            });
            const json = withProductMargins(existing);
            return res.status(200).json({
                message: 'Matching product updated instead of creating a duplicate.',
                product: json,
                wholesaleProfit: json.wholesaleProfit.amount,
                retailProfit: json.retailProfit.amount,
                deduped: true
            });
        }
        const opening = Math.max(toNum(req.body.openingStock), 0);
        const product = await Product.create({
            ...data,
            purchasePrice: 0,
            wholesalePrice: 0,
            retailPrice: 0,
            minSellingRate: toNum(req.body.minSellingRate),
            minWholesaleQty: 1,
            stockMeters: opening
        });
        if (opening > 0) {
            await logStock({
                productId: product.id,
                type: 'Purchase',
                quantity: opening,
                balance: opening,
                ref: 'OPEN',
                ShopId: data.ShopId
            });
        }
        const json = withProductMargins(product);
        res.status(201).json({
            message: 'Product saved successfully.',
            product: json,
            wholesaleProfit: json.wholesaleProfit.amount,
            retailProfit: json.retailProfit.amount
        });
    } catch (error) {
        if (skuTaken(error)) {
            return res.status(400).json({ message: 'This SKU already exists. Use a new SKU code.' });
        }
        if (error.message === 'IMAGE_TOO_LARGE') {
            return res.status(400).json({ message: 'Product image is too large. Upload a smaller photo.' });
        }
        res.status(500).json({ message: 'Error adding product', error: error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { ShopId: await activeShopId() },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(products.map(withProductMargins));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        const shopId = await activeShopId();
        if (!sameShop(product, shopId)) {
            return res.status(403).json({ message: 'You can only manage products for this shop.' });
        }
        const data = identityFromBody({ ...product.toJSON(), ...req.body });
        data.ShopId = shopId;
        if (rejectIfInvalid(data, res)) return;
        if (!data.sku) data.sku = product.sku || `AH-${Date.now().toString(36).toUpperCase()}`;
        const conflict = await findShopProductConflict(shopId, data, product.id);
        if (conflict) {
            return res.status(400).json({
                message: 'Another product already uses this SKU, barcode, or title. Update that item instead.'
            });
        }
        await product.update({
            ...data,
            stockMeters: product.stockMeters,
            purchasePrice: product.purchasePrice,
            wholesalePrice: product.wholesalePrice,
            retailPrice: product.retailPrice,
            minWholesaleQty: product.minWholesaleQty
        });
        res.status(200).json({ message: 'Catalog product updated.', product: withProductMargins(product) });
    } catch (error) {
        if (skuTaken(error)) {
            return res.status(400).json({ message: 'This SKU already exists. Use a new SKU code.' });
        }
        if (error.message === 'IMAGE_TOO_LARGE') {
            return res.status(400).json({ message: 'Product image is too large. Upload a smaller photo.' });
        }
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        if (!sameShop(product, await activeShopId())) {
            return res.status(403).json({ message: 'You can only manage products for this shop.' });
        }
        const purged = await purgeProductById(req.params.id);
        if (!purged) return res.status(404).json({ message: 'Product not found.' });
        res.status(200).json({
            message: 'Product deleted successfully',
            ids: purged.ids,
            title: purged.title
        });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};
