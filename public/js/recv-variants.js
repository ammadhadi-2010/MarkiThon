function recvColorSelectHtml(selected) {
    const names = typeof allInvColors === 'function'
        ? allInvColors()
        : ['Black', 'White', 'Off-White', 'Navy Blue', 'Red', 'Green'];
    const cur = String(selected || '').trim()
        || (names.includes('Navy Blue') ? 'Navy Blue' : (names[0] || ''));
    const list = names.includes(cur) || !cur ? names : names.concat(cur);
    const opts = list.map((name) =>
        `<option${name === cur ? ' selected' : ''}>${typeof escapeHtml === 'function' ? escapeHtml(name) : name}</option>`
    ).join('');
    return `<select class="recv-v-color" name="recvColorName" autocomplete="off">${opts}</select>`;
}

function recvVariantRowHtml(row) {
    if (typeof isRecvMobile === 'function' && isRecvMobile()) {
        return recvMobileRowHtml(row || {});
    }
    if (typeof isRecvBlanket === 'function' && isRecvBlanket()) {
        return recvBlanketRowHtml(row || {});
    }
    if (typeof isRecvBedsheet === 'function' && isRecvBedsheet()) {
        return recvSheetRowHtml(row || {});
    }
    return `<tr>
        <td>${recvColorSelectHtml(row && row.color)}</td>
        <td><input class="recv-v-thaan" name="recvColorThaan" type="number" min="0" step="1" placeholder="0" autocomplete="off"></td>
        <td><input class="recv-v-per" name="recvColorPer" type="number" min="0" step="0.01" placeholder="0" autocomplete="off"></td>
        <td><input class="recv-v-qty" name="recvColorQty" type="number" min="0" step="0.01" placeholder="0" autocomplete="off"></td>
        <td><button type="button" class="ghost recv-v-del" title="Delete" aria-label="Delete">🗑</button></td>
    </tr>`;
}

function recvVariantsMarkup() {
    return `
        <div class="recv-variants">
            <div class="card-title" style="margin-top:8px">Color Variants Batch Entry</div>
            <p class="wl-hint">Add every color on this invoice. Totals feed purchase cost and QR stickers.</p>
            <datalist id="recvColorList"></datalist>
            <div class="table-wrap">
                <table class="recv-v-table">
                    <thead>
                        <tr>
                            <th id="recvHeadCol1">Color Name</th>
                            <th id="recvHeadCol2">Thaan</th>
                            <th id="recvHeadCol3">Length / Meters</th>
                            <th id="recvHeadCol4">Total Qty</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="recvVariantBody"></tbody>
                    <tfoot>
                        <tr class="recv-v-total">
                            <td>Total</td>
                            <td id="recvTotThaan">0</td>
                            <td id="recvTotAvg">0</td>
                            <td id="recvTotQty">0</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div class="actions">
                <button type="button" class="ghost" id="recvAddColor">+ Add Color Row</button>
            </div>
        </div>`;
}

function recvVariantQtyFromRow(row) {
    const qtyEl = row.querySelector('.recv-v-qty');
    if (row.classList.contains('recv-sheet-row') || row.classList.contains('recv-blanket-row')
        || row.classList.contains('recv-mobile-row')) {
        return Number(qtyEl?.value) || 0;
    }
    const thaan = Number(row.querySelector('.recv-v-thaan')?.value) || 0;
    const per = Number(row.querySelector('.recv-v-per')?.value) || 0;
    if (thaan > 0 && per > 0 && qtyEl) qtyEl.value = String(thaan * per);
    return Number(qtyEl?.value) || (thaan * per) || 0;
}

function collectRecvVariants() {
    return [...document.querySelectorAll('#recvVariantBody tr')].map((row) => {
        const color = String(row.querySelector('.recv-v-color')?.value || '').trim();
        const thaan = Number(row.querySelector('.recv-v-thaan')?.value) || 0;
        const per = Number(row.querySelector('.recv-v-per')?.value) || 0;
        const qty = recvVariantQtyFromRow(row);
        const extra = row.classList.contains('recv-blanket-row') && typeof collectRecvBlanketFields === 'function'
            ? collectRecvBlanketFields(row)
            : (typeof collectRecvSheetFields === 'function' && row.classList.contains('recv-sheet-row')
                ? collectRecvSheetFields(row)
                : {});
        return { color, thaan, perThaan: per, qty, ...extra };
    }).filter((v) => v.color && v.qty > 0);
}

