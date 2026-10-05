const STORE_NAV = [
    ['settings', 'Store Settings'],
    ['products', 'Products'],
    ['orders', 'Orders']
];

function storeNavHtml() {
    const subs = STORE_NAV.map(([id, label]) =>
        `<button class="nav-subitem" data-store-sec="${id}" type="button">${label}</button>`
    ).join('');
    return `
        <div class="nav-group" id="storeNavGroup">
            <button class="nav-item nav-parent" data-view="store" type="button" aria-expanded="false">
                <span>Online Store</span>
                <span class="nav-caret" aria-hidden="true">▾</span>
            </button>
            <div class="nav-sub" id="storeNavSub">${subs}</div>
        </div>`;
}

function setStoreNavOpen(open) {
    const group = document.getElementById('storeNavGroup');
    const parent = group && group.querySelector('.nav-parent');
    if (!group || !parent) return;
    group.classList.toggle('open', open);
    parent.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function paintStoreNavSection(section) {
    const name = STORE_NAV.some((row) => row[0] === section) ? section : 'products';
    document.querySelectorAll('[data-store-sec]').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.storeSec === name);
    });
    setStoreNavOpen(true);
}

function bindStoreNav() {
    const nav = document.getElementById('sidebarNav');
    const old = nav && nav.querySelector('[data-view="store"]');
    if (!nav || !old || document.getElementById('storeNavGroup')) return;
    old.insertAdjacentHTML('beforebegin', storeNavHtml());
    old.remove();
    const parent = nav.querySelector('#storeNavGroup .nav-parent');
    parent.addEventListener('click', () => {
        const group = document.getElementById('storeNavGroup');
        const opening = !group.classList.contains('open');
        setStoreNavOpen(opening);
        if (opening) {
            if (typeof osClearEditPath === 'function') osClearEditPath();
            showView('store', { storeSec: 'products' });
        }
    });
    nav.querySelectorAll('[data-store-sec]').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (typeof osClearEditPath === 'function') osClearEditPath();
            if (btn.dataset.storeSec === 'customers') {
                showView('customers');
                return;
            }
            showView('store', { storeSec: btn.dataset.storeSec });
        });
    });
}
