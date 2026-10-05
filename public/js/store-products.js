let osProducts = [];
let osPage = 1;
const OS_PAGE_SIZE = 8;

function osMoney(value) {
    return Number(value || 0).toLocaleString();
}

function osStockBadge(row) {
    if (row.stockStatus === 'low') return '<span class="os-stock os-stock-low">Low Stock</span>';
    return '<span class="os-stock os-stock-in">In Stock</span>';
}

function osStatusBtn(row) {
    const on = row.storePublished;
    return `<button type="button" class="${on ? 'os-pill-on' : 'os-pill-off'}" data-ospub="${row.id}">${on ? 'Published' : 'Hidden'}</button>`;
}

function osFeaturedSwitch(row) {
    const on = row.storeFeatured ? ' checked' : '';
    return `<label class="os-feat">
        <input data-osfeat="${row.id}" name="osFeat${row.id}" type="checkbox" role="switch"${on} autocomplete="off">
        <span></span>
    </label>`;
}

function osProductCell(row) {
    const cat = row.category ? `<span class="os-cat">${escapeHtml(row.category)}</span>` : '';
    return `<div class="os-prod">
        <img src="${escapeHtml(row.imageUrl || '')}" alt="" onerror="this.style.opacity=0.2">
        <div>
            <strong>${escapeHtml(row.title)}</strong>
            ${cat}
        </div>
    </div>`;
}

function osDiscountCell(row) {
    if (!(Number(row.discountPrice) > Number(row.onlinePrice))) {
        return '<span class="os-muted">—</span>';
    }
    const pct = row.discountPct ? ` <span class="os-pct">(${row.discountPct}%)</span>` : '';
    return `<span class="os-was">${osMoney(row.discountPrice)}</span>${pct}`;
}

function osPriceHtml(row) {
    return `<span class="os-price-now"><span class="os-rs">Rs. </span>${osMoney(row.onlinePrice)}</span>`;
}

function osIconBtn(act, id, title, path) {
    return `<button type="button" class="os-icon-btn" data-act="${act}" data-id="${id}" title="${title}" aria-label="${title}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${path}</svg>
    </button>`;
}

function osActionsHtml(id) {
    return `<div class="os-acts">
        ${osIconBtn('edit', id, 'Edit', '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>')}
        ${osIconBtn('preview', id, 'Preview', '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>')}
        <div class="os-more">
            ${osIconBtn('more', id, 'More options', '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>')}
            <div class="os-more-drop">
                <button type="button" data-act="delete" data-id="${id}">Delete product</button>
            </div>
        </div>
    </div>`;
}

function osRowHtml(row, index) {
    return `<tr class="os-row" data-osid="${row.id}">
        <td class="os-check"><input type="checkbox" name="osSel${row.id}" autocomplete="off"></td>
        <td class="os-td-prod">${osProductCell(row)}</td>
        <td class="os-td-status"><span class="os-spec-label">Website Status</span>${osStatusBtn(row)}</td>
        <td class="os-td-price"><span class="os-spec-label">Online / Discount</span>${osPriceHtml(row)}<span class="os-m-disc">${osDiscountCell(row)}</span></td>
        <td class="os-td-disc">${osDiscountCell(row)}</td>
        <td class="os-td-feat"><span class="os-spec-label">Featured</span>${osFeaturedSwitch(row)}</td>
        <td class="os-td-stock"><span class="os-spec-label">Stock Status</span>${osStockBadge(row)}</td>
        <td class="os-td-order">
            <div class="os-order">
                <span class="os-ord-n">${index + 1}</span>
                <span class="os-ord-arrows">
                    <button type="button" class="os-move" data-osmove="up" data-osidx="${index}" title="Move up">▴</button>
                    <button type="button" class="os-move" data-osmove="down" data-osidx="${index}" title="Move down">▾</button>
                </span>
            </div>
        </td>
        <td class="os-td-acts">${osActionsHtml(row.id)}</td>
        <td class="os-td-break"></td>
        <td class="os-td-foot"></td>
    </tr>`;
}

function osFilterRows() {
    const q = String(document.getElementById('osSearch')?.value || '').toLowerCase().trim();
    const cat = String(document.getElementById('osCatFilter')?.value || '');
    const status = String(document.getElementById('osStatusFilter')?.value || '');
    return osProducts.filter((p) => {
        if (q && ![p.title, p.sku, p.category].some((v) => String(v || '').toLowerCase().includes(q))) return false;
        if (cat && p.category !== cat) return false;
        if (status === 'published' && !p.storePublished) return false;
        if (status === 'hidden' && p.storePublished) return false;
        return true;
    });
}
