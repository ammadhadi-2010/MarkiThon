function formatOsWhatsapp(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('92') && digits.length > 10) digits = '0' + digits.slice(2);
    digits = digits.slice(0, 11);
    if (digits.length <= 4) return digits;
    return digits.slice(0, 4) + '-' + digits.slice(4);
}

function osBrandRead() {
    return {
        logoUrl: String(document.getElementById('osLogoUrl')?.value || ''),
        coverUrl: String(document.getElementById('osCoverUrl')?.value || ''),
        whatsappNumber: formatOsWhatsapp(document.getElementById('osWhatsapp')?.value || ''),
        shopDescription: String(document.getElementById('osShopBio')?.value || '').trim()
    };
}

function fillOsBrand(row) {
    const data = row || {};
    paintOsDrop('logo', data.logoUrl || '');
    paintOsDrop('cover', data.coverUrl || '');
    const wa = document.getElementById('osWhatsapp');
    const bio = document.getElementById('osShopBio');
    if (wa) wa.value = formatOsWhatsapp(data.whatsappNumber || '');
    if (bio) bio.value = String(data.shopDescription || '');
}

async function loadStoreBrand() {
    try {
        fillOsBrand(await api.get('/api/online-store/branding'));
    } catch (error) {
        fillOsBrand({});
        showToast(error.message);
    }
}

async function saveStoreBrand() {
    const btn = document.getElementById('osBrandSave');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Saving...';
    }
    try {
        const data = await api.put('/api/online-store/branding', osBrandRead());
        fillOsBrand(data.branding || osBrandRead());
        showToast(data.message || 'Store branding saved.');
    } catch (error) {
        showToast(error.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Save Store Branding';
        }
    }
}

function bindStoreBrand() {
    const card = document.getElementById('osBrandCard');
    if (!card || card.dataset.bound) return;
    card.dataset.bound = '1';
    bindOsDrop('logo');
    bindOsDrop('cover');
    document.getElementById('osWhatsapp')?.addEventListener('input', (event) => {
        event.target.value = formatOsWhatsapp(event.target.value);
    });
    document.getElementById('osBrandSave')?.addEventListener('click', () => {
        saveStoreBrand().catch((err) => showToast(err.message));
    });
}
