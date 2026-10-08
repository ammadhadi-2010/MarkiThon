let productsCache = [];
let invSaving = false;
const INV_TABS = ['basic', 'images'];

function setInvSaveBusy(on) {
    invSaving = Boolean(on);
    const btn = document.getElementById('invSave');
    if (!btn) return;
    btn.disabled = invSaving;
    btn.classList.toggle('is-busy', invSaving);
    btn.setAttribute('aria-busy', invSaving ? 'true' : 'false');
    const label = btn.querySelector('.inv-save-label');
    if (label) label.textContent = invSaving ? 'Saving...' : 'Save Catalog Product';
}

function paintInvConvert() {
    const sell = document.getElementById('invSellUnit');
    const conv = document.getElementById('invConvert');
    const hint = document.getElementById('invConvertHint');
    if (!sell || !conv || !hint) return;
    const n = Number(conv.value) || 0;
    hint.textContent = `1 ${sell.value} = ${n} Meter. Stock In receives in Meter. POS sells in ${sell.value}.`;
}

function setInvTab(name) {
    document.querySelectorAll('#view-inventory .tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('#view-inventory .panel').forEach((p) => p.classList.toggle('active', p.dataset.panel === name));
}

function nextInvTab() {
    const current = document.querySelector('#catalogWrap .tab.active');
    const idx = INV_TABS.indexOf(current?.dataset.tab);
    setInvTab(INV_TABS[Math.min(Math.max(idx, 0) + 1, INV_TABS.length - 1)]);
}

function previewImage() {
    const url = document.getElementById('invImageUrl').value;
    const img = document.getElementById('invPreview');
    const hint = document.getElementById('invImageHint');
    if (url) {
        img.src = url;
        img.hidden = false;
        hint.hidden = true;
    } else {
        img.hidden = true;
        hint.hidden = false;
    }
}

function resetInvForm() {
    document.getElementById('invForm').reset();
    document.getElementById('invEditId').value = '';
    document.getElementById('invOpening').value = 0;
    const minRate = document.getElementById('invMinRate');
    if (minRate) minRate.value = '';
    document.getElementById('invOpeningWrap').hidden = false;
    document.getElementById('invOnHand').hidden = true;
    document.getElementById('invOnHand').textContent = 'On-hand: 0';
    previewImage();
    setInvTab('basic');
    fillInvCategoryOptions();
    fillInvSupplierOptions('');
    if (typeof applyInvBedsheetMode === 'function') applyInvBedsheetMode();
    if (typeof applyInvBlanketMode === 'function') applyInvBlanketMode();
    if (typeof applyInvMobileMode === 'function') applyInvMobileMode();
    const sell = document.getElementById('invSellUnit');
    const conv = document.getElementById('invConvert');
    const hardware = typeof isInvMobile === 'function' && isInvMobile();
    if (!hardware && sell) sell.value = 'Gaz';
    if (conv) conv.value = hardware ? 1 : (typeof defaultMetersForSell === 'function' ? defaultMetersForSell('Gaz') : 0.9144);
    paintInvConvert();
}

function invPayload() {
    return {
        title: document.getElementById('invTitle').value,
        brand: document.getElementById('invBrand').value,
        category: document.getElementById('invCategory').value,
        subCategory: document.getElementById('invSubCategory').value,
        fabricType: document.getElementById('invFabricType').value,
        barcode: document.getElementById('invBarcode').value,
        sku: document.getElementById('invSku').value,
        imageUrl: document.getElementById('invImageUrl').value,
        stockUnit: document.getElementById('invUnit').value,
        sellUnit: document.getElementById('invSellUnit').value,
        metersPerSellUnit: document.getElementById('invConvert').value,
        supplierId: document.getElementById('invSupplierId').value,
        openingStock: document.getElementById('invOpening').value,
        minSellingRate: document.getElementById('invMinRate')?.value || 0,
        ...(typeof invMobilePayload === 'function' ? invMobilePayload() : {}),
        ...(typeof invBedsheetPayload === 'function' ? invBedsheetPayload() : {}),
        ...(typeof invBlanketPayload === 'function' ? invBlanketPayload() : {})
    };
}

function fillInvForm(p) {
    document.getElementById('invEditId').value = p.id;
    document.getElementById('invTitle').value = p.title || '';
    document.getElementById('invBrand').value = p.brand || '';
    fillInvCategoryOptions(p.category || 'Lawn');
    if (typeof fillInvBedsheetFields === 'function') fillInvBedsheetFields(p);
    if (typeof fillInvBlanketFields === 'function') fillInvBlanketFields(p);
    if (typeof applyInvBedsheetMode === 'function') applyInvBedsheetMode();
    if (typeof applyInvBlanketMode === 'function') applyInvBlanketMode();
    document.getElementById('invSubCategory').value = p.subCategory || '';
    document.getElementById('invFabricType').value = p.fabricType || '';
    document.getElementById('invBarcode').value = p.barcode || '';
    document.getElementById('invSku').value = p.sku || '';
    document.getElementById('invImageUrl').value = p.imageUrl || '';
    document.getElementById('invUnit').value = p.stockUnit === 'Than' ? 'Thaan' : (p.stockUnit || 'Meter');
    const sell = document.getElementById('invSellUnit');
    const conv = document.getElementById('invConvert');
    if (sell) sell.value = p.sellUnit || 'Gaz';
    if (conv) conv.value = Number(p.metersPerSellUnit) > 0 ? p.metersPerSellUnit : (typeof defaultMetersForSell === 'function' ? defaultMetersForSell(sell.value) : 0.9144);
    if (typeof isInvBedsheet === 'function' && isInvBedsheet()) {
        const sheetUnit = /set/i.test(String(p.stockUnit || p.sellUnit || '')) ? 'Set' : 'Pieces';
        document.getElementById('invUnit').value = sheetUnit;
        if (sell) sell.value = /set/i.test(String(p.sellUnit || '')) ? 'Set' : sheetUnit;
        if (conv) conv.value = 1;
    }
    if (typeof isInvBlanket === 'function' && isInvBlanket()) {
        const unit = /carton/i.test(String(p.stockUnit || '')) ? 'Carton'
            : (/bag/i.test(String(p.stockUnit || '')) ? 'Bag' : 'Piece');
        document.getElementById('invUnit').value = unit;
        if (sell) sell.value = unit;
        if (conv) conv.value = 1;
    }
    if (typeof fillInvMobileFields === 'function') fillInvMobileFields(p);
    paintInvConvert();
    document.getElementById('invOpeningWrap').hidden = true;
    document.getElementById('invOnHand').hidden = false;
    document.getElementById('invOnHand').textContent =
        `On-hand: ${Number(p.stockMeters) || 0} ${(typeof isInvMobile === 'function' && isInvMobile()) ? (document.getElementById('invUnit').value || 'Pcs') : (p.stockUnit || 'Meter')} (add stock in Stock Movement → Stock In)`;
    const minRate = document.getElementById('invMinRate');
    if (minRate) minRate.value = Number(p.minSellingRate) > 0 ? String(p.minSellingRate) : '';
    fillInvSupplierOptions(p.supplierId || '');
    previewImage();
    showView('inventory');
}

function catalogIdentityRows() {
    const seen = new Set();
    const groups = [];
    (productsCache || []).forEach((p) => {
        const key = String(p.title || '').trim().toLowerCase();
        if (!key || seen.has(key)) return;
        seen.add(key);
        const pack = productsCache.filter((x) => String(x.title || '').trim().toLowerCase() === key);
        const base = pack.find((x) => !x.color) || pack[0];
        const stock = pack.reduce((s, x) => s + (Number(x.stockMeters) || 0), 0);
        groups.push({ ...base, stockMeters: stock });
    });
    return groups;
}

function renderProducts() {
    const tbody = document.getElementById('invTable');
    tbody.innerHTML = catalogIdentityRows().map((p) => `
        <tr>
            <td class="prod-cell">
                <img class="thumb" src="${escapeHtml(p.imageUrl || '')}" alt="" onerror="this.style.opacity=0.2">
                <span>${escapeHtml(p.title)}<span class="sku">${escapeHtml([p.brand, typeof blanketSpecLabel === 'function' ? blanketSpecLabel(p) : '', typeof bedsheetSpecLabel === 'function' ? bedsheetSpecLabel(p) : ''].filter(Boolean).join(' · ') || '')}</span></span>
            </td>
            <td>${escapeHtml(p.sku || '-')}</td>
            <td>${p.stockMeters} ${escapeHtml(p.stockUnit || 'm')}</td>
            <td>${escapeHtml(p.stockUnit === 'Than' ? 'Thaan' : (p.stockUnit || 'Meter'))}</td>
            <td class="col-actions">${actionMenuHtml(p.id, '', { history: true, share: true })} <button type="button" class="rpt-btn" data-report="product" data-role="Shopkeeper" data-target="${escapeHtml(p.title)}">Report to Admin</button></td>
        </tr>`).join('');
}

async function loadProducts() {
    if (typeof loadInvShopCategories === 'function') await loadInvShopCategories();
    productsCache = await offlineLoadProducts();
    if (!Array.isArray(productsCache)) productsCache = [];
    renderProducts();
    if (typeof fillInvSupplierOptions === 'function') fillInvSupplierOptions();
    if (typeof fillInvBrandOptions === 'function') fillInvBrandOptions();
    if (typeof fillInvColorOptions === 'function') fillInvColorOptions();
}

async function openProductHistory(productId) {
    showView('stock', { skipRefresh: true });
    if (typeof setStockTab === 'function') setStockTab('history');
    if (typeof loadProducts === 'function') await loadProducts();
    if (typeof fillStockProducts === 'function') fillStockProducts();
    const select = document.getElementById('stProduct');
    if (select) select.value = productId;
    if (typeof loadProductHistory === 'function') await loadProductHistory(productId);
}

async function saveProduct(event) {
    event.preventDefault();
    if (invSaving) return;
    const form = document.getElementById('invForm');
    setInvTab('basic');
    if (form && !form.checkValidity()) {
        form.reportValidity();
        return;
    }
    const id = document.getElementById('invEditId').value;
    setInvSaveBusy(true);
    try {
        const payload = invPayload();
        const data = await offlineSaveProduct(id, payload);
        showToast(data.message);
        resetInvForm();
        await loadProducts();
    } catch (error) {
        showToast(error.message);
    } finally {
        setInvSaveBusy(false);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('view-inventory');
    root.innerHTML = inventoryMarkup();
    disableAutofill(root);
    root.querySelectorAll('#catalogWrap .tab').forEach((tab) => tab.addEventListener('click', () => setInvTab(tab.dataset.tab)));
    document.getElementById('invNext').addEventListener('click', nextInvTab);
    document.getElementById('invCancel').addEventListener('click', resetInvForm);
    document.getElementById('invSave').addEventListener('click', () => setInvTab('basic'));
    document.getElementById('invForm').addEventListener('invalid', () => setInvTab('basic'), true);
    document.getElementById('invForm').addEventListener('submit', saveProduct);
    if (typeof bindInvBedsheet === 'function') bindInvBedsheet();
    if (typeof bindInvBlanket === 'function') bindInvBlanket();
    if (typeof bindInvMobile === 'function') bindInvMobile();
    document.getElementById('invSellUnit').addEventListener('change', () => {
        const sheet = typeof isInvBedsheet === 'function' && isInvBedsheet();
        const blanket = typeof isInvBlanket === 'function' && isInvBlanket();
        const hardware = typeof isInvMobile === 'function' && isInvMobile();
        document.getElementById('invConvert').value = (sheet || blanket || hardware)
            ? 1
            : defaultMetersForSell(document.getElementById('invSellUnit').value);
        paintInvConvert();
    });
    document.getElementById('invConvert').addEventListener('input', paintInvConvert);
    document.getElementById('invImageUrl').addEventListener('input', previewImage);
    if (typeof bindInvImageCompress === 'function') bindInvImageCompress();
    document.getElementById('invTable').addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        const product = productsCache.find((p) => String(p.id) === String(btn.dataset.id));
        if (btn.dataset.act === 'share' && product) {
            openShareModal(product).catch((error) => showToast(error.message));
        }
        if (btn.dataset.act === 'edit' && product) fillInvForm(product);
        if (btn.dataset.act === 'history') {
            openProductHistory(btn.dataset.id).catch((error) => showToast(error.message));
        }
        if (btn.dataset.act === 'delete') {
            deleteInvProduct(product).catch((error) => showToast(error.message));
        }
    });
    if (typeof bindInventoryShare === 'function') bindInventoryShare();
    if (typeof bindInventorySupplier === 'function') bindInventorySupplier();
    if (typeof bindInvAddSupplier === 'function') bindInvAddSupplier();
    paintInvConvert();
    loadProducts().catch((error) => showToast(error.message));
});
