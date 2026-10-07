const SA_NAV = [
    ['dashboard', 'Dashboard'],
    ['shops', 'Shops / Shopkeepers'],
    ['products', 'Products'],
    ['orders', 'Orders'],
    ['customers', 'Customers'],
    ['categories', 'Categories'],
    ['website', 'Website / Marketplace'],
    ['subscriptions', 'Subscription Packages'],
    ['reports', 'Reports'],
    ['complaints', 'Complaints / Support'],
    ['settings', 'Settings']
];

function saPaintNav(active) {
    const links = SA_NAV.map(([id, label]) =>
        `<button class="sa-nav-btn${id === active ? ' is-on' : ''}" data-sa="${id}" type="button">${label}</button>`
    ).join('');
    document.getElementById('saNav').innerHTML = `
        <div class="sa-brand"><img class="sa-logo" src="/assets/logo.png" alt="MarkiThon"><div><strong>MarkiThon</strong><small>Marketplace Admin Panel</small></div></div>
        ${links}
        <h4>Quick Links</h4>
        <a class="sa-link" href="/">View Marketplace</a>
        <button class="sa-link" type="button" data-sa="reports">System Health</button>
        <div class="sa-foot">
            <strong>MarkiThon</strong>
            <p class="sa-muted">Build a bigger business together.</p>
            <a href="/">Visit Marketplace</a>
        </div>`;
}

let saAdminUser = null;

function saAdminInitial(user) {
    const name = String((user && (user.name || user.email)) || 'Admin').trim();
    return (name[0] || 'A').toUpperCase();
}

function saPaintTop() {
    const user = saAdminUser || {};
    const label = user.name || 'Admin';
    const role = user.role === 'admin' ? 'Super Admin' : (user.role || 'Super Admin');
    const initial = saAdminInitial(user);
    document.getElementById('saTop').innerHTML = `
        <button class="sa-menu" id="saMenu" type="button">Menu</button>
        <input class="sa-search" id="saSearch" type="search" placeholder="Search shops, products, customers, orders..." autocomplete="off">
        <div class="sa-who">
            <div class="sa-avatar" title="${saText(label)}">${saText(initial)}</div>
            <div><strong>${saText(label)}</strong><div class="sa-muted">${saText(role)}</div></div>
            <button class="sa-cms-copy" id="saLogout" type="button">Sign Out</button>
        </div>`;
    const out = document.getElementById('saLogout');
    if (out) out.addEventListener('click', () => typeof saLogoutAdmin === 'function' && saLogoutAdmin());
}

async function saLoadAdminWho() {
    try {
        const response = await fetch('/api/auth/admin/me', { credentials: 'include' });
        if (!response.ok) return;
        const data = await response.json();
        saAdminUser = data.user || null;
        if (typeof saPaintTop === 'function' && document.getElementById('saTop')) saPaintTop();
    } catch (error) {
        /* Keep default admin label until next paint. */
    }
}
