function catMainOptions() {
    const mains = Array.isArray(catalogScope.mainCategories)
        ? catalogScope.mainCategories
        : catalogItems('category').filter((row) => row.kind === 'main' || row.source === 'standard');
    return mains;
}

function catSubRows() {
    if (Array.isArray(catalogScope.subcategories)) return catalogScope.subcategories;
    return catalogItems('category').filter((row) => row.kind === 'subcategory' || row.parentName);
}

function fillCatParentSelect(selected) {
    const select = document.getElementById('catParent');
    if (!select) return;
    const mains = catMainOptions();
    select.innerHTML = '<option value="">Select main category</option>' + mains.map((row) =>
        `<option value="${escapeHtml(row.name)}">${escapeHtml(row.name)}</option>`).join('');
    if (selected) select.value = selected;
}

function renderCategoryPage() {
    const tbody = document.getElementById('catTable');
    if (!tbody) return;
    fillCatParentSelect(document.getElementById('catParent')?.value || '');
    const mains = catMainOptions().map((row) => `
        <tr>
            <td>${escapeHtml(row.name)}</td>
            <td>Standard</td>
            <td>—</td>
            <td class="col-actions"><span class="sku">Locked</span></td>
        </tr>`).join('');
    const subs = catSubRows().map((row) => `
        <tr>
            <td>${escapeHtml(row.name)}</td>
            <td>Subcategory</td>
            <td>${escapeHtml(row.parentName || '')}</td>
            <td class="col-actions">
                <button type="button" class="ghost" data-act="edit"
                    data-id="${escapeHtml(row.name)}" data-parent="${escapeHtml(row.parentName || '')}">Edit</button>
                <button type="button" class="ghost" data-act="delete"
                    data-id="${escapeHtml(row.name)}" data-parent="${escapeHtml(row.parentName || '')}">Delete</button>
            </td>
        </tr>`).join('');
    tbody.innerHTML = mains + subs
        || '<tr><td colspan="4">No categories yet for this shop type.</td></tr>';
}

function resetCategoryForm() {
    document.getElementById('catForm')?.reset();
    const orig = document.getElementById('catEditOriginal');
    if (orig) orig.value = '';
    fillCatParentSelect('');
    const btn = document.getElementById('catSaveBtn');
    if (btn) btn.textContent = 'Save Subcategory';
}

function fillCategoryForm(name, parent) {
    document.getElementById('catEditOriginal').value = name;
    document.getElementById('catName').value = name;
    fillCatParentSelect(parent || '');
    document.getElementById('catParent').value = parent || '';
    document.getElementById('catName').focus();
    const btn = document.getElementById('catSaveBtn');
    if (btn) btn.textContent = 'Update Subcategory';
}

async function saveStoreCategory(event) {
    event.preventDefault();
    const name = document.getElementById('catName').value.trim();
    const parentName = document.getElementById('catParent').value.trim();
    const original = document.getElementById('catEditOriginal').value.trim();
    if (!name || !parentName) return showToast('Choose a main category and enter a subcategory name.');
    try {
        const data = await api.post('/api/catalog/terms', {
            kind: 'subcategory',
            name,
            parentName,
            original
        });
        await loadCatalogScope();
        resetCategoryForm();
        showToast(data.message || 'Subcategory saved for this shop.');
    } catch (error) {
        showToast(error.message);
    }
}

async function deleteStoreCategory(name, parent) {
    if (!confirm('Delete this subcategory?')) return;
    try {
        const query = '?kind=subcategory&name=' + encodeURIComponent(name)
            + '&parentName=' + encodeURIComponent(parent || '');
        const data = await api.del('/api/catalog/terms' + query);
        await loadCatalogScope();
        if (document.getElementById('catEditOriginal').value === name) resetCategoryForm();
        showToast(data.message || 'Subcategory removed.');
    } catch (error) {
        showToast(error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('view-categories');
    if (!root) return;
    root.innerHTML = categoriesMarkup();
    disableAutofill(root);
    document.getElementById('catBack').addEventListener('click', () => showView('inventory'));
    document.getElementById('catCancel')?.addEventListener('click', resetCategoryForm);
    bindCatalogPageActions(root);
    document.getElementById('catForm').addEventListener('submit', saveStoreCategory);
    document.getElementById('catTable').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        if (btn.dataset.act === 'edit') fillCategoryForm(btn.dataset.id, btn.dataset.parent);
        if (btn.dataset.act === 'delete') deleteStoreCategory(btn.dataset.id, btn.dataset.parent);
    });
    loadCatalogScope().catch((error) => showToast(error.message));
});
