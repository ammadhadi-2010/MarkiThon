const MP_BUYER_KEY = 'mpBuyerToken';
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
    if (!token) {
        mpVendor = null;
        return;
    }
    try {
        const res = await fetch('/api/auth/vendor/me', {
            headers: { Authorization: 'Bearer ' + token },
            credentials: 'include'
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            mpVendor = null;
            return;
        }
        mpVendor = data.user || null;
    } catch (error) {
        mpVendor = null;
    }
}

function mpMapVendorUser(vendor) {
    const status = String(vendor.status || '');
    const approved = status === 'Active';
    const pending = status === 'Pending Admin Approval';
    return {
        id: vendor.id,
        name: vendor.shopName || vendor.ownerName || 'Shopkeeper',
        imageUrl: vendor.imageUrl || '',
        role: 'shopkeeper',
        isVendor: true,
        hasShop: true,
        subtitle: 'Shopkeeper',
        status,
        isApproved: approved,
        verified: approved,
        verifyState: approved ? 'verified' : (pending ? 'pending' : 'unverified'),
        shopkeeperId: vendor.shopkeeperId || '',
        email: vendor.email || '',
        phone: vendor.phone || ''
    };
}

function mpMenuSessionUser() {
    if (mpVendor) return mpMapVendorUser(mpVendor);
    if (typeof mpHasVendorSession === 'function' && mpHasVendorSession()
        && typeof sfShop !== 'undefined' && sfShop) {
        return {
            name: sfShop.shopName || 'Shopkeeper',
            imageUrl: (sfShop.themeAssets && sfShop.themeAssets.logo) || sfShop.imageUrl || '',
            role: 'shopkeeper',
            isVendor: true,
            hasShop: true,
            subtitle: 'Shopkeeper',
            verified: Boolean(sfShop.isApproved),
            isApproved: Boolean(sfShop.isApproved),
            status: sfShop.isApproved ? 'Active' : 'Pending Admin Approval',
            verifyState: sfShop.isApproved ? 'verified' : 'pending'
        };
    }
    return mpBuyer || null;
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
