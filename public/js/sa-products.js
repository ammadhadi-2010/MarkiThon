let saProdRows = [];
let saProdPick = new Set();
let saProdLikes = new Set();
let saProdFocus = false;
let saProdFlash = '';
let saProdQuery = '';
let saProdCategory = 'All';
let saProdShop = 'All';
let saProdSort = 'Newest';
const SA_PROD_CATS = [];

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
    return names.sort((a, b) => a.localeCompare(b));
}

function saProdPills(rows) {
    const items = [['All', rows.length]].concat(saProdCatList().map((name) =>
        [name, rows.filter((row) => row.category === name).length]));
    return `<div class="sa-pills">${items.map(([name, total]) =>
        `<button class="sa-pill-btn${name === saProdCategory ? ' is-on' : ''}" type="button" data-prod-pill="${name}">${name} (${saCount(total)})</button>`
    ).join('')}</div>`;
}

function saProdPhoto(row) {
    const tag = row.tag ? `<span class="sa-tag is-${row.tag.toLowerCase()}">${saText(row.tag)}</span>` : '';
    const liked = saProdLikes.has(row.id) ? ' is-on' : '';
    const heart = saSvg('<path d="M12 19s-7-4.4-7-8.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 14.6 12 19 12 19z"/>');
    const img = row.image
        ? `<img class="sa-prod-img" src="${saText(row.image)}" alt="${saText(row.title)}" loading="lazy">`
        : `<div class="sa-prod-ph">${saText((row.title || '?').slice(0, 1).toUpperCase())}</div>`;
    return `<div class="sa-prod-photo sa-cover-${saText(row.tone || 'sheet')}">${img}${tag}<button class="sa-heart${liked}" type="button" data-prod-like="${row.id}" aria-label="Save">${heart}</button></div>`;
}

function saProdCard(row) {
    const off = row.was > row.price ? Math.round((1 - row.price / row.was) * 100) : 0;
    const checked = saProdPick.has(row.id) ? ' checked' : '';
    const price = off ? `<s>${saMoney(row.was)}</s><em>${off}% OFF</em>` : '';
    const canPublish = row.status !== 'Published';
    const canHide = row.status !== 'Hidden';
    return `<article class="sa-card sa-prod">
        ${saProdPhoto(row)}
        <div class="sa-prod-shop"><span>${saShopInitials(row.shop)}</span><strong>${saText(row.shop)}</strong></div>
        <h3>${saText(row.title)}</h3>
        <p class="sa-muted sa-prod-cat">${saText(row.category || 'Other')}</p>
        <p class="sa-prod-price"><strong>${saMoney(row.price)}</strong><span>/ ${saText(row.unit || 'Pcs')}</span>${price}</p>
        <div class="sa-prod-foot"><span class="sa-muted">Stock: ${saCount(row.stock)}</span>${saStatus(row.status)}
            <label class="sa-tick"><input type="checkbox" data-prod-pick="${row.id}" autocomplete="off"${checked} aria-label="Select product"></label>
        </div>
        <div class="sa-prod-mods">
            <button type="button" class="sa-mod is-pub" data-prod-publish="${row.id}" ${canPublish ? '' : 'disabled'}>Publish</button>
            <button type="button" class="sa-mod is-hide" data-prod-hide="${row.id}" ${canHide ? '' : 'disabled'}>Hide</button>
            <button type="button" class="sa-mod is-del" data-prod-del="${row.id}">Delete</button>
            <button type="button" class="sa-mod is-edit" data-prod-edit="${row.id}">Edit</button>
        </div>
    </article>`;
}

function saMatchedProducts() {
    return saProdRows.filter((row) => {
        const text = (row.title + ' ' + row.id + ' ' + row.shop + ' ' + (row.sku || '') + ' ' + (row.category || '')).toLowerCase();
        if (saProdQuery && !text.includes(saProdQuery.toLowerCase())) return false;
        if (saProdCategory !== 'All' && row.category !== saProdCategory) return false;
        if (saProdShop !== 'All' && row.shop !== saProdShop) return false;
        return true;
    }).sort((a, b) => {
        const left = String(a.added || '');
        const right = String(b.added || '');
        return saProdSort === 'Oldest' ? left.localeCompare(right) : right.localeCompare(left);
    });
}

function saPaintProducts() {
    const matched = saMatchedProducts();
    const shops = [...new Set(saProdRows.map((row) => row.shop).filter(Boolean))].sort();
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
            <button class="sa-bulk-go is-publish" type="button" data-prod-bulk="published">Publish</button>
            <button class="sa-bulk-go is-hide" type="button" data-prod-bulk="hidden">Hide</button>
            <button class="sa-bulk-go is-delete" type="button" data-prod-bulk="delete">Delete</button>
            <button class="sa-bulk-go is-all" id="saProdAll" type="button">View All Products</button>
        </div>
        <p class="sa-note-line" id="saProdNote">${saText(saProdFlash)}</p>
        <p class="sa-muted">Publish shows products on the marketplace. Hide and Pending keep them off the public catalog.</p>`;
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
    const response = await fetch('/api/admin/products');
    const data = await response.json();
    if (!response.ok) {
        saProdRows = [];
        saProdFlash = data.message || 'Could not load products.';
        saPaintProducts();
        return;
    }
    saProdRows = data.products || [];
    saPaintProducts();
}

function saProdById(id) {
    return saProdRows.find((row) => String(row.id) === String(id));
}
