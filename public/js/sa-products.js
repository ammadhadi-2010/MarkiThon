let saProdRows = [];
let saProdPick = new Set();
let saProdLikes = new Set();
let saProdFocus = false;
let saProdFlash = '';
let saProdQuery = '';
let saProdCategory = 'All';
let saProdShop = 'All';
let saProdSort = 'Newest';
const SA_PROD_CATS = ['Fabrics', 'Lawn', 'Cotton', 'Silk'];

function saProdCards(rows) {
    const count = (status) => rows.filter((row) => row.status === status).length;
    const box = saSvg('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>');
    const check = saSvg('<circle cx="12" cy="12" r="8"/><path d="M8 12l2.5 2.5L16 9"/>');
    const eye = saSvg('<path d="M3 3l18 18"/><path d="M10 6.2A10 10 0 0 1 21 12s-1.5 2.2-4 3.8"/><path d="M6 7.5C3.8 9.2 3 12 3 12s4 6 9 6c1.1 0 2.1-.2 3-.6"/>');
    const clock = saSvg('<circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/>');
    const cards = [
        ['blue', box, 'Total Products', rows.length, 'up'],
        ['green', check, 'Published', count('Published'), 'up'],
        ['purple', eye, 'Hidden', count('Hidden'), 'down'],
        ['orange', clock, 'Pending Review', count('Pending'), 'dash']
    ];
    return `<div class="sa-shop-stats sa-prod-stats">${cards.map(([tone, icon, label, value, trend]) =>
        `<article class="sa-card sa-stat sa-tone-${tone}"><div class="sa-stat-top"><span class="sa-ico">${icon}</span><span>${label}</span></div><strong>${saCount(value)}</strong><div class="sa-trend">${trend === 'up' ? '<span class="sa-up">↑</span>' : trend === 'down' ? '<span class="sa-down">↓</span>' : '<span class="sa-shop-dash">—</span>'}</div></article>`
    ).join('')}</div>`;
}

function saProdCatList() {
    const names = SA_PROD_CATS.slice();
    saProdRows.forEach((row) => {
        if (row.category && names.indexOf(row.category) < 0) names.push(row.category);
    });
    return names;
}

function saProdPills(rows) {
    const items = [['All', rows.length]].concat(saProdCatList().map((name) => [name, rows.filter((row) => row.category === name).length]));
    return `<div class="sa-pills">${items.map(([name, total]) =>
        `<button class="sa-pill-btn${name === saProdCategory ? ' is-on' : ''}" type="button" data-prod-pill="${name}">${name} (${saCount(total)})</button>`
    ).join('')}</div>`;
}

function saProdCard(row) {
    const off = row.was > row.price ? Math.round((1 - row.price / row.was) * 100) : 0;
    const tag = row.tag ? `<span class="sa-tag is-${row.tag.toLowerCase()}">${saText(row.tag)}</span>` : '';
    const liked = saProdLikes.has(row.id) ? ' is-on' : '';
    const checked = saProdPick.has(row.id) ? ' checked' : '';
    const eye = saSvg('<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>');
    const pen = saSvg('<path d="M4 20h4L18 10l-4-4L4 16v4z"/>');
    const hide = saSvg('<path d="M3 3l18 18"/><path d="M10.6 6.2A11 11 0 0 1 12 6c6 0 10 6 10 6a18 18 0 0 1-3.2 3.6"/>');
    const more = saSvg('<circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/>');
    const heart = saSvg('<path d="M12 19s-7-4.4-7-8.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 14.6 12 19 12 19z"/>');
    const price = off ? `<s>${saMoney(row.was)}</s><em>${off}% OFF</em>` : '';
    return `<article class="sa-card sa-prod">
        <div class="sa-prod-photo sa-cover-${saText(row.tone)}">${tag}<button class="sa-heart${liked}" type="button" data-prod-like="${row.id}" aria-label="Save">${heart}</button></div>
        <div class="sa-prod-shop"><span>${saShopInitials(row.shop)}</span><strong>${saText(row.shop)}</strong></div>
        <h3>${saText(row.title)}</h3>
        <p class="sa-prod-price"><strong>${saMoney(row.price)}</strong><span>/ ${saText(row.unit)}</span>${price}</p>
        <div class="sa-prod-foot"><span class="sa-muted">Stock: ${saCount(row.stock)}</span>${saStatus(row.status)}
            <label class="sa-tick"><input type="checkbox" data-prod-pick="${row.id}" autocomplete="off"${checked} aria-label="Select product"></label>
            <div class="sa-actions">
                <button type="button" data-prod-view="${row.id}" title="View" aria-label="View">${eye}</button>
                <button type="button" data-prod-edit="${row.id}" title="Edit" aria-label="Edit">${pen}</button>
                <button type="button" data-prod-hide="${row.id}" title="Visibility" aria-label="Visibility">${hide}</button>
                <button type="button" data-prod-more="${row.id}" title="More options" aria-label="More options">${more}</button>
            </div>
        </div>
    </article>`;
}

