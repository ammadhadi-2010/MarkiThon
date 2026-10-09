let obShopType = 'Fabric Shop';
let obBusinessType = 'Both';
let obProductTypes = [];
let obStep = 1;
let obSetupCompleted = false;
let obMaxWizard = 0;
const obPassDraft = { current: '', next: '', confirm: '' };

function setObChoice(rootId, attr, value) {
    document.querySelectorAll('#' + rootId + ' .ob-chip').forEach((btn) => {
        btn.classList.toggle('on', btn.getAttribute(attr) === value);
    });
}

function obCanJumpSteps() {
    return Boolean(obSetupCompleted);
}

function obCanOpenStep(step) {
    if (obSetupCompleted) return true;
    return obWizardIndex(step) <= obMaxWizard;
}

function stashObPassDraft() {
    const cur = document.getElementById('obCurrentPass');
    const neu = document.getElementById('obNewPass');
    const conf = document.getElementById('obConfirmPass');
    if (cur) obPassDraft.current = cur.value;
    if (neu) obPassDraft.next = neu.value;
    if (conf) obPassDraft.confirm = conf.value;
}

function restoreObPassDraft() {
    const cur = document.getElementById('obCurrentPass');
    const neu = document.getElementById('obNewPass');
    const conf = document.getElementById('obConfirmPass');
    if (cur) cur.value = obPassDraft.current;
    if (neu) neu.value = obPassDraft.next;
    if (conf) conf.value = obPassDraft.confirm;
}

function clearObPassDraft() {
    obPassDraft.current = '';
    obPassDraft.next = '';
    obPassDraft.confirm = '';
}

function showObStep(step, fromJump) {
    if (Number(step) === 3) step = 4;
    if (fromJump && !obCanOpenStep(step)) {
        showToast('Complete earlier steps first, or finish setup once to unlock free navigation.');
        return;
    }
    stashObPassDraft();
    obStep = step;
    const idx = obWizardIndex(step);
    if (idx > obMaxWizard) obMaxWizard = idx;
    document.getElementById('obHead').innerHTML = onboardingHeaderMarkup(step);
    document.querySelectorAll('.ob-panel').forEach((panel) => {
        panel.hidden = Number(panel.dataset.obstep) !== step;
    });
    const passCard = document.getElementById('obPassCard');
    if (passCard) passCard.hidden = Number(step) !== 7;
    if (step === 6 && typeof paintSetupSummary === 'function') paintSetupSummary();
    if (step === 6 && typeof updateObEmbedMap === 'function') updateObEmbedMap();
    if (step === 7 && typeof paintVerifyStep === 'function') paintVerifyStep();
    if (Number(step) === 7) restoreObPassDraft();
}

function obVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function obHeroUrls() {
    return [0, 1, 2].map((i) => obVal('obBan' + i + 'Url'));
}

function obPayload() {
    const heroBanners = obHeroUrls();
    return {
        shopName: obVal('obShopName'),
        ownerName: obVal('obOwnerName'),
        ownerCnic: obVal('obOwnerCnic'),
        shopSku: obVal('obShopSku'),
        phoneNumber: obVal('obPhoneNumber'),
        emailAddress: obVal('obEmailAddress'),
        marketName: obVal('obMarketName'),
        shopNumber: obVal('obShopNumber'),
        shopAddress: obVal('obShopAddress'),
        imageUrl: obVal('obLogoUrl'),
        heroBanners,
        coverBanner: heroBanners.find(Boolean) || '',
        whatsappNumber: obVal('obOrderWhatsapp'),
        shopDescription: obVal('obShopBio'),
        shopType: obShopType,
        businessType: obBusinessType
    };
}

function renderProductTypes() {
    document.querySelectorAll('#obTypeGrid .ob-type').forEach((card) => {
        card.classList.toggle('on', obProductTypes.includes(card.dataset.ptype));
    });
    document.getElementById('obSelectedLabel').textContent =
        `Selected Categories (${obProductTypes.length})`;
    document.getElementById('obTags').innerHTML = obProductTypes.map((name) => `
        <span class="ob-tag">${name}
            <button type="button" data-unpick="${name}" aria-label="Remove">×</button>
        </span>`).join('');
}

function toggleProductType(name) {
    if (obProductTypes.includes(name)) {
        obProductTypes = obProductTypes.filter((item) => item !== name);
    } else obProductTypes = obProductTypes.concat(name);
    renderProductTypes();
}

