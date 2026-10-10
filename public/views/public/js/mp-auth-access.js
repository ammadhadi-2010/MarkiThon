function mpCleanLabel(value) {
    const text = String(value || '').trim();
    if (!text || text.indexOf('@') !== -1) return '';
    return text.slice(0, 80);
}

function mpDisplayName(user) {
    if (!user) return '';
    /* Registered shopName always wins over Google/owner personal titles. */
    const shop = mpCleanLabel(user.shopName);
    if (shop) return shop;
    return mpCleanLabel(user.fullName)
        || mpCleanLabel(user.ownerName)
        || mpCleanLabel(user.name)
        || String(user.email || '').trim()
        || 'Account';
}

function mpIsShopkeeperRole(user) {
    if (!user) return false;
    const role = String(user.role || '').toLowerCase();
    return role === 'shopkeeper' || role === 'vendor' || user.isVendor === true || user.hasShop === true;
}

function mpIsAdminLoggedIn() {
    try {
        return Boolean(localStorage.getItem('mtAuthToken:admin'));
    } catch (error) {
        return false;
    }
}

function mpIsActiveShopkeeper(user) {
    if (!user) return false;
    const shopRole = mpIsShopkeeperRole(user)
        || (typeof mpIsVendorLoggedIn === 'function' && mpIsVendorLoggedIn());
    if (!shopRole) return false;
    return user.isApproved === true || user.status === 'Active';
}

function mpMaybeRedirectShopkeeper(user, force) {
    const row = user || (typeof mpMenuSessionUser === 'function' ? mpMenuSessionUser() : null);
    if (!mpIsActiveShopkeeper(row)) return false;
    const path = String(location.pathname || '/');
    const onApp = path === '/app' || path.indexOf('/app/') === 0;
    if (onApp) return false;
    const onHome = path === '/' || path === '';
    if (!force && !onHome) return false;
    location.replace('/app');
    return true;
}

const MP_BUYER_USER_KEY = 'mpBuyerUser';

function mpSaveBuyerCache(buyer) {
    if (!buyer) {
        localStorage.removeItem(MP_BUYER_USER_KEY);
        return;
    }
    try {
        localStorage.setItem(MP_BUYER_USER_KEY, JSON.stringify(buyer));
    } catch (error) {
        /* Ignore quota errors. */
    }
}

function mpReadBuyerCache() {
    try {
        const row = JSON.parse(localStorage.getItem(MP_BUYER_USER_KEY) || 'null');
        return row && typeof row === 'object' ? row : null;
    } catch (error) {
        return null;
    }
}

function mpHydrateSessions() {
    if (typeof mpBuyerToken === 'function' && mpBuyerToken()) {
        const cached = mpReadBuyerCache();
        if (cached) mpBuyer = cached;
    }
    if (!mpVendor && typeof mpReadStoredVendor === 'function') {
        const stored = mpReadStoredVendor();
        if (stored) mpVendor = stored;
    }
}

function mpApplyVendorSession(data) {
    const user = data.user || data.vendor || null;
    if (!user || !data.token) return false;
    localStorage.setItem('mtAuthToken:vendor', data.token);
    localStorage.setItem('mtAuthToken', data.token);
    if (typeof authSaveToken === 'function') authSaveToken('vendor', data.token);
    mpVendor = user;
    if (typeof mpSaveStoredVendor === 'function') mpSaveStoredVendor(user);
    return true;
}

function mpApplyBuyerSession(data) {
    if (data && data.pending) {
        if (typeof mpToast === 'function') {
            mpToast(data.message || 'Your account is Pending Admin Approval.');
        }
        if (typeof mpCloseAuth === 'function') mpCloseAuth();
        return;
    }
    const role = String((data && data.role) || '').toLowerCase();
    const asVendor = role === 'shopkeeper' || role === 'vendor'
        || (data.user && (data.user.shopName || data.user.role === 'vendor'));
    if (asVendor && mpApplyVendorSession(data)) {
        if (typeof mpCloseAuth === 'function') mpCloseAuth();
        if (typeof mpPaintAuth === 'function') mpPaintAuth();
        const goApp = data.redirect === '/app' || mpIsActiveShopkeeper(data.user);
        if (goApp) {
            location.assign('/app');
            return;
        }
        return;
    }
    if (data.token) localStorage.setItem('mpBuyerToken', data.token);
    mpBuyer = data.buyer || data.user || null;
    mpSaveBuyerCache(mpBuyer);
    if (typeof mpCloseAuth === 'function') mpCloseAuth();
    if (typeof mpPaintAuth === 'function') mpPaintAuth();
    if (typeof mpPaintHearts === 'function') mpPaintHearts(document);
    if (location.pathname.indexOf('/profile/orders') === 0 && typeof mpMountOrders === 'function') {
        mpMountOrders((location.pathname.split('/')[3]) || '');
    }
}

function mpToast(message) {
    let host = document.getElementById('mpToastHost');
    if (!host) {
        host = document.createElement('div');
        host.id = 'mpToastHost';
        host.className = 'mp-toast-host';
        document.body.appendChild(host);
    }
    const item = document.createElement('div');
    item.className = 'mp-toast';
    item.textContent = String(message || '');
    host.appendChild(item);
    window.setTimeout(() => {
        item.classList.add('is-out');
        window.setTimeout(() => item.remove(), 280);
    }, 4000);
}

function mpRequireAuth(mode) {
    const user = typeof mpMenuSessionUser === 'function'
        ? mpMenuSessionUser()
        : (typeof mpBuyer !== 'undefined' && (mpBuyer || mpVendor || mpAdmin));
    if (user) return true;
    if (typeof mpCloseProfileMenu === 'function') mpCloseProfileMenu();
    if (typeof mpOpenAuth === 'function') mpOpenAuth(mode || 'register');
    return false;
}

function mpHasRegisteredShop(user) {
    if (!user) return false;
    if (mpIsShopkeeperRole(user)) return true;
    if (typeof mpHasVendorSession === 'function' && mpHasVendorSession()) return true;
    if (typeof mpIsVendorLoggedIn === 'function' && mpIsVendorLoggedIn()) return true;
    return Boolean(mpCleanLabel(user.shopName));
}

function mpDashboardHref(user) {
    const role = String((user && user.role) || '').toLowerCase();
    if (role === 'admin' || (typeof mpIsAdminLoggedIn === 'function' && mpIsAdminLoggedIn() && mpAdmin)) {
        return '/admin';
    }
    if (mpHasRegisteredShop(user) || mpIsActiveShopkeeper(user)) return '/app';
    return '/register-shop';
}

function mpOpenDashboard() {
    if (!mpRequireAuth('login')) return;
    const user = typeof mpMenuSessionUser === 'function' ? mpMenuSessionUser() : null;
    const href = mpDashboardHref(user) || '/register-shop';
    if (typeof mpCloseProfileMenu === 'function') mpCloseProfileMenu();
    location.assign(href);
}
