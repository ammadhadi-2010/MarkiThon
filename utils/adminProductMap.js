function normStatus(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (raw === 'published' || raw === 'hidden' || raw === 'pending') return raw;
    if (raw === 'publish') return 'published';
    if (raw === 'hide') return 'hidden';
    return '';
}

function displayStatus(value) {
    const key = normStatus(value);
    if (key === 'published') return 'Published';
    if (key === 'hidden') return 'Hidden';
    if (key === 'pending') return 'Pending';
    return 'Pending';
}

function statusFromRow(row) {
    const explicit = normStatus(row.marketplaceStatus);
    if (explicit) return explicit;
    if (row.storePublished === false) return 'hidden';
    const price = Number(row.storeOnlinePrice) || Number(row.retailPrice) || 0;
    if (!(price > 0)) return 'pending';
    return 'published';
}

function applyMarketplaceStatus(status) {
    const key = normStatus(status) || 'pending';
    return {
        marketplaceStatus: key,
        storePublished: key === 'published'
    };
}

function isBlankColor(row) {
    const color = String((row && row.color) || '').trim().toLowerCase();
    return !color || color === 'default' || color === 'no color' || color === '-';
}

function familyKey(row) {
    const shop = Number((row && row.ShopId) || (row && row.shopId) || 1);
    const title = String((row && row.title) || '').trim().toLowerCase();
    return title ? `${shop}::${title}` : `id:${row && row.id}`;
}

function mapAdminProduct(row, shopName, index) {
    const retail = Number(row.retailPrice) || 0;
    const online = Number(row.storeOnlinePrice) || 0;
    const price = online > 0 ? online : retail;
    const status = statusFromRow(row);
    return {
        id: String(row.id),
        sku: row.sku || '',
        shop: shopName || 'Ammad Hadi Stor',
        shopId: Number(row.ShopId) || 1,
        title: row.title || 'Untitled',
        category: row.category || 'Other',
        price,
        was: retail > price ? retail : 0,
        unit: row.sellUnit || row.stockUnit || 'Pcs',
        stock: Math.round(Number(row.stockMeters) || 0),
        status: displayStatus(status),
        statusKey: status,
        tag: row.storeFeatured ? 'Featured' : (row.storeNewArrival ? 'New' : (row.storeSale ? 'Sale' : '')),
        image: row.imageUrl || '',
        added: row.createdAt ? new Date(row.createdAt).toISOString() : '',
        tone: String(row.category || 'other').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 12) || 'sheet',
        locked: true,
        index,
        variantIds: [String(row.id)],
        variantCount: 1
    };
}

function pickPrimary(pack) {
    return pack.slice().sort((a, b) => {
        const blankDiff = (isBlankColor(a) ? 0 : 1) - (isBlankColor(b) ? 0 : 1);
        if (blankDiff) return blankDiff;
        const imgDiff = (a.imageUrl ? 0 : 1) - (b.imageUrl ? 0 : 1);
        if (imgDiff) return imgDiff;
        const stockDiff = (Number(b.stockMeters) || 0) - (Number(a.stockMeters) || 0);
        if (stockDiff) return stockDiff;
        return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    })[0];
}

function familyStatus(pack) {
    const keys = pack.map(statusFromRow);
    if (keys.includes('published')) return 'published';
    if (keys.includes('pending')) return 'pending';
    return 'hidden';
}

function groupAdminProducts(rows, shopNames) {
    const groups = new Map();
    (Array.isArray(rows) ? rows : []).forEach((row) => {
        const key = familyKey(row);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(row);
    });
    const out = [];
    let index = 0;
    groups.forEach((pack) => {
        const primary = pickPrimary(pack);
        const mapped = mapAdminProduct(primary, shopNames[primary.ShopId], index);
        const stock = pack.reduce((sum, row) => sum + (Number(row.stockMeters) || 0), 0);
        mapped.stock = Math.round(stock);
        mapped.variantIds = pack.map((row) => String(row.id));
        mapped.variantCount = pack.length;
        const priced = pack
            .filter((row) => (Number(row.storeOnlinePrice) || Number(row.retailPrice) || 0) > 0)
            .sort((a, b) => (Number(b.stockMeters) || 0) - (Number(a.stockMeters) || 0));
        if (priced.length) {
            const best = priced[0];
            const retail = Number(best.retailPrice) || 0;
            const online = Number(best.storeOnlinePrice) || 0;
            mapped.price = online > 0 ? online : retail;
            mapped.was = retail > mapped.price ? retail : 0;
            mapped.unit = best.sellUnit || best.stockUnit || mapped.unit;
        }
        if (!mapped.image) {
            const withImg = pack.find((row) => row.imageUrl);
            if (withImg) mapped.image = withImg.imageUrl;
        }
        const status = familyStatus(pack);
        mapped.statusKey = status;
        mapped.status = displayStatus(status);
        const skuRow = pack.find((row) => row.sku && isBlankColor(row)) || pack.find((row) => row.sku);
        if (skuRow && skuRow.sku) mapped.sku = skuRow.sku;
        out.push(mapped);
        index += 1;
    });
    out.sort((a, b) => String(b.added || '').localeCompare(String(a.added || '')));
    return out;
}

function countStatuses(rows) {
    const counts = { total: rows.length, published: 0, hidden: 0, pending: 0 };
    rows.forEach((row) => {
        const key = row.statusKey || normStatus(row.status);
        if (key === 'published') counts.published += 1;
        else if (key === 'hidden') counts.hidden += 1;
        else counts.pending += 1;
    });
    return counts;
}

function expandVariantIds(products, ids) {
    const wanted = new Set((ids || []).map(String));
    const out = new Set();
    (products || []).forEach((row) => {
        const variants = Array.isArray(row.variantIds) ? row.variantIds.map(String) : [String(row.id)];
        if (wanted.has(String(row.id)) || variants.some((id) => wanted.has(id))) {
            variants.forEach((id) => out.add(id));
        }
    });
    wanted.forEach((id) => out.add(id));
    return [...out];
}

module.exports = {
    normStatus,
    displayStatus,
    statusFromRow,
    applyMarketplaceStatus,
    mapAdminProduct,
    groupAdminProducts,
    countStatuses,
    expandVariantIds,
    familyKey
};