function fillOnboarding(row) {
    if (!row) return;
    document.getElementById('obShopName').value = row.shopName || '';
    document.getElementById('obOwnerName').value = row.ownerName || '';
    const cnic = document.getElementById('obOwnerCnic');
    if (cnic) cnic.value = row.ownerCnic || '';
    const sku = document.getElementById('obShopSku');
    if (sku) sku.value = row.shopSku || '';
    document.getElementById('obPhoneNumber').value = row.phoneNumber || '';
    document.getElementById('obEmailAddress').value = row.emailAddress || '';
    document.getElementById('obMarketName').value = row.marketName || '';
    document.getElementById('obShopNumber').value = row.shopNumber || '';
    document.getElementById('obShopAddress').value = row.shopAddress || '';
    const wa = document.getElementById('obOrderWhatsapp');
    if (wa && Object.prototype.hasOwnProperty.call(row, 'whatsappNumber')) {
        wa.value = typeof formatObWhatsapp === 'function'
            ? formatObWhatsapp(row.whatsappNumber || '')
            : (row.whatsappNumber || '');
    }
    const bio = document.getElementById('obShopBio');
    if (bio && Object.prototype.hasOwnProperty.call(row, 'shopDescription')) {
        bio.value = row.shopDescription || '';
    }
    obShopType = row.shopType || 'Fabric Shop';
    obBusinessType = row.businessType || 'Both';
    obProductTypes = Array.isArray(row.productTypes) ? row.productTypes.slice() : [];
    setObChoice('obShopType', 'data-shoptype', obShopType);
    setObChoice('obBusinessType', 'data-bustype', obBusinessType);
    if (typeof paintObMedia === 'function') {
        let banners;
        const stored = Array.isArray(row.heroBanners) ? row.heroBanners : [];
        if (stored.some(Boolean)) banners = stored;
        else if (Object.prototype.hasOwnProperty.call(row, 'coverBanner')) {
            banners = [row.coverBanner || '', '', ''];
        } else banners = obHeroUrls();
        paintObMedia(row.imageUrl, banners);
    }
    renderProductTypes();
    if (typeof loadStaffStep === 'function') loadStaffStep().catch(() => {});
    if (typeof fillPackage === 'function') fillPackage(row);
    if (typeof fillDigital === 'function') fillDigital(row);
    obSetupCompleted = Boolean(row.isSetupCompleted || row.isApproved);
    if (obSetupCompleted) obMaxWizard = OB_WIZARD.length - 1;
    if (typeof applyShopProfile === 'function') {
        applyShopProfile({ shopName: row.shopName, ownerName: row.ownerName });
    }
}

async function loadOnboardingStep1() {
    fillOnboarding(await api.get('/api/settings/shop-profile'));
}

async function loadSettings() {
    await loadOnboardingStep1();
    showObStep(1);
}

async function saveOnboardingStep1(event) {
    event.preventDefault();
    const data = await api.put('/api/settings/shop-profile', obPayload());
    showToast(data.message);
    fillOnboarding(data.profile);
    showObStep(2);
}

async function saveOnboardingStep2(event) {
    event.preventDefault();
    const data = await api.post('/api/onboarding/step-2', { productTypes: obProductTypes });
    showToast(data.message);
    fillOnboarding(data.profile);
    showObStep(4);
}

function bindOnboarding() {
    const root = document.getElementById('view-settings');
    const card = document.getElementById('obCard');
    if (card && !card.dataset.jumpBound) {
        card.dataset.jumpBound = '1';
        card.addEventListener('click', (event) => {
            const jump = event.target.closest('[data-objump]');
            if (!jump || jump.disabled) return;
            event.preventDefault();
            showObStep(Number(jump.getAttribute('data-objump')), true);
        });
    }
    document.getElementById('obShopType').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-shoptype]');
        if (!btn) return;
        obShopType = btn.dataset.shoptype;
        setObChoice('obShopType', 'data-shoptype', obShopType);
        if (obShopType === 'Mobile Accessories' && !obProductTypes.includes('Mobile Accessories')) {
            obProductTypes = obProductTypes.concat('Mobile Accessories');
            renderProductTypes();
        }
    });
    document.getElementById('obBusinessType').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-bustype]');
        if (!btn) return;
        obBusinessType = btn.dataset.bustype;
        setObChoice('obBusinessType', 'data-bustype', obBusinessType);
    });
    if (typeof bindObMedia === 'function') bindObMedia();
    document.getElementById('obCancel').addEventListener('click', () => {
        loadOnboardingStep1().catch((err) => showToast(err.message));
    });
    document.getElementById('obForm').addEventListener('submit', (event) => {
        saveOnboardingStep1(event).catch((err) => showToast(err.message));
    });
    document.getElementById('obTypeGrid').addEventListener('click', (e) => {
        const card = e.target.closest('[data-ptype]');
        if (card) toggleProductType(card.dataset.ptype);
    });
    document.getElementById('obTags').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-unpick]');
        if (btn) toggleProductType(btn.dataset.unpick);
    });
    document.getElementById('obBack').addEventListener('click', () => showObStep(1));
    document.getElementById('obCancel2').addEventListener('click', () => {
        loadOnboardingStep1().catch((err) => showToast(err.message));
    });
    document.getElementById('obForm2').addEventListener('submit', (event) => {
        saveOnboardingStep2(event).catch((err) => showToast(err.message));
    });
    if (typeof bindOnboardingStep4 === 'function') bindOnboardingStep4();
    if (typeof bindOnboardingStep5 === 'function') bindOnboardingStep5();
    if (typeof bindOnboardingStep6 === 'function') bindOnboardingStep6();
    if (typeof bindOnboardingStep7 === 'function') bindOnboardingStep7();
    disableAutofill(root);
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('view-settings');
    root.innerHTML = onboardingMarkup();
    bindOnboarding();
    loadOnboardingStep1().catch((err) => showToast(err.message));
});
