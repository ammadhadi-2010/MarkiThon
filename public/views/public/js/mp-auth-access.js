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
