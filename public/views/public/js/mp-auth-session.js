const MP_BUYER_KEY = 'mpBuyerToken';
const MP_VENDOR_KEY = 'vendor';
const MP_VENDOR_ALT = 'mtVendorUser';
let mpBuyer = null;
let mpVendor = null;

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
        return;
    }
    try {
        mpBuyer = (await mpBuyerFetch('/me')).buyer;
    } catch (error) {
        localStorage.removeItem(MP_BUYER_KEY);
        mpBuyer = null;
    }
}

async function mpLoadVendor() {
    const token = mpVendorToken();
    const stored = mpReadStoredVendor();
    if (!token && !stored) {
        mpVendor = null;
        return;
    }
    if (token) {
        try {
            const res = await fetch('/api/auth/vendor/me', {
                headers: { Authorization: 'Bearer ' + token },
                credentials: 'include'
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.user) {
                mpVendor = data.user;
                mpSaveStoredVendor(data.user);
                return;
            }
        } catch (error) {
            /* use stored vendor */
        }
    }
    mpVendor = stored || null;
}

function mpMapVendorUser(vendor) {
    const status = String(vendor.status || '');
    const approved = status === 'Active' || vendor.isApproved === true;
    const pending = !approved && (status === 'Pending Admin Approval' || vendor.verifyState === 'pending');
    const shopName = vendor.shopName || vendor.name || vendor.ownerName || 'Shopkeeper';
    return {
        id: vendor.id,
        name: shopName,
        shopName,
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
        ownerName: vendor.ownerName || ''
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
    return mpOverlayStorefront(mpMapVendorUser({
        shopName: (typeof sfShop !== 'undefined' && sfShop && sfShop.shopName) || mpBuyer.name,
        ownerName: mpBuyer.name,
        imageUrl: mpBuyer.imageUrl || '',
        email: mpBuyer.email || '',
        phone: mpBuyer.phone || '',
        status: mpBuyer.verified ? 'Active' : 'Pending Admin Approval',
        isApproved: Boolean(mpBuyer.verified)
    }));
}

function mpMenuSessionUser() {
    if (mpIsVendorLoggedIn()) {
        const raw = mpVendor || mpReadStoredVendor();
        if (raw) return mpOverlayStorefront(mpMapVendorUser(raw));
        const shop = mpShopFallbackUser();
        if (shop) return shop;
        return mpMapVendorUser({ shopName: 'Shopkeeper', status: 'Active', isApproved: true });
    }
    const asVendor = mpBuyerAsVendor();
    if (asVendor) return asVendor;
    if (mpBuyer && typeof sfShop !== 'undefined' && sfShop && sfShop.shopName) {
        return mpOverlayStorefront(mpMapVendorUser({
            shopName: sfShop.shopName,
            ownerName: mpBuyer.name || '',
            imageUrl: (sfShop.themeAssets && sfShop.themeAssets.logo) || sfShop.imageUrl || mpBuyer.imageUrl || '',
            email: mpBuyer.email || '',
            phone: mpBuyer.phone || '',
            status: sfShop.isApproved ? 'Active' : 'Pending Admin Approval',
            isApproved: Boolean(sfShop.isApproved)
        }));
    }
    if (!mpBuyer) return null;
    return Object.assign({}, mpBuyer, {
        name: mpBuyer.name || mpBuyer.email || 'Account',
        subtitle: mpBuyer.subtitle && mpBuyer.subtitle !== 'Customer' ? mpBuyer.subtitle : 'Account'
    });
}

function mpApplyBuyerSession(data) {
    localStorage.setItem(MP_BUYER_KEY, data.token);
    mpBuyer = data.buyer;
    if (typeof mpCloseAuth === 'function') mpCloseAuth();
    if (typeof mpPaintAuth === 'function') mpPaintAuth();
    if (typeof mpPaintHearts === 'function') mpPaintHearts(document);
    if (location.pathname.indexOf('/profile/orders') === 0 && typeof mpMountOrders === 'function') {
        mpMountOrders((location.pathname.split('/')[3]) || '');
    }
}
