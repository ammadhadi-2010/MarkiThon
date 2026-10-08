let mpLiveProducts = [];
let mpFeaturedIds = [];

function mpParseImages(row) {
    if (Array.isArray(row.images) && row.images.length) return row.images.filter(Boolean);
    if (row.imageUrl) return [row.imageUrl];
    return [];
}

function mpMapStoreProduct(row, shopName) {
    const sale = Number(row.retailPrice || 0);
    const was = Number(row.wasPrice || 0);
    const retail = was > sale ? was : sale;
    const tag = row.storeFeatured ? 'best'
        : (row.storeNewArrival ? 'new' : (row.storeSale || was > sale ? 'sale' : 'best'));
    const images = mpParseImages(row);
    return {
        id: row.id,
        title: row.title || 'Product',
        salePrice: sale,
        retailPrice: retail,
        imageUrl: images[0] || '',
        images,
        shopName: shopName || 'Ammad Hadi Stor',
        rating: '4.8',
        stock: 12,
        tag,
        storeFeatured: Boolean(row.storeFeatured),
        storeNewArrival: Boolean(row.storeNewArrival),
        storeSale: Boolean(row.storeSale) || was > sale,
        category: row.category || 'Products',
        unit: row.stockUnit || 'Piece',
        variants: [row.stockUnit || 'Standard'],
        desc: row.title || '',
        delivery: 'Estimated Delivery: 2 - 4 Working Days',
        returns: '7 Days Easy Return. Hassle-free returns and exchanges.'
    };
}

function mpPreferFeatured(rows) {
    if (!mpFeaturedIds.length) return rows;
    const rank = new Map(mpFeaturedIds.map((id, index) => [String(id), index]));
    return rows.slice().sort((a, b) => {
        const ai = rank.has(String(a.id)) ? rank.get(String(a.id)) : 999;
        const bi = rank.has(String(b.id)) ? rank.get(String(b.id)) : 999;
        return ai - bi;
    });
}

function mpDedupeProducts(rows) {
    return Array.from(new Map(
        (Array.isArray(rows) ? rows : []).map((item) => {
            const title = String((item && item.title) || '').trim().toLowerCase();
            const shop = String((item && item.shopName) || '').trim().toLowerCase();
            const key = title
                ? (shop ? shop + '::' + title : title)
                : String((item && item.id) || Math.random());
            return [key, item];
        })
    ).values());
}

async function mpFetchShopProducts() {
    const res = await fetch('/api/store/ammadhadistor');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Could not load shop products.');
    const shopName = (data.shop && data.shop.shopName) || 'Ammad Hadi Stor';
    return (Array.isArray(data.products) ? data.products : [])
        .map((row) => mpMapStoreProduct(row, shopName));
}

async function mpFetchCatalogFallback() {
    const res = await fetch('/api/store/catalog');
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new Error('Could not load catalog products.');
    const rows = Array.isArray(data) ? data : [];
    return rows.filter((row) => row.storePublished !== false).map((row) => {
        let gallery = [];
        try {
            gallery = typeof row.storeImages === 'string'
                ? JSON.parse(row.storeImages || '[]')
                : (Array.isArray(row.storeImages) ? row.storeImages : []);
        } catch (error) {
            gallery = [];
        }
        return mpMapStoreProduct({
            id: row.id,
            title: row.title,
            retailPrice: row.retailPrice,
            wasPrice: row.storeDiscountPrice || 0,
            imageUrl: gallery[0] || row.imageUrl,
            images: gallery,
            stockUnit: row.stockUnit,
            category: row.category,
            storeFeatured: row.storeFeatured,
            storeNewArrival: row.storeNewArrival,
            storeSale: row.storeSale
        }, 'Ammad Hadi Stor');
    });
}

async function mpLoadCatalog() {
    try {
        mpLiveProducts = mpPreferFeatured(mpDedupeProducts(await mpFetchShopProducts()));
        if (mpLiveProducts.length) return mpLiveProducts;
    } catch (error) {
        /* Try catalog fallback. */
    }
    mpLiveProducts = mpPreferFeatured(mpDedupeProducts(await mpFetchCatalogFallback()));
    return mpLiveProducts;
}

function mpRememberFeaturedProducts(ids) {
    mpFeaturedIds = (ids || []).map(String);
    if (mpLiveProducts.length) {
        mpLiveProducts = mpPreferFeatured(mpLiveProducts);
        const root = document.getElementById('mpRoot');
        if (root && typeof mpPaintTrendGrid === 'function') mpPaintTrendGrid(root);
    }
}
