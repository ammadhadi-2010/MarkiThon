let storeSection = 'products';

function setStoreSection(name) {
    if (name === 'customers') {
        if (typeof showView === 'function') showView('customers');
        return;
    }
    const next = ['settings', 'products', 'orders', 'edit'].includes(name)
        ? name
        : 'products';
    storeSection = next;
    const top = document.getElementById('osDashTop');
    if (top) top.hidden = next !== 'settings';
    const products = document.getElementById('osPage-products');
    const edit = document.getElementById('osPage-edit');
    const orders = document.getElementById('osPage-orders');
    if (products) products.hidden = next !== 'products';
    if (edit) edit.hidden = next !== 'edit';
    if (orders) orders.hidden = next !== 'orders';
    if (typeof paintStoreNavSection === 'function') {
        paintStoreNavSection(next === 'edit' ? 'products' : next);
    }
}

async function refreshStoreManage() {
    if (typeof loadStoreStatus === 'function') await loadStoreStatus();
    if (typeof bindStoreHome === 'function') bindStoreHome();
    if (typeof loadStoreBanner === 'function') await loadStoreBanner();
    if (typeof loadStoreTheme === 'function') await loadStoreTheme();
    if (storeSection === 'settings' && typeof loadStorePolicy === 'function') await loadStorePolicy();
    if (storeSection === 'orders') {
        if (typeof loadOsOrders === 'function') await loadOsOrders();
        return;
    }
    if (storeSection === 'edit') {
        const id = document.getElementById('osEditPage')?.dataset.id
            || (typeof osEditIdFromPath === 'function' ? osEditIdFromPath() : '');
        if (id && typeof fillOsEditPage === 'function') await fillOsEditPage(id);
        return;
    }
    if (typeof loadOsProducts === 'function') await loadOsProducts();
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('view-store');
    if (!root) return;
    root.innerHTML = storeMarkup();
    disableAutofill(root);
    if (typeof bindStoreStatus === 'function') bindStoreStatus();
    if (typeof bindStoreHome === 'function') bindStoreHome();
    if (typeof bindStoreBanner === 'function') bindStoreBanner();
    if (typeof bindStoreTheme === 'function') bindStoreTheme();
    if (typeof bindStorePolicy === 'function') bindStorePolicy();
    if (typeof bindOsProducts === 'function') bindOsProducts();
    if (typeof bindOsOrders === 'function') bindOsOrders();
    if (typeof bindOsEdit === 'function') bindOsEdit();
    if (typeof bootOsEditRoute === 'function') {
        bootOsEditRoute().catch((err) => showToast(err.message));
    }
});
