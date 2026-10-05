function shopSlugFromName(name) {
    return String(name || 'Ammad Hadi Stor').toLowerCase().replace(/[^a-z0-9]+/g, '') || 'ammadhadistor';
}

function applyStoreLinks(name) {
    const slug = shopSlugFromName(name);
    const url = 'https://markithon.com/' + slug;
    const path = '/' + slug;
    const nameEl = document.getElementById('osStoreName');
    const linkEl = document.getElementById('osStoreLink');
    const openEl = document.getElementById('osOpenLink');
    const viewEl = document.getElementById('osViewPublic');
    if (nameEl) nameEl.value = name || 'Ammad Hadi Stor';
    if (linkEl) linkEl.value = url;
    if (openEl) openEl.setAttribute('href', path);
    if (viewEl) viewEl.setAttribute('href', path);
}

function paintStoreApproval(approved) {
    const unlocked = Boolean(approved);
    const badge = document.getElementById('osVerifyBadge');
    const btn = document.getElementById('osApproveStore');
    if (badge) {
        badge.textContent = unlocked ? 'Store Live & Verified' : 'Pending Admin Approval';
        badge.classList.toggle('wait', !unlocked);
        badge.classList.toggle('live', unlocked);
    }
    if (btn) btn.textContent = unlocked ? 'Set Pending' : 'Approve Store';
    if (typeof applyStoreApproval === 'function') applyStoreApproval(unlocked);
}

async function loadStoreStatus() {
    let name = 'Ammad Hadi Stor';
    try {
        const row = await api.get('/api/settings');
        if (row && row.shopName) name = row.shopName;
    } catch (error) {
        const brand = document.getElementById('shopName');
        if (brand && brand.textContent) name = brand.textContent.trim();
    }
    applyStoreLinks(name);
    try {
        const gate = await api.get('/api/settings/store-approval');
        paintStoreApproval(gate && gate.isApproved);
    } catch (error) {
        paintStoreApproval(false);
    }
}

function bindStoreStatus() {
    const copy = document.getElementById('osCopyLink');
    const approve = document.getElementById('osApproveStore');
    if (copy && !copy.dataset.bound) {
        copy.dataset.bound = '1';
        copy.addEventListener('click', () => {
            const el = document.getElementById('osStoreLink');
            navigator.clipboard.writeText(el.value).then(() => showToast('Store link copied.'))
                .catch(() => showToast('Could not copy store link.'));
        });
    }
    if (approve && !approve.dataset.bound) {
        approve.dataset.bound = '1';
        approve.addEventListener('click', () => {
            const live = document.getElementById('osVerifyBadge');
            const next = !(live && live.classList.contains('live'));
            api.put('/api/settings/store-approval', { isApproved: next }).then((data) => {
                paintStoreApproval(data.isApproved);
                showToast(data.message);
            }).catch((err) => showToast(err.message));
        });
    }
}
