let obIsApproved = false;

function storeAssetsUnlocked() {
    return Boolean(obIsApproved);
}

function applyStoreApproval(approved) {
    obIsApproved = Boolean(approved);
    const badge = document.getElementById('obVerifyBadge');
    const copy = document.getElementById('obVerifyCopy');
    const unlocked = storeAssetsUnlocked();
    if (badge) {
        badge.textContent = unlocked ? 'Store Live & Verified' : 'Pending Admin Approval';
        badge.classList.toggle('wait', !unlocked);
        badge.classList.toggle('live', unlocked);
    }
    if (copy) {
        copy.textContent = unlocked
            ? 'Ammad Hadi Stor is verified. Download the branded QR code, share the store, or save the digital business card.'
            : 'Your store profile is in review. Sharing, QR downloads, and the digital business card stay locked until an admin approves Ammad Hadi Stor.';
    }
    document.querySelectorAll('#obQrCards .ob-qr-card').forEach((card) => {
        card.classList.toggle('ob-qr-lock', !unlocked);
        const note = card.querySelector('.ob-qr-lock-note');
        if (note) note.hidden = unlocked;
    });
    document.querySelectorAll('[data-qr-download]').forEach((btn) => {
        btn.disabled = !unlocked;
    });
    ['obShareStore', 'obDownloadVcf'].forEach((id) => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = !unlocked;
    });
}

function paintVerifyStep() {
    const name = document.getElementById('obShopName');
    const nameEl = document.getElementById('obVerifyName');
    const urlEl = document.getElementById('obVerifyUrl');
    const bizEl = document.getElementById('obVerifyBiz');
    if (nameEl) nameEl.textContent = (name && name.value) || 'Ammad Hadi Stor';
    if (urlEl && typeof liveStoreUrl === 'function') urlEl.textContent = liveStoreUrl();
    if (bizEl) bizEl.textContent = typeof obBusinessMode === 'function' ? obBusinessMode() : 'Both';
    if (typeof paintObQrCards === 'function') paintObQrCards();
    applyStoreApproval(obIsApproved);
    if (typeof bindPasswordToggles === 'function') {
        bindPasswordToggles(document.getElementById('obPassForm'));
    }
}

async function saveOnboardingStep7(event) {
    event.preventDefault();
    const payload = typeof digitalPayload === 'function' ? digitalPayload() : { acceptedTerms: true };
    const data = await api.post('/api/onboarding/step-6/complete', {
        ...payload,
        finishSetup: true
    });
    showToast(data.message);
    showView('dashboard');
}

function bindOnboardingStep7() {
    if (typeof bindObStoreShare === 'function') bindObStoreShare();
    if (typeof bindObPassword === 'function') bindObPassword();
    const back = document.getElementById('obBack7');
    const form = document.getElementById('obForm7');
    if (back && !back.dataset.bound) {
        back.dataset.bound = '1';
        back.addEventListener('click', () => showObStep(6));
    }
    if (form && !form.dataset.bound) {
        form.dataset.bound = '1';
        form.addEventListener('submit', (event) => {
            saveOnboardingStep7(event).catch((err) => showToast(err.message));
        });
    }
}
