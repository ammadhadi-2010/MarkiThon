function dropLocalProducts(ids, title) {
    const idSet = new Set((ids || []).map((id) => String(id)));
    const key = String(title || '').trim().toLowerCase();
    productsCache = (productsCache || []).filter((p) => {
        if (idSet.has(String(p.id))) return false;
        if (key && String(p.title || '').trim().toLowerCase() === key) return false;
        return true;
    });
    if (typeof osProducts !== 'undefined' && Array.isArray(osProducts)) {
        osProducts = osProducts.filter((p) => {
            if (idSet.has(String(p.id))) return false;
            if (key && String(p.title || '').trim().toLowerCase() === key) return false;
            return true;
        });
        if (typeof renderOsProducts === 'function') renderOsProducts();
        if (typeof fillOsCatFilter === 'function') fillOsCatFilter();
    }
}

async function deleteInvProduct(product) {
    if (!product) return;
    const detail = [product.title, product.sku].filter(Boolean).join(' · ');
    const ok = await openConfirmDelete({
        title: 'Delete Product',
        detail,
        yesLabel: 'Delete Product'
    });
    if (!ok) return;
    const data = await api.del(`/api/products/${encodeURIComponent(product.id)}`);
    const ids = Array.isArray(data.ids) ? data.ids : [product.id];
    if (typeof idbDelete === 'function') {
        await Promise.all(ids.map((id) => idbDelete('products', id).catch(() => null)));
    }
    dropLocalProducts(ids, data.title || product.title);
    renderProducts();
    showToast(data.message || 'Product deleted successfully');
}
