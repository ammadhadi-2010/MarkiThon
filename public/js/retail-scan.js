function parseRtScan(raw) {
    const text = String(raw || '').trim();
    if (!text) return { raw: '', sku: '', color: '' };
    const parts = text.split('|').map((part) => part.trim()).filter(Boolean);
    return { raw: text, sku: parts[0] || text, color: parts[1] || '' };
}

function rtScanCodes(product) {
    return [product.sku, product.barcode, product.id]
        .map((value) => String(value || '').trim().toLowerCase())
        .filter(Boolean);
}

function matchRtScan(query) {
    const parsed = parseRtScan(query);
    const raw = parsed.raw.toLowerCase();
    const sku = parsed.sku.toLowerCase();
    const color = parsed.color.toLowerCase();
    const list = typeof posSellableRows === 'function'
        ? posSellableRows(productsCache)
        : shopInventory(productsCache).filter((p) => Number(p.stockMeters) > 0);
    const exact = list.find((p) => {
        const codes = rtScanCodes(p);
        return codes.includes(raw) || codes.includes(sku);
    });
    if (exact && color) {
        const variant = list.find((p) =>
            String(p.title || '').toLowerCase() === String(exact.title || '').toLowerCase()
            && String(p.color || '').toLowerCase() === color
            && (!exact.brand || String(p.brand || '').toLowerCase() === String(exact.brand || '').toLowerCase())
        );
        if (variant) return variant;
    }
    if (color) {
        const bySkuColor = list.find((p) =>
            rtScanCodes(p).includes(sku) && String(p.color || '').toLowerCase() === color
        );
        if (bySkuColor) return bySkuColor;
    }
    if (exact) return exact;
    return list.find((p) => rtScanCodes(p).some((code) => code && (raw === code || raw.startsWith(`${code}|`))))
        || null;
}

async function handleRtScanEnter(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    event.stopPropagation();
    const input = event.target;
    const query = String(input.value || '').trim();
    if (!query) return;
    if (typeof loadProducts === 'function' && !(productsCache || []).length) {
        try { await loadProducts(); } catch (error) { /* keep scanning */ }
    }
    const hit = matchRtScan(query);
    input.value = '';
    const hits = document.getElementById('rtHits');
    if (hits) hits.hidden = true;
    if (!hit) {
        showToast('No product matched this barcode.');
        input.focus();
        return;
    }
    if (typeof addRtProduct === 'function') addRtProduct(hit, { scanned: true });
    input.focus();
}

function bindRtScanner() {
    const input = document.getElementById('rtSearch');
    if (!input || input.dataset.scanBound) return;
    input.dataset.scanBound = '1';
    input.setAttribute('autocomplete', 'off');
    input.addEventListener('keydown', (event) => {
        handleRtScanEnter(event);
    });
}

document.addEventListener('DOMContentLoaded', bindRtScanner);
