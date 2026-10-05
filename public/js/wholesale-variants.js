function wsColorCellHtml(line, index) {
    const family = typeof rtColorSiblings === 'function' ? rtColorSiblings(line) : [];
    if (family.length > 1) {
        const opts = family.map((p) => {
            const selected = String(p.id) === String(line.productId) ? ' selected' : '';
            return `<option value="${p.id}"${selected}>${escapeHtml(p.color)}</option>`;
        }).join('');
        return `<select class="pos-color-select" data-wscolor="${index}" autocomplete="off">${opts}</select>`;
    }
    if (line.color) return `<span class="sku-badge color-badge">${escapeHtml(line.color)}</span>`;
    return '<span class="prod-variant">-</span>';
}

function applyWsLineColor(index, productId) {
    const product = (productsCache || []).find((p) => String(p.id) === String(productId));
    const line = wsLines[index];
    if (!product || !line) return;
    const key = rtLineMatchKey(product);
    const other = wsLines.findIndex((row, i) => i !== index && rtLineMatchKey(row) === key);
    if (other >= 0) {
        wsLines[other].qty += Number(line.qty) || 1;
        wsLines.splice(index, 1);
    } else {
        line.productId = product.id;
        line.sku = product.sku;
        line.color = product.color || '';
        line.brand = product.brand || '';
        line.imageUrl = product.imageUrl;
        line.rate = Number(product.wholesalePrice) || 0;
        line.sellUnit = sellUnitOf(product);
        line.stockMeters = product.stockMeters;
        Object.assign(line, typeof copyBedsheetFields === 'function' ? copyBedsheetFields(product) : {});
        Object.assign(line, typeof copyBlanketFields === 'function' ? copyBlanketFields(product) : {});
    }
    renderWsLines();
}

function searchWsProducts(q) {
    const hits = document.getElementById('wsHits');
    const term = typeof rtNorm === 'function' ? rtNorm(q) : String(q || '').trim().toLowerCase();
    if (!term) {
        hits.hidden = true;
        return;
    }
    const rows = shopInventory(productsCache).filter((p) =>
        (typeof posSearchBlob === 'function' ? posSearchBlob(p) : [p.title, p.sku, p.barcode, p.brand, p.color])
            .some((v) => String(v || '').toLowerCase().includes(term))
    ).slice(0, 20);
    hits.innerHTML = rows.map((p) => (
        typeof posHitButtonHtml === 'function'
            ? posHitButtonHtml(p, 'data-wsadd')
            : `<button type="button" data-wsadd="${p.id}">${escapeHtml(p.title)}</button>`
    )).join('') || '<button type="button">No matches</button>';
    hits.hidden = false;
}

function bindWsPosVariants() {
    const lines = document.getElementById('wsLines');
    if (!lines || lines.dataset.colorBound) return;
    lines.dataset.colorBound = '1';
    lines.addEventListener('change', (event) => {
        const sel = event.target.closest('[data-wscolor]');
        if (!sel) return;
        applyWsLineColor(Number(sel.dataset.wscolor), sel.value);
    });
}

document.addEventListener('DOMContentLoaded', () => setTimeout(bindWsPosVariants, 0));
