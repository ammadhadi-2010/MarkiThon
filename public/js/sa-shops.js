let saShopRows = [];
let saShopPage = 1;
let saShopFocus = false;
const SA_SHOP_SIZE = 10;
const SA_SHOP_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#db2777', '#ea580c', '#16a34a'];

function saShopInitials(name) {
    return String(name || 'S').split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase();
}

function saShopWa(phone) {
    let digits = String(phone || '').replace(/\D/g, '');
    if (digits.startsWith('0')) digits = '92' + digits.slice(1);
    return digits ? 'https://wa.me/' + digits : '';
}

function saShopOptions(pairs, current) {
    return pairs.map(([value, label]) =>
        `<option value="${value}"${value === current ? ' selected' : ''}>${label}</option>`).join('');
}

function saShopKeep(row, kept) {
    const text = (row.name + ' ' + row.owner + ' ' + row.phone).toLowerCase();
    if (kept.query && !text.includes(kept.query.toLowerCase())) return false;
    if (kept.status !== 'All' && row.status !== kept.status) return false;
    if (kept.pack !== 'All' && row.package !== kept.pack) return false;
    return true;
}

function saSvg(path) {
    return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${path}</svg>`;
}

function saShopCards(rows) {
    const count = (status) => rows.filter((row) => row.status === status).length;
    const shop = saSvg('<path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/>');
    const open = saSvg('<path d="M4 10h16l-1.4 4H5.4L4 10z"/><path d="M6 14v6h12v-6"/>');
    const wait = saSvg('<circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/>');
    const stop = saSvg('<circle cx="12" cy="12" r="8"/><path d="M8 12h8"/>');
    const cards = [
        ['blue', shop, 'Total Shops', rows.length, true],
        ['green', open, 'Active Shops', count('Active'), true],
        ['orange', wait, 'Pending Approval', count('Pending'), false],
        ['pink', stop, 'Suspended', count('Suspended'), false]
    ];
    return `<div class="sa-shop-stats">${cards.map(([tone, icon, label, value, up]) =>
        `<article class="sa-card sa-stat sa-tone-${tone}"><div class="sa-stat-top"><span class="sa-ico">${icon}</span><span>${label}</span></div><strong>${value}</strong><div class="sa-trend">${up ? '<span class="sa-up">↑</span>' : '<span class="sa-shop-dash">—</span>'}</div></article>`
    ).join('')}</div>`;
}

function saShopRow(row, index) {
    const wa = saShopWa(row.phone);
    const link = wa ? `<a class="sa-wa" href="${wa}" target="_blank" rel="noopener" title="WhatsApp" aria-label="WhatsApp">${saSvg('<path d="M8 5h8a2 2 0 0 1 2 2v8l-3-2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>')}</a>` : '';
    const eye = saSvg('<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>');
    const pen = saSvg('<path d="M4 20h4L18 10l-4-4L4 16v4z"/>');
    const more = saSvg('<circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/>');
    return `<tr>
        <td><div class="sa-shop-who"><span class="sa-shop-logo" style="background:${SA_SHOP_COLORS[index % SA_SHOP_COLORS.length]}">${saShopInitials(row.name)}</span><span><strong>${saText(row.name)}</strong><small>${saText(row.owner)}</small></span></div></td>
        <td><span class="sa-contact">${saText(row.phone)} ${link}</span></td>
        <td class="sa-pack"><strong>${saText(row.package)}</strong><small>(${row.months} months)</small></td>
        <td>${saStatus(row.status)}</td>
        <td><div class="sa-actions">
            <button type="button" data-shop-view="${row.id}" title="View" aria-label="View">${eye}</button>
            <button type="button" data-shop-edit="${row.id}" title="Edit" aria-label="Edit">${pen}</button>
            <button type="button" data-shop-more="${row.id}" title="More options" aria-label="More options">${more}</button>
        </div></td>
    </tr>`;
}

function saShopPager(total) {
    const pages = Math.max(1, Math.ceil(total / SA_SHOP_SIZE));
    if (saShopPage > pages) saShopPage = pages;
    const start = total ? (saShopPage - 1) * SA_SHOP_SIZE + 1 : 0;
    const end = Math.min(total, saShopPage * SA_SHOP_SIZE);
    const buttons = Array.from({ length: pages }, (_, index) => {
        const page = index + 1;
        return `<button class="sa-page-btn${page === saShopPage ? ' is-on' : ''}" type="button" data-shop-page="${page}">${page}</button>`;
    }).join('');
    return `<div class="sa-pager"><span class="sa-muted">Showing ${start} – ${end} of ${total} shops</span><div>${buttons}</div></div>`;
}

function saPaintShops() {
    const query = document.getElementById('saShopQuery');
    const status = document.getElementById('saShopStatus');
    const pack = document.getElementById('saShopPack');
    const kept = { query: query ? query.value : '', status: status ? status.value : 'All', pack: pack ? pack.value : 'All' };
    const matched = saShopRows.map((row, index) => ({ row, index })).filter((item) => saShopKeep(item.row, kept));
    const slice = matched.slice((saShopPage - 1) * SA_SHOP_SIZE, saShopPage * SA_SHOP_SIZE);
    document.getElementById('saShops').innerHTML = `
        <div class="sa-shop-head">
            <div class="sa-shop-title"><div class="sa-shop-mark">${saSvg('<path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/>')}</div><div><h1>Shops / Shopkeepers</h1><p class="sa-muted">Manage all shops, shopkeepers and their status.</p></div></div>
            <button class="sa-add" id="saAddShop" type="button">+ Add New Shop</button>
        </div>
        ${saShopCards(saShopRows)}
        <div class="sa-shop-tools">
            <label class="sa-shop-search-wrap">${saSvg('<circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/>')}<input class="sa-shop-search" id="saShopQuery" type="search" placeholder="Search shop name, owner, or email..." autocomplete="off" value="${saText(kept.query)}"></label>
            <select id="saShopStatus">${saShopOptions([['All', 'All Status'], ['Active', 'Active'], ['Pending', 'Pending'], ['Suspended', 'Suspended']], kept.status)}</select>
            <select id="saShopPack">${saShopOptions([['All', 'All Packages'], ['Standard', 'Standard'], ['Premium', 'Premium']], kept.pack)}</select>
        </div>
        <section class="sa-card sa-shop-board"><div class="sa-scroll"><table class="sa-table sa-shop-table">
            <thead><tr><th>Shop / Owner</th><th>Contact</th><th>Package</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>${slice.map((item) => saShopRow(item.row, item.index)).join('') || '<tr><td colspan="5">No shops match these filters.</td></tr>'}</tbody>
        </table></div>${saShopPager(matched.length)}</section>
        <div id="saVendors"></div>
        <p class="sa-note-line" id="saShopNote"></p>`;
    document.getElementById('saShopQuery').addEventListener('input', () => { saShopPage = 1; saShopFocus = true; saPaintShops(); });
    document.getElementById('saShopStatus').addEventListener('change', () => { saShopPage = 1; saPaintShops(); });
    document.getElementById('saShopPack').addEventListener('change', () => { saShopPage = 1; saPaintShops(); });
    if (typeof saMountVendors === 'function') saMountVendors();
    if (saShopFocus) {
        const box = document.getElementById('saShopQuery');
        box.focus();
        box.setSelectionRange(box.value.length, box.value.length);
        saShopFocus = false;
    }
}

async function saMountShops() {
    const response = await fetch('/api/platform/shops');
    const data = await response.json();
    saShopRows = data.shops || [];
    saPaintShops();
}

function saShopById(id) {
    return saShopRows.find((row) => row.id === id);
}
