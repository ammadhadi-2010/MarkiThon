const { listCategories, updateCategory } = require('../utils/adminCategories');

exports.categories = async (req, res) => {
    try {
        res.status(200).json({ categories: await listCategories() });
    } catch (error) {
        res.status(500).json({ message: 'Could not load categories.' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const row = await updateCategory(req.params.id, req.body || {});
        if (row && row.missing) return res.status(404).json({ message: 'Category not found.' });
        if (!row) return res.status(400).json({ message: 'Enter a valid slug.' });
        res.status(200).json({ message: 'Category updated.', category: row });
    } catch (error) {
        res.status(500).json({ message: 'Could not update the category.' });
    }
};
