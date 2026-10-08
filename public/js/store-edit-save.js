let osEditState = {};
let osEditSaving = false;

function osEditBuildPayload() {
    const extra = typeof osEditDescPayload === 'function' ? osEditDescPayload() : {};
    const tags = typeof osEditTagPayload === 'function' ? osEditTagPayload() : {};
    const home = typeof osEditHomePayload === 'function' ? osEditHomePayload() : {};
    const photos = typeof osEditPhotoPayload === 'function' ? osEditPhotoPayload() : {};
    const policy = typeof osEditPolicyPayload === 'function' ? osEditPolicyPayload() : {};
    const story = typeof osEditStoryPayload === 'function' ? osEditStoryPayload() : {};
    return {
        storeOnlinePrice: Number(document.getElementById('osEditOnline')?.value || 0),
        storeDiscountPrice: Number(document.getElementById('osEditDiscount')?.value || 0),
        wholesalePrice: Number(document.getElementById('osEditWholesale')?.value || 0),
        minWholesaleQty: Math.max(1, Number(document.getElementById('osEditMoq')?.value || 10)),
        storePublished: Boolean(document.getElementById('osEditPub')?.checked),
        storeFeatured: Boolean(document.getElementById('osEditFeat')?.checked),
        storeNewArrival: Boolean(document.getElementById('osEditNew')?.checked),
        storeSale: Boolean(document.getElementById('osEditSale')?.checked),
        ...home,
        ...extra,
        ...tags,
        ...photos,
        ...policy,
        ...story
    };
}

function osEditSyncState() {
    osEditState = osEditBuildPayload();
    return osEditState;
}

function osEditValidate(body) {
    if (!String(body.storeTitle || '').trim()) return 'Product title is required.';
    if (!String(body.storeShortDescription || '').trim()) {
        return 'Short description is required.';
    }
    if (!(Number(body.storeOnlinePrice) > 0)) return 'Online selling price is required.';
    if (typeof osEditFullText === 'function' && osEditFullText().length > 1000) {
        return 'Full description must be 1000 characters or less.';
    }
    return '';
}

function osEditSetBusy(on) {
    osEditSaving = Boolean(on);
    const page = document.getElementById('osEditPage');
    if (page) page.classList.toggle('is-saving', osEditSaving);
    document.querySelectorAll('[data-oseditsave]').forEach((btn) => {
        btn.disabled = osEditSaving;
        btn.classList.toggle('is-busy', osEditSaving);
        btn.setAttribute('aria-busy', osEditSaving ? 'true' : 'false');
    });
}

function osEditCacheRow(row) {
    if (!row || !row.id) return;
    const list = Array.isArray(osProducts) ? osProducts : [];
    const next = list.some((p) => String(p.id) === String(row.id))
        ? list.map((p) => String(p.id) === String(row.id) ? row : p)
        : list.concat(row);
    osProducts = next;
}

async function saveOsEdit() {
    const page = document.getElementById('osEditPage');
    const id = page && page.dataset.id;
    if (!id || osEditSaving) return;
    if (typeof onOsEditTagBlur === 'function') {
        const add = document.getElementById('osEditTagAdd');
        if (add && add.value.trim()) onOsEditTagBlur({ target: add });
    }
    const body = osEditSyncState();
    const error = osEditValidate(body);
    if (error) {
        showToast(error);
        return;
    }
    osEditSetBusy(true);
    try {
        const stickers = typeof osEditStickerPayload === 'function'
            ? await osEditStickerPayload()
            : {};
        const data = await api.put(
            `/api/online-store/products/${encodeURIComponent(id)}`,
            { ...body, ...stickers }
        );
        if (data.product) osEditCacheRow(data.product);
        showToast(data.message || 'Product updated.');
        osEditSetBusy(false);
        closeOsEdit();
    } catch (err) {
        osEditSetBusy(false);
        showToast(err.message || 'Could not save product.');
    }
}
