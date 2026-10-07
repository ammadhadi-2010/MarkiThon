let saCatRows = [];
let saCatPage = 1;
let saCatPick = 'All';
let saCatFlash = '';
const SA_CAT_SIZE = 9;

function saCatShown() {
    if (saCatPick === 'All') return saCatRows;
    return saCatRows.filter((row) => row.id === saCatPick);
}

function saCatSide(rows) {
    const items = [['All', 'All Categories', rows.length]].concat(rows.map((row) => [row.id, row.name, row.products]));
    return `<aside class="sa-cat-side">${items.map(([id, label, total]) =>
        `<button class="sa-cat-link${id === saCatPick ? ' is-on' : ''}" type="button" data-cat-pick="${id}"><span>${saText(label)}</span><b>${saCount(total)}</b></button>`
    ).join('')}</aside>`;
}

function saCatRow(row, index) {
    const eye = saSvg('<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>');
    const pen = saSvg('<path d="M4 20h4L18 10l-4-4L4 16v4z"/>');
    const more = saSvg('<circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/>');
    return `<tr>
        <td>${index + 1}</td>
        <td><div class="sa-order-who"><span class="sa-cat-thumb sa-cover-${saText(row.tone)}"></span><strong>${saText(row.name)}</strong></div></td>
        <td>${saText(row.slug)}</td>
        <td>${saCount(row.products)}</td>
        <td>${saStatus(row.status)}</td>
        <td><div class="sa-actions">
            <button type="button" data-cat-edit="${row.id}" title="Edit" aria-label="Edit">${pen}</button>
            <button type="button" data-cat-view="${row.id}" title="View" aria-label="View">${eye}</button>
            <button type="button" data-cat-more="${row.id}" title="More options" aria-label="More options">${more}</button>
        </div></td>
    </tr>`;
}

function saCatPager(total) {
    const pages = Math.max(1, Math.ceil(total / SA_CAT_SIZE));
    if (saCatPage > pages) saCatPage = pages;
    const start = total ? (saCatPage - 1) * SA_CAT_SIZE + 1 : 0;
    const end = Math.min(total, saCatPage * SA_CAT_SIZE);
    const buttons = Array.from({ length: pages }, (_, index) => {
        const page = index + 1;
        return `<button class="sa-page-btn${page === saCatPage ? ' is-on' : ''}" type="button" data-cat-page="${page}">${page}</button>`;
    }).join('');
    return `<div class="sa-pager"><span class="sa-muted">Showing ${start} – ${end} of ${total} categories</span><div>${buttons}</div></div>`;
}

function saPaintCategories() {
    const shown = saCatShown();
    const slice = shown.slice((saCatPage - 1) * SA_CAT_SIZE, saCatPage * SA_CAT_SIZE);
    const mark = saSvg('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/>');
    document.getElementById('saCategories').innerHTML = `
        <div class="sa-shop-head">
            <div class="sa-shop-title"><div class="sa-shop-mark">${mark}</div><div><h1>Categories</h1><p class="sa-muted">Manage product categories and organize your marketplace.</p></div></div>
        </div>
        <div class="sa-cat-layout">
            ${saCatSide(saCatRows)}
            <section class="sa-card sa-shop-board"><div class="sa-scroll"><table class="sa-table sa-shop-table sa-cat-table">
                <thead><tr><th>#</th><th>Category Name</th><th>Slug</th><th>Products</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>${slice.map((row, index) => saCatRow(row, (saCatPage - 1) * SA_CAT_SIZE + index)).join('') || `<tr><td colspan="6">${saCatRows.length ? 'No categories match this list.' : 'No categories yet — add products to create them.'}</td></tr>`}</tbody>
            </table></div>${saCatPager(shown.length)}</section>
        </div>
        <p class="sa-note-line" id="saCatNote">${saText(saCatFlash)}</p>
        <p class="sa-muted">Slug and status stay in this admin list. Product labels are not changed.</p>`;
    saCatFlash = '';
}

async function saMountCategories() {
    const response = await fetch('/api/admin/categories');
    const data = await response.json();
    saCatRows = data.categories || [];
    saPaintCategories();
}

function saCatById(id) {
    return saCatRows.find((row) => row.id === id);
}
