function formatStockDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function qtyLabel(change) {
    const n = Number(change) || 0;
    const sign = n > 0 ? '+' : '';
    return `${sign}${n} m`;
}

function isIncoming(type, change) {
    return type === 'Purchase' || type === 'Opening Stock' || Number(change) > 0;
}

function renderStockRows(logs) {
    const tbody = document.getElementById('stTable');
    if (!logs.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No stock history for this product.</td></tr>';
        return;
    }
    tbody.innerHTML = logs.map((row) => {
        const incoming = isIncoming(row.type, row.quantityChange);
        return `<tr>
            <td>${formatStockDate(row.date)}</td>
            <td class="${incoming ? 'type-in' : 'type-out'}">${escapeHtml(row.type)}</td>
            <td class="${incoming ? 'qty-in' : 'qty-out'}">${qtyLabel(row.quantityChange)}</td>
            <td>${row.balance} m</td>
            <td>${escapeHtml(row.referenceNumber || '-')}</td>
        </tr>`;
    }).join('');
}

function paintHero(product) {
    document.getElementById('stImage').src = product.imageUrl || '';
    document.getElementById('stTitle').textContent = `${product.title}${product.sku ? ` (${product.sku})` : ''}`;
    document.getElementById('stSub').textContent = `${product.category || 'Fabric'} | ${product.brand || '-'}`;
    document.getElementById('stCurrent').textContent = `Current Stock: ${product.stockMeters} ${product.stockUnit || 'm'}`;
    const badge = document.getElementById('stBadge');
    const inStock = Number(product.stockMeters) > 0;
    badge.textContent = inStock ? 'In Stock' : 'Out of Stock';
    badge.classList.toggle('out', !inStock);
}

async function loadProductHistory(productId) {
    const data = await offlineLoadStock(productId);
    paintHero(data.product || {});
    renderStockRows(data.logs || []);
}

async function loadFullMovement() {
    let logs;
    try {
        logs = await api.get('/api/products/stock-movement');
    } catch (error) {
        if (!isNetworkError(error)) throw error;
        logs = await idbGetAll('stock_movements');
        showToast('Offline Mode: showing cached stock movement.');
    }
    renderStockRows(Array.isArray(logs) ? logs : []);
    setStockTab('movement');
}

function fillStockProducts() {
    const select = document.getElementById('stProduct');
    if (!select) return [];
    const list = shopInventory(productsCache);
    select.innerHTML = list.map((p) =>
        `<option value="${p.id}">${escapeHtml(p.title)} (${escapeHtml(p.sku || 'No SKU')})</option>`
    ).join('');
    return list;
}

function setStockTab(name) {
    const root = document.getElementById('view-stock');
    if (!root) return;
    const tab = name === 'in' || name === 'movement' ? name : 'history';
    root.querySelectorAll('[data-sttab]').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.sttab === tab);
    });
    const inPanel = document.getElementById('stInPanel');
    const hist = document.getElementById('stHistBlock');
    if (inPanel) inPanel.hidden = tab !== 'in';
    if (hist) hist.hidden = tab === 'in';
    if (tab === 'in' && typeof fillInvSupplierOptions === 'function') fillInvSupplierOptions();
    if (tab === 'in' && typeof refreshRecvVouchers === 'function') refreshRecvVouchers();
}

async function refreshStockView() {
    if (typeof loadProducts === 'function') await loadProducts();
    const list = fillStockProducts();
    const current = document.getElementById('stProduct')?.value;
    const id = current || (list[0] && list[0].id);
    if (id) await loadProductHistory(id);
}

document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('view-stock');
    root.innerHTML = stockMarkup();
    disableAutofill(root);
    if (typeof bindInventoryReceive === 'function') bindInventoryReceive();
    setStockTab('history');

    if (!Array.isArray(productsCache) || !productsCache.length) {
        productsCache = await offlineLoadProducts();
    }
    const list = fillStockProducts();
    if (list[0]) {
        try { await loadProductHistory(list[0].id); } catch (error) { showToast(error.message); }
    }

    document.getElementById('stProduct').addEventListener('change', async (e) => {
        try { await loadProductHistory(e.target.value); } catch (error) { showToast(error.message); }
    });
    root.querySelectorAll('[data-sttab]').forEach((tab) => tab.addEventListener('click', async () => {
        root.querySelectorAll('[data-sttab]').forEach((t) => t.classList.toggle('active', t === tab));
        try {
            if (tab.dataset.sttab === 'in') setStockTab('in');
            else if (tab.dataset.sttab === 'movement') {
                setStockTab('movement');
                await loadFullMovement();
            } else {
                setStockTab('history');
                await loadProductHistory(document.getElementById('stProduct').value);
            }
        } catch (error) { showToast(error.message); }
    }));
    document.getElementById('stFull').addEventListener('click', () => loadFullMovement().catch((e) => showToast(e.message)));
});
