const ShopProfile = require('../models/ShopProfile');
const CatalogTerm = require('../models/CatalogTerm');
const { isSystemName, platformStandardGroups } = require('../utils/shopTypeCatalog');
const { mainNamesForType } = require('../utils/adminCategories');

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

function mapSub(row, shop) {
    return {
        id: row.id,
        name: row.name,
        parentName: row.parentName || '',
        source: 'custom',
        kind: 'subcategory',
        locked: false,
        status: row.status || 'active',
        shopId: Number(row.shopId),
        ownerName: row.ownerName || shop.ownerName,
        shopType: row.shopType || shop.shopType,
        shopName: shop.shopName
    };
}

function packShop(shop, customs) {
    const mains = mainNamesForType(shop.shopType).map((name) => ({
        name,
        source: 'standard',
        kind: 'main',
        locked: true,
        shopId: shop.shopId,
        ownerName: shop.ownerName,
        shopType: shop.shopType,
        shopName: shop.shopName
    }));
    const own = customs.filter((row) => Number(row.shopId) === Number(shop.shopId));
    const subs = own
        .filter((row) => row.kind === 'subcategory' || (row.kind === 'category' && row.parentName))
        .map((row) => mapSub(row, shop));
    const brands = own.filter((row) => row.kind === 'brand').map((row) => ({
        name: row.name,
        source: 'custom',
        locked: false,
        shopId: Number(row.shopId),
        ownerName: row.ownerName || shop.ownerName,
        shopType: row.shopType || shop.shopType,
        shopName: shop.shopName
    }));
    return {
        shopId: shop.shopId,
        shopName: shop.shopName,
        ownerName: shop.ownerName,
        shopType: shop.shopType,
        mainCategories: mains,
        categories: mains.concat(subs),
        subcategories: subs,
        brands
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
        const shop = {
            shopId,
            shopName: (profile && profile.shopName) || `Shop ${shopId}`,
            ownerName: (profile && profile.ownerName) || rows[0].ownerName || '',
            shopType: (profile && profile.shopType) || rows[0].shopType || ''
        };
        return {
            ...shop,
            categories: packShop(shop, rows).categories,
            brands: packShop(shop, rows).brands
        };
    });
}

exports.list = async (req, res) => {
    try {
        const shop = await loadShop();
        const platform = req.query.scope === 'platform';
        const customs = await CatalogTerm.findAll({ order: [['name', 'ASC']] });
        const mine = packShop(shop, customs);
        if (!platform) return res.json({ viewer: 'shop', ...mine });
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
        const kind = req.body.kind === 'brand'
            ? 'brand'
            : (req.body.kind === 'subcategory' ? 'subcategory' : 'category');
        const name = clean(req.body.name);
        const original = clean(req.body.original);
        const parentName = clean(req.body.parentName || req.body.parent);
        if (!name) return res.status(400).json({ message: 'Name is required.' });
        if (kind === 'brand' && (isSystemName('brand', name) || (original && isSystemName('brand', original)))) {
            return res.status(403).json({ message: 'System brands cannot be changed.' });
        }
        if (kind === 'subcategory') {
            const mains = mainNamesForType(shop.shopType);
            if (!parentName || !mains.some((item) => sameName(item, parentName))) {
                return res.status(400).json({ message: 'Choose a valid main category.' });
            }
        }
        if (kind === 'category') {
            return res.status(403).json({
                message: 'Main categories are managed by Super Admin. Add a subcategory instead.'
            });
        }
        const rows = await CatalogTerm.findAll({ where: { kind, shopId: shop.shopId } });
        const current = original
            ? rows.find((row) => sameName(row.name, original)
                && sameName(row.parentName || '', parentName || row.parentName || ''))
            : null;
        if (original && !current) {
            return res.status(403).json({ message: 'You can only edit names created for this shop.' });
        }
        const clash = rows.find((row) => sameName(row.name, name)
            && sameName(row.parentName || '', parentName)
            && (!current || row.id !== current.id));
        if (clash) return res.status(400).json({ message: 'That subcategory already exists.' });
        const payload = {
            kind,
            name,
            parentName: kind === 'subcategory' ? parentName : null,
            status: 'active',
            shopId: shop.shopId,
            ownerName: shop.ownerName,
            shopType: shop.shopType
        };
        const saved = current ? await current.update(payload) : await CatalogTerm.create(payload);
        res.status(current ? 200 : 201).json({
            message: current ? 'Subcategory updated.' : 'Subcategory saved for this shop.',
            term: saved
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not save catalog term.', error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const shop = await loadShop();
        const kind = req.query.kind === 'brand'
            ? 'brand'
            : (req.query.kind === 'subcategory' ? 'subcategory' : 'category');
        const name = clean(req.query.name);
        const parentName = clean(req.query.parentName || '');
        if (kind === 'category' || isSystemName(kind === 'brand' ? 'brand' : 'category', name)) {
            return res.status(403).json({ message: 'Standard categories cannot be deleted.' });
        }
        const rows = await CatalogTerm.findAll({ where: { kind, shopId: shop.shopId } });
        const row = rows.find((item) => sameName(item.name, name)
            && (!parentName || sameName(item.parentName || '', parentName)));
        if (!row) {
            return res.status(403).json({ message: 'You can only delete names created for this shop.' });
        }
        await row.destroy();
        res.json({ message: 'Removed.' });
    } catch (error) {
        res.status(500).json({ message: 'Could not delete catalog term.', error: error.message });
    }
};
