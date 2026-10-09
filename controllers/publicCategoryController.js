const ShopProfile = require('../models/ShopProfile');
const CatalogTerm = require('../models/CatalogTerm');
const { listCategories } = require('../utils/adminCategories');
const { resolveShopType } = require('../utils/shopTypeCatalog');

function sameName(left, right) {
    return String(left || '').trim().toLowerCase() === String(right || '').trim().toLowerCase();
}

async function shopTypeFromRequest(req) {
    const queryType = String(req.query.shopType || '').trim();
    if (queryType) return resolveShopType(queryType);
    const profile = await ShopProfile.findOne({ where: { ShopId: 1 } });
    return resolveShopType((profile && profile.shopType) || 'Clothing & Fashion');
}

exports.listByShopType = async (req, res) => {
    try {
        const shopType = await shopTypeFromRequest(req);
        const group = listCategories().find((row) => row.shopType === shopType);
        const categories = (group && group.categories) || [];
        res.status(200).json({
            shopType,
            categories: categories.map((row) => ({
                id: row.id,
                name: row.name,
                icon: row.icon || '📁',
                locked: Boolean(row.locked),
                subCount: Array.isArray(row.subcategories) ? row.subcategories.length : 0
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not load categories.' });
    }
};

exports.listSubcategories = async (req, res) => {
    try {
        const shopType = await shopTypeFromRequest(req);
        const parent = String(req.query.parent || req.query.category || '').trim();
        const group = listCategories().find((row) => row.shopType === shopType);
        const mains = (group && group.categories) || [];
        const profile = await ShopProfile.findOne({ where: { ShopId: 1 } });
        const shopId = profile ? Number(profile.ShopId) : 1;
        const terms = await CatalogTerm.findAll({
            where: { kind: 'subcategory', shopId },
            order: [['name', 'ASC']]
        });
        const adminSubs = [];
        mains.forEach((cat) => {
            if (parent && !sameName(parent, cat.name)) return;
            (cat.subcategories || []).forEach((sub) => {
                adminSubs.push({
                    id: sub.id,
                    name: sub.name,
                    parentName: cat.name,
                    source: 'standard',
                    shopType
                });
            });
        });
        const shopSubs = terms
            .filter((row) => resolveShopType(row.shopType || shopType) === shopType)
            .filter((row) => !parent || sameName(parent, row.parentName))
            .filter((row) => mains.some((cat) => sameName(cat.name, row.parentName)))
            .map((row) => ({
                id: 'shop-' + row.id,
                name: row.name,
                parentName: row.parentName || '',
                source: 'custom',
                shopType
            }));
        const subcategories = adminSubs.concat(shopSubs.filter((sub) =>
            !adminSubs.some((row) => sameName(row.name, sub.name)
                && sameName(row.parentName, sub.parentName))));
        res.status(200).json({ shopType, parent: parent || null, subcategories });
    } catch (error) {
        res.status(500).json({ message: 'Could not load subcategories.' });
    }
};
