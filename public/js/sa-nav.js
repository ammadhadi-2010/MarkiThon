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
        <div class="sa-brand"><div class="sa-mark">M</div><div><strong>MarkiThon</strong><small>Marketplace Admin Panel</small></div></div>
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

function saPaintTop() {
    document.getElementById('saTop').innerHTML = `
        <button class="sa-menu" id="saMenu" type="button">Menu</button>
        <input class="sa-search" id="saSearch" type="search" placeholder="Search shops, products, customers, orders..." autocomplete="off">
        <div class="sa-who">
            <div class="sa-avatar" title="Admin">A</div>
            <div><strong>Admin</strong><div class="sa-muted">Super Admin</div></div>
            <button class="sa-cms-copy" id="saLogout" type="button">Sign Out</button>
        </div>`;
    const out = document.getElementById('saLogout');
    if (out) out.addEventListener('click', () => typeof saLogoutAdmin === 'function' && saLogoutAdmin());
}
