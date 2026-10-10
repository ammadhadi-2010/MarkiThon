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
    ['settings', 'Profile Settings']
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

function saTopAvatarHtml(user) {
    const url = user && user.avatarUrl;
    if (url) return `<img class="sa-avatar-img" src="${saText(url)}" alt="">`;
    return saText(saAdminInitial(user));
}

function saPaintTop() {
    const user = saAdminUser || {};
    const label = user.name || 'Admin';
    const role = user.role === 'admin' ? 'Super Admin' : (user.role || 'Super Admin');
    document.getElementById('saTop').innerHTML = `
        <button class="sa-menu" id="saMenu" type="button">Menu</button>
        <input class="sa-search" id="saSearch" type="search" placeholder="Search shops, products, customers, orders..." autocomplete="off">
        <div class="sa-user-menu">
            <button class="sa-user-trigger" id="saUserTrigger" type="button" aria-expanded="false" aria-haspopup="true">
                <span class="sa-avatar" title="${saText(label)}">${saTopAvatarHtml(user)}</span>
                <span class="sa-user-label">
                    <strong>${saText(label)}</strong>
                    <span class="sa-muted">${saText(role)}</span>
                </span>
                <span class="sa-user-caret" aria-hidden="true"></span>
            </button>
            <div class="sa-user-drop" id="saUserMenu" hidden role="menu">
                <button type="button" id="saMenuProfile" role="menuitem">Profile Settings</button>
                <button type="button" id="saMenuLogout" role="menuitem">Sign Out</button>
            </div>
        </div>`;
    if (typeof saBindTopMenu === 'function') saBindTopMenu();
}

async function saLoadAdminWho() {
    try {
        const response = await fetch('/api/auth/admin/me', { credentials: 'include' });
        if (!response.ok) return;
        const data = await response.json();
        saAdminUser = data.user || null;
        if (typeof saAdminSyncFormFields === 'function' && document.getElementById('saAdminProfileForm')) {
            saAdminSyncFormFields(saAdminUser);
        }
        if (typeof saPaintTop === 'function' && document.getElementById('saTop')) saPaintTop();
    } catch (error) {
        /* Keep default admin label until next paint. */
    }
}
