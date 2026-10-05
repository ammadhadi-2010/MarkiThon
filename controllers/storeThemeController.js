const ShopDigitalSetup = require('../models/ShopDigitalSetup');
const {
    normalizeThemeId,
    packThemeAssets,
    packStoreTheme,
    assetTooLarge
} = require('../utils/storeThemes');

async function loadDigital() {
    const [row] = await ShopDigitalSetup.findOrCreate({
        where: { ShopId: 1 },
        defaults: { ShopId: 1, storeThemeId: 'standard-retail', themeAssets: {} }
    });
    return row;
}

async function getTheme(req, res) {
    try {
        const row = await loadDigital();
        res.json(packStoreTheme(row));
    } catch (error) {
        res.status(500).json({ message: 'Could not load store theme.' });
    }
}

async function putTheme(req, res) {
    try {
        const body = req.body || {};
        const themeId = normalizeThemeId(body.themeId);
        const assets = packThemeAssets(body.assets);
        if (assetTooLarge(assets)) {
            return res.status(400).json({ message: 'Image is too large. Upload a smaller photo.' });
        }
        const row = await loadDigital();
        row.storeThemeId = themeId;
        row.themeAssets = assets;
        await row.save();
        res.json({
            message: 'Theme and branding saved.',
            theme: packStoreTheme(row)
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not save store theme.' });
    }
}

module.exports = { getTheme, putTheme };
