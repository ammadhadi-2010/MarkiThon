const NAV_ITEMS = [
    ['dashboard', 'Dashboard'],
    ['inventory', 'Inventory'],
    ['stock', 'Stock Movement'],
    ['billing', 'Billing / POS'],
    ['wholesale', 'Wholesale Orders'],
    ['store', 'Online Store'],
    ['customers', 'Customers'],
    ['suppliers', 'Suppliers'],
    ['reports', 'Reports'],
    ['expenses', 'Expenses'],
    ['settings', 'Settings']
];

function showToast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 2600);
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('open');
}

function showView(name, opts = {}) {
    if (name === 'store' && opts.storeSec === 'customers') {
        showView('customers', opts);
        return;
    }
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach((n) => {
        const invSub = name === 'wholesalers' || name === 'categories'
            || name === 'brands' || name === 'colors';
        n.classList.toggle('active', n.dataset.view === name
            || (invSub && n.dataset.view === 'inventory')
            || (name === 'store' && n.dataset.view === 'store'));
    });
    const view = document.getElementById('view-' + name);
    if (view) view.classList.add('active');
    const quick = document.getElementById('invQuickActions');
    if (quick) quick.hidden = name !== 'inventory';
    const search = document.getElementById('globalSearch');
    const placeholders = {
        suppliers: 'Search suppliers...',
        inventory: 'Search products...',
        billing: 'Search products...',
        wholesale: 'Search wholesale orders...',
        wholesalers: 'Search wholesalers...',
        stock: 'Search stock history...',
        reports: 'Search reports...',
        dashboard: 'Search dashboard...',
        store: 'Search store products...',
        customers: 'Search customers...',
        categories: 'Search categories...',
        brands: 'Search brands...',
        colors: 'Search colors...',
        expenses: 'Search expenses...',
        settings: 'Search settings...'
    };
    search.placeholder = placeholders[name] || 'Search...';
    closeSidebar();
    if (!opts.skipPath) syncAdminPath(name);
    if (name === 'store' && typeof setStoreSection === 'function') {
        setStoreSection(opts.storeSec || 'products');
    }
    if (name === 'inventory' && typeof setInvPageMode === 'function') {
        setInvPageMode(opts.invMode || 'product');
    }
    if (opts.skipRefresh) return;
    if (name === 'dashboard') {
        requestAnimationFrame(() => refreshLinkedView(name));
        return;
    }
    refreshLinkedView(name);
}

function refreshLinkedView(name) {
    const run = async () => {
        if (name === 'dashboard' && typeof refreshDashboard === 'function') await refreshDashboard();
        if (name === 'inventory' && typeof loadProducts === 'function') await loadProducts();
        if (name === 'suppliers' && typeof loadSuppliers === 'function') await loadSuppliers();
        if (name === 'billing' && typeof loadRtCustomers === 'function') await loadRtCustomers();
        if (name === 'billing' && typeof loadRtBills === 'function') await loadRtBills();
        if (name === 'wholesale' && typeof refreshWholesaleView === 'function') await refreshWholesaleView();
        if (name === 'stock' && typeof refreshStockView === 'function') await refreshStockView();
        if (name === 'stock' && typeof refreshRecvVouchers === 'function') await refreshRecvVouchers();
        if (name === 'store' && typeof refreshStoreManage === 'function') await refreshStoreManage();
        if (name === 'expenses' && typeof loadExpenses === 'function') await loadExpenses();
        if (name === 'settings' && typeof loadSettings === 'function') await loadSettings();
        if (name === 'customers' && typeof loadCustomerHub === 'function') await loadCustomerHub();
        if (name === 'wholesalers' && typeof loadWholesalers === 'function') await loadWholesalers();
        if (name === 'categories' && typeof renderCategoryPage === 'function') renderCategoryPage();
        if (name === 'brands' && typeof renderBrandPage === 'function') renderBrandPage();
        if (name === 'colors' && typeof renderColorPage === 'function') renderColorPage();
    };
    run().catch((error) => showToast(error.message));
}

function pathForView(name) {
    if (name === 'customers') return '/customers';
    if (name === 'settings') return '/settings';
    if (name === 'dashboard') return '/dashboard';
    if (name === 'inventory') return '/inventory';
    return '/app';
}

function viewFromPath(path) {
    const raw = String(path || '');
    if (raw === '/customers' || raw.indexOf('/customers/') === 0
        || raw.indexOf('/online-store/customers') === 0) return 'customers';
    if (raw === '/settings' || raw.indexOf('/settings/') === 0
        || raw === '/store-settings' || raw.indexOf('/store-settings/') === 0) {
        return 'settings';
    }
    if (raw === '/inventory' || raw.indexOf('/inventory/') === 0) return 'inventory';
    if (raw === '/dashboard' || raw.indexOf('/dashboard/') === 0
        || raw === '/app' || raw.indexOf('/app/') === 0
        || raw === '/vendor/dashboard' || raw.indexOf('/vendor/dashboard/') === 0) {
        return 'dashboard';
    }
    return '';
}

function syncAdminPath(name) {
    const next = pathForView(name);
    if (location.pathname !== next) {
        history.pushState({ view: name }, '', next);
    }
}

function bootAdminPath() {
    const path = String(location.pathname || '');
    if (path === '/online-store/customers' || path.indexOf('/online-store/customers/') === 0) {
        history.replaceState({ view: 'customers' }, '', '/customers');
        showView('customers', { skipPath: true });
        return;
    }
    const view = viewFromPath(path);
    if (view) {
        showView(view, { skipPath: true });
        return;
    }
    showView('dashboard', { skipPath: true });
    if (location.pathname === '/' || location.pathname === '/index.html') {
        history.replaceState({ view: 'dashboard' }, '', '/dashboard');
    }
}

function renderNav() {
    const nav = document.getElementById('sidebarNav');
    const active = viewFromPath(location.pathname) || 'dashboard';
    nav.innerHTML = NAV_ITEMS.map(([id, label]) => `
        <button class="nav-item${id === active ? ' active' : ''}" data-view="${id}" type="button">
            ${label}
        </button>
    `).join('');
    nav.querySelectorAll('.nav-item').forEach((btn) => {
        if (btn.classList.contains('nav-parent')) return;
        btn.addEventListener('click', () => showView(btn.dataset.view));
    });
    if (typeof bindStoreNav === 'function') bindStoreNav();
}

document.addEventListener('DOMContentLoaded', () => {
    renderNav();
    document.getElementById('menuBtn').addEventListener('click', toggleSidebar);
    document.getElementById('overlay').addEventListener('click', closeSidebar);
    disableAutofill(document);
    bootAdminPath();
    window.addEventListener('popstate', () => {
        const view = viewFromPath(location.pathname) || 'dashboard';
        showView(view, { skipPath: true });
    });
});
