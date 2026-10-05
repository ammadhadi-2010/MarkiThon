function setRecvSaveLabel() {
    const btn = document.getElementById('recvSave');
    const id = document.getElementById('recvVoucherId')?.value;
    if (btn) btn.textContent = id ? 'Update Stock Receipt' : 'Save Stock Receipt';
}

function fillRecvVariantRows(rows) {
    const body = document.getElementById('recvVariantBody');
    if (!body || typeof recvVariantRowHtml !== 'function') return;
    body.innerHTML = '';
    const list = rows && rows.length ? rows : [{}];
    list.forEach((row) => {
        body.insertAdjacentHTML('beforeend', recvVariantRowHtml(row));
        const tr = body.lastElementChild;
        if (!tr) return;
        const color = tr.querySelector('.recv-v-color');
        const thaan = tr.querySelector('.recv-v-thaan');
        const per = tr.querySelector('.recv-v-per');
        const qty = tr.querySelector('.recv-v-qty');
        if (color && !tr.classList.contains('recv-sheet-row')) color.value = row.color || '';
        if (thaan) thaan.value = row.thaan > 0 ? String(row.thaan) : '';
        const length = Number(row.perThaan || row.per) || (row.thaan > 0 && row.qty > 0
            ? Number(row.qty) / Number(row.thaan) : 0);
        if (per) per.value = length > 0 ? String(length) : '';
        if (qty && !tr.classList.contains('recv-sheet-row')) {
            qty.value = row.qty > 0 ? String(row.qty) : '';
        }
    });
    if (typeof fillInvColorOptions === 'function') fillInvColorOptions();
}

async function editRecvVoucher(id) {
    if (typeof loadProducts === 'function') await loadProducts();
    if (typeof loadSuppliers === 'function') await loadSuppliers();
    const v = await api.get(`/api/products/vouchers/${encodeURIComponent(id)}`);
    const product = (productsCache || []).find((p) => String(p.id) === String(v.productId))
        || (productsCache || []).find((p) => String(p.title || '').toLowerCase() === String(v.productTitle || '').toLowerCase());
    if (product && typeof applyRecvProduct === 'function') applyRecvProduct(product);
    else {
        recvProduct = { id: v.productId, title: v.productTitle, sku: '', stockUnit: v.unit, sellUnit: v.sellUnit };
        document.getElementById('recvProductId').value = v.productId || '';
        document.getElementById('recvSearch').value = v.productTitle || '';
    }
    document.getElementById('recvVoucherId').value = v.id;
    document.getElementById('recvBill').value = v.billNo || '';
    if (v.date) document.getElementById('recvDate').value = String(v.date).slice(0, 10);
    if (v.supplierId) fillInvSupplierOptions(v.supplierId);
    document.getElementById('recvBuyUnit').value = v.unit || 'Meter';
    const sell = document.getElementById('recvSellUnit');
    if (sell) sell.value = v.sellUnit || sell.value;
    document.getElementById('recvPurchase').value = recvEmptyIfZero(v.purchasePrice);
    document.getElementById('recvWholesale').value = recvEmptyIfZero(v.wholesalePrice);
    document.getElementById('recvRetail').value = recvEmptyIfZero(v.retailPrice);
    document.getElementById('recvPayMode').value = v.paymentMode || 'full';
    document.getElementById('recvPayMethod').value = v.payMethod || 'Cash';
    document.getElementById('recvPaidNow').value = recvEmptyIfZero(v.amountPaid);
    document.getElementById('recvAmount').value = v.total > 0 ? String(v.total) : '';
    if (typeof recvAmountManual !== 'undefined') recvAmountManual = true;
    fillRecvVariantRows(v.variants);
    setRecvSaveLabel();
    if (typeof paintRecvTotals === 'function') paintRecvTotals();
    document.getElementById('recvForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('Receipt loaded. Update Stock Receipt to save changes.');
}

function printRecvVoucher(id) {
    const v = recvVoucherCache.find((row) => String(row.id) === String(id));
    if (!v) return showToast('Voucher was not found.');
    lastRecvInvoice = {
        number: v.billNo,
        customerName: v.supplierName,
        customerPhone: '',
        paymentMethod: v.status === 'Unpaid' ? 'Unpaid (Credit)' : (v.payMethod || 'Cash'),
        subTotal: v.total,
        discount: 0,
        grandTotal: v.total,
        createdAt: v.date,
        items: (v.variants || []).map((r) => ({
            title: `${v.productTitle} · ${r.color}`,
            quantitySold: r.qty,
            sellUnit: v.unit,
            rate: v.purchasePrice,
            total: Number(r.qty || 0) * Number(v.purchasePrice || 0)
        })),
        stickers: {
            title: v.productTitle,
            sku: '',
            billNo: v.billNo,
            price: v.retailPrice,
            variants: v.variants || []
        }
    };
    lastRecvLabels = lastRecvInvoice.stickers;
    if (typeof printDraftInvoice === 'function') printDraftInvoice(lastRecvInvoice);
}
