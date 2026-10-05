const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

const flagFile = path.join(__dirname, '../data/admin-category-flags.json');
const catalogFile = path.join(__dirname, '../data/platform-products.json');

function readJson(target, fallback) {
    try {
        const data = JSON.parse(fs.readFileSync(target, 'utf8'));
        return data == null ? fallback : data;
    } catch (error) {
        return fallback;
    }
}

function writeJson(target, data) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(data, null, 2));
}

function slugify(name) {
    const slug = String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return slug || 'category';
}

function toneFor(name) {
    const text = String(name || '').toLowerCase();
    if (text.includes('silk')) return 'silk';
    if (text.includes('cotton')) return 'cotton';
    if (text.includes('lawn')) return 'lawn';
    if (text.includes('bed')) return 'sheet';
    if (text.includes('blanket') || text.includes('kambal')) return 'towel';
    if (text.includes('fabric')) return 'curtain';
    return 'khaddar';
}

async function listCategories() {
    const flags = readJson(flagFile, {});
    const counts = {};
    function add(name) {
        const label = String(name || '').trim();
        if (!label) return;
        counts[label] = (counts[label] || 0) + 1;
    }
    try {
        const products = await Product.findAll({ attributes: ['category'], raw: true });
        products.forEach((row) => add(row.category));
    } catch (error) {
        counts.Other = counts.Other || 0;
    }
    const catalog = readJson(catalogFile, []);
    if (Array.isArray(catalog)) catalog.forEach((row) => add(row.category));
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b)).map((name) => {
        const id = 'cat-' + slugify(name);
        const flag = flags[id] || {};
        return {
            id,
            name,
            slug: flag.slug || slugify(name),
            products: counts[name],
            status: flag.status === 'Inactive' ? 'Inactive' : 'Active',
            tone: toneFor(name)
        };
    });
}

async function updateCategory(id, body) {
    const current = (await listCategories()).find((row) => row.id === id);
    if (!current) return { missing: true };
    const status = body.status === 'Inactive' ? 'Inactive' : 'Active';
    const slug = slugify(body.slug || current.slug);
    if (slug.length < 2) return null;
    const flags = readJson(flagFile, {});
    flags[id] = { slug, status };
    writeJson(flagFile, flags);
    return { ...current, slug, status };
}

module.exports = { listCategories, updateCategory };
