function isRecvMobile(product) {
    const row = product || (typeof recvProduct !== 'undefined' ? recvProduct : null);
    if (typeof isMobileShop === 'function' && isMobileShop()) return true;
    return typeof isMobileProduct === 'function' && isMobileProduct(row);
}

function setRecvHardwareCols(hidden) {
    ['recvHeadCol2', 'recvHeadCol3', 'recvTotThaan', 'recvTotAvg'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.hidden = hidden;
    });
}

function recvMobileRowHtml(row) {
    const qty = Number(row && row.qty) > 0 ? row.qty : '';
    const color = typeof recvColorSelectHtml === 'function' ? recvColorSelectHtml(row && row.color) : '';
    return `<tr class="recv-mobile-row">
        <td>${color}</td>
        <td hidden></td>
        <td hidden></td>
        <td><input class="recv-v-qty" name="recvColorQty" type="number" min="0" step="1" placeholder="0" autocomplete="off" value="${qty}"></td>
        <td><button type="button" class="ghost recv-v-del" title="Delete" aria-label="Delete">Delete</button></td>
    </tr>`;
}

function paintRecvMobileHead() {
    const qty = document.getElementById('recvHeadCol4');
    const unit = document.getElementById('recvBuyUnit')?.value || 'Pcs';
    if (qty) qty.textContent = `Qty (${unit})`;
    const add = document.getElementById('recvAddColor');
    if (add) add.textContent = '+ Add Row';
}

function applyRecvMobileMode() {
    const mobile = isRecvMobile();
    setRecvHardwareCols(mobile);
    if (!mobile) {
        const add = document.getElementById('recvAddColor');
        if (add && add.textContent === '+ Add Row') add.textContent = '+ Add Color Row';
        return;
    }
    const buy = document.getElementById('recvBuyUnit');
    const sell = document.getElementById('recvSellUnit');
    const current = (typeof hardwareUnitName === 'function'
        ? (hardwareUnitName(recvProduct && recvProduct.stockUnit) || hardwareUnitName(recvProduct && recvProduct.sellUnit))
        : '') || 'Pcs';
    if (typeof fillRecvSelect === 'function') {
        fillRecvSelect(buy, ['Pcs', 'Box', 'Pack'], current, true);
        fillRecvSelect(sell, ['Pcs', 'Box', 'Pack'], current, true);
    }
    const meta = document.getElementById('recvMeta');
    if (meta) {
        meta.hidden = true;
        meta.textContent = '';
    }
    paintRecvMobileHead();
    if (typeof paintRecvTotals === 'function') paintRecvTotals();
    const body = document.getElementById('recvVariantBody');
    if (body && body.dataset.mode !== 'mobile') {
        body.dataset.mode = 'mobile';
        if (typeof resetRecvVariants === 'function') resetRecvVariants();
    }
}
