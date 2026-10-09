const { listCategories } = require('../utils/adminCategories');
const { resolveShopType } = require('../utils/shopTypeCatalog');

exports.listByShopType = async (req, res) => {
    try {
        const shopType = resolveShopType(req.query.shopType || '');
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
