function recvPayLabel() {
    const sel = document.getElementById('recvPayMode');
    return sel && sel.selectedOptions[0] ? sel.selectedOptions[0].textContent : 'Paid';
}

function recvConfirmSummary() {
    const { price, qty, total } = recvPurchaseTotal();
    const unit = document.getElementById('recvBuyUnit')?.value || 'Meter';
    const rows = typeof collectRecvVariants === 'function' ? collectRecvVariants() : [];
    const colorLine = rows.length
        ? rows.map((v) => `${v.color} (${v.qty} ${unit})`).join(', ')
        : '-';
    return [
        `Product: ${recvProduct && recvProduct.title ? recvProduct.title : '-'}`,
        `Colors: ${colorLine}`,
        `Quantity: ${qty} ${unit}`,
        `Purchase rate: Rs. ${price.toLocaleString()} / ${unit}`,
        `Total cost: Rs. ${total.toLocaleString()}`,
        `Wholesale: Rs. ${Number(document.getElementById('recvWholesale')?.value || 0).toLocaleString()}`,
        `Retail: Rs. ${Number(document.getElementById('recvRetail')?.value || 0).toLocaleString()}`,
        `Payment: ${recvPayLabel()}`,
        `Balance due: Rs. ${(total - recvPaidAmount(total)).toLocaleString()}`
    ].join('\n');
}

function closeRecvConfirm() {
    document.getElementById('recvConfirm')?.classList.remove('open');
}

function openRecvConfirm() {
    if (!document.getElementById('recvProductId')?.value) {
        return showToast('Select a master catalog product.');
    }
    const rows = typeof collectRecvVariants === 'function' ? collectRecvVariants() : [];
    if (!rows.length) return showToast('Add at least one color with quantity.');
    const body = document.getElementById('recvConfirmBody');
    if (body) body.textContent = recvConfirmSummary();
    document.getElementById('recvConfirm')?.classList.add('open');
}

function bindRecvConfirm() {
    const yes = document.getElementById('recvConfirmYes');
    const no = document.getElementById('recvConfirmNo');
    if (!yes || yes.dataset.bound) return;
    yes.dataset.bound = '1';
    no.addEventListener('click', closeRecvConfirm);
    yes.addEventListener('click', () => {
        closeRecvConfirm();
        if (typeof performRecvSave === 'function') performRecvSave();
    });
}
