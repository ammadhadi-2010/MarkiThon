let recvProduct = null;
let lastRecvInvoice = null;
let lastRecvLabels = null;

function recvMoneyLabel(amount, percent) {
    return `Rs.${Number(amount || 0).toLocaleString()} (${Number(percent || 0).toFixed(1)}%)`;
}

function recvQtyValue() {
    if (typeof recvBatchTotals === 'function') return recvBatchTotals().qty;
    if (typeof collectRecvVariants === 'function') {
        return collectRecvVariants().reduce((s, v) => s + v.qty, 0);
    }
    return 0;
}

function paintRecvPayUi() {
    const mode = document.getElementById('recvPayMode')?.value || 'full';
    const wrap = document.getElementById('recvPaidWrap');
    const method = document.getElementById('recvMethodField');
    const slip = document.getElementById('recvPayProofWrap');
    if (wrap) wrap.hidden = mode !== 'partial';
    if (method) method.hidden = mode === 'credit';
    if (slip) slip.hidden = mode === 'credit';
}

let recvAmountManual = false;

function markRecvAmountAuto() {
    recvAmountManual = false;
}

function recvPurchaseTotal() {
    const price = Number(document.getElementById('recvPurchase')?.value) || 0;
    const qty = recvQtyValue();
    const amountEl = document.getElementById('recvAmount');
    const typed = Number(amountEl?.value) || 0;
    const total = recvAmountManual && typed >= 0 ? typed : price * qty;
    return { price, qty, total };
}

function recvPaidAmount(total) {
    const mode = document.getElementById('recvPayMode')?.value || 'full';
    if (mode === 'credit') return 0;
    if (mode === 'partial') return Math.min(Math.max(Number(document.getElementById('recvPaidNow')?.value) || 0, 0), total);
    return total;
}

function paintRecvUnitLabels() {
    const unit = document.getElementById('recvBuyUnit')?.value
        || document.getElementById('recvUnit')?.value || 'Meter';
    const qtyLab = document.getElementById('recvQtyLabel');
    const rateLab = document.getElementById('recvRateLabel');
    if (qtyLab) qtyLab.textContent = `Total Quantity (${unit})`;
    if (rateLab) rateLab.textContent = `Purchase Rate (Per ${unit})`;
}

function paintRecvTotals() {
    if (typeof paintRecvUnitLabels === 'function') paintRecvUnitLabels();
    const el = document.getElementById('recvTotal');
    const badge = document.getElementById('recvConvert');
    const bal = document.getElementById('recvBalance');
    const unit = document.getElementById('recvBuyUnit')?.value
        || document.getElementById('recvUnit')?.value || 'Meter';
    const { price, qty, total } = recvPurchaseTotal();
    const qtySync = document.getElementById('recvQtySync');
    const amountEl = document.getElementById('recvAmount');
    if (qtySync) qtySync.value = qty > 0 ? String(Number(qty.toFixed(4))) : '';
    if (amountEl && !recvAmountManual && document.activeElement !== amountEl) {
        amountEl.value = total > 0 ? String(Number(total.toFixed(2))) : '';
    }
    if (typeof paintRecvVariantTotals === 'function') paintRecvVariantTotals();
    const meters = typeof receiveQtyToMeters === 'function'
        ? receiveQtyToMeters(qty, unit, recvProduct)
        : qty;
    const gaz = typeof metersToGaz === 'function'
        ? metersToGaz(meters, recvProduct, unit)
        : meters;
    if (el) {
        el.textContent = `Purchase Total: Rs. ${total.toLocaleString()} (${qty} ${unit} @ Rs. ${price.toLocaleString()} per ${unit})`;
    }
    if (typeof isRecvMobile === 'function' && isRecvMobile() && typeof paintRecvMobileHead === 'function') {
        paintRecvMobileHead();
    }
    if (badge) {
        const sell = document.getElementById('recvSellUnit')?.value || (recvProduct && recvProduct.sellUnit) || 'Gaz';
        if ((typeof isRecvBedsheet === 'function' && isRecvBedsheet())
            || (typeof isRecvBlanket === 'function' && isRecvBlanket())
            || (typeof isRecvMobile === 'function' && isRecvMobile())) {
            badge.textContent = `Received ${qty} ${unit}`;
        } else {
            badge.textContent = `Received ${qty} ${unit} = ${gaz.toFixed(2)} ${sell} available for POS`;
        }
    }
    const paid = recvPaidAmount(total);
    if (bal) {
        const due = total - paid;
        bal.textContent = due > 0
            ? `Ledger balance due: Rs. ${due.toLocaleString()} — remaining installments go to Supplier Ledger`
            : `Ledger balance due: Rs. 0`;
    }
    const purchase = price;
    const wholesale = Number(document.getElementById('recvWholesale')?.value) || 0;
    const retail = Number(document.getElementById('recvRetail')?.value) || 0;
    const wsEl = document.getElementById('recvWsProfit');
    const rtEl = document.getElementById('recvRtProfit');
    const ws = wholesale - purchase;
    const rt = retail - purchase;
    if (wsEl) wsEl.textContent = recvMoneyLabel(ws, purchase ? (ws / purchase) * 100 : 0);
    if (rtEl) rtEl.textContent = recvMoneyLabel(rt, purchase ? (rt / purchase) * 100 : 0);
    paintRecvPayUi();
    if (typeof paintRecvRule === 'function') paintRecvRule();
}
