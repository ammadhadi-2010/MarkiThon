const SHOP_CATALOG = {
    'Fabric Shop': {
        categories: ['Lawn', 'Cotton', 'Silk', 'Khaddar', 'Linen', 'Fabric'],
        brands: ['Gul Ahmed', 'Alkaram', 'Khadi', 'Nishat', 'Bareeze']
    },
    'Suit Shop': {
        categories: ['Ready-Made Suits', 'Garments'],
        brands: ['Gul Ahmed', 'Alkaram', 'Nishat', 'Junaid Jamshed']
    },
    'Home Textile': {
        categories: ['Bedsheet', 'Blanket / Kambal', 'Takiya / Pillow', 'Quilt / Razai'],
        brands: ['Gul Ahmed', 'Alkaram', 'Durafit', 'Cannon']
    },
    'General Store': {
        categories: ['Lawn', 'Cotton', 'Silk', 'Bedsheet', 'Ready-Made Suits', 'Garments'],
        brands: ['Gul Ahmed', 'Alkaram', 'Nishat', 'Bareeze']
    },
    'Mobile Accessories': {
        categories: ['Mobile Accessories', 'Chargers', 'Cases & Covers', 'Earphones', 'Power Banks', 'Cables'],
        brands: ['Samsung', 'Apple', 'Anker', 'Baseus', 'Oraimo']
    }
};

function catalogForType(shopType) {
    return SHOP_CATALOG[shopType] || SHOP_CATALOG['General Store'];
}

function systemNames(kind) {
    const key = kind === 'brand' ? 'brands' : 'categories';
    const names = [];
    Object.values(SHOP_CATALOG).forEach((row) => {
        row[key].forEach((name) => {
            if (!names.some((item) => item.toLowerCase() === name.toLowerCase())) names.push(name);
        });
    });
    return names;
}

function isSystemName(kind, name) {
    const value = String(name || '').trim().toLowerCase();
    return systemNames(kind).some((item) => item.toLowerCase() === value);
}

function platformStandardGroups() {
    return Object.keys(SHOP_CATALOG).map((shopType) => {
        const base = SHOP_CATALOG[shopType];
        const pack = (names) => names.map((name) => ({
            name,
            source: 'standard',
            locked: true,
            shopId: 0,
            ownerName: 'Platform',
            shopType,
            shopName: 'System'
        }));
        return {
            shopId: 0,
            shopName: 'System',
            ownerName: 'Platform',
            shopType,
            categories: pack(base.categories),
            brands: pack(base.brands)
        };
    });
}

module.exports = {
    SHOP_CATALOG,
    catalogForType,
    systemNames,
    isSystemName,
    platformStandardGroups
};
