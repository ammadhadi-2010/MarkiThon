function rtNorm(value) {
    return String(value || '').trim().toLowerCase();
}

function rtLineMatchKey(item) {
    const sku = rtNorm(item.sku);
    const color = rtNorm(item.color);
    if (sku && color) return `sku:${sku}|${color}`;
    if (sku) return `sku:${sku}`;
    return `id:${item.id || item.productId || ''}`;
}

function rtColorSiblings(item) {
    const title = rtNorm(item.title);
    const brand = rtNorm(item.brand);
    if (!title) return [];
    return (productsCache || []).filter((p) => {
        if (rtNorm(p.title) !== title) return false;
        if (brand && rtNorm(p.brand) && rtNorm(p.brand) !== brand) return false;
        return Boolean(p.color);
    });
}

function rtColorCellHtml(line, index) {
    const family = rtColorSiblings(line);
    if (family.length > 1) {
        const opts = family.map((p) => {
            const selected = String(p.id) === String(line.productId) ? ' selected' : '';
            return `<option value="${p.id}"${selected}>${escapeHtml(p.color)}</option>`;
        }).join('');
        return `<select class="pos-color-select" data-rtcolor="${index}" autocomplete="off">${opts}</select>`;
    }
    if (line.color) return `<span class="sku-badge color-badge">${escapeHtml(line.color)}</span>`;
    return '<span class="prod-variant">-</span>';
}

function applyRtLineColor(index, productId) {
    const product = (productsCache || []).find((p) => String(p.id) === String(productId));
    const line = rtLines[index];
    if (!product || !line) return;
    const key = rtLineMatchKey(product);
    const other = rtLines.findIndex((row, i) => i !== index && rtLineMatchKey(row) === key);
    if (other >= 0) {
        rtLines[other].qty += Number(line.qty) || 1;
        rtLines.splice(index, 1);
    } else {
        line.productId = product.id;
        line.sku = product.sku;
        line.color = product.color || '';
        line.brand = product.brand || '';
        line.imageUrl = product.imageUrl;
        line.rate = Number(product.retailPrice) || 0;
        line.sellUnit = sellUnitOf(product);
        line.stockMeters = product.stockMeters;
        Object.assign(line, typeof posCopyMinRate === 'function' ? posCopyMinRate(product) : {});
        Object.assign(line, typeof copyBedsheetFields === 'function' ? copyBedsheetFields(product) : {});
        Object.assign(line, typeof copyBlanketFields === 'function' ? copyBlanketFields(product) : {});
    }
    renderRtLines();
}

function searchRtProducts(q) {
    const hits = document.getElementById('rtHits');
    const term = rtNorm(q);
    if (!term) {
        hits.hidden = true;
        return;
    }
    const pool = typeof posSellableRows === 'function'
        ? posSellableRows(productsCache)
        : shopInventory(productsCache).filter((p) => Number(p.stockMeters) > 0);
    const rows = pool.filter((p) =>
        (typeof posSearchBlob === 'function' ? posSearchBlob(p) : [p.title, p.sku, p.barcode, p.brand, p.color])
            .some((v) => rtNorm(v).includes(term))
    ).slice(0, 20);
    hits.innerHTML = rows.map((p) => (
        typeof posHitButtonHtml === 'function'
            ? posHitButtonHtml(p, 'data-rtadd')
            : `<button type="button" data-rtadd="${p.id}">${escapeHtml(p.title)}</button>`
    )).join('') || '<button type="button">No matches</button>';
    hits.hidden = false;
}

function bindRtPosVariants() {
    const lines = document.getElementById('rtLines');
    if (!lines || lines.dataset.colorBound) return;
    lines.dataset.colorBound = '1';
    lines.addEventListener('change', (event) => {
        const sel = event.target.closest('[data-rtcolor]');
        if (!sel) return;
        applyRtLineColor(Number(sel.dataset.rtcolor), sel.value);
    });
}

document.addEventListener('DOMContentLoaded', () => setTimeout(bindRtPosVariants, 0));
