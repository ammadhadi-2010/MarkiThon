async function loadStoreBanner() {
    try {
        const row = await api.get('/api/online-store/banner');
        await fillOsBannerCats(row.ctaLink);
        fillOsBanner(row);
    } catch (error) {
        fillOsBanner({});
        showToast(error.message);
    }
}

async function saveStoreBanner() {
    const btn = document.getElementById('osBannerSave');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Saving...';
    }
    try {
        const saved = await api.put('/api/online-store/banner', osBannerRead());
        fillOsBanner(saved);
        showToast('Banner settings saved.');
    } catch (error) {
        showToast(error.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Save Banner Settings';
        }
    }
}

async function clearOsBannerImage() {
    const current = String(document.getElementById('osBannerImage')?.value || '');
    if (!current) return showToast('No banner image to remove.');
    const ok = await openConfirmDelete({
        title: 'Remove Banner Image',
        detail: 'Promotional banner image',
        yesLabel: 'Remove Image'
    });
    if (!ok) return;
    document.getElementById('osBannerImage').value = '';
    const file = document.getElementById('osBannerFile');
    if (file) file.value = '';
    paintOsBannerPreview();
}

function bindStoreBanner() {
    const card = document.getElementById('osBannerCard');
    if (!card || card.dataset.bound) return;
    card.dataset.bound = '1';
    bindOsBannerUpload();
    card.addEventListener('input', paintOsBannerPreview);
    card.addEventListener('change', paintOsBannerPreview);
    document.getElementById('osBannerSave')?.addEventListener('click', () => {
        saveStoreBanner().catch((err) => showToast(err.message));
    });
    document.getElementById('osBannerClear')?.addEventListener('click', () => {
        clearOsBannerImage().catch((err) => showToast(err.message));
    });
}
