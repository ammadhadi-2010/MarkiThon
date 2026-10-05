function catalogPageActions(active) {
    const btn = (key, label) => {
        const on = active === key ? ' active' : '';
        return `<button type="button" class="inv-quick-btn${on}" data-cataction="${key}">${label}</button>`;
    };
    return `
        <div class="cat-actions" role="toolbar" aria-label="Catalog actions">
            ${btn('product', '+ Add Product')}
            ${btn('category', '+ Add Category')}
            ${btn('brand', '+ Add Brand')}
            ${btn('color', '+ Add Color')}
        </div>`;
}

function openCatalogAction(act) {
    if (act === 'product') {
        if (typeof focusAddProduct === 'function') return focusAddProduct();
        showView('inventory');
        return;
    }
    if (act === 'category') {
        showView('categories');
        if (typeof renderCategoryPage === 'function') renderCategoryPage();
        return;
    }
    if (act === 'brand') {
        showView('brands');
        if (typeof renderBrandPage === 'function') renderBrandPage();
        return;
    }
    if (act === 'color') {
        showView('colors');
        if (typeof renderColorPage === 'function') renderColorPage();
    }
}

function bindCatalogPageActions(root) {
    if (!root || root.dataset.catNavBound) return;
    root.dataset.catNavBound = '1';
    root.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-cataction]');
        if (btn) openCatalogAction(btn.dataset.cataction);
    });
}
