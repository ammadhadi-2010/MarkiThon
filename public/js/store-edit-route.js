function osEditIdFromPath() {
    const match = String(location.pathname || '').match(/\/online-store\/products\/edit\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

function osEditUrl(id) {
    return '/online-store/products/edit/' + encodeURIComponent(id);
}

function osProductsListUrl() {
    return '/online-store/products';
}

function osPushEditPath(id) {
    const url = osEditUrl(id);
    if (location.pathname !== url) history.pushState({ osEdit: id }, '', url);
}

function osClearEditPath() {
    const url = osProductsListUrl();
    if (location.pathname !== url) {
        history.pushState({ view: 'store', storeSec: 'products' }, '', url);
    }
}

function bindOsEditRoute() {
    if (window.__osEditRouteBound) return;
    window.__osEditRouteBound = true;
    window.addEventListener('popstate', () => {
        const id = osEditIdFromPath();
        if (id && typeof openOsEdit === 'function') {
            openOsEdit(id, { skipPath: true });
            return;
        }
        if (typeof showView === 'function') showView('store', { storeSec: 'products' });
    });
}

async function bootOsEditRoute() {
    const id = osEditIdFromPath();
    if (id && typeof openOsEdit === 'function') {
        await openOsEdit(id, { skipPath: true });
        return;
    }
    if (String(location.pathname || '').startsWith('/online-store/products')) {
        if (typeof showView === 'function') showView('store', { storeSec: 'products' });
    }
}
