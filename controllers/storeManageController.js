const Product = require('../models/Product');
const { purgeProductById } = require('../utils/purgeProduct');
const { parsePoints } = require('../utils/publicPolicy');
const { applyStoryFields } = require('../utils/storeStory');
const { activeShopId, sameShop } = require('../utils/shopScope');

function toNum(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function mapManageProduct(row, stock, images) {
    const p = row.toJSON ? row.toJSON() : row;
    const onHand = stock == null ? toNum(p.stockMeters) : stock;
    const min = toNum(p.minWholesaleQty) || 1;
    const online = toNum(p.storeOnlinePrice) > 0 ? toNum(p.storeOnlinePrice) : toNum(p.retailPrice);
    const discount = toNum(p.storeDiscountPrice);
    const pct = discount > 0 && online > discount
        ? Math.round((discount / online) * 100)
        : 0;
    const gallery = Array.isArray(images) && images.length
        ? images
        : (p.imageUrl ? [p.imageUrl] : []);
    return {
        id: p.id,
        title: p.title,
        sku: p.sku,
        category: p.category || '',
        subCategory: p.subCategory || '',
        stockUnit: p.stockUnit || 'Meter',
        imageUrl: gallery[0] || p.imageUrl || '',
        images: gallery,
        storePublished: p.storePublished !== false,
        storeFeatured: Boolean(p.storeFeatured),
        storeNewArrival: Boolean(p.storeNewArrival),
        storeSale: Boolean(p.storeSale),
        onlinePrice: online,
        discountPrice: discount,
        discountPct: pct,
        wholesalePrice: toNum(p.wholesalePrice),
        minWholesaleQty: min,
        stockMeters: onHand,
        stockStatus: onHand <= min ? 'low' : 'in',
        storeSortOrder: toNum(p.storeSortOrder),
        storeDescription: p.storeDescription || '',
        storeTags: p.storeTags || '',
        storeHomeSection: p.storeHomeSection || '',
        storeTitle: p.storeTitle || '',
        storeShortDescription: p.storeShortDescription || '',
        storeImages: parseStoreImages(p.storeImages),
        storeStickerImage: p.storeStickerImage || '',
        storeStickerJson: p.storeStickerJson || '',
        storeHighlights: p.storeHighlights || '[]',
        storeDeliveryTime: p.storeDeliveryTime || '',
        storeDeliveryCharge: p.storeDeliveryCharge || '',
        storeDeliveryDetail: p.storeDeliveryDetail || '',
        storeReturnPolicy: p.storeReturnPolicy || '',
        storeDescHeadline: p.storeDescHeadline || '',
        storeDescBody: p.storeDescBody || '',
        storeFeatures: p.storeFeatures || '[]',
        storeIncludes: p.storeIncludes || '[]',
        storeCare: p.storeCare || '[]',
        highlights: p.storeFeatures || '[]',
        packageIncludes: p.storeIncludes || '[]',
        careInstructions: p.storeCare || '[]',
        retailPrice: toNum(p.retailPrice),
        sellUnit: p.sellUnit || p.stockUnit || 'Gaz'
    };
}

function parseStoreImages(value) {
    try {
        const raw = typeof value === 'string' ? JSON.parse(value || '[]') : value;
        return Array.isArray(raw) ? raw.filter((url) => String(url || '').trim()) : [];
    } catch (error) {
        return [];
    }
}

function packImages(pack) {
    const urls = [];
    pack.forEach((row) => {
        const url = String(row.imageUrl || '').trim();
        if (url && !urls.includes(url)) urls.push(url);
        parseStoreImages(row.storeImages).forEach((img) => {
            if (img && !urls.includes(img)) urls.push(img);
        });
    });
    return urls;
}

function identityRows(products) {
    const seen = new Set();
    const out = [];
    products.forEach((row) => {
        const key = String(row.title || '').trim().toLowerCase();
        if (!key || seen.has(key)) return;
        seen.add(key);
        const pack = products.filter((p) => String(p.title || '').trim().toLowerCase() === key);
        const base = pack.find((p) => !p.color) || pack[0];
        const stock = pack.reduce((sum, p) => sum + toNum(p.stockMeters), 0);
        out.push(mapManageProduct(base, stock, packImages(pack)));
    });
    return out.sort((a, b) => a.storeSortOrder - b.storeSortOrder || a.title.localeCompare(b.title));
}

exports.listManage = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { ShopId: await activeShopId() },
            order: [['title', 'ASC']]
        });
        res.status(200).json(identityRows(products));
    } catch (error) {
        res.status(500).json({ message: 'Error loading store products', error: error.message });
    }
};

function isBadId(error) {
    return /invalid input syntax for type uuid/i.test(String(error && error.message || ''));
}

