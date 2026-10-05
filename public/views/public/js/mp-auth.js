const MP_BUYER_KEY = 'mpBuyerToken';
let mpBuyer = null;

function mpBuyerToken() {
    return localStorage.getItem(MP_BUYER_KEY) || '';
}

async function mpBuyerFetch(path, options) {
    const headers = { 'Content-Type': 'application/json' };
    const token = mpBuyerToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    const res = await fetch('/api/buyers' + path, Object.assign({}, options, { headers }));
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Request failed.');
    return data;
}

async function mpLoadBuyer() {
    if (!mpBuyerToken()) {
        mpBuyer = null;
        return;
    }
    try {
        mpBuyer = (await mpBuyerFetch('/me')).buyer;
    } catch (error) {
        localStorage.removeItem(MP_BUYER_KEY);
        mpBuyer = null;
    }
}

function mpCloseProfileMenu() {
    const menu = document.getElementById('mpAuthMenu');
    const trigger = document.getElementById('mpAuthMenuBtn');
    if (!menu) return;
    menu.classList.remove('is-open');
    menu.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
}

function mpToggleProfileMenu() {
    const menu = document.getElementById('mpAuthMenu');
    const trigger = document.getElementById('mpAuthMenuBtn');
    if (!menu || !trigger) return;
    const open = menu.hidden || !menu.classList.contains('is-open');
    if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => menu.classList.add('is-open'));
        trigger.setAttribute('aria-expanded', 'true');
    } else {
        mpCloseProfileMenu();
    }
}

function mpApplyBuyerSession(data) {
    localStorage.setItem(MP_BUYER_KEY, data.token);
    mpBuyer = data.buyer;
    mpCloseAuth();
    mpPaintAuth();
    if (typeof mpPaintHearts === 'function') mpPaintHearts(document);
    if (location.pathname.indexOf('/profile/orders') === 0 && typeof mpMountOrders === 'function') {
        mpMountOrders((location.pathname.split('/')[3]) || '');
    }
}

function mpPaintAuth() {
    const slot = document.getElementById('mpAuthSlot');
    if (!slot) return;
    if (!mpBuyer) {
        slot.innerHTML = mpGuestPillMarkup();
        slot.querySelector('#mpAuthOpen').addEventListener('click', () => mpOpenAuth('login'));
        return;
    }
    slot.innerHTML = mpProfileMenuMarkup(mpBuyer);
    slot.querySelector('#mpAuthMenuBtn').addEventListener('click', (event) => {
        event.stopPropagation();
        mpToggleProfileMenu();
    });
    slot.querySelectorAll('[data-mp-account]').forEach((btn) => {
        btn.addEventListener('click', () => {
            mpCloseProfileMenu();
            mpOpenAccount(btn.getAttribute('data-mp-account'));
        });
    });
    const lang = slot.querySelector('[data-mp-lang]');
    if (lang) lang.addEventListener('click', () => mpCloseProfileMenu());
    slot.querySelector('#mpLogout').addEventListener('click', mpLogoutBuyer);
}

function mpEnsureAuthShell() {
    if (document.getElementById('mpAuthModal')) return;
    document.body.insertAdjacentHTML('beforeend', mpAuthModalMarkup() + mpAccountDrawerMarkup());
    mpBindAuthModal();
    mpBindAccountDrawer();
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
    mpBuyer = null;
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
            if (event.target.closest('#mpAuthSlot')) return;
            mpCloseProfileMenu();
        });
    }
    await mpLoadBuyer();
    mpPaintAuth();
    if (!mpBuyer && typeof mpPromptGoogleOneTap === 'function') mpPromptGoogleOneTap();
}
