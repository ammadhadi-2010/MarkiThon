function paintNetBadge() {
    const el = document.getElementById('netBadge');
    if (!el) return;
    const online = navigator.onLine;
    el.textContent = online ? 'Online' : 'Offline Mode';
    el.classList.toggle('online', online);
    el.classList.toggle('offline', !online);
}

async function flushOfflineQueue() {
    if (!navigator.onLine) return;
    let synced = 0;
    const products = await idbGetAll('products');
    for (const product of products.filter((p) => p._pending)) {
        const body = { ...product };
        delete body._pending;
        delete body._pendingMethod;
        const method = product._pendingMethod;
        const data = method === 'PUT' && !String(product.id).startsWith('prod-')
            ? await api.put(`/api/products/${product.id}`, body)
            : await api.post('/api/products/add', body);
        await idbDelete('products', product.id);
        if (data.product) await idbPut('products', data.product);
        synced += 1;
    }
    const sales = (await idbGetAll('sales_transactions')).filter((s) => s._pending);
    for (const sale of sales) {
        await api.post('/api/retail/create', sale.payload);
        await idbDelete('sales_transactions', sale.id);
        synced += 1;
    }
    const ledger = (await idbGetAll('ledger_entries')).filter((r) => r._pending);
    for (const row of ledger) {
        await api.post('/api/ledger/add', {
            customerName: row.customerName,
            transactionType: row.transactionType,
            amount: row.amount,
            description: row.description
        });
        await idbDelete('ledger_entries', row.id);
        synced += 1;
    }
    const moves = (await idbGetAll('stock_movements')).filter((r) => r._pending);
    for (const move of moves) {
        await idbDelete('stock_movements', move.id);
        synced += 1;
    }
    if (synced) {
        showToast(`Synced ${synced} offline record(s).`);
        if (typeof loadProducts === 'function') await loadProducts();
        if (typeof loadRtBills === 'function') await loadRtBills();
        if (typeof loadCustomerHub === 'function') await loadCustomerHub();
    }
}

function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
}

document.addEventListener('DOMContentLoaded', () => {
    paintNetBadge();
    registerServiceWorker();
    window.addEventListener('online', () => {
        paintNetBadge();
        flushOfflineQueue().catch((err) => showToast(err.message));
    });
    window.addEventListener('offline', paintNetBadge);
});
