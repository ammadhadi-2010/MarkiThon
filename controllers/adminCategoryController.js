const {
    listCategories,
    addCategory,
    addSubcategory,
    updateCategory,
    removeCategory
} = require('../utils/adminCategories');
const { enrichShopTypes, removeShopSub, updateShopSub } = require('../utils/adminShopSubs');

async function treePayload() {
    return enrichShopTypes();
}

exports.categories = async (req, res) => {
    try {
        res.status(200).json({ shopTypes: await treePayload() });
    } catch (error) {
        res.status(500).json({ message: 'Could not load categories.' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const result = addCategory(req.body || {});
        if (result.error) return res.status(400).json({ message: result.error });
        res.status(201).json({
            message: result.message,
            shopType: result.shopType,
            shopTypes: await treePayload()
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not add the category.' });
    }
};

exports.createSubcategory = async (req, res) => {
    try {
        const result = addSubcategory(req.body || {});
        if (result.error) return res.status(400).json({ message: result.error });
        res.status(201).json({
            message: result.message,
            shopType: result.shopType,
            shopTypes: await treePayload()
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not add the subcategory.' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        if (String(req.params.id || '').startsWith('shopsub-')) {
            const row = await updateShopSub(req.params.id, req.body || {});
            if (row.missing) return res.status(404).json({ message: 'Shop subcategory not found.' });
            if (row.error) return res.status(400).json({ message: row.error });
            return res.status(200).json({
                message: row.message,
                shopType: row.shopType,
                shopTypes: await treePayload()
            });
        }
        const row = updateCategory(req.params.id, req.body || {});
        if (row && row.missing) return res.status(404).json({ message: 'Category not found.' });
        if (row && row.error) return res.status(400).json({ message: row.error });
        res.status(200).json({
            message: row.message || 'Category updated.',
            shopType: row.shopType,
            shopTypes: await treePayload()
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not update the category.' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        if (String(req.params.id || '').startsWith('shopsub-')) {
            const row = await removeShopSub(req.params.id);
            if (row.missing) return res.status(404).json({ message: 'Shop subcategory not found.' });
            return res.status(200).json({
                message: row.message,
                shopType: row.shopType,
                shopTypes: await treePayload()
            });
        }
        const row = removeCategory(req.params.id);
        if (row && row.missing) return res.status(404).json({ message: 'Category not found.' });
        if (row && row.error) return res.status(400).json({ message: row.error });
        res.status(200).json({
            message: row.message || 'Deleted.',
            shopType: row.shopType,
            shopTypes: await treePayload()
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not delete the category.' });
    }
};
