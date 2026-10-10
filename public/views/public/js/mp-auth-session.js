const MP_BUYER_KEY = 'mpBuyerToken';
const MP_VENDOR_KEY = 'vendor';
const MP_VENDOR_ALT = 'mtVendorUser';
let mpBuyer = null;
let mpVendor = null;
let mpAdmin = null;

function mpBuyerToken() {
    return localStorage.getItem(MP_BUYER_KEY) || '';
}

function mpVendorToken() {
    try {
        return localStorage.getItem('mtAuthToken:vendor')
            || (typeof authToken === 'function' ? authToken('vendor') : '')
            || '';
    } catch (error) {
        return '';
    }
}

function mpParseVendorRow(raw) {
    if (!raw) return null;
    try {
        const row = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!row || typeof row !== 'object') return null;
        if (row.shopName || row.ownerName || row.role === 'vendor' || row.role === 'shopkeeper') return row;
        if (row.isVendor || row.hasShop) return row;
        return null;
    } catch (error) {
        return null;
    }
}

function mpReadStoredVendor() {
    try {
        return mpParseVendorRow(localStorage.getItem(MP_VENDOR_KEY))
            || mpParseVendorRow(localStorage.getItem(MP_VENDOR_ALT))
            || mpParseVendorRow(localStorage.getItem('user'));
    } catch (error) {
        return null;
    }
}

function mpSaveStoredVendor(user) {
    if (!user) {
        localStorage.removeItem(MP_VENDOR_KEY);
        localStorage.removeItem(MP_VENDOR_ALT);
        return;
    }
    const payload = JSON.stringify(user);
    localStorage.setItem(MP_VENDOR_KEY, payload);
    localStorage.setItem(MP_VENDOR_ALT, payload);
}

function mpIsVendorLoggedIn() {
    return Boolean(mpVendorToken() || mpVendor || mpReadStoredVendor());
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
        mpSaveBuyerCache(null);
        return;
    }
    if (!mpBuyer) mpBuyer = mpReadBuyerCache();
    try {
        const data = await mpBuyerFetch('/me');
        mpBuyer = data.buyer || null;
        mpSaveBuyerCache(mpBuyer);
    } catch (error) {
        const message = String((error && error.message) || '');
        if (/sign in|unauthorized|401|403/i.test(message) || !mpBuyer) {
            localStorage.removeItem(MP_BUYER_KEY);
            mpSaveBuyerCache(null);
            mpBuyer = null;
        }
    }
}

