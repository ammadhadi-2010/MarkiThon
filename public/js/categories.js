function renderCategoryPage() {
    const tbody = document.getElementById('catTable');
    if (!tbody) return;
    const rows = typeof catalogItems === 'function' ? catalogItems('category') : [];
    tbody.innerHTML = rows.map((row) => {
        const menu = row.locked
            ? '<span class="sku">Locked</span>'
            : `<button type="button" class="ghost" data-act="edit" data-id="${escapeHtml(row.name)}">Edit</button>
               <button type="button" class="ghost" data-act="delete" data-id="${escapeHtml(row.name)}">Delete</button>`;
        return `<tr>
            <td>${escapeHtml(row.name)}</td>
            <td>${row.source === 'custom' ? 'Custom' : 'Standard'}</td>
            <td class="col-actions">${menu}</td>
        </tr>`;
    }).join('');
}

function resetCategoryForm() {
    document.getElementById('catForm')?.reset();
    const orig = document.getElementById('catEditOriginal');
    if (orig) orig.value = '';
}

function fillCategoryForm(name) {
    document.getElementById('catEditOriginal').value = name;
    document.getElementById('catName').value = name;
    document.getElementById('catName').focus();
}

async function saveStoreCategory(event) {
    event.preventDefault();
    const name = document.getElementById('catName').value.trim();
    const original = document.getElementById('catEditOriginal').value.trim();
    if (!name) return;
    if (original && isStandardInvCategory(original)) {
        return showToast('Standard categories cannot be edited.');
    }
    try {
        const data = await saveCatalogTerm('category', name, original);
        resetCategoryForm();
        showToast(data.message || 'Category saved for this shop.');
    } catch (error) {
        showToast(error.message);
    }
}

async function deleteStoreCategory(name) {
    if (isStandardInvCategory(name)) {
        return showToast('Standard categories cannot be deleted.');
    }
    if (!confirm('Delete this category?')) return;
    try {
        const data = await deleteCatalogTerm('category', name);
        if (document.getElementById('catEditOriginal').value === name) resetCategoryForm();
        showToast(data.message || 'Category removed.');
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
        const name = btn.dataset.id;
        if (btn.dataset.act === 'edit') fillCategoryForm(name);
        if (btn.dataset.act === 'delete') deleteStoreCategory(name);
    });
    loadCatalogScope().catch((error) => showToast(error.message));
});
