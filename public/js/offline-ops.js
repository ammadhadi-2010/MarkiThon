function inventoryShopId() {
    if (typeof catalogScope !== 'undefined' && Number(catalogScope.shopId) > 0) {
        return Number(catalogScope.shopId);
    }
    return 1;
}

function shopInventory(rows) {
    const shopId = inventoryShopId();
    return (rows || []).filter((row) => Number(row && (row.ShopId || shopId)) === shopId);
}

async function offlineLoadProducts() {
    try {
        const rows = await api.get('/api/products/list');
        const list = Array.isArray(rows) ? rows : [];
        const pending = (await idbGetAll('products')).filter((p) => p._pending);
        const pendingIds = new Set(pending.map((p) => String(p.id)));
        const merged = shopInventory(pending.concat(list.filter((p) => !pendingIds.has(String(p.id)))));
        await idbReplaceAll('products', merged);
        return merged;
    } catch (error) {
        const cached = await idbGetAll('products');
        if (cached.length) {
            showToast('Offline Mode: showing cached products.');
            return shopInventory(cached);
        }
        throw error;
    }
}

async function offlineSaveProduct(id, payload) {
    try {
        const data = id
            ? await api.put(`/api/products/${id}`, payload)
            : await api.post('/api/products/add', payload);
        return data;
    } catch (error) {
        if (!isNetworkError(error)) throw error;
        const record = {
            ...payload,
            id: id || offlineId('prod'),
            stockMeters: id ? (Number(payload.stockMeters) || 0) : (Number(payload.openingStock) || 0),
            _pending: true,
            _pendingMethod: id ? 'PUT' : 'POST'
        };
        await idbPut('products', record);
        showToast('Saved locally. Will sync when online.');
        return { message: 'Saved in Offline Mode.', product: record };
    }
}

async function offlineSaveSale(payload) {
    try {
        return await api.post('/api/retail/create', payload);
    } catch (error) {
        if (!isNetworkError(error)) throw error;
        const bill = {
            id: offlineId('sale'),
            billNumber: 'OFF-' + Date.now().toString().slice(-6),
            customerName: payload.customerName,
            paymentMethod: payload.paymentMethod,
            grandTotal: 0,
            _pending: true,
            payload
        };
        const items = payload.items || [];
        bill.grandTotal = items.reduce((s, i) => {
            const sold = i.quantitySold != null ? i.quantitySold : i.quantityMeters;
            return s + Number(sold) * Number(i.rate);
        }, 0);
        await idbPut('sales_transactions', bill);
        const products = await idbGetAll('products');
        for (const item of items) {
            const product = products.find((p) => String(p.id) === String(item.productId));
            if (!product) continue;
            const meters = item.quantitySold != null
                ? sellQtyToMeters(item.quantitySold, product)
                : Number(item.quantityMeters);
            const next = Number(product.stockMeters) - meters;
            product.stockMeters = Math.max(next, 0);
            await idbPut('products', product);
            await idbPut('stock_movements', {
                id: offlineId('stk'),
                date: new Date().toISOString(),
                type: 'Sale',
                quantityChange: -meters,
                balance: product.stockMeters,
                referenceNumber: bill.billNumber,
                productId: product.id,
                _pending: true
            });
        }
        showToast('Bill saved in Offline Mode. Will sync when online.');
        return { message: 'Saved in Offline Mode.', bill };
    }
}

async function offlineLoadBills() {
    let server = [];
    try {
        const rows = await api.get('/api/retail/list');
        server = Array.isArray(rows) ? rows : [];
    } catch (error) {
        if (!isNetworkError(error)) throw error;
    }
    const queued = (await idbGetAll('sales_transactions')).filter((r) => r._pending);
    return queued.concat(server);
}

async function offlineLoadStock(productId) {
    try {
        const data = await api.get(`/api/products/${productId}/stock-history`);
        const logs = (data.logs || []).map((row, i) => ({
            ...row,
            id: row.id || `${productId}-${i}`,
            productId
        }));
        const existing = (await idbGetAll('stock_movements')).filter((r) => r._pending);
        await idbReplaceAll('stock_movements', existing.concat(logs));
        return data;
    } catch (error) {
        if (!isNetworkError(error)) throw error;
        const products = await idbGetAll('products');
        const product = products.find((p) => String(p.id) === String(productId)) || {};
        const logs = (await idbGetAll('stock_movements'))
            .filter((r) => String(r.productId) === String(productId));
        showToast('Offline Mode: showing cached stock history.');
        return { product, logs };
    }
}

async function offlineSaveLedger(payload) {
    try {
        return await api.post('/api/ledger/add', payload);
    } catch (error) {
        if (!isNetworkError(error)) throw error;
        const row = {
            id: offlineId('led'),
            ...payload,
            amount: Number(payload.amount) || 0,
            _pending: true
        };
        await idbPut('ledger_entries', row);
        showToast('Ledger saved in Offline Mode. Will sync when online.');
        return { message: 'Saved in Offline Mode.', entry: row };
    }
}

async function offlineLoadLedger(name) {
    try {
        if (name) return await api.get(`/api/ledger/${encodeURIComponent(name)}`);
        const rows = await api.get('/api/ledger/list');
        if (Array.isArray(rows)) {
            const pending = (await idbGetAll('ledger_entries')).filter((r) => r._pending);
            await idbReplaceAll('ledger_entries', pending.concat(rows.map((r) => ({
                ...r,
                id: r.id || offlineId('led')
            }))));
        }
        return rows;
    } catch (error) {
        if (!isNetworkError(error)) throw error;
        let rows = await idbGetAll('ledger_entries');
        if (name) {
            rows = rows.filter((r) => String(r.customerName || '').toLowerCase()
                .includes(name.toLowerCase()));
        }
        return rows;
    }
}
