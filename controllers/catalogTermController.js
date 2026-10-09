const ShopProfile = require('../models/ShopProfile');
const CatalogTerm = require('../models/CatalogTerm');
const { catalogForType, isSystemName, platformStandardGroups } = require('../utils/shopTypeCatalog');

function clean(value) {
    return String(value || '').trim().slice(0, 80);
}

function sameName(left, right) {
    return clean(left).toLowerCase() === clean(right).toLowerCase();
}

async function loadShop() {
    const profile = await ShopProfile.findOne({ where: { ShopId: 1 } });
    return {
        shopId: profile ? Number(profile.ShopId) : 1,
        shopType: (profile && profile.shopType) || 'Clothing & Fashion',
        ownerName: (profile && profile.ownerName) || '',
        shopName: (profile && profile.shopName) || 'Ammad Hadi Stor'
    };
}

function customGroups(customs, profiles) {
    const byId = new Map();
    customs.forEach((row) => {
        const id = Number(row.shopId);
        if (!byId.has(id)) byId.set(id, []);
        byId.get(id).push(row);
    });
    return [...byId.entries()].map(([shopId, rows]) => {
        const profile = profiles.find((item) => Number(item.ShopId) === shopId);
        const shopName = (profile && profile.shopName) || `Shop ${shopId}`;
        const ownerName = (profile && profile.ownerName) || rows[0].ownerName || '';
        const shopType = (profile && profile.shopType) || rows[0].shopType || '';
        const list = (kind) => rows.filter((row) => row.kind === kind).map((row) => ({
            name: row.name,
            source: 'custom',
            locked: true,
            shopId,
            ownerName: row.ownerName || ownerName,
            shopType: row.shopType || shopType,
            shopName
        }));
        return { shopId, shopName, ownerName, shopType, categories: list('category'), brands: list('brand') };
    });
}

function packShop(shop, customs) {
    const base = catalogForType(shop.shopType);
    const own = customs.filter((row) => Number(row.shopId) === Number(shop.shopId));
    const list = (kind) => {
        const key = kind === 'brand' ? 'brands' : 'categories';
        const standard = base[key].map((name) => ({
            name,
            source: 'standard',
            locked: true,
            shopId: shop.shopId,
            ownerName: shop.ownerName,
            shopType: shop.shopType,
            shopName: shop.shopName
        }));
        const custom = own.filter((row) => row.kind === kind).map((row) => ({
            name: row.name,
            source: 'custom',
            locked: false,
            shopId: Number(row.shopId),
            ownerName: row.ownerName || shop.ownerName,
            shopType: row.shopType || shop.shopType,
            shopName: shop.shopName
        }));
        return standard.concat(custom);
    };
    return {
        shopId: shop.shopId,
        shopName: shop.shopName,
        ownerName: shop.ownerName,
        shopType: shop.shopType,
        categories: list('category'),
        brands: list('brand')
    };
}

exports.list = async (req, res) => {
    try {
        const shop = await loadShop();
        const platform = req.query.scope === 'platform';
        const customs = await CatalogTerm.findAll({ order: [['name', 'ASC']] });
        const mine = packShop(shop, customs);
        if (!platform) {
            return res.json({ viewer: 'shop', ...mine });
        }
        const profiles = await ShopProfile.findAll({ order: [['ShopId', 'ASC']] });
        const groups = platformStandardGroups().concat(customGroups(customs, profiles));
        res.json({ viewer: 'platform', ...mine, groups });
    } catch (error) {
        res.status(500).json({ message: 'Could not load catalog terms.', error: error.message });
    }
};

exports.save = async (req, res) => {
    try {
        const shop = await loadShop();
        const kind = req.body.kind === 'brand' ? 'brand' : 'category';
        const name = clean(req.body.name);
        const original = clean(req.body.original);
        if (!name) return res.status(400).json({ message: 'Name is required.' });
        if (isSystemName(kind, name) || (original && isSystemName(kind, original))) {
            return res.status(403).json({ message: 'System categories and brands cannot be changed.' });
        }
        const rows = await CatalogTerm.findAll({ where: { kind, shopId: shop.shopId } });
        const current = original ? rows.find((row) => sameName(row.name, original)) : null;
        if (original && !current) {
            return res.status(403).json({ message: 'You can only edit names created for this shop.' });
        }
        const clash = rows.find((row) => sameName(row.name, name) && (!current || row.id !== current.id));
        if (clash) return res.status(400).json({ message: 'That name already exists for this shop.' });
        const saved = current
            ? await current.update({ name })
            : await CatalogTerm.create({
                kind,
                name,
                shopId: shop.shopId,
                ownerName: shop.ownerName,
                shopType: shop.shopType
            });
        res.status(current ? 200 : 201).json({
            message: current ? 'Updated.' : 'Saved for this shop.',
            term: saved
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not save catalog term.', error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const shop = await loadShop();
        const kind = req.query.kind === 'brand' ? 'brand' : 'category';
        const name = clean(req.query.name);
        if (isSystemName(kind, name)) {
            return res.status(403).json({ message: 'System categories and brands cannot be deleted.' });
        }
        const rows = await CatalogTerm.findAll({ where: { kind, shopId: shop.shopId } });
        const row = rows.find((item) => sameName(item.name, name));
        if (!row) {
            return res.status(403).json({ message: 'You can only delete names created for this shop.' });
        }
        await row.destroy();
        res.json({ message: 'Removed.' });
    } catch (error) {
        res.status(500).json({ message: 'Could not delete catalog term.', error: error.message });
    }
};
