function todayInputDate() {
    return new Date().toISOString().slice(0, 10);
}

function mapStockUnit(value) {
    const raw = String(value || 'Meter');
    if (raw === 'Than' || raw === 'Thaan') return 'Meter';
    if (raw === 'Yard') return 'Gaz';
    if (raw === 'Unit') return 'Piece';
    return raw;
}

function resetRecvForm() {
    const form = document.getElementById('recvForm');
    if (!form) return;
    form.reset();
    recvProduct = null;
    document.getElementById('recvProductId').value = '';
    document.getElementById('recvDate').value = todayInputDate();
    ['recvPurchase', 'recvWholesale', 'recvRetail', 'recvMinRate', 'recvPaidNow', 'recvAmount', 'recvQtySync']
        .forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    if (typeof markRecvAmountAuto === 'function') markRecvAmountAuto();
    document.getElementById('recvOnHand').textContent = 'Select a catalog item to receive stock.';
    const meta = document.getElementById('recvMeta');
    if (meta) {
        meta.hidden = true;
        meta.textContent = '';
    }
    const hits = document.getElementById('recvHits');
    if (hits) hits.hidden = true;
    document.getElementById('recvDone').hidden = true;
    const card = document.getElementById('recvPickCard');
    if (card) card.hidden = true;
    if (typeof resetRecvProofs === 'function') resetRecvProofs();
    if (typeof applyRecvBedsheetMode === 'function') applyRecvBedsheetMode();
    if (typeof applyRecvBlanketMode === 'function') applyRecvBlanketMode();
    if (typeof applyRecvMobileMode === 'function') applyRecvMobileMode();
    if (typeof resetRecvVariants === 'function') resetRecvVariants();
    fillInvSupplierOptions('');
    const vid = document.getElementById('recvVoucherId');
    if (vid) vid.value = '';
    if (typeof setRecvSaveLabel === 'function') setRecvSaveLabel();
    paintRecvTotals();
}

function applyRecvProduct(product) {
    const key = String(product.title || '').trim().toLowerCase();
    const pack = (productsCache || []).filter((p) =>
        String(p.title || '').trim().toLowerCase() === key
    );
    const base = pack.find((p) => !p.color) || product;
    recvProduct = base;
    document.getElementById('recvProductId').value = base.id;
    document.getElementById('recvSearch').value = `${base.title} (${base.sku || 'No SKU'})`;
    document.getElementById('recvPurchase').value = recvEmptyIfZero(base.purchasePrice);
    if (typeof markRecvAmountAuto === 'function') markRecvAmountAuto();
    document.getElementById('recvWholesale').value = recvEmptyIfZero(base.wholesalePrice);
    document.getElementById('recvRetail').value = recvEmptyIfZero(base.retailPrice);
    const minEl = document.getElementById('recvMinRate');
    if (minEl) minEl.value = recvEmptyIfZero(base.minSellingRate);
    if (typeof applyRecvBedsheetMode === 'function') applyRecvBedsheetMode();
    if (typeof applyRecvBlanketMode === 'function') applyRecvBlanketMode();
    if (typeof isRecvBedsheet === 'function' && isRecvBedsheet(base)) {
        document.getElementById('recvBuyUnit').value = 'Set';
        document.getElementById('recvSellUnit').value = typeof recvSheetSellValue === 'function'
            ? recvSheetSellValue(base.sellUnit)
            : (/set/i.test(String(base.sellUnit || '')) ? 'Set' : 'Piece');
    } else if (typeof isRecvBlanket === 'function' && isRecvBlanket(base)) {
        const unit = /carton/i.test(String(base.stockUnit || '')) ? 'Carton'
            : (/bag/i.test(String(base.stockUnit || '')) ? 'Bag' : 'Piece');
        document.getElementById('recvBuyUnit').value = unit;
        document.getElementById('recvSellUnit').value = unit;
    } else {
        const buy = mapStockUnit(base.stockUnit);
        document.getElementById('recvBuyUnit').value = buy;
        document.getElementById('recvSellUnit').value = base.sellUnit || 'Gaz';
    }
    if (typeof applyRecvMobileMode === 'function') applyRecvMobileMode();
    const stock = pack.reduce((s, p) => s + (Number(p.stockMeters) || 0), 0);
    const onHandUnit = (typeof isRecvMobile === 'function' && isRecvMobile(base))
        ? (document.getElementById('recvBuyUnit').value || 'Pcs')
        : (base.stockUnit || document.getElementById('recvBuyUnit').value);
    document.getElementById('recvOnHand').textContent = `On-hand (all colors): ${stock} ${onHandUnit}`;
    fillInvSupplierOptions(base.supplierId || '');
    document.getElementById('recvHits').hidden = true;
    if (typeof paintRecvCard === 'function') paintRecvCard(base);
    if (typeof fillInvColorOptions === 'function') fillInvColorOptions();
    paintRecvTotals();
}

