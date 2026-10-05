const { listProducts, createProduct, updateProduct, bulkProducts } = require('../utils/platformProducts');

exports.products = async (req, res) => {
    try {
        res.status(200).json({ products: await listProducts() });
    } catch (error) {
        res.status(500).json({ message: 'Could not load products.' });
    }
};

exports.createProduct = (req, res) => {
    const row = createProduct(req.body || {});
    if (!row) return res.status(400).json({ message: 'Enter the product title, shop, category, and price.' });
    res.status(201).json({ message: 'Product added.', product: row });
};

exports.updateProduct = async (req, res) => {
    try {
        const row = await updateProduct(req.params.id, req.body || {});
        if (row && row.missing) return res.status(404).json({ message: 'Product not found.' });
        if (!row) return res.status(400).json({ message: 'Enter the product title, shop, category, and price.' });
        res.status(200).json({ message: 'Product updated.', product: row });
    } catch (error) {
        res.status(500).json({ message: 'Could not update the product.' });
    }
};

exports.bulkProducts = async (req, res) => {
    try {
        const rows = await bulkProducts(req.body || {});
        if (!rows) return res.status(400).json({ message: 'Choose products and an action.' });
        res.status(200).json({ message: 'Products updated.', products: rows });
    } catch (error) {
        res.status(500).json({ message: 'Could not update products.' });
    }
};
