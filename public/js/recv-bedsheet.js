const RECV_FABRIC_BUY = ['Meter', 'Gaz', 'Suit', 'Piece'];
const RECV_SHEET_BUY = ['Set', 'Piece'];
const RECV_SHEET_SELL = ['Piece', 'Set'];
const RECV_SHEET_SIZES = [
    'Single (60 x 95 in)',
    'King (95 x 99 in)',
    'Super King',
    'Custom'
];
const RECV_SHEET_DIM = {
    'Single (60 x 95 in)': '60 x 95 in',
    'King (95 x 99 in)': '95 x 99 in'
};

function isRecvBedsheet(product) {
    const p = product || (typeof recvProduct !== 'undefined' ? recvProduct : null);
    if (!p) return false;
    if (typeof isBedsheetProduct === 'function') return isBedsheetProduct(p);
    return String(p.category || '').toLowerCase() === 'bedsheet';
}

function recvSheetSellValue(value) {
    return /set/i.test(String(value || '')) ? 'Set' : 'Piece';
}

function fillRecvSelect(el, names, selected, enabled) {
    if (!el) return;
    const keep = names.includes(selected) ? selected : names[0];
    el.innerHTML = names.map((name) => `<option>${name}</option>`).join('');
    el.disabled = enabled === false;
    el.value = keep;
}

function recvSheetDefaults() {
    const p = (typeof recvProduct !== 'undefined' && recvProduct) || {};
    const picked = RECV_SHEET_SIZES.includes(p.bedsheetSize)
        ? p.bedsheetSize
        : 'King (95 x 99 in)';
    return {
        size: picked,
        dim: p.bedsheetDimensions || RECV_SHEET_DIM[picked] || '',
        weight: Number(p.bedsheetWeight) > 0 ? String(p.bedsheetWeight) : '',
        wunit: /kg/i.test(String(p.bedsheetWeightUnit || '')) ? 'kg' : 'gm'
    };
}

function recvSheetSizeOptions(selected) {
    return RECV_SHEET_SIZES.map((name) =>
        `<option${name === selected ? ' selected' : ''}>${name}</option>`
    ).join('');
}

function recvSheetRowHtml(row) {
    const d = Object.assign(recvSheetDefaults(), row || {});
    const locked = Boolean(RECV_SHEET_DIM[d.size]);
    const dim = locked ? RECV_SHEET_DIM[d.size] : (d.dim || d.dimensions || '');
    const wunit = /kg/i.test(String(d.weightUnit || d.wunit || '')) ? 'kg' : 'gm';
    const weight = Number(d.weight) > 0 ? d.weight : '';
    const qty = Number(d.qty) > 0 ? d.qty : '';
    return `<tr class="recv-sheet-row">
        <td>${typeof recvColorSelectHtml === 'function' ? recvColorSelectHtml(d.color) : `<select class="recv-v-color" name="recvColorName" autocomplete="off"><option>Navy Blue</option></select>`}</td>
        <td><div class="recv-w-cell">
            <input class="recv-v-weight" name="recvColorWeight" type="number" min="0" step="0.01" placeholder="0" autocomplete="off" value="${weight}">
            <select class="recv-v-wunit" name="recvColorWunit" autocomplete="off">
                <option value="gm"${wunit === 'gm' ? ' selected' : ''}>gm</option>
                <option value="kg"${wunit === 'kg' ? ' selected' : ''}>kg</option>
            </select>
        </div></td>
        <td><div class="recv-size-cell">
            <select class="recv-v-size" name="recvColorSize" autocomplete="off">${recvSheetSizeOptions(d.size)}</select>
            <input class="recv-v-dim" name="recvColorDim" placeholder="60 x 95 in" autocomplete="off" value="${typeof escapeHtml === 'function' ? escapeHtml(dim) : dim}"${locked ? ' readonly' : ''}>
        </div></td>
        <td><input class="recv-v-qty" name="recvColorQty" type="number" min="0" step="1" placeholder="0" autocomplete="off" value="${qty}"></td>
        <td><button type="button" class="ghost recv-v-del" title="Delete" aria-label="Delete">🗑</button></td>
    </tr>`;
}

function syncRecvSheetDim(row) {
    const size = row.querySelector('.recv-v-size');
    const dim = row.querySelector('.recv-v-dim');
    if (!size || !dim) return;
    const locked = RECV_SHEET_DIM[size.value];
    if (locked) {
        dim.value = locked;
        dim.readOnly = true;
        return;
    }
    dim.readOnly = false;
}

function paintRecvVariantHead() {
    const sheet = isRecvBedsheet();
    const h1 = document.getElementById('recvHeadCol1');
    const h2 = document.getElementById('recvHeadCol2');
    const h3 = document.getElementById('recvHeadCol3');
    const h4 = document.getElementById('recvHeadCol4');
    if (h1) h1.textContent = 'Color Name';
    if (h2) h2.textContent = sheet ? 'Weight (gm / kg)' : 'Thaan';
    if (h3) h3.textContent = sheet ? 'Size (Preset / Dimensions)' : 'Length / Meters';
    if (h4) h4.textContent = sheet ? 'Quantity (Sets/Pieces)' : 'Total Qty';
    const thaan = document.getElementById('recvTotThaan');
    const avg = document.getElementById('recvTotAvg');
    if (thaan) thaan.textContent = sheet ? '' : (thaan.textContent || '0');
    if (avg) avg.textContent = sheet ? '' : (avg.textContent || '0');
}

function applyRecvBedsheetMode() {
    if (typeof isRecvBlanket === 'function' && isRecvBlanket()) return;
    const sheet = isRecvBedsheet();
    const buy = document.getElementById('recvBuyUnit');
    const sell = document.getElementById('recvSellUnit');
    const badge = document.getElementById('recvConvert');
    const meta = document.getElementById('recvMeta');
    if (sheet) {
        fillRecvSelect(buy, RECV_SHEET_BUY, 'Set', true);
        fillRecvSelect(sell, RECV_SHEET_SELL, recvSheetSellValue(recvProduct && recvProduct.sellUnit), true);
        if (badge) badge.hidden = false;
        if (meta) {
            meta.hidden = true;
            meta.textContent = '';
        }
    } else {
        const sellName = (recvProduct && recvProduct.sellUnit) || 'Gaz';
        fillRecvSelect(buy, RECV_FABRIC_BUY, mapStockUnit(recvProduct && recvProduct.stockUnit), true);
        fillRecvSelect(sell, [sellName], sellName, false);
        if (badge) badge.hidden = false;
    }
    paintRecvVariantHead();
    const body = document.getElementById('recvVariantBody');
    if (!body) return;
    const next = sheet ? 'sheet' : 'fabric';
    if (body.dataset.mode !== next) {
        body.dataset.mode = next;
        if (typeof resetRecvVariants === 'function') resetRecvVariants();
    }
}

function collectRecvSheetFields(row) {
    return {
        weight: Number(row.querySelector('.recv-v-weight')?.value) || 0,
        weightUnit: row.querySelector('.recv-v-wunit')?.value || 'gm',
        size: String(row.querySelector('.recv-v-size')?.value || '').trim(),
        dimensions: String(row.querySelector('.recv-v-dim')?.value || '').trim()
    };
}
