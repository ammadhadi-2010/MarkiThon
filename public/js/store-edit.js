let osEditRow = null;

function fillOsEditControls(row) {
    const pub = document.getElementById('osEditPub');
    const feat = document.getElementById('osEditFeat');
    const neu = document.getElementById('osEditNew');
    const sale = document.getElementById('osEditSale');
    if (pub) pub.checked = Boolean(row.storePublished);
    if (feat) feat.checked = Boolean(row.storeFeatured);
    if (neu) neu.checked = Boolean(row.storeNewArrival);
    if (sale) sale.checked = Boolean(row.storeSale);
    if (typeof paintOsWebLabels === 'function') paintOsWebLabels();
    if (typeof fillOsEditPrice === 'function') fillOsEditPrice(row);
    if (typeof fillOsEditHomePos === 'function') fillOsEditHomePos(row);
    if (typeof fillOsEditDesc === 'function') fillOsEditDesc(row);
    if (typeof fillOsEditTags === 'function') fillOsEditTags(row);
    if (typeof fillOsEditPolicy === 'function') fillOsEditPolicy(row);
    if (typeof fillOsEditStory === 'function') fillOsEditStory(row);
    if (typeof fillOsEditPhotos === 'function') fillOsEditPhotos(row);
    if (typeof osEditSyncState === 'function') osEditSyncState();
}

function closeOsEdit() {
    if (typeof osClearEditPath === 'function') osClearEditPath();
    if (typeof showView === 'function') showView('store', { storeSec: 'products' });
}

async function fetchOsEditProduct(id) {
    const data = await api.get(`/api/online-store/products/${encodeURIComponent(id)}`);
    if (!data || !data.product) throw new Error('Product not found.');
    return data.product;
}

async function fillOsEditPage(id) {
    const page = document.getElementById('osEditPage');
    if (!page) return;
    page.classList.add('is-loading');
    try {
        const row = await fetchOsEditProduct(id);
        osEditRow = row;
        if (typeof osEditCacheRow === 'function') osEditCacheRow(row);
        page.dataset.id = String(row.id);
        fillOsEditInfo(row);
        fillOsEditControls(row);
        if (typeof fillOsEditStickers === 'function') await fillOsEditStickers(row);
        disableAutofill(page);
    } catch (err) {
        showToast(err.message || 'Could not load product.');
        closeOsEdit();
    } finally {
        page.classList.remove('is-loading');
    }
}

async function openOsEdit(id, opts = {}) {
    if (!opts.skipPath && typeof osPushEditPath === 'function') osPushEditPath(id);
    if (typeof showView === 'function') {
        showView('store', { storeSec: 'edit', skipRefresh: true });
    }
    await fillOsEditPage(id);
}

function onOsEditFormChange(event) {
    if (event.target.closest('.os-web-row') && typeof paintOsWebLabels === 'function') {
        paintOsWebLabels();
    }
    if (typeof osEditSyncState === 'function') osEditSyncState();
}

function onOsEditFormInput(event) {
    if (event.target.id === 'osEditShort' && typeof paintOsEditCounts === 'function') {
        paintOsEditCounts();
    }
    if (event.target.id === 'osEditOnline' || event.target.id === 'osEditDiscount') {
        if (typeof paintOsEditPct === 'function') paintOsEditPct();
    }
    if (typeof osEditSyncState === 'function') osEditSyncState();
}

function bindOsEdit() {
    const page = document.getElementById('osEditPage');
    const form = document.getElementById('osEditForm');
    if (!page || !form || page.dataset.bound) return;
    page.dataset.bound = '1';
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (typeof saveOsEdit === 'function') saveOsEdit();
    });
    page.addEventListener('click', (event) => {
        if (event.target.closest('[data-oseditclose]')) closeOsEdit();
        if (event.target.closest('[data-oseditsave]')) {
            if (typeof saveOsEdit === 'function') saveOsEdit();
        }
        onOsEditThumbClick(event);
        if (typeof onOsEditFmt === 'function') onOsEditFmt(event);
        if (typeof onOsEditPhotoClick === 'function') onOsEditPhotoClick(event);
        if (typeof onOsEditTagClick === 'function') onOsEditTagClick(event);
        if (typeof onOsEditStickerClick === 'function') onOsEditStickerClick(event);
    });
    page.addEventListener('keydown', (event) => {
        if (typeof onOsEditTagKey === 'function') onOsEditTagKey(event);
        if (typeof onOsEditStickerKey === 'function') onOsEditStickerKey(event);
    });
    page.addEventListener('focusout', (event) => {
        if (typeof onOsEditTagBlur === 'function') onOsEditTagBlur(event);
        if (typeof osEditSyncState === 'function') osEditSyncState();
    });
    page.addEventListener('input', onOsEditFormInput);
    page.addEventListener('change', onOsEditFormChange);
    document.getElementById('osEditFull')?.addEventListener('input', () => {
        if (typeof paintOsEditCounts === 'function') paintOsEditCounts();
        if (typeof osEditSyncState === 'function') osEditSyncState();
    });
    document.getElementById('osEditPhotoFile')?.addEventListener('change', (event) => {
        const file = event.target.files && event.target.files[0];
        event.target.value = '';
        if (file && typeof addOsEditPhoto === 'function') {
            addOsEditPhoto(file).catch((err) => showToast(err.message));
        }
    });
    document.getElementById('osStickerFile')?.addEventListener('change', (event) => {
        if (typeof onOsStickerFileChange === 'function') {
            onOsStickerFileChange(event).catch((err) => showToast(err.message));
        }
    });
    if (typeof bindOsEditRoute === 'function') bindOsEditRoute();
}
