const DEFAULT_INV_BRANDS = ['Gul Ahmed', 'Alkaram', 'Khadi', 'Nishat', 'Bareeze'];

function extraInvBrands() {
    try {
        const raw = JSON.parse(localStorage.getItem('invBrands') || '[]');
        return Array.isArray(raw) ? raw.filter(Boolean) : [];
    } catch (error) {
        return [];
    }
}

function allInvBrands() {
    if (typeof catalogNames === 'function') {
        const names = catalogNames('brand');
        if (names.length) return names;
    }
    return DEFAULT_INV_BRANDS.slice();
}

function fillInvBrandOptions(selected) {
    const input = document.getElementById('invBrand');
    const list = document.getElementById('invBrandList');
    if (list) {
        list.innerHTML = allInvBrands().map((name) =>
            `<option value="${escapeHtml(name)}"></option>`
        ).join('');
    }
    if (input && selected) input.value = selected;
}

function renderBrandPage() {
    const tbody = document.getElementById('brandTable');
    if (!tbody) return;
    const rows = typeof catalogItems === 'function' ? catalogItems('brand') : [];
    tbody.innerHTML = rows.map((row) => `
        <tr>
            <td>${escapeHtml(row.name)}</td>
            <td>${row.source === 'custom' ? 'Custom' : 'Standard'}</td>
            <td>${row.locked
                ? '<span class="sku">Locked</span>'
                : `<button type="button" class="ghost" data-branddel="${escapeHtml(row.name)}">Delete</button>`}</td>
        </tr>`).join('');
    fillInvBrandOptions();
}

async function saveStoreBrand(event) {
    event.preventDefault();
    const name = document.getElementById('brandName').value.trim();
    if (!name) return;
    try {
        const data = await saveCatalogTerm('brand', name, '');
        document.getElementById('brandForm').reset();
        showToast(data.message || 'Brand saved for this shop.');
    } catch (error) {
        showToast(error.message);
    }
}

async function deleteStoreBrand(name) {
    const row = typeof catalogTerm === 'function' ? catalogTerm('brand', name) : null;
    if (!row || row.locked || row.source !== 'custom') {
        return showToast('System brands cannot be deleted.');
    }
    try {
        const data = await deleteCatalogTerm('brand', name);
        showToast(data.message || 'Brand removed.');
    } catch (error) {
        showToast(error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('view-brands');
    if (!root) return;
    root.innerHTML = brandsMarkup();
    disableAutofill(root);
    bindCatalogPageActions(root);
    document.getElementById('brandBack').addEventListener('click', () => showView('inventory'));
    document.getElementById('brandForm').addEventListener('submit', saveStoreBrand);
    document.getElementById('brandTable').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-branddel]');
        if (btn) deleteStoreBrand(btn.dataset.branddel);
    });
    loadCatalogScope().catch((error) => showToast(error.message));
});