function patchBody(body) {
    const data = {};
    if (body.storePublished !== undefined) data.storePublished = Boolean(body.storePublished);
    if (body.storeFeatured !== undefined) data.storeFeatured = Boolean(body.storeFeatured);
    if (body.storeNewArrival !== undefined) data.storeNewArrival = Boolean(body.storeNewArrival);
    if (body.storeSale !== undefined) data.storeSale = Boolean(body.storeSale);
    if (body.storeOnlinePrice !== undefined) data.storeOnlinePrice = toNum(body.storeOnlinePrice);
    if (body.storeDiscountPrice !== undefined) data.storeDiscountPrice = toNum(body.storeDiscountPrice);
    if (body.wholesalePrice !== undefined) data.wholesalePrice = toNum(body.wholesalePrice);
    if (body.minWholesaleQty !== undefined) {
        data.minWholesaleQty = Math.max(1, toNum(body.minWholesaleQty) || 10);
    }
    if (body.storeSortOrder !== undefined) data.storeSortOrder = Math.max(0, toNum(body.storeSortOrder));
    if (body.storeDescription !== undefined) {
        data.storeDescription = String(body.storeDescription || '').slice(0, 8000);
    }
    if (body.storeTags !== undefined) {
        data.storeTags = String(body.storeTags || '').slice(0, 500);
    }
    if (body.storeHomeSection !== undefined) {
        const slot = String(body.storeHomeSection || 'featured');
        data.storeHomeSection = ['featured', 'new', 'sale', 'category'].includes(slot)
            ? slot
            : 'featured';
    }
    if (body.storeTitle !== undefined) data.storeTitle = String(body.storeTitle || '').slice(0, 120);
    if (body.storeShortDescription !== undefined) {
        data.storeShortDescription = String(body.storeShortDescription || '').slice(0, 200);
    }
    if (body.storeImages !== undefined) {
        const list = parseStoreImages(
            Array.isArray(body.storeImages) ? JSON.stringify(body.storeImages) : body.storeImages
        );
        data.storeImages = JSON.stringify(list.slice(0, 8));
    }
    if (body.storeStickerImage !== undefined) {
        data.storeStickerImage = String(body.storeStickerImage || '');
    }
    if (body.storeStickerJson !== undefined) {
        data.storeStickerJson = String(body.storeStickerJson || '').slice(0, 20000);
    }
    if (body.storeHighlights !== undefined) {
        const raw = typeof body.storeHighlights === 'string'
            ? body.storeHighlights
            : JSON.stringify(body.storeHighlights || []);
        data.storeHighlights = JSON.stringify(parsePoints(raw));
    }
    if (body.storeDeliveryTime !== undefined) {
        data.storeDeliveryTime = String(body.storeDeliveryTime || '').trim().slice(0, 120);
    }
    if (body.storeDeliveryCharge !== undefined) {
        data.storeDeliveryCharge = String(body.storeDeliveryCharge || '').trim().slice(0, 160);
    }
    if (body.storeDeliveryDetail !== undefined) {
        data.storeDeliveryDetail = String(body.storeDeliveryDetail || '').trim().slice(0, 500);
    }
    if (body.storeReturnPolicy !== undefined) {
        data.storeReturnPolicy = String(body.storeReturnPolicy || '').trim().slice(0, 500);
    }
    applyStoryFields(body, data);
    return data;
}

exports.patchProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        const shopId = await activeShopId();
        if (!sameShop(product, shopId)) {
            return res.status(403).json({ message: 'You can only manage products for this shop.' });
        }
        const data = patchBody(req.body || {});
        if (!Object.keys(data).length) {
            return res.status(400).json({ message: 'No store fields to update.' });
        }
        const siblings = await Product.findAll({ where: { title: product.title, ShopId: shopId } });
        const rows = siblings.length ? siblings : [product];
        await Promise.all(rows.map((row) => row.update(data)));
        const pack = await Product.findAll({ where: { title: product.title, ShopId: shopId } });
        const stock = pack.reduce((sum, p) => sum + toNum(p.stockMeters), 0);
        const fresh = await Product.findByPk(product.id);
        res.status(200).json({
            message: 'Store product updated.',
            product: mapManageProduct(fresh, stock, packImages(pack))
        });
    } catch (error) {
        if (isBadId(error)) return res.status(404).json({ message: 'Product not found.' });
        res.status(500).json({ message: 'Error updating store product', error: error.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        const shopId = await activeShopId();
        if (!product || !sameShop(product, shopId)) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        const pack = product.title
            ? await Product.findAll({ where: { title: product.title, ShopId: shopId } })
            : [product];
        const mapped = identityRows(pack)[0]
            || mapManageProduct(product, null, packImages(pack));
        res.status(200).json({ product: mapped });
    } catch (error) {
        if (isBadId(error)) return res.status(404).json({ message: 'Product not found.' });
        res.status(500).json({ message: 'Error loading store product', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product || !sameShop(product, await activeShopId())) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        const purged = await purgeProductById(req.params.id);
        if (!purged) return res.status(404).json({ message: 'Product not found.' });
        res.status(200).json({
            message: 'Product deleted successfully',
            ids: purged.ids,
            title: purged.title
        });
    } catch (error) {
        if (isBadId(error)) return res.status(404).json({ message: 'Product not found.' });
        res.status(500).json({ message: 'Error deleting store product', error: error.message });
    }
};
