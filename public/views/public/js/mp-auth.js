function mpCloseProfileMenu() {
    const menu = document.getElementById('mpAuthMenu');
    const trigger = document.getElementById('mpAuthMenuBtn');
    const badge = document.getElementById('sfShopBadge');
    if (!menu) return;
    menu.classList.remove('is-open');
    menu.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (badge) badge.setAttribute('aria-expanded', 'false');
}

function mpToggleProfileMenu() {
    const menu = document.getElementById('mpAuthMenu');
    const trigger = document.getElementById('mpAuthMenuBtn');
    const badge = document.getElementById('sfShopBadge');
    if (!menu) return;
    const open = menu.hidden || !menu.classList.contains('is-open');
    if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => menu.classList.add('is-open'));
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
        if (badge) badge.setAttribute('aria-expanded', 'true');
    } else {
        mpCloseProfileMenu();
    }
}

function mpBindProfileMenu(slot) {
    const trigger = slot.querySelector('#mpAuthMenuBtn');
    if (trigger) {
        trigger.addEventListener('click', (event) => {
            event.stopPropagation();
            mpToggleProfileMenu();
        });
    }
    slot.querySelectorAll('[data-mp-account]').forEach((btn) => {
        btn.addEventListener('click', () => {
            mpCloseProfileMenu();
            if (typeof mpOpenAccount === 'function') mpOpenAccount(btn.getAttribute('data-mp-account'));
        });
    });
    slot.querySelectorAll('[data-mp-go]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            mpVendorGo(link.getAttribute('data-mp-go') || link.getAttribute('href'));
        });
    });
    const lang = slot.querySelector('[data-mp-lang]');
    if (lang) lang.addEventListener('click', () => mpCloseProfileMenu());
    const legacy = slot.querySelector('[data-mp-vendor-entry]');
    if (legacy) legacy.addEventListener('click', mpOpenVendorEntry);
    const out = slot.querySelector('#mpLogout');
    if (out) out.addEventListener('click', mpLogoutBuyer);
}

function mpPaintAuth() {
    const slot = document.getElementById('mpAuthSlot');
    if (!slot) return;
    if (typeof mpLoadVendor === 'function' && !mpVendor && typeof mpReadStoredVendor === 'function') {
        const stored = mpReadStoredVendor();
        if (stored) mpVendor = stored;
    }
    const sessionUser = typeof mpMenuSessionUser === 'function' ? mpMenuSessionUser() : mpBuyer;
    if (!sessionUser) {
        slot.innerHTML = mpGuestPillMarkup();
        slot.querySelector('#mpAuthOpen').addEventListener('click', () => mpOpenAuth('login'));
        if (typeof sfWireShopBadgeAuth === 'function') sfWireShopBadgeAuth();
        return;
    }
    slot.innerHTML = mpProfileMenuMarkup(sessionUser);
    mpBindProfileMenu(slot);
    if (typeof sfWireShopBadgeAuth === 'function') sfWireShopBadgeAuth();
}

function mpEnsureAuthShell() {
    if (document.getElementById('mpAuthModal')) return;
    document.body.insertAdjacentHTML('beforeend', mpAuthModalMarkup() + mpAccountDrawerMarkup());
    mpBindAuthModal();
    mpBindAccountDrawer();
    if (typeof bindPasswordToggles === 'function') bindPasswordToggles(document.getElementById('mpAuthModal'));
}

function mpSetAuthError(message) {
    const el = document.getElementById('mpAuthError');
    if (!el) return;
    el.hidden = !message;
    el.textContent = message || '';
}

function mpAuthChannel() {
    const on = document.querySelector('#mpAuthChannels .on');
    return on ? on.getAttribute('data-mp-channel') : 'email';
}