function saPaintProducts() {
    const matched = saProdRows.filter((row) => {
        const text = (row.title + ' ' + row.id + ' ' + row.shop).toLowerCase();
        if (saProdQuery && !text.includes(saProdQuery.toLowerCase())) return false;
        if (saProdCategory !== 'All' && row.category !== saProdCategory) return false;
        if (saProdShop !== 'All' && row.shop !== saProdShop) return false;
        return true;
    }).sort((a, b) => (saProdSort === 'Oldest' ? a.added.localeCompare(b.added) : b.added.localeCompare(a.added)));
    const shops = [...new Set(saProdRows.map((row) => row.shop))].sort();
    const mark = saSvg('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>');
    const search = saSvg('<circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/>');
    document.getElementById('saProducts').innerHTML = `
        <div class="sa-shop-head">
            <div class="sa-shop-title"><div class="sa-shop-mark">${mark}</div><div><h1>Products</h1><p class="sa-muted">Manage all products across marketplace.</p></div></div>
            <button class="sa-add" id="saAddProduct" type="button">+ Add Product</button>
        </div>
        ${saProdCards(saProdRows)}
        <div class="sa-shop-tools">
            <label class="sa-shop-search-wrap">${search}<input class="sa-shop-search" id="saProdQuery" type="search" placeholder="Search product name, ID, or shop..." autocomplete="off" value="${saText(saProdQuery)}"></label>
            <select id="saProdCategory">${saShopOptions([['All', 'All Categories']].concat(saProdCatList().map((name) => [name, name])), saProdCategory)}</select>
            <select id="saProdShop">${saShopOptions([['All', 'All Shops']].concat(shops.map((name) => [name, name])), saProdShop)}</select>
            <select id="saProdSort">${saShopOptions([['Newest', 'Added Date (Newest)'], ['Oldest', 'Added Date (Oldest)']], saProdSort)}</select>
        </div>
        ${saProdPills(saProdRows)}
        <div class="sa-prod-grid">${matched.map(saProdCard).join('') || `<p class="sa-muted">${saProdRows.length ? 'No products match these filters.' : 'No products available.'}</p>`}</div>
        <div class="sa-bulk">
            <div><strong>Bulk Actions</strong><span class="sa-muted" id="saProdCount">${saProdPick.size} Products selected</span></div>
            <button class="sa-bulk-go is-publish" type="button" data-prod-bulk="Published">Publish</button>
            <button class="sa-bulk-go is-hide" type="button" data-prod-bulk="Hidden">Hide</button>
            <button class="sa-bulk-go is-delete" type="button" data-prod-bulk="delete">Delete</button>
            <button class="sa-bulk-go is-all" id="saProdAll" type="button">View All Products</button>
        </div>
        <p class="sa-note-line" id="saProdNote">${saText(saProdFlash)}</p>
        <p class="sa-muted">Catalog actions do not change shop stock.</p>`;
    saProdFlash = '';
    document.getElementById('saProdQuery').addEventListener('input', (event) => {
        saProdQuery = event.target.value;
        saProdFocus = true;
        saPaintProducts();
    });
    document.getElementById('saProdCategory').addEventListener('change', (event) => {
        saProdCategory = event.target.value;
        saPaintProducts();
    });
    document.getElementById('saProdShop').addEventListener('change', (event) => {
        saProdShop = event.target.value;
        saPaintProducts();
    });
    document.getElementById('saProdSort').addEventListener('change', (event) => {
        saProdSort = event.target.value;
        saPaintProducts();
    });
    if (saProdFocus) {
        const box = document.getElementById('saProdQuery');
        box.focus();
        box.setSelectionRange(box.value.length, box.value.length);
        saProdFocus = false;
    }
}

async function saMountProducts() {
    const response = await fetch('/api/platform/products');
    const data = await response.json();
    saProdRows = data.products || [];
    saPaintProducts();
}

function saProdById(id) {
    return saProdRows.find((row) => row.id === id);
}
