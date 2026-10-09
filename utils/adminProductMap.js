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
        index
    };
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

module.exports = {
    normStatus,
    displayStatus,
    statusFromRow,
    applyMarketplaceStatus,
    mapAdminProduct,
    countStatuses
};
