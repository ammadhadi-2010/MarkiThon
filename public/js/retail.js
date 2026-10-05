let rtLines = [];
let rtPay = 'Cash';
let rtCustomers = [];
let rtEditId = null;

function rtTotals() {
    const sub = rtLines.reduce((sum, line) => sum + line.qty * line.rate, 0);
    const raw = Number(document.getElementById('rtDiscount').value) || 0;
    const type = document.getElementById('rtDiscountType').value;
    const disc = type === 'percent' ? sub * (raw / 100) : raw;
    const grand = Math.max(sub - disc, 0);
    document.getElementById('rtSub').textContent = sub.toLocaleString();
    document.getElementById('rtDiscVal').textContent = disc.toLocaleString();
    document.getElementById('rtGrand').textContent = grand.toLocaleString();
    return { sub, disc, grand };
}

function renderRtLines() {
    document.getElementById('rtLines').innerHTML = rtLines.map((line, i) => `
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
            ${typeof posRateCellHtml === 'function' ? posRateCellHtml(line, i, 'rtrate') : `<td class="pos-rate" data-label="Unit Price">${Number(line.rate).toLocaleString()}</td>`}
            <td class="pos-qty" data-label="Qty">
                <input class="qty-input" data-rtqty="${i}" type="number" min="0.01" step="0.01"
                    value="${line.qty}" autocomplete="off" name="rtQty${i}">
                <span class="qty-unit">${escapeHtml(line.sellUnit || 'Gaz')}</span>
            </td>
            <td class="pos-line-total" data-label="Total">${(line.qty * line.rate).toLocaleString()}</td>
            <td class="pos-act"><button type="button" class="trash" data-rtremove="${i}">🗑</button></td>
        </tr>`).join('');
    rtTotals();
}
function addRtProduct(product, opts) {
    const keyOf = typeof rtLineMatchKey === 'function' ? rtLineMatchKey : (p) => String(p.id || p.productId);
    const existing = rtLines.find((line) => keyOf(line) === keyOf(product));
    if (existing) existing.qty += 1;
    else rtLines.push({
        productId: product.id, title: product.title, sku: product.sku, brand: product.brand || '',
        imageUrl: product.imageUrl, color: product.color || '', rate: Number(product.retailPrice) || 0,
        sellUnit: sellUnitOf(product), stockMeters: product.stockMeters, qty: 1,
        ...(typeof posCopyMinRate === 'function' ? posCopyMinRate(product) : {}),
        ...(typeof copyBedsheetFields === 'function' ? copyBedsheetFields(product) : {}),
        ...(typeof copyBlanketFields === 'function' ? copyBlanketFields(product) : {})
    });
    document.getElementById('rtHits').hidden = true;
    const search = document.getElementById('rtSearch');
    if (search) { search.value = ''; search.focus(); }
    renderRtLines();
    if (opts && opts.scanned) {
        showToast(`${product.title}${product.color ? ` · ${product.color}` : ''} added to the bill.`);
    }
}
function fillRtCustomers(selectedId) {
    const select = document.getElementById('rtCustomer');
    const current = selectedId || select.value || 'walk-in';
    select.innerHTML = '<option value="walk-in">Walk-in Customer</option>' +
        rtCustomers.map((c) =>
            `<option value="${c.id}" data-phone="${escapeHtml(c.phone || '')}">${escapeHtml(c.name)}</option>`
        ).join('');
    select.value = current;
}

async function loadRtCustomers() {
    try { rtCustomers = await api.get('/api/retail/customers'); } catch (error) {
        if (!isNetworkError(error)) throw error;
        rtCustomers = [];
    }
    if (!Array.isArray(rtCustomers)) rtCustomers = [];
    fillRtCustomers();
}
function selectedRtCustomer() {
    const select = document.getElementById('rtCustomer');
    const opt = select.selectedOptions[0];
    if (select.value === 'walk-in') return { name: 'Walk-in Customer', phone: '' };
    return { name: opt.text, phone: opt.dataset.phone || '' };
}

async function saveRetailBill(event) {
    event.preventDefault();
    if (!rtLines.length) return showToast('Add at least one product.');
    const customer = selectedRtCustomer();
    const payload = {
        customerName: customer.name,
        customerPhone: customer.phone,
        discount: document.getElementById('rtDiscount').value,
        discountType: document.getElementById('rtDiscountType').value,
        paymentMethod: rtPay,
        notes: document.getElementById('rtNotes').value,
        items: rtLines.map(posSaleItem)
    };
    try {
        const data = rtEditId
            ? await api.put(`/api/retail/${rtEditId}`, payload)
            : await offlineSaveSale(payload);
        showToast(data.message);
        rtEditId = null;
        rtLines = [];
        renderRtLines();
        if (typeof loadProducts === 'function') await loadProducts();
        if (typeof loadRtBills === 'function') await loadRtBills();
        if (typeof loadCustomerHub === 'function') await loadCustomerHub();
    } catch (error) {
        showToast(error.message);
    }
}

