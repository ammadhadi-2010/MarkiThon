const OSC_KEY = 'onlineStoreControl';
const OSC_DEFAULTS = {
    productVisibility: true,
    marketplace: true,
    stockVisibility: 'exact',
    featured: false,
    acceptOrders: true,
    shopStatus: 'open'
};

function loadOscState() {
    try {
        const raw = JSON.parse(localStorage.getItem(OSC_KEY) || '{}');
        return { ...OSC_DEFAULTS, ...(raw && typeof raw === 'object' ? raw : {}) };
    } catch (error) {
        return { ...OSC_DEFAULTS };
    }
}

function saveOscState(state) {
    localStorage.setItem(OSC_KEY, JSON.stringify(state));
}

function oscOnOff(on) {
    return on ? 'ON' : 'OFF';
}

function readOscForm() {
    return {
        productVisibility: document.getElementById('oscVisible').checked,
        marketplace: document.getElementById('oscMarket').checked,
        stockVisibility: document.getElementById('oscStock').value === 'instock' ? 'instock' : 'exact',
        featured: document.getElementById('oscFeatured').checked,
        acceptOrders: document.getElementById('oscOrders').checked,
        shopStatus: document.querySelector('[data-oscshop].active')?.dataset.oscshop === 'closed'
            ? 'closed'
            : 'open'
    };
}

function paintOscForm(state) {
    const data = state || loadOscState();
    document.getElementById('oscVisible').checked = Boolean(data.productVisibility);
    document.getElementById('oscMarket').checked = Boolean(data.marketplace);
    document.getElementById('oscStock').value = data.stockVisibility === 'instock' ? 'instock' : 'exact';
    document.getElementById('oscFeatured').checked = Boolean(data.featured);
    document.getElementById('oscOrders').checked = Boolean(data.acceptOrders);
    document.getElementById('oscVisibleLabel').textContent = oscOnOff(data.productVisibility);
    document.getElementById('oscMarketLabel').textContent = oscOnOff(data.marketplace);
    document.getElementById('oscFeaturedLabel').textContent = oscOnOff(data.featured);
    document.getElementById('oscOrdersLabel').textContent = oscOnOff(data.acceptOrders);
    document.querySelectorAll('[data-oscshop]').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.oscshop === data.shopStatus);
    });
}

function oscToast(field, state) {
    if (field === 'stockVisibility') {
        const stock = state.stockVisibility === 'instock' ? "Show 'In Stock' only" : 'Show exact quantity';
        return showToast(`Stock Visibility: ${stock}`);
    }
    if (field === 'shopStatus') {
        const shop = state.shopStatus === 'closed' ? 'Temporarily Closed' : 'Open';
        return showToast(`Shop Status: ${shop}`);
    }
    const labels = {
        productVisibility: 'Product Visibility',
        marketplace: 'Show on Markithon Marketplace',
        featured: 'Featured Product Status',
        acceptOrders: 'Online Orders Acceptance'
    };
    const on = field === 'productVisibility' ? state.productVisibility
        : field === 'marketplace' ? state.marketplace
            : field === 'featured' ? state.featured
                : state.acceptOrders;
    showToast(`${labels[field] || 'Online Store Control'}: ${oscOnOff(on)}`);
}

function persistOscChange(field) {
    const state = readOscForm();
    saveOscState(state);
    paintOscForm(state);
    oscToast(field, state);
}

function bindDashboardStore() {
    const form = document.getElementById('oscForm');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = '1';
    paintOscForm(loadOscState());
    ['oscVisible', 'oscMarket', 'oscFeatured', 'oscOrders'].forEach((id) => {
        const field = id === 'oscVisible' ? 'productVisibility'
            : id === 'oscMarket' ? 'marketplace'
                : id === 'oscFeatured' ? 'featured'
                    : 'acceptOrders';
        document.getElementById(id).addEventListener('change', () => persistOscChange(field));
    });
    document.getElementById('oscStock').addEventListener('change', () => persistOscChange('stockVisibility'));
    form.querySelectorAll('[data-oscshop]').forEach((btn) => {
        btn.addEventListener('click', () => {
            form.querySelectorAll('[data-oscshop]').forEach((b) => b.classList.toggle('active', b === btn));
            persistOscChange('shopStatus');
        });
    });
}
