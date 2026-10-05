const DEFAULT_INV_CATS = ['Lawn', 'Cotton', 'Silk', 'Khaddar', 'Linen', 'Bedsheet', 'Blanket / Kambal'];
let invShopCategories = [];

function extraInvCategories() {
    try {
        const raw = JSON.parse(localStorage.getItem('invCategories') || '[]');
        return Array.isArray(raw) ? raw.filter(Boolean) : [];
    } catch (error) {
        return [];
    }
}

function allInvCategories() {
    if (typeof catalogNames === 'function') {
        const names = catalogNames('category');
        if (names.length) return names;
    }
    return invShopCategories.length ? invShopCategories.slice() : [];
}

function isStandardInvCategory(name) {
    const row = typeof catalogTerm === 'function' ? catalogTerm('category', name) : null;
    return !row || row.source === 'standard' || row.locked;
}

async function loadInvShopCategories() {
    if (typeof loadCatalogScope === 'function') return loadCatalogScope();
    fillInvCategoryOptions();
}

function fillInvCategoryOptions(selected) {
    const select = document.getElementById('invCategory');
    if (!select) return;
    const names = allInvCategories();
    if (selected && !names.includes(selected)) names.push(selected);
    select.innerHTML = names.map((name) => `<option>${escapeHtml(name)}</option>`).join('');
    if (selected && names.includes(selected)) select.value = selected;
    else if (names[0]) select.value = names[0];
}

function fillInvSupplierOptions(selected) {
    const rows = (typeof suppliersCache !== 'undefined' ? suppliersCache : [])
        .filter((s) => s.status !== 'Inactive');
    ['invSupplierId', 'recvSupplierId'].forEach((id) => {
        const select = document.getElementById(id);
        if (!select) return;
        const keep = selected || select.value;
        select.innerHTML = '<option value="">Select supplier</option>' + rows.map((s) =>
            `<option value="${s.id}">${escapeHtml(s.name)} — ${escapeHtml(s.phone || '')}</option>`
        ).join('');
        if (keep) select.value = keep;
    });
}

function focusAddProduct() {
    if (typeof showView === 'function') showView('inventory', { invMode: 'product' });
    if (typeof setInvPageMode === 'function') setInvPageMode('product');
    if (typeof resetInvForm === 'function') resetInvForm();
    if (typeof setInvTab === 'function') setInvTab('basic');
    const title = document.getElementById('invTitle');
    if (title) title.focus();
}

function openQuickPage(act) {
    if (act === 'product') return focusAddProduct();
    if (act === 'stockin') {
        if (typeof showView === 'function') showView('stock');
        if (typeof setStockTab === 'function') setStockTab('in');
        return;
    }
    if (act === 'supplier') {
        if (typeof focusInvAddSupplier === 'function') return focusInvAddSupplier();
        showView('inventory');
        return;
    }
    if (act === 'wholesaler') {
        showView('wholesalers');
        if (typeof resetWholesalerForm === 'function') resetWholesalerForm();
        const name = document.getElementById('wlName');
        if (name) name.focus();
        return;
    }
    if (act === 'category') {
        showView('categories');
        if (typeof renderCategoryPage === 'function') renderCategoryPage();
    }
}

function bindInventorySupplier() {
    loadInvShopCategories().catch(() => fillInvCategoryOptions());
    const quick = document.getElementById('invQuickActions');
    if (quick && !quick.dataset.bound) {
        quick.dataset.bound = '1';
        quick.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-invquick]');
            if (btn) openQuickPage(btn.dataset.invquick);
        });
    }
    if (typeof loadSuppliers === 'function') {
        loadSuppliers().then(() => fillInvSupplierOptions()).catch(() => {});
    }
}
