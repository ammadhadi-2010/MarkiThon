const SHOP_CATALOG = {
    'Clothing & Fashion': {
        categories: ['Men', 'Women', 'Kids Wear', 'Lawn', 'Cotton', 'Ready-Made Suits', 'Garments'],
        brands: ['Gul Ahmed', 'Alkaram', 'Nishat', 'Bareeze', 'Junaid Jamshed']
    },
    'Electronics & Mobile': {
        categories: ['Mobiles', 'Mobile Accessories', 'Chargers', 'Cases & Covers', 'Earphones', 'Power Banks'],
        brands: ['Samsung', 'Apple', 'Xiaomi', 'Anker', 'Oraimo']
    },
    'Grocery & Food': {
        categories: ['Staples', 'Snacks', 'Beverages', 'Dairy', 'Spices', 'Frozen Food'],
        brands: ['National', 'Nestle', 'Olpers', 'Tapal', 'Bake Parlor']
    },
    'Beauty & Personal Care': {
        categories: ['Skincare', 'Makeup', 'Hair Care', 'Fragrance', 'Personal Care'],
        brands: ['Loreal', 'Nivea', 'Garnier', 'Maybelline', 'Dove']
    },
    'Home & Living': {
        categories: ['Bedsheet', 'Blanket / Kambal', 'Takiya / Pillow', 'Quilt / Razai', 'Decor', 'Kitchen'],
        brands: ['Gul Ahmed', 'Alkaram', 'Durafit', 'Cannon']
    },
    'Furniture': {
        categories: ['Sofa', 'Beds', 'Tables', 'Chairs', 'Storage', 'Office Furniture'],
        brands: ['Interwood', 'Habitt', 'ChenOne', 'Local Craft']
    },
    'Sports & Fitness': {
        categories: ['Gym Gear', 'Sportswear', 'Outdoor', 'Footwear', 'Accessories'],
        brands: ['Nike', 'Adidas', 'Puma', 'Under Armour']
    },
    'Books & Stationery': {
        categories: ['Books', 'Notebooks', 'Pens', 'Art Supplies', 'Office Supplies'],
        brands: ['Oxford', 'Dollar', 'Piano', 'Pelikan']
    },
    'Automotive': {
        categories: ['Car Care', 'Bike Parts', 'Oils', 'Tyres', 'Accessories'],
        brands: ['Shell', 'Castrol', 'Bosch', 'Honda']
    },
    'Kids & Toys': {
        categories: ['Toys', 'Baby Care', 'School', 'Games', 'Kids Fashion'],
        brands: ['Lego', 'Fisher-Price', 'Hasbro', 'Local Soft Toys']
    },
    'Jewellery & Accessories': {
        categories: ['Jewellery', 'Watches', 'Bags', 'Sunglasses', 'Accessories'],
        brands: ['Local Gold', 'Silver Craft', 'Fashion House']
    },
    'Hardware & Tools': {
        categories: ['Tools', 'Electrical', 'Plumbing', 'Paint', 'Fasteners'],
        brands: ['Stanley', 'Bosch', 'Makita', 'Local Hardware']
    },
    'Pharmacy & Health': {
        categories: ['Medicines', 'Vitamins', 'First Aid', 'Medical Devices', 'Wellness'],
        brands: ['Getz', 'Abbott', 'GSK', 'Hilton']
    },
    'General / Multi-Category': {
        categories: ['General', 'Daily Needs', 'Household', 'Seasonal', 'Other'],
        brands: ['House Brand', 'Local Supply']
    }
};

const LEGACY_SHOP_TYPES = {
    'Fabric Shop': 'Clothing & Fashion',
    'Suit Shop': 'Clothing & Fashion',
    'Home Textile': 'Home & Living',
    'General Store': 'General / Multi-Category',
    'Mobile Accessories': 'Electronics & Mobile'
};

function resolveShopType(shopType) {
    const raw = String(shopType || '').trim();
    if (SHOP_CATALOG[raw]) return raw;
    return LEGACY_SHOP_TYPES[raw] || 'General / Multi-Category';
}

function catalogForType(shopType) {
    return SHOP_CATALOG[resolveShopType(shopType)];
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
    LEGACY_SHOP_TYPES,
    resolveShopType,
    catalogForType,
    systemNames,
    isSystemName,
    platformStandardGroups
};
