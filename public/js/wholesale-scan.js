async function handleWsScanEnter(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    event.stopPropagation();
    const input = event.target;
    const query = String(input.value || '').trim();
    if (!query) return;
    if (typeof loadProducts === 'function' && !(productsCache || []).length) {
        try { await loadProducts(); } catch (error) { /* keep scanning */ }
    }
    const hit = typeof matchRtScan === 'function' ? matchRtScan(query) : null;
    input.value = '';
    const hits = document.getElementById('wsHits');
    if (hits) hits.hidden = true;
    if (!hit) {
        showToast('No product matched this barcode.');
        input.focus();
        return;
    }
    if (typeof addWsProduct === 'function') addWsProduct(hit, { scanned: true });
    input.focus();
}

function bindWsScanner() {
    const input = document.getElementById('wsSearch');
    if (!input || input.dataset.scanBound) return;
    input.dataset.scanBound = '1';
    input.setAttribute('autocomplete', 'off');
    input.addEventListener('keydown', (event) => {
        handleWsScanEnter(event);
    });
}

document.addEventListener('DOMContentLoaded', bindWsScanner);