function mpPaintAuthForm() {
    const mode = document.getElementById('mpAuthForm').dataset.mode || 'login';
    const channel = mpAuthChannel();
    const google = channel === 'google';
    document.getElementById('mpAuthTitle').textContent = mode === 'register' ? 'Create account' : 'Sign In';
    document.getElementById('mpAuthNameWrap').hidden = mode !== 'register' || google;
    document.getElementById('mpAuthEmailWrap').hidden = channel === 'phone' || google;
    document.getElementById('mpAuthPhoneWrap').hidden = channel !== 'phone' || google;
    document.getElementById('mpAuthPassWrap').hidden = google;
    document.getElementById('mpAuthNote').hidden = !google;
    document.getElementById('mpAuthSubmit').hidden = google;
    const submit = document.getElementById('mpAuthSubmit');
    submit.textContent = mode === 'register' ? 'Register' : 'Sign In';
    const slot = document.getElementById('mpGoogleBtn');
    if (slot) slot.hidden = !google;
    if (google && typeof mpRenderGoogleButton === 'function') mpRenderGoogleButton();
}

function mpOpenAuth(mode) {
    mpEnsureAuthShell();
    const form = document.getElementById('mpAuthForm');
    form.dataset.mode = mode || 'login';
    document.querySelectorAll('[data-mp-mode]').forEach((btn) => {
        btn.classList.toggle('on', btn.getAttribute('data-mp-mode') === form.dataset.mode);
    });
    mpSetAuthError('');
    mpPaintAuthForm();
    document.getElementById('mpAuthModal').hidden = false;
}

function mpCloseAuth() {
    const modal = document.getElementById('mpAuthModal');
    if (modal) modal.hidden = true;
}

async function mpSubmitAuth(event) {
    event.preventDefault();
    if (mpAuthChannel() === 'google') {
        if (typeof mpRenderGoogleButton === 'function') mpRenderGoogleButton();
        return;
    }
    const mode = document.getElementById('mpAuthForm').dataset.mode || 'login';
    const channel = mpAuthChannel();
    const body = {
        channel,
        name: document.getElementById('mpAuthName').value,
        email: document.getElementById('mpAuthEmail').value,
        phone: document.getElementById('mpAuthPhone').value,
        password: document.getElementById('mpAuthPass').value
    };
    try {
        const data = await mpBuyerFetch(mode === 'register' ? '/register' : '/login', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        mpApplyBuyerSession(data);
    } catch (error) {
        mpSetAuthError(error.message);
    }
}

function mpBindAuthModal() {
    const form = document.getElementById('mpAuthForm');
    form.dataset.mode = 'login';
    form.addEventListener('submit', mpSubmitAuth);
    document.getElementById('mpAuthClose').addEventListener('click', mpCloseAuth);
    document.getElementById('mpAuthModal').addEventListener('click', (event) => {
        if (event.target.id === 'mpAuthModal') mpCloseAuth();
    });
    document.querySelectorAll('[data-mp-mode]').forEach((btn) => {
        btn.addEventListener('click', () => mpOpenAuth(btn.getAttribute('data-mp-mode')));
    });
    document.querySelectorAll('[data-mp-channel]').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-mp-channel]').forEach((item) => item.classList.remove('on'));
            btn.classList.add('on');
            mpPaintAuthForm();
        });
    });
}

function mpLogoutBuyer() {
    localStorage.removeItem(MP_BUYER_KEY);
    localStorage.removeItem('mtAuthToken:vendor');
    localStorage.removeItem('mtAuthToken');
    localStorage.removeItem('vendor');
    localStorage.removeItem('mtVendorUser');
    mpBuyer = null;
    mpVendor = null;
    mpCloseProfileMenu();
    mpPaintAuth();
    if (typeof mpCloseAccount === 'function') mpCloseAccount();
    if (typeof mpPaintHearts === 'function') mpPaintHearts(document);
    if (location.pathname.indexOf('/profile/orders') === 0 && typeof mpMountOrders === 'function') mpMountOrders('');
}

async function mpBindAuth() {
    mpEnsureAuthShell();
    if (!window.mpAuthDocBound) {
        window.mpAuthDocBound = true;
        document.addEventListener('click', (event) => {
            if (event.target.closest('#mpAuthSlot, #sfShopBadge, #mpAuthMenu')) return;
            mpCloseProfileMenu();
        });
    }
    await Promise.all([mpLoadBuyer(), mpLoadVendor()]);
    mpPaintAuth();
    if (!mpBuyer && !mpVendor && typeof mpPromptGoogleOneTap === 'function') mpPromptGoogleOneTap();
}
