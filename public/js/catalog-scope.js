let catalogScope = {
    viewer: 'shop',
    shopId: 1,
    shopType: '',
    categories: [],
    mainCategories: [],
    subcategories: [],
    brands: [],
    groups: []
};

function catalogItems(kind) {
    const rows = kind === 'brand' ? catalogScope.brands : catalogScope.categories;
    return Array.isArray(rows) ? rows : [];
}

function catalogNames(kind) {
    if (kind !== 'category') return catalogItems(kind).map((row) => row.name);
    const mains = Array.isArray(catalogScope.mainCategories)
        ? catalogScope.mainCategories.map((row) => row.name)
        : [];
    const subs = Array.isArray(catalogScope.subcategories)
        ? catalogScope.subcategories.map((row) => row.name)
        : catalogItems('category').filter((row) => row.kind === 'subcategory').map((row) => row.name);
    const names = [];
    mains.concat(subs).forEach((name) => {
        if (name && !names.includes(name)) names.push(name);
    });
    if (names.length) return names;
    return catalogItems('category').map((row) => row.name);
}

function catalogTerm(kind, name) {
    return catalogItems(kind).find((row) => row.name === name) || null;
}

function catalogQuery() {
    const scope = new URLSearchParams(location.search).get('scope');
    return scope === 'platform' ? '?scope=platform' : '';
}

function readLocalNames(key) {
    try {
        const raw = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(raw) ? raw.filter(Boolean) : [];
    } catch (error) {
        return [];
    }
}

async function migrateLocalCatalog() {
    const pairs = [
        ['invCategories', 'category'],
        ['invBrands', 'brand']
    ];
    for (const [key, kind] of pairs) {
        const names = readLocalNames(key);
        for (const name of names) {
            try {
                await api.post('/api/catalog/terms', { kind, name });
            } catch (error) {
                /* Skip names that are system defaults or already saved. */
            }
        }
        if (names.length) localStorage.removeItem(key);
    }
}

function paintPlatformTable(id, kind) {
    const body = document.getElementById(id);
    const wrap = body && body.closest('[data-platform]');
    if (!body || !wrap) return;
    const groups = catalogScope.viewer === 'platform' ? catalogScope.groups : [];
    wrap.hidden = !groups.length;
    body.innerHTML = groups.map((group) => (group[kind] || []).map((row) => `
        <tr>
            <td>${escapeHtml(group.shopName || '')}</td>
            <td>${escapeHtml(group.ownerName || '')}</td>
            <td>${escapeHtml(group.shopType || '')}</td>
            <td>${escapeHtml(row.name)}</td>
            <td>${row.source === 'custom' ? 'Custom' : 'Standard'}</td>
            <td><span class="sku">Locked</span></td>
        </tr>`).join('')).join('');
}

async function loadCatalogScope() {
    if (readLocalNames('invCategories').length || readLocalNames('invBrands').length) {
        await migrateLocalCatalog();
    }
    catalogScope = await api.get('/api/catalog/terms' + catalogQuery());
    if (typeof fillInvCategoryOptions === 'function') fillInvCategoryOptions();
    if (typeof fillInvBrandOptions === 'function') fillInvBrandOptions();
    if (document.getElementById('catTable') && typeof renderCategoryPage === 'function') renderCategoryPage();
    if (document.getElementById('brandTable') && typeof renderBrandPage === 'function') renderBrandPage();
    paintPlatformTable('catAdminTable', 'categories');
    paintPlatformTable('brandAdminTable', 'brands');
    if (typeof applyInvMobileMode === 'function') applyInvMobileMode();
    if (typeof applyRecvMobileMode === 'function') applyRecvMobileMode();
}

async function saveCatalogTerm(kind, name, original) {
    const data = await api.post('/api/catalog/terms', { kind, name, original: original || '' });
    await loadCatalogScope();
    return data;
}

async function deleteCatalogTerm(kind, name) {
    const query = `?kind=${encodeURIComponent(kind)}&name=${encodeURIComponent(name)}`;
    const data = await api.del('/api/catalog/terms' + query);
    await loadCatalogScope();
    return data;
}
