function digitalPayload() {
    const maps = document.getElementById('obMapsLink').value.trim();
    const lat = document.getElementById('obLatitude').value.trim();
    const lng = document.getElementById('obLongitude').value.trim();
    const wa = document.getElementById('obOrderWhatsapp');
    const phone = document.getElementById('obPhoneNumber');
    return {
        websiteUrl: typeof liveStoreUrl === 'function'
            ? liveStoreUrl()
            : document.getElementById('obWebsiteUrl').value.trim(),
        whatsappNumber: ((wa && wa.value) || (phone && phone.value) || '').trim(),
        facebookPage: document.getElementById('obFacebook').value.trim(),
        instagramHandle: document.getElementById('obInstagram').value.trim(),
        youtubeChannel: document.getElementById('obYoutube').value.trim(),
        storeLocation: maps || (lat && lng ? 'https://maps.google.com/maps?q=' + lat + ',' + lng : ''),
        latitude: lat,
        longitude: lng,
        marketPosition: document.getElementById('obMarketPosition').value,
        landmarkNote: document.getElementById('obLandmarkNote').value.trim(),
        acceptedTerms: document.getElementById('obTerms').checked
    };
}

function markSocialFilled() {
    document.querySelectorAll('.ob-social').forEach((row) => {
        const input = row.querySelector('input');
        row.classList.toggle('filled', Boolean(input && input.value.trim()));
    });
}

function typeSummary() {
    const shop = String(typeof obShopType === 'string' ? obShopType : 'Fabric Shop').replace(' Shop', '');
    if (typeof obBusinessType === 'string' && obBusinessType === 'Both') {
        return shop + ' + Wholesale + Retail';
    }
    return shop + ' + ' + (obBusinessType || 'Retail');
}

function paintSetupSummary() {
    const name = document.getElementById('obShopName');
    document.getElementById('obSumName').textContent = (name && name.value) || 'Ammad Hadi Stor';
    document.getElementById('obSumType').textContent = typeSummary();
    const pack = document.getElementById('obSelectedPackage');
    document.getElementById('obSumPackage').textContent = (pack && pack.value) || 'Business';
    paintLiveStoreLink();
}

function shopSlugFromName(name) {
    return String(name || 'Ammad Hadi Stor').toLowerCase().replace(/[^a-z0-9]+/g, '') || 'ammadhadistor';
}

function paintLiveStoreLink() {
    const slug = shopSlugFromName(document.getElementById('obShopName') && document.getElementById('obShopName').value);
    const canonical = typeof liveStoreUrl === 'function' ? liveStoreUrl() : ('https://markithon.com/' + slug);
    const el = document.getElementById('obStoreLink');
    if (el) el.value = canonical;
    const site = document.getElementById('obWebsiteUrl');
    if (site) site.value = canonical;
    const open = document.getElementById('obOpenStore');
    if (open) open.setAttribute('href', '/' + slug);
    if (typeof paintObStoreQr === 'function') paintObStoreQr();
    if (typeof markSocialFilled === 'function') markSocialFilled();
}

async function copyLiveStoreLink() {
    const el = document.getElementById('obStoreLink');
    if (!el || !el.value) return;
    await navigator.clipboard.writeText(el.value);
    showToast('Store link copied.');
}

function fillDigital(row) {
    if (!document.getElementById('obWebsiteUrl')) return;
    document.getElementById('obFacebook').value = row.facebookPage || '';
    document.getElementById('obInstagram').value = row.instagramHandle || '';
    document.getElementById('obYoutube').value = row.youtubeChannel || '';
    document.getElementById('obMarketPosition').value = row.marketPosition || '';
    document.getElementById('obLandmarkNote').value = row.landmarkNote || '';
    document.getElementById('obMapsLink').value = row.storeLocation || '';
    if (row.latitude && row.longitude) writeObCoords(Number(row.latitude), Number(row.longitude));
    applyObMapsLink();
    if (row.latitude && row.longitude) writeObCoords(Number(row.latitude), Number(row.longitude));
    updateObEmbedMap();
    markSocialFilled();
    paintSetupSummary();
    if (typeof applyStoreApproval === 'function') applyStoreApproval(row.isApproved);
}

async function saveOnboardingStep6(event) {
    event.preventDefault();
    const data = await api.post('/api/onboarding/step-6/complete', {
        ...digitalPayload(),
        finishSetup: false
    });
    showToast(data.message);
    if (typeof applyStoreApproval === 'function') applyStoreApproval(data.profile && data.profile.isApproved);
    showObStep(7);
}

function bindOnboardingStep6() {
    document.querySelectorAll('.ob-social input').forEach((input) => {
        input.addEventListener('input', markSocialFilled);
    });
    const maps = document.getElementById('obMapsLink');
    maps.addEventListener('input', applyObMapsLink);
    maps.addEventListener('paste', () => setTimeout(applyObMapsLink, 0));
    document.getElementById('obCopyStore').addEventListener('click', () => {
        copyLiveStoreLink().catch(() => showToast('Could not copy store link.'));
    });
    const shopName = document.getElementById('obShopName');
    if (shopName && !shopName.dataset.storeLinkBound) {
        shopName.dataset.storeLinkBound = '1';
        shopName.addEventListener('input', paintLiveStoreLink);
    }
    document.getElementById('obDetectLocation').addEventListener('click', detectObLiveLocation);
    document.getElementById('obBack6').addEventListener('click', () => showObStep(5));
    document.getElementById('obForm6').addEventListener('submit', (event) => {
        saveOnboardingStep6(event).catch((err) => showToast(err.message));
    });
}
