function dropOsProducts(ids, title) {
    const idSet = new Set((ids || []).map((id) => String(id)));
    const key = String(title || '').trim().toLowerCase();
    osProducts = (osProducts || []).filter((p) => {
        if (idSet.has(String(p.id))) return false;
        if (key && String(p.title || '').trim().toLowerCase() === key) return false;
        return true;
    });
    if (typeof productsCache !== 'undefined' && Array.isArray(productsCache)) {
        productsCache = productsCache.filter((p) => {
            if (idSet.has(String(p.id))) return false;
            if (key && String(p.title || '').trim().toLowerCase() === key) return false;
            return true;
        });
        if (typeof renderProducts === 'function') renderProducts();
    }
}

async function deleteOsProduct(id) {
    const row = osProducts.find((p) => String(p.id) === String(id));
    const detail = row ? [row.storeTitle || row.title, row.sku].filter(Boolean).join(' · ') : '';
    const ok = await openConfirmDelete({
        title: 'Delete Product',
        detail,
        yesLabel: 'Delete Product'
    });
    if (!ok) return;
    const data = await api.del(`/api/online-store/products/${encodeURIComponent(id)}`);
    const ids = Array.isArray(data.ids) ? data.ids : [id];
    dropOsProducts(ids, data.title || (row && row.title) || '');
    renderOsProducts();
    if (typeof fillOsCatFilter === 'function') fillOsCatFilter();
    const editId = document.getElementById('osEditPage')?.dataset.id;
    if (editId && ids.map(String).includes(String(editId))) {
        if (typeof osClearEditPath === 'function') osClearEditPath();
        if (typeof setStoreSection === 'function') setStoreSection('products');
    }
    showToast(data.message || 'Product deleted successfully');
}
