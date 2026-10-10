function mpCleanLabel(value) {
    const text = String(value || '').trim();
    if (!text || text.indexOf('@') !== -1) return '';
    return text.slice(0, 80);
}

function mpDisplayName(user) {
    if (!user) return '';
    return mpCleanLabel(user.fullName)
        || mpCleanLabel(user.shopName)
        || mpCleanLabel(user.ownerName)
        || mpCleanLabel(user.name)
        || String(user.email || '').trim()
        || 'Account';
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
    const role = String(user.role || '').toLowerCase();
    const shopRole = role === 'shopkeeper' || role === 'vendor' || user.isVendor || user.hasShop;
    if (!shopRole && typeof mpIsVendorLoggedIn === 'function' && !mpIsVendorLoggedIn()) return false;
    if (!shopRole) return false;
    return user.isApproved === true || user.status === 'Active' || user.verified === true;
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
    const role = String((data && data.role) || '').toLowerCase();
    const asVendor = role === 'shopkeeper' || role === 'vendor'
        || (data.user && (data.user.shopName || data.user.role === 'vendor'));
    if (asVendor && mpApplyVendorSession(data)) {
        if (typeof mpCloseAuth === 'function') mpCloseAuth();
        if (typeof mpPaintAuth === 'function') mpPaintAuth();
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

function mpDashboardHref(user) {
    const role = String((user && user.role) || '').toLowerCase();
    if (role === 'admin' || (typeof mpIsAdminLoggedIn === 'function' && mpIsAdminLoggedIn() && mpAdmin)) {
        return '/admin';
    }
    if (typeof mpIsActiveShopkeeper === 'function' && mpIsActiveShopkeeper(user)) return '/app';
    const shop = role === 'shopkeeper' || role === 'vendor'
        || (user && (user.isVendor || user.hasShop));
    if (shop && user && (user.isApproved === true || user.status === 'Active' || user.verified === true)) {
        return '/app';
    }
    return '';
}

function mpOpenDashboard() {
    if (!mpRequireAuth('login')) return;
    const user = typeof mpMenuSessionUser === 'function' ? mpMenuSessionUser() : null;
    const href = mpDashboardHref(user);
    if (typeof mpCloseProfileMenu === 'function') mpCloseProfileMenu();
    if (href) {
        location.assign(href);
        return;
    }
    mpToast('Dashboard access is only available for active Shopkeepers or Admins.');
}
