const THEME_IDS = [
    'modern-apparel',
    'luxury-boutique',
    'urban-streetwear',
    'standard-retail'
];

function normalizeThemeId(value) {
    const id = String(value || '').trim();
    return THEME_IDS.includes(id) ? id : 'standard-retail';
}

function packThemeAssets(raw) {
    const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    return {
        logo: String(src.logo || ''),
        hero: String(src.hero || ''),
        showcaseA: String(src.showcaseA || ''),
        showcaseB: String(src.showcaseB || '')
    };
}

function packStoreTheme(digital) {
    const row = digital && digital.toJSON ? digital.toJSON() : (digital || {});
    return {
        themeId: normalizeThemeId(row.storeThemeId),
        assets: packThemeAssets(row.themeAssets)
    };
}

function assetTooLarge(assets) {
    return Object.values(assets).some((url) => String(url || '').length > 900000);
}

module.exports = {
    THEME_IDS,
    normalizeThemeId,
    packThemeAssets,
    packStoreTheme,
    assetTooLarge
};
