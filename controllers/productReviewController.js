const Product = require('../models/Product');
const ProductReview = require('../models/ProductReview');

function cleanId(id) {
    return /^[0-9a-f-]{36}$/i.test(String(id || '')) ? String(id) : '';
}

function mapReview(row) {
    return {
        id: row.id,
        reviewerName: row.reviewerName,
        stars: row.stars,
        description: row.description
    };
}

async function publishedProduct(id) {
    if (!id) return null;
    const product = await Product.findByPk(id);
    if (!product || product.storePublished === false) return null;
    return product;
}

exports.listProductReviews = async (req, res) => {
    try {
        const product = await publishedProduct(cleanId(req.params.id));
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        const rows = await ProductReview.findAll({
            where: { productId: product.id },
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        res.status(200).json({ reviews: rows.map(mapReview) });
    } catch (error) {
        res.status(500).json({ message: 'Error loading reviews', error: error.message });
    }
};

exports.addProductReview = async (req, res) => {
    try {
        const product = await publishedProduct(cleanId(req.params.id));
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        const reviewerName = String(req.body.reviewerName || '').trim().slice(0, 80);
        const description = String(req.body.description || '').trim().slice(0, 1000);
        const stars = Number(req.body.stars);
        if (reviewerName.length < 2) {
            return res.status(400).json({ message: 'Please enter your name.' });
        }
        if (description.length < 8) {
            return res.status(400).json({ message: 'Please write a short review.' });
        }
        if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
            return res.status(400).json({ message: 'Choose a star rating from 1 to 5.' });
        }
        const row = await ProductReview.create({
            productId: product.id,
            reviewerName,
            stars,
            description
        });
        res.status(201).json({ message: 'Review submitted.', review: mapReview(row) });
    } catch (error) {
        res.status(500).json({ message: 'Error saving review', error: error.message });
    }
};
