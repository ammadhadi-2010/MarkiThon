const OB_SHOP_TYPES = [
    ['Clothing & Fashion', '👗'],
    ['Electronics & Mobile', '📱'],
    ['Grocery & Food', '🛒'],
    ['Beauty & Personal Care', '💄'],
    ['Home & Living', '🏠'],
    ['Furniture', '🛋️'],
    ['Sports & Fitness', '🏋️'],
    ['Books & Stationery', '📚'],
    ['Automotive', '🚗'],
    ['Kids & Toys', '🧸'],
    ['Jewellery & Accessories', '💎'],
    ['Hardware & Tools', '🔧'],
    ['Pharmacy & Health', '💊'],
    ['General / Multi-Category', '🏪']
];

const OB_SHOP_TYPE_LEGACY = {
    'Fabric Shop': 'Clothing & Fashion',
    'Suit Shop': 'Clothing & Fashion',
    'Home Textile': 'Home & Living',
    'General Store': 'General / Multi-Category',
    'Mobile Accessories': 'Electronics & Mobile'
};

function normalizeObShopType(value) {
    const raw = String(value || '').trim();
    if (OB_SHOP_TYPES.some((row) => row[0] === raw)) return raw;
    return OB_SHOP_TYPE_LEGACY[raw] || 'Clothing & Fashion';
}

function obShopTypeMarkup(selected) {
    const current = normalizeObShopType(selected);
    return OB_SHOP_TYPES.map(([name, icon]) => `
        <button type="button" class="ob-chip${name === current ? ' on' : ''}" data-shoptype="${name}">
            <span>${icon}</span>${name}
        </button>`).join('');
}
