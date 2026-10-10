let saData = null;

function saDashboard(data) {
    return `
        ${saWelcome()}
        ${saStatCards(data.stats)}
        <div class="sa-mid">
            <section class="sa-card"><div class="sa-head"><h3>Sales Overview</h3><span class="sa-muted">Last 7 days</span></div>${saSalesChart(data.series)}</section>
            <section class="sa-card"><h3>Top Categories</h3>${saDonut(data.categories, data.stats.products)}</section>
        </div>
        <div class="sa-low">
            <section class="sa-card"><div class="sa-head"><h3>Recent Shops</h3></div>${saShopsTable(data.shops)}</section>
            <section class="sa-card"><div class="sa-head"><h3>Recent Orders</h3></div>${saOrdersTable(data.orders)}</section>
            <div class="sa-stack">${saQuickActions()}${saActivity(data.activity)}</div>
        </div>
        <div class="sa-bottom">${saMiniStats(data.stats)}${saApprovals(data.applications)}
            <section class="sa-card"><h3>Quick Reports</h3>
                <button class="sa-report" type="button" data-sa="reports">Sales Report</button>
                <button class="sa-report" type="button" data-sa="orders">Order Report</button>
                <button class="sa-report" type="button" data-sa="products">Product Report</button>
            </section>
            ${saHealth(data.health)}
        </div>`;
}

function saPage(id, data) {
    if (id && id !== 'dashboard') return saRoute(id, data) || saDashboard(data);
    return saDashboard(data);
}

function saFilter() {
    const query = (document.getElementById('saSearch').value || '').toLowerCase();
    document.querySelectorAll('.sa-table tbody tr').forEach((row) => {
        row.hidden = query && !row.textContent.toLowerCase().includes(query);
    });
}

async function saDecide(id, status) {
    const response = await fetch('/api/platform/applications/' + id, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        window.alert(data.message || 'Could not update the application.');
        return;
    }
    saData = null;
    await saLoad(location.hash.slice(1) || 'dashboard');
}

async function saLoad(page) {
    const active = page || 'dashboard';
    if (!saData) {
        const response = await fetch('/api/platform/overview', { credentials: 'include' });
        if (!response.ok) {
            document.getElementById('saView').innerHTML = '<section class="sa-card"><h2>Could not load dashboard data.</h2><p class="sa-muted">Sign in again or check the API connection.</p></section>';
            return;
        }
        saData = await response.json();
    }
    saPaintNav(active);
    saPaintTop();
    if (typeof saCloseUserMenu === 'function') saCloseUserMenu();
    document.getElementById('saView').innerHTML = saPage(active, saData);
    document.getElementById('saSearch').addEventListener('input', saFilter);
    document.getElementById('saMenu').addEventListener('click', () => {
        document.getElementById('saNav').classList.toggle('is-open');
    });
    if (active === 'shops' && typeof saMountShops === 'function') saMountShops();
    if (active === 'products' && typeof saMountProducts === 'function') saMountProducts();
    if (active === 'orders' && typeof saMountOrders === 'function') saMountOrders();
    if (active === 'customers' && typeof saMountCustomers === 'function') saMountCustomers();
    if (active === 'categories' && typeof saMountCategories === 'function') saMountCategories();
    if (active === 'complaints' && typeof saMountTickets === 'function') saMountTickets();
    if (active === 'website' && typeof saMountCms === 'function') saMountCms();
    if (active === 'subscriptions' && typeof saMountSubscriptions === 'function') saMountSubscriptions();
    if (active === 'settings' && typeof saMountAdminPass === 'function') saMountAdminPass();
}

document.addEventListener('click', (event) => {
    const nav = event.target.closest('[data-sa]');
    if (nav) {
        const page = nav.dataset.sa;
        document.getElementById('saNav').classList.remove('is-open');
        if (/^\/admin\/(shops|support)\//.test(location.pathname)) {
            location.assign('/admin#' + page);
            return;
        }
        location.hash = page;
        return;
    }
    const choice = event.target.closest('[data-decide]');
    if (choice) saDecide(choice.dataset.decide, choice.dataset.status);
});

window.addEventListener('hashchange', () => {
    if (/^\/admin\/(shops|support)\//.test(location.pathname)) return;
    saLoad(location.hash.slice(1) || 'dashboard');
});

const saProfileId = (location.pathname.match(/^\/admin\/shops\/([^/]+)$/) || [])[1];
const saSupportId = (location.pathname.match(/^\/admin\/support\/([^/]+)$/) || [])[1];

window.saBoot = function saBoot() {
    if (saProfileId) saMountShopPage(decodeURIComponent(saProfileId));
    else if (saSupportId) saMountTicketPage(decodeURIComponent(saSupportId));
    else saLoad(location.hash.slice(1) || 'dashboard');
};