async function loadRetailBillForEdit(bill) {
    if (typeof loadProducts === 'function') await loadProducts();
    await loadRtCustomers();
    rtEditId = bill.id;
    rtLines = (bill.items || []).map((line) => {
        const product = (productsCache || []).find((p) => String(p.id) === String(line.productId)) || {};
        return {
            productId: line.productId,
            title: line.title || product.title || 'Product',
            sku: line.sku || product.sku || '',
            color: product.color || line.color || '',
            brand: product.brand || line.brand || '',
            stockMeters: product.stockMeters,
            imageUrl: product.imageUrl || '',
            rate: Number(line.rate) || 0,
            qty: Number(line.quantitySold != null ? line.quantitySold : line.quantityMeters) || 0,
            sellUnit: line.sellUnit || product.sellUnit || 'Gaz',
            ...(typeof posCopyMinRate === 'function' ? posCopyMinRate(product) : {}),
            ...(typeof copyBedsheetFields === 'function' ? copyBedsheetFields(product) : {}),
            ...(typeof copyBlanketFields === 'function' ? copyBlanketFields(product) : {})
        };
    });
    const select = document.getElementById('rtCustomer');
    const name = bill.customerName || 'Walk-in Customer';
    const match = [...select.options].find((o) => o.text === name);
    if (match) select.value = match.value;
    else {
        const opt = document.createElement('option');
        opt.value = 'edit-loaded';
        opt.textContent = name;
        opt.dataset.phone = bill.customerPhone || '';
        select.appendChild(opt);
        select.value = 'edit-loaded';
    }
    document.getElementById('rtDiscountType').value = 'flat';
    document.getElementById('rtDiscount').value = Number(bill.discount) || 0;
    document.getElementById('rtNotes').value = bill.notes || '';
    rtPay = bill.paymentMethod || 'Cash';
    document.querySelectorAll('#view-billing [data-rtpay]').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.rtpay === rtPay);
    });
    renderRtLines();
}

async function loadRtBills() {
    const list = await offlineLoadBills();
    const tbody = document.getElementById('rtBills');
    if (!tbody) return;
    tbody.innerHTML = list.map((b) => `
        <tr>
            <td>${escapeHtml(b.billNumber)}</td>
            <td>${escapeHtml(b.customerName)}</td>
            <td>${Number(b.grandTotal).toLocaleString()}</td>
            <td>${escapeHtml(b.paymentMethod)}</td>
            <td class="col-actions">${billMenuHtml(b.id, 'retail')}</td>
        </tr>`).join('') || '<tr><td colspan="5" class="empty">No saved bills yet.</td></tr>';
}

function printRtBill(event) {
    if (event) event.preventDefault();
    const totals = rtTotals();
    const customer = selectedRtCustomer();
    printDraftInvoice({
        number: 'DRAFT',
        customerName: customer.name,
        customerPhone: customer.phone,
        subTotal: totals.sub,
        discount: totals.disc,
        grandTotal: totals.grand,
        paymentMethod: rtPay,
        createdAt: new Date().toISOString(),
        items: rtLines.map((l) => (typeof posInvoiceLine === 'function' ? posInvoiceLine(l) : {
            title: l.title,
            quantityMeters: l.qty,
            sellUnit: l.sellUnit,
            quantitySold: l.qty,
            rate: l.rate,
            total: l.qty * l.rate
        }))
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('view-billing');
    root.innerHTML = retailMarkup();
    disableAutofill(root);
    await loadRtCustomers().catch((e) => showToast(e.message));
    document.getElementById('rtNewCustomer').addEventListener('click', () => document.getElementById('rtModal').classList.add('open'));
    document.getElementById('rtCustCancel').addEventListener('click', () => document.getElementById('rtModal').classList.remove('open'));
    document.getElementById('rtCustForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const data = await api.post('/api/retail/customers', {
                name: document.getElementById('rtCustName').value,
                phone: document.getElementById('rtCustPhone').value
            });
            showToast(data.message);
            document.getElementById('rtCustForm').reset();
            document.getElementById('rtModal').classList.remove('open');
            await loadRtCustomers();
            fillRtCustomers(String(data.customer.id));
        } catch (error) { showToast(error.message); }
    });
    document.getElementById('rtSearch').addEventListener('input', (e) => searchRtProducts(e.target.value));
    document.getElementById('rtHits').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-rtadd]');
        if (!btn) return;
        const product = (productsCache || []).find((p) => String(p.id) === String(btn.dataset.rtadd));
        if (product) addRtProduct(product);
    });
    document.getElementById('rtLines').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-rtremove]');
        if (!btn) return;
        rtLines.splice(Number(btn.dataset.rtremove), 1);
        renderRtLines();
    });
    document.getElementById('rtDiscount').addEventListener('input', rtTotals);
    document.getElementById('rtDiscountType').addEventListener('change', rtTotals);
    root.querySelectorAll('[data-rtpay]').forEach((btn) => btn.addEventListener('click', () => {
        rtPay = btn.dataset.rtpay;
        root.querySelectorAll('[data-rtpay]').forEach((b) => b.classList.toggle('active', b === btn));
    }));
    document.getElementById('rtForm').addEventListener('submit', saveRetailBill);
    document.getElementById('rtPrint').addEventListener('click', printRtBill);
    if (typeof bindRtZeroInputs === 'function') bindRtZeroInputs();
    loadRtBills().catch((e) => showToast(e.message));
});