function searchRecvProducts(q) {
    const hits = document.getElementById('recvHits');
    const term = q.toLowerCase().trim();
    if (!term) {
        hits.hidden = true;
        return;
    }
    const seen = new Set();
    const rows = shopInventory(productsCache).filter((p) => {
        const hit = [p.title, p.sku, p.barcode, p.brand]
            .some((v) => String(v || '').toLowerCase().includes(term));
        if (!hit) return false;
        const key = String(p.title || '').trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).slice(0, 8);
    hits.innerHTML = rows.map((p) =>
        `<button type="button" data-recvid="${p.id}">${escapeHtml(p.title)} · ${escapeHtml(p.sku || 'No SKU')} · ${p.stockMeters} ${escapeHtml((typeof posHardwareUnit === 'function' && isMobileProduct(p)) ? posHardwareUnit(p) : (p.stockUnit || 'm'))}</button>`
    ).join('') || '<button type="button">No catalog matches</button>';
    hits.hidden = false;
}

function recvPayload() {
    const { qty, total } = recvPurchaseTotal();
    const paid = recvPaidAmount(total);
    const variants = typeof collectRecvVariants === 'function' ? collectRecvVariants() : [];
    if (typeof rememberInvColor === 'function') {
        variants.forEach((v) => rememberInvColor(v.color));
    }
    return {
        productId: document.getElementById('recvProductId').value,
        supplierId: document.getElementById('recvSupplierId').value,
        receivedAt: document.getElementById('recvDate').value,
        billNo: document.getElementById('recvBill').value,
        quantity: qty,
        stockUnit: document.getElementById('recvBuyUnit').value,
        sellUnit: document.getElementById('recvSellUnit').value,
        variants,
        purchasePrice: document.getElementById('recvPurchase').value,
        purchaseTotal: document.getElementById('recvAmount').value,
        wholesalePrice: document.getElementById('recvWholesale').value,
        retailPrice: document.getElementById('recvRetail').value,
        minSellingRate: document.getElementById('recvMinRate')?.value || '',
        paymentMode: document.getElementById('recvPayMode').value,
        amountPaid: paid,
        payMethod: document.getElementById('recvPayMethod').value,
        invoiceImage: typeof recvProofValue === 'function' ? recvProofValue('recvInvoiceImage') : '',
        paymentProof: document.getElementById('recvPayMode').value === 'credit'
            ? ''
            : (typeof recvProofValue === 'function' ? recvProofValue('recvPayProofImage') : '')
    };
}

function printRecvInvoice() {
    if (!lastRecvInvoice || typeof printDraftInvoice !== 'function') {
        return showToast('Save a stock receipt before printing.');
    }
    printDraftInvoice(lastRecvInvoice);
}

function captureRecvLabels(data) {
    const p = recvProduct || {};
    const rows = (data && data.variants) || (typeof collectRecvVariants === 'function' ? collectRecvVariants() : []);
    lastRecvLabels = {
        title: p.title || 'Product',
        sku: p.sku || '',
        billNo: (data.invoice && data.invoice.number) || document.getElementById('recvBill').value,
        price: document.getElementById('recvRetail').value,
        variants: rows.map((v) => ({
            color: v.color,
            sku: v.sku || p.sku,
            thaan: v.thaan || 1,
            qty: v.qty
        }))
    };
}

async function performRecvSave() {
    try {
        const id = document.getElementById('recvVoucherId')?.value;
        const data = id
            ? await api.put(`/api/products/vouchers/${encodeURIComponent(id)}`, recvPayload())
            : await api.post('/api/products/receive', recvPayload());
        lastRecvInvoice = data.invoice || null;
        captureRecvLabels(data);
        showToast(data.message);
        document.getElementById('recvDoneText').textContent = data.message;
        document.getElementById('recvDone').hidden = false;
        if (typeof printRecvLabels === 'function') printRecvLabels();
        if (typeof refreshRecvVouchers === 'function') await refreshRecvVouchers();
        if (typeof loadProducts === 'function') await loadProducts();
        if (typeof loadSuppliers === 'function') await loadSuppliers();
        if (typeof refreshStockView === 'function') await refreshStockView();
        if (typeof setRecvSaveLabel === 'function') setRecvSaveLabel();
    } catch (error) {
        showToast(error.message);
    }
}

function saveStockReceipt(event) {
    event.preventDefault();
    if (typeof openRecvConfirm === 'function') openRecvConfirm();
    else performRecvSave();
}

function bindInventoryReceive() {
    const form = document.getElementById('recvForm');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = '1';
    document.getElementById('recvDate').value = todayInputDate();
    document.getElementById('recvSearch').addEventListener('input', (e) => {
        document.getElementById('recvProductId').value = '';
        recvProduct = null;
        if (typeof paintRecvCard === 'function') paintRecvCard(null);
        searchRecvProducts(e.target.value);
    });
    document.getElementById('recvHits').addEventListener('click', (e) => {
        const product = (productsCache || []).find((p) => String(p.id) === String(e.target.dataset.recvid));
        if (product) applyRecvProduct(product);
    });
    document.getElementById('recvPurchase').addEventListener('input', () => {
        if (typeof markRecvAmountAuto === 'function') markRecvAmountAuto();
        paintRecvTotals();
    });
    document.getElementById('recvAmount').addEventListener('input', () => {
        recvAmountManual = true;
        paintRecvTotals();
    });
    ['recvWholesale', 'recvRetail', 'recvPaidNow', 'recvPayMode']
        .forEach((id) => document.getElementById(id).addEventListener('input', paintRecvTotals));
    document.getElementById('recvPayMode').addEventListener('change', paintRecvTotals);
    document.getElementById('recvBuyUnit').addEventListener('change', paintRecvTotals);
    document.getElementById('recvSellUnit').addEventListener('change', paintRecvTotals);
    document.getElementById('recvCancel').addEventListener('click', resetRecvForm);
    document.getElementById('recvPrintInv').addEventListener('click', printRecvInvoice);
    document.getElementById('recvPrintQr').addEventListener('click', () => {
        if (typeof printRecvLabels === 'function') printRecvLabels();
        else showToast('Label printer is not ready.');
    });
    document.getElementById('recvNew').addEventListener('click', resetRecvForm);
    if (typeof bindRecvZeroInputs === 'function') bindRecvZeroInputs();
    if (typeof bindRecvProofs === 'function') bindRecvProofs();
    if (typeof bindRecvVariants === 'function') bindRecvVariants();
    if (typeof bindRecvConfirm === 'function') bindRecvConfirm();
    if (typeof bindRecvVouchers === 'function') bindRecvVouchers();
    if (typeof setRecvSaveLabel === 'function') setRecvSaveLabel();
    if (typeof applyRecvMobileMode === 'function') applyRecvMobileMode();
    form.addEventListener('submit', saveStockReceipt);
    paintRecvTotals();
}
