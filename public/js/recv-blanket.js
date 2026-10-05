const RECV_BLANKET_UNITS = ['Piece', 'Bag', 'Carton'];
const RECV_BLANKET_PLY = ['Single Ply', 'Double Ply', 'Heavy Double Ply'];
const RECV_BLANKET_SIZES = ['Single Bed', 'Double Bed', 'King Size', 'Baby Blanket'];

function isRecvBlanket(product) {
    const p = product || (typeof recvProduct !== 'undefined' ? recvProduct : null);
    if (!p) return false;
    if (typeof isBlanketProduct === 'function') return isBlanketProduct(p);
    const cat = String(p.category || '').toLowerCase();
    return cat.includes('blanket') || cat.includes('kambal');
}

function recvBlanketDefaults() {
    const p = (typeof recvProduct !== 'undefined' && recvProduct) || {};
    return {
        ply: RECV_BLANKET_PLY.includes(p.blanketPly) ? p.blanketPly : 'Double Ply',
        size: RECV_BLANKET_SIZES.includes(p.blanketSize) ? p.blanketSize : 'King Size',
        weight: Number(p.blanketWeight) > 0 ? String(p.blanketWeight) : ''
    };
}

function recvBlanketEsc(text) {
    return typeof escapeHtml === 'function' ? escapeHtml(text) : String(text || '');
}

function recvBlanketRowHtml(row) {
    const d = Object.assign(recvBlanketDefaults(), row || {});
    const qty = Number(d.qty) > 0 ? d.qty : '';
    const weight = Number(d.weight) > 0 ? d.weight : '';
    const ply = d.ply || d.blanketPly || recvBlanketDefaults().ply;
    const size = d.size || d.blanketSize || recvBlanketDefaults().size;
    return `<tr class="recv-blanket-row">
        <td>${typeof recvColorSelectHtml === 'function' ? recvColorSelectHtml(d.color) : ''}</td>
        <td>
            <span class="sku">${recvBlanketEsc(ply)} - ${recvBlanketEsc(size)}</span>
            <input class="recv-v-ply" name="recvBlanketPly" type="hidden" value="${recvBlanketEsc(ply)}" autocomplete="off">
            <input class="recv-v-size" name="recvBlanketSize" type="hidden" value="${recvBlanketEsc(size)}" autocomplete="off">
        </td>
        <td><input class="recv-v-weight" name="recvBlanketWeight" type="number" min="0.1" step="0.1" placeholder="4.5" autocomplete="off" value="${weight}"></td>
        <td><input class="recv-v-qty" name="recvColorQty" type="number" min="0" step="1" placeholder="0" autocomplete="off" value="${qty}"></td>
        <td><button type="button" class="ghost recv-v-del" title="Delete" aria-label="Delete">🗑</button></td>
    </tr>`;
}

function collectRecvBlanketFields(row) {
    const locked = recvBlanketDefaults();
    return {
        ply: locked.ply,
        size: locked.size,
        weight: Number(row.querySelector('.recv-v-weight')?.value) || 0,
        weightUnit: 'kg'
    };
}

function paintRecvBlanketHead() {
    const h1 = document.getElementById('recvHeadCol1');
    const h2 = document.getElementById('recvHeadCol2');
    const h3 = document.getElementById('recvHeadCol3');
    const h4 = document.getElementById('recvHeadCol4');
    if (h1) h1.textContent = 'Color / Design Name';
    if (h2) h2.textContent = 'Ply & Size';
    if (h3) h3.textContent = 'Weight (kg)';
    if (h4) h4.textContent = 'Quantity (Pieces)';
    const thaan = document.getElementById('recvTotThaan');
    const avg = document.getElementById('recvTotAvg');
    if (thaan) thaan.textContent = '';
    if (avg) avg.textContent = '';
}

function applyRecvBlanketMode() {
    if (!isRecvBlanket()) return;
    const buy = document.getElementById('recvBuyUnit');
    const sell = document.getElementById('recvSellUnit');
    const meta = document.getElementById('recvMeta');
    const keep = (recvProduct && recvProduct.stockUnit) || 'Piece';
    if (typeof fillRecvSelect === 'function') {
        fillRecvSelect(buy, RECV_BLANKET_UNITS, keep, true);
        fillRecvSelect(sell, RECV_BLANKET_UNITS, (recvProduct && recvProduct.sellUnit) || keep, true);
    }
    if (meta) {
        meta.hidden = true;
        meta.textContent = '';
    }
    paintRecvBlanketHead();
    const body = document.getElementById('recvVariantBody');
    if (!body) return;
    const lock = `${recvBlanketDefaults().ply}|${recvBlanketDefaults().size}`;
    if (body.dataset.mode !== 'blanket' || body.dataset.blanketLock !== lock) {
        body.dataset.mode = 'blanket';
        body.dataset.blanketLock = lock;
        if (typeof resetRecvVariants === 'function') resetRecvVariants();
    }
}
