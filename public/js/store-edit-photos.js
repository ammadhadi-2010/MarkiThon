function storeEditPhotosMarkup() {
    return `
    <section class="os-edit-sec">
        <div class="os-edit-sec-head">
            <span class="os-step">7</span>
            <div>
                <strong>Product Images</strong>
                <p>Add or manage product images for better visibility.</p>
            </div>
        </div>
        <div class="os-photo-row">
            <div id="osEditPhotos" class="os-photo-grid"></div>
            <ul class="os-photo-tips">
                <li>Use high quality images</li>
                <li>Recommended size: 800x800</li>
                <li>Supports JPG, PNG (max 5MB)</li>
            </ul>
        </div>
        <input id="osEditPhotoFile" name="osEditPhotoFile" type="file" accept="image/jpeg,image/png,image/webp" hidden autocomplete="off">
    </section>`;
}

let osEditExtraImages = [];

function osEditPaintSource() {
    return osEditRow || {};
}

function paintOsEditPhotos() {
    const box = document.getElementById('osEditPhotos');
    if (!box) return;
    const mains = typeof osEditImageList === 'function' ? osEditImageList(osEditPaintSource()) : [];
    const extras = osEditExtraImages;
    const mainTiles = mains.map((url, index) =>
        `<div class="os-photo-tile">
            <img src="${escapeHtml(url)}" alt="" onerror="this.style.opacity=0.2">
            ${index === 0 ? '<span class="os-photo-main">Main Image</span>' : ''}
        </div>`
    ).join('');
    const extraTiles = extras.map((url, index) => {
        if (!url || mains.includes(url)) return '';
        return `<div class="os-photo-tile">
            <img src="${escapeHtml(url)}" alt="" onerror="this.style.opacity=0.2">
            <button type="button" class="os-photo-x" data-osrmimg="${index}" aria-label="Remove image">×</button>
        </div>`;
    }).join('');
    box.innerHTML = mainTiles + extraTiles + `<button type="button" class="os-photo-add" data-osaddimg>
        <span>+</span>Add Image
    </button>`;
}

function fillOsEditPhotos(row) {
    osEditExtraImages = Array.isArray(row.storeImages) ? row.storeImages.slice() : [];
    paintOsEditPhotos();
}

function osEditPhotoPayload() {
    return { storeImages: osEditExtraImages.slice() };
}

async function addOsEditPhoto(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image is too large. Use a file under 5 MB.');
        return;
    }
    if (typeof compressInvImage !== 'function') {
        showToast('Image upload is not available.');
        return;
    }
    const dataUrl = await compressInvImage(file);
    osEditExtraImages.push(dataUrl);
    paintOsEditPhotos();
    if (typeof osEditSyncState === 'function') osEditSyncState();
}

function onOsEditPhotoClick(event) {
    const rm = event.target.closest('[data-osrmimg]');
    if (rm) {
        osEditExtraImages.splice(Number(rm.dataset.osrmimg), 1);
        paintOsEditPhotos();
        if (typeof osEditSyncState === 'function') osEditSyncState();
        return;
    }
    if (!event.target.closest('[data-osaddimg]')) return;
    document.getElementById('osEditPhotoFile')?.click();
}