async function mpLoadVendor() {
    const token = mpVendorToken();
    const stored = mpReadStoredVendor();
    if (!mpVendor && stored) mpVendor = stored;
    try {
        const headers = {};
        if (token) headers.Authorization = 'Bearer ' + token;
        const res = await fetch('/api/auth/vendor/me', {
            headers,
            credentials: 'include'
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.user) {
            mpVendor = data.user;
            mpSaveStoredVendor(data.user);
            if (data.token) {
                localStorage.setItem('mtAuthToken:vendor', data.token);
                localStorage.setItem('mtAuthToken', data.token);
            } else if (token) {
                localStorage.setItem('mtAuthToken:vendor', token);
            }
            return;
        }
        if (res.status === 401 && !stored) {
            mpVendor = null;
            return;
        }
    } catch (error) {
        /* Keep cached vendor when offline. */
    }
    mpVendor = mpVendor || stored || null;
}

async function mpLoadAdmin() {
    if (!mpIsAdminLoggedIn()) {
        mpAdmin = null;
        return;
    }
    try {
        const token = localStorage.getItem('mtAuthToken:admin') || '';
        const res = await fetch('/api/auth/admin/me', {
            credentials: 'include',
            headers: token ? { Authorization: 'Bearer ' + token } : {}
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.user) {
            mpAdmin = null;
            return;
        }
        const row = data.user;
        mpAdmin = {
            id: row.id,
            role: 'admin',
            name: row.name || 'Super Admin',
            fullName: row.name || '',
            email: row.email || '',
            imageUrl: row.avatarUrl || '',
            subtitle: 'Super Admin',
            verified: true
        };
    } catch (error) {
        mpAdmin = null;
    }
}

function mpMapVendorUser(vendor) {
    const status = String(vendor.status || '');
    const approved = status === 'Active' || vendor.isApproved === true;
    const pending = !approved && (status === 'Pending Admin Approval' || vendor.verifyState === 'pending');
    const shopName = String(vendor.shopName || '').trim();
    const ownerName = String(vendor.ownerName || vendor.fullName || '').trim();
    const label = shopName || ownerName || 'Shopkeeper';
    return {
        id: vendor.id,
        name: label,
        shopName: shopName || label,
        fullName: ownerName,
        imageUrl: vendor.imageUrl || '',
        role: 'shopkeeper',
        isVendor: true,
        hasShop: true,
        subtitle: 'Shopkeeper',
        status: status || (approved ? 'Active' : 'Pending Admin Approval'),
        isApproved: approved,
        verified: approved,
        verifyState: approved ? 'verified' : (pending ? 'pending' : 'unverified'),
        shopkeeperId: vendor.shopkeeperId || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        ownerName
    };
}

function mpShopFallbackUser() {
    if (typeof sfShop === 'undefined' || !sfShop) return null;
    return mpMapVendorUser({
        shopName: sfShop.shopName,
        imageUrl: (sfShop.themeAssets && sfShop.themeAssets.logo) || sfShop.imageUrl || '',
        status: sfShop.isApproved ? 'Active' : 'Pending Admin Approval',
        isApproved: Boolean(sfShop.isApproved)
    });
}

function mpOverlayStorefront(mapped) {
    if (!mapped || typeof sfShop === 'undefined' || !sfShop || !sfShop.shopName) return mapped;
    const approved = sfShop.isApproved != null ? Boolean(sfShop.isApproved) : mapped.isApproved;
    return Object.assign({}, mapped, {
        name: sfShop.shopName,
        shopName: sfShop.shopName,
        isApproved: approved,
        verified: approved,
        status: approved ? 'Active' : 'Pending Admin Approval',
        imageUrl: mapped.imageUrl
            || (sfShop.themeAssets && sfShop.themeAssets.logo)
            || sfShop.imageUrl
            || ''
    });
}

function mpBuyerAsVendor() {
    if (!mpBuyer) return null;
    const role = String(mpBuyer.role || '').toLowerCase();
    if (!(mpBuyer.isVendor || mpBuyer.hasShop || role === 'shopkeeper' || role === 'vendor')) return null;
    const shopName = (typeof sfShop !== 'undefined' && sfShop && sfShop.shopName)
        || mpBuyer.shopName
        || '';
    return mpOverlayStorefront(mpMapVendorUser({
        shopName,
        ownerName: mpBuyer.fullName || mpBuyer.name || '',
        imageUrl: mpBuyer.imageUrl || '',
        email: mpBuyer.email || '',
        phone: mpBuyer.phone || '',
        status: mpBuyer.verified ? 'Active' : 'Pending Admin Approval',
        isApproved: Boolean(mpBuyer.verified)
    }));
}

function mpMenuSessionUser() {
    if (mpAdmin) return mpAdmin;
    if (mpIsVendorLoggedIn()) {
        const raw = mpVendor || mpReadStoredVendor();
        if (raw) return mpOverlayStorefront(mpMapVendorUser(raw));
        const shop = mpShopFallbackUser();
        if (shop) return shop;
        return mpMapVendorUser({ shopName: 'Shopkeeper', status: 'Active', isApproved: true });
    }
    const asVendor = mpBuyerAsVendor();
    if (asVendor) return asVendor;
    if (!mpBuyer) return null;
    return Object.assign({}, mpBuyer, {
        name: mpDisplayName(mpBuyer),
        role: mpBuyer.role || 'customer',
        subtitle: mpBuyer.subtitle && mpBuyer.subtitle !== 'Customer' ? mpBuyer.subtitle : 'Account'
    });
}

