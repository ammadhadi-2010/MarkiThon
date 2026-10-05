const DEFAULT_CATEGORIES = [
    'Fabric',
    'Lawn',
    'Ready-Made Suits',
    'Bedsheet',
    'Blanket / Kambal',
    'Takiya / Pillow',
    'Other'
];

function unitLabel(stockUnit) {
    const unit = String(stockUnit || 'Meter').toLowerCase();
    if (unit.includes('suit') || unit.includes('set')) return 'sets';
    if (unit.includes('pc') || unit.includes('piece') || unit.includes('than')) return 'pcs';
    if (unit.includes('yard')) return 'yd';
    return 'm';
}

function categoryLabel(product) {
    const raw = (product && (product.category || product.fabricType)) || 'Other';
    return String(raw).trim() || 'Other';
}

const SHOP_TYPE_CATEGORIES = {
    'Mobile Accessories': [
        'Mobile Accessories',
        'Chargers',
        'Cases & Covers',
        'Earphones',
        'Power Banks',
        'Cables'
    ]
};

function categoriesForShop(shopType, productTypes) {
    const names = [];
    const add = (key) => (SHOP_TYPE_CATEGORIES[key] || []).forEach((name) => {
        if (!names.includes(name)) names.push(name);
    });
    add(shopType);
    (Array.isArray(productTypes) ? productTypes : []).forEach(add);
    return names;
}

function navCategories(shopType, productTypes, products) {
    const ordered = categoriesForShop(shopType, productTypes);
    (products || []).forEach((product) => {
        const name = String((product && product.category) || '').trim();
        if (name && !ordered.includes(name)) ordered.push(name);
    });
    return ordered;
}

function shopCategories(products) {
    const found = new Set();
    (products || []).forEach((p) => found.add(categoryLabel(p)));
    const ordered = DEFAULT_CATEGORIES.filter((name) => found.has(name) || name === 'Other');
    found.forEach((name) => {
        if (!ordered.includes(name)) ordered.splice(Math.max(ordered.length - 1, 0), 0, name);
    });
    return ordered.length ? ordered : DEFAULT_CATEGORIES;
}

module.exports = {
    DEFAULT_CATEGORIES,
    unitLabel,
    categoryLabel,
    shopCategories,
    categoriesForShop,
    navCategories
};
