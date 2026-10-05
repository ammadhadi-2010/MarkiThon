let wsLines = [];
let wsPay = 'Cash';
let wsOrdersCache = [];
let wsEditId = null;

function wsTotals() {
    const sub = wsLines.reduce((sum, line) => sum + line.qty * line.rate, 0);
    const raw = Number(document.getElementById('wsDiscount').value) || 0;
    const type = document.getElementById('wsDiscountType').value;
    const disc = type === 'percent' ? sub * (raw / 100) : raw;
    const grand = Math.max(sub - disc, 0);
    document.getElementById('wsSub').textContent = sub.toLocaleString();
    document.getElementById('wsDiscVal').textContent = disc.toLocaleString();
    document.getElementById('wsGrand').textContent = grand.toLocaleString();
    return { sub, disc, grand };
}

function renderWsLines() {
    const tbody = document.getElementById('wsLines');
    tbody.innerHTML = wsLines.map((line, i) => `
        <tr>
            <td class="pos-idx">${i + 1}</td>
            <td class="prod-cell">
                <div class="prod-row">
                    <img class="thumb" src="${escapeHtml(line.imageUrl || '')}" alt="" onerror="this.style.opacity=0.2">
                    <div class="prod-meta">
                        <span class="prod-title">${escapeHtml(line.title)}</span>
                        ${typeof posSpecBadgeHtml === 'function' ? posSpecBadgeHtml(line) : ''}
                        ${line.sku ? `<span class="sku-badge">${escapeHtml(line.sku)}</span>` : ''}
                    </div>
                </div>
            </td>
            <td class="pos-rate" data-label="Rate">${Number(line.rate).toLocaleString()}</td>
            <td class="pos-qty" data-label="Qty">
                <input class="qty-input" data-wsqty="${i}" type="number" min="0.01" step="0.01"
                    value="${line.qty}" autocomplete="off" name="wsQty${i}">
                <span class="qty-unit">${escapeHtml(line.sellUnit || 'Gaz')}</span>
            </td>
            <td class="pos-line-total" data-label="Total">${(line.qty * line.rate).toLocaleString()}</td>
            <td class="pos-act"><button type="button" class="trash" data-remove="${i}">🗑</button></td>
        </tr>`).join('');
    wsTotals();
}

function addWsProduct(product, opts) {
    const keyOf = typeof rtLineMatchKey === 'function' ? rtLineMatchKey : (p) => String(p.id || p.productId);
    const existing = wsLines.find((line) => keyOf(line) === keyOf(product));
    const minQty = Number(product.minWholesaleQty) || 1;
    if (existing) existing.qty += minQty;
    else wsLines.push({
        productId: product.id, title: product.title, sku: product.sku, brand: product.brand || '',
        imageUrl: product.imageUrl, color: product.color || '',
        rate: Number(product.wholesalePrice) || 0,
        sellUnit: typeof sellUnitOf === 'function' ? sellUnitOf(product) : (product.sellUnit || 'Gaz'),
        stockMeters: product.stockMeters, qty: minQty,
        ...(typeof copyBedsheetFields === 'function' ? copyBedsheetFields(product) : {}),
        ...(typeof copyBlanketFields === 'function' ? copyBlanketFields(product) : {})
    });
    document.getElementById('wsHits').hidden = true;
    const search = document.getElementById('wsSearch');
    if (search) { search.value = ''; search.focus(); }
    renderWsLines();
    if (opts && opts.scanned) {
        showToast(`${product.title}${product.color ? ` · ${product.color}` : ''} added to the order.`);
    }
}

async function loadWsCustomers() {
    const select = document.getElementById('wsCustomer');
    if (!select) return;
    if (typeof loadWholesalers === 'function') await loadWholesalers();
    const list = Array.isArray(wholesalersCache) ? wholesalersCache : [];
    select.innerHTML = '<option value="">Select wholesaler</option>' +
        list.map((w) => `<option value="${w.id}" data-phone="${escapeHtml(w.phone || '')}">${escapeHtml(w.name)}</option>`).join('');
}

async function refreshWholesaleView() {
    await loadWsCustomers();
    wsOrdersCache = await api.get('/api/wholesale/list');
    renderWsOrders();
}

function renderWsOrders() {
    document.getElementById('wsOrders').innerHTML = wsOrdersCache.map((o) => `
        <tr>
            <td>${escapeHtml(o.orderNumber)}</td>
            <td>${escapeHtml(o.customerName)}</td>
            <td>${Number(o.grandTotal).toLocaleString()}</td>
            <td>${escapeHtml(o.paymentMethod)}</td>
            <td class="col-actions">${billMenuHtml(o.id, 'wholesale')}</td>
        </tr>`).join('') || '<tr><td colspan="5" class="empty">No wholesale orders yet.</td></tr>';
}