function recvBatchTotals() {
    let thaan = 0;
    let qty = 0;
    document.querySelectorAll('#recvVariantBody tr').forEach((row) => {
        thaan += Number(row.querySelector('.recv-v-thaan')?.value) || 0;
        qty += recvVariantQtyFromRow(row);
    });
    const avg = thaan > 0 ? qty / thaan : 0;
    return { thaan, avg, qty };
}

function fmtRecvNum(value, digits) {
    const n = Number(value) || 0;
    if (!n) return '0';
    return n.toLocaleString(undefined, {
        maximumFractionDigits: digits,
        minimumFractionDigits: n % 1 ? Math.min(digits, 2) : 0
    });
}

function paintRecvVariantTotals() {
    const tot = recvBatchTotals();
    const packed = (typeof isRecvBedsheet === 'function' && isRecvBedsheet())
        || (typeof isRecvBlanket === 'function' && isRecvBlanket())
        || (typeof isRecvMobile === 'function' && isRecvMobile());
    const thaanEl = document.getElementById('recvTotThaan');
    const avgEl = document.getElementById('recvTotAvg');
    const qtyEl = document.getElementById('recvTotQty');
    if (thaanEl) thaanEl.textContent = packed ? '' : fmtRecvNum(tot.thaan, 0);
    if (avgEl) avgEl.textContent = packed ? '' : fmtRecvNum(tot.avg, 2);
    if (qtyEl) qtyEl.textContent = fmtRecvNum(tot.qty, packed ? 0 : 2);
}

function addRecvVariantRow() {
    const body = document.getElementById('recvVariantBody');
    if (!body) return;
    body.insertAdjacentHTML('beforeend', recvVariantRowHtml());
    if (typeof fillInvColorOptions === 'function') fillInvColorOptions();
}

function resetRecvVariants() {
    const body = document.getElementById('recvVariantBody');
    if (!body) return;
    body.innerHTML = '';
    addRecvVariantRow();
}

function bindRecvVariants() {
    const body = document.getElementById('recvVariantBody');
    const add = document.getElementById('recvAddColor');
    if (!body || body.dataset.bound) return;
    body.dataset.bound = '1';
    resetRecvVariants();
    add?.addEventListener('click', () => addRecvVariantRow());
    body.addEventListener('click', (e) => {
        const btn = e.target.closest('.recv-v-del');
        if (!btn) return;
        btn.closest('tr')?.remove();
        if (!body.querySelector('tr')) addRecvVariantRow();
        if (typeof markRecvAmountAuto === 'function') markRecvAmountAuto();
        if (typeof paintRecvTotals === 'function') paintRecvTotals();
    });
    body.addEventListener('change', (e) => {
        const row = e.target.closest('tr');
        if (row && e.target.classList.contains('recv-v-size') && typeof syncRecvSheetDim === 'function') {
            syncRecvSheetDim(row);
        }
    });
    body.addEventListener('input', (e) => {
        const row = e.target.closest('tr');
        if (row && (e.target.classList.contains('recv-v-thaan') || e.target.classList.contains('recv-v-per'))) {
            recvVariantQtyFromRow(row);
        }
        if (typeof markRecvAmountAuto === 'function') markRecvAmountAuto();
        if (typeof paintRecvTotals === 'function') paintRecvTotals();
    });
    body.addEventListener('focusin', (e) => {
        if (e.target.matches('input[type="number"]') && typeof onRecvZeroFocus === 'function') {
            onRecvZeroFocus(e);
        }
    });
    body.addEventListener('focusout', (e) => {
        if (e.target.matches('input[type="number"]') && typeof onRecvZeroBlur === 'function') {
            onRecvZeroBlur(e);
        }
    });
}
