const { listManagedShops } = require('../utils/platformShops');
const { listProducts } = require('../utils/platformProducts');
const { listOrders } = require('../utils/adminOrders');
const { readCms, updateCms, pickRows, homeShopRows, writeBannerImage } = require('../utils/adminCms');
const { listShopkeeperAds } = require('../utils/shopkeeperAds');

function shopPath(row) {
    const site = row.profile && row.profile.website;
    if (site) {
        try {
            const url = new URL(site, 'https://markithon.com');
            if (url.pathname && url.pathname !== '/') return url.pathname.slice(0, 80);
        } catch (error) {
            /* Use the shop name when the website is not a URL. */
        }
    }
    const slug = String(row.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
    return '/' + (slug || 'shops');
}

function shopCard(row) {
    const profile = row.profile || {};
    const type = profile.shopType;
    const image = profile.coverBanner || profile.imageUrl || '';
    return {
        id: row.id,
        name: row.name,
        path: shopPath(row),
        owner: row.owner || profile.ownerName || '',
        category: type || row.package || 'Shop',
        status: row.status || 'Pending',
        image,
        tags: Array.isArray(profile.productTypes) ? profile.productTypes.slice(0, 2) : []
    };
}

function productCard(row) {
    return {
        id: row.id,
        title: row.title,
        sku: row.sku || '',
        shop: row.shop || '',
        price: row.price,
        unit: row.unit || 'Pcs',
        tag: row.tag || '',
        tone: row.tone || 'sheet',
        status: row.status
    };
}

async function loadCms() {
    const [shops, products, orders] = await Promise.all([
        listManagedShops(),
        listProducts(),
        listOrders()
    ]);
    const cms = readCms();
    const shopRows = shops.map(shopCard);
    const productRows = products.map(productCard);
    let shopAds = [];
    try {
        shopAds = await listShopkeeperAds();
    } catch (error) {
        shopAds = [];
    }
    return {
        cms,
        shops: shopRows,
        products: productRows,
        shopAds,
        featuredShops: homeShopRows(shopRows, cms.featuredShopIds),
        featuredProducts: pickRows(productRows.filter((row) => row.status === 'Published'), cms.featuredProductIds, 4),
        stats: {
            shops: shopRows.length,
            active: shopRows.filter((row) => row.status === 'Active').length,
            products: productRows.length,
            orders: orders.length,
            visitors: Number(cms.visitors) || 0
        }
    };
}

exports.cms = async (req, res) => {
    try {
        res.status(200).json(await loadCms());
    } catch (error) {
        res.status(500).json({ message: 'Could not load marketplace settings.' });
    }
};

exports.bannerImage = (req, res) => {
    try {
        const url = writeBannerImage(req.body || {});
        if (!url) return res.status(400).json({ message: 'Choose a PNG, JPG, or WebP image under 2 MB.' });
        res.status(200).json({ url });
    } catch (error) {
        res.status(500).json({ message: 'Could not store the banner image.' });
    }
};

exports.saveCms = async (req, res) => {
    try {
        updateCms(req.body || {});
        const payload = await loadCms();
        res.status(200).json({ message: 'Marketplace settings saved.', ...payload });
    } catch (error) {
        res.status(500).json({ message: 'Could not save marketplace settings.' });
    }
};