async function loadWholesaleBillForEdit(bill) {
    if (typeof loadProducts === 'function') await loadProducts();
    await loadWsCustomers();
    wsEditId = bill.id;
    wsLines = (bill.items || []).map((line) => {
        const product = (productsCache || []).find((p) => String(p.id) === String(line.productId)) || {};
        return {
            productId: line.productId,
            title: line.title || product.title || 'Product',
            sku: line.sku || product.sku || '',
            imageUrl: product.imageUrl || '',
            color: product.color || line.color || '',
            brand: product.brand || '',
            sellUnit: line.sellUnit || product.sellUnit || 'Gaz',
            ...(typeof copyBedsheetFields === 'function' ? copyBedsheetFields(product) : {}),
            ...(typeof copyBlanketFields === 'function' ? copyBlanketFields(product) : {}),
            rate: Number(line.rate) || 0,
            qty: Number(line.quantitySold != null ? line.quantitySold : line.quantityMeters) || 0
        };
    });
    const select = document.getElementById('wsCustomer');
    const name = bill.customerName || '';
    const match = [...select.options].find((o) => o.text === name);
    if (match) {
        select.value = match.value;
        document.getElementById('wsPhone').value = match.dataset.phone || bill.customerPhone || '';
    } else {
        const opt = document.createElement('option');
        opt.value = 'edit-loaded';
        opt.textContent = name;
        opt.dataset.phone = bill.customerPhone || '';
        select.appendChild(opt);
        select.value = 'edit-loaded';
        document.getElementById('wsPhone').value = bill.customerPhone || '';
    }
    document.getElementById('wsDiscountType').value = 'flat';
    document.getElementById('wsDiscount').value = Number(bill.discount) || 0;
    document.getElementById('wsNotes').value = bill.notes || '';
    wsPay = bill.paymentMethod || 'Cash';
    document.querySelectorAll('#view-wholesale [data-pay]').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.pay === wsPay);
    });
    renderWsLines();
}

async function saveWholesale(event) {
    event.preventDefault();
    const customer = document.getElementById('wsCustomer');
    const name = customer.options[customer.selectedIndex]?.text || '';
    if (!customer.value) return showToast('Select a wholesaler.');
    if (!wsLines.length) return showToast('Add at least one product.');
    const payload = {
        wholesalerId: customer.value === 'edit-loaded' ? null : customer.value,
        customerName: name,
        customerPhone: document.getElementById('wsPhone').value,
        discount: document.getElementById('wsDiscount').value,
        discountType: document.getElementById('wsDiscountType').value,
        paymentMethod: wsPay,
        notes: document.getElementById('wsNotes').value,
        items: wsLines.map((l) => typeof posSaleItem === 'function' ? posSaleItem(l) : ({ productId: l.productId, quantitySold: l.qty, rate: l.rate }))
    };
    try {
        const data = wsEditId
            ? await api.put(`/api/wholesale/${wsEditId}`, payload)
            : await api.post('/api/wholesale/create', payload);
        showToast(data.message);
        wsEditId = null;
        wsLines = [];
        renderWsLines();
        await loadProducts();
        wsOrdersCache = await api.get('/api/wholesale/list');
        renderWsOrders();
        if (typeof loadWholesalers === 'function') await loadWholesalers();
    } catch (error) {
        showToast(error.message);
    }
}

function printWsBill(event) {
    if (event) event.preventDefault();
    const totals = wsTotals();
    const customer = document.getElementById('wsCustomer');
    const name = customer.options[customer.selectedIndex]?.text || '';
    printDraftInvoice({
        number: 'DRAFT',
        customerName: name,
        customerPhone: document.getElementById('wsPhone').value,
        subTotal: totals.sub,
        discount: totals.disc,
        grandTotal: totals.grand,
        paymentMethod: wsPay,
        createdAt: new Date().toISOString(),
        items: wsLines.map((l) => (typeof posInvoiceLine === 'function' ? posInvoiceLine(l) : {
            title: l.title,
            quantityMeters: l.qty,
            quantitySold: l.qty,
            sellUnit: l.sellUnit,
            rate: l.rate,
            total: l.qty * l.rate
        }))
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('view-wholesale');
    root.innerHTML = wholesaleMarkup();
    disableAutofill(root);
    await loadWsCustomers();
    document.getElementById('wsCustomer').addEventListener('change', (e) => {
        const opt = e.target.selectedOptions[0];
        document.getElementById('wsPhone').value = opt?.dataset.phone || '';
    });
    document.getElementById('wsViewCustomer').addEventListener('click', () => {
        const customer = document.getElementById('wsCustomer');
        if (!customer.value) return showToast('Select a wholesaler.');
        if (typeof openWholesalerLedger === 'function') {
            openWholesalerLedger(customer.value).catch((err) => showToast(err.message));
        } else showView('wholesalers');
    });
    document.getElementById('wsSearch').addEventListener('input', (e) => searchWsProducts(e.target.value));
    document.getElementById('wsHits').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-wsadd]');
        if (!btn) return;
        const product = (productsCache || []).find((p) => String(p.id) === String(btn.dataset.wsadd));
        if (product) addWsProduct(product);
    });
    document.getElementById('wsLines').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-remove]');
        if (!btn) return;
        wsLines.splice(Number(btn.dataset.remove), 1);
        renderWsLines();
    });
    document.getElementById('wsDiscount').addEventListener('input', wsTotals);
    document.getElementById('wsDiscountType').addEventListener('change', wsTotals);
    root.querySelectorAll('[data-pay]').forEach((btn) => btn.addEventListener('click', () => {
        wsPay = btn.dataset.pay;
        root.querySelectorAll('[data-pay]').forEach((b) => b.classList.toggle('active', b === btn));
    }));
    document.getElementById('wsForm').addEventListener('submit', saveWholesale);
    document.getElementById('wsPrint').addEventListener('click', printWsBill);
    if (typeof bindWsZeroInputs === 'function') bindWsZeroInputs();
    try {
        wsOrdersCache = await api.get('/api/wholesale/list');
        renderWsOrders();
    } catch (error) { console.error(error); }
});
