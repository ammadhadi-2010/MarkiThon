function mpEscAttr(value) {
    return String(value || '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

function mpGuestPillMarkup() {
    const mark = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 19.2c.8-3.2 3.2-4.8 6.5-4.8s5.7 1.6 6.5 4.8"/></svg>';
    return `<button type="button" class="mp-pill mp-pill-guest" id="mpAuthOpen" aria-label="Sign In / Register" title="Sign In / Register">
        <span class="mp-pill-avatar">${mark}</span>
        <span class="mp-pill-name">Sign In / Register</span>
    </button>`;
}

function mpMenuAvatar(buyer) {
    const name = (typeof mpDisplayName === 'function' ? mpDisplayName(buyer) : '')
        || buyer.name || buyer.shopName || buyer.email || 'A';
    const letter = name.trim().charAt(0).toUpperCase() || 'A';
    const image = mpEscAttr(buyer.imageUrl || (buyer.preferences && buyer.preferences.avatar) || '');
    if (image) {
        return `<img class="mp-pill-avatar mp-pill-photo" src="${image}" alt="" width="40" height="40">`;
    }
    return `<span class="mp-pill-avatar">${letter}</span>`;
}

function mpIsVendorRole(user) {
    if (!user) return false;
    const role = String(user.role || '').toLowerCase();
    return user.isVendor === true
        || user.hasShop === true
        || role === 'vendor'
        || role === 'shopkeeper';
}

function mpHasVendorSession() {
    if (typeof mpIsVendorLoggedIn === 'function' && mpIsVendorLoggedIn()) return true;
    if (typeof mpVendor !== 'undefined' && mpVendor) return true;
    try {
        return Boolean(
            localStorage.getItem('mtAuthToken:vendor')
            || localStorage.getItem('vendor')
            || localStorage.getItem('mtVendorUser')
            || (typeof authToken === 'function' && authToken('vendor'))
        );
    } catch (error) {
        return false;
    }
}

function mpIsShopVendor(user) {
    if (mpHasVendorSession()) return true;
    return mpIsVendorRole(user);
}

function mpVendorGo(href) {
    if (typeof mpCloseProfileMenu === 'function') mpCloseProfileMenu();
    const target = String(href || '').trim() || '/settings';
    requestAnimationFrame(() => location.assign(target));
}

function mpOpenVendorEntry() {
    mpVendorGo('/settings');
}

function mpManageMenuMarkup(user) {
    const shop = mpHasVendorSession() || mpIsShopVendor(user)
        || (typeof mpHasRegisteredShop === 'function' && mpHasRegisteredShop(user));
    const admin = String((user && user.role) || '').toLowerCase() === 'admin';
    const active = typeof mpIsActiveShopkeeper === 'function' && mpIsActiveShopkeeper(user);
    const storeLink = shop
        ? '<a href="/settings" data-mp-go="/settings">Online Store Settings</a>'
        : '';
    const sellerLink = shop || active
        ? '<a href="/app" class="mp-menu-inventory" data-mp-go="/app">My Shop / POS Inventory</a>'
        : '<a href="/register-shop" class="mp-menu-seller" data-mp-go="/register-shop">Become a Seller</a>';
    const registerExtra = shop || active || admin
        ? ''
        : '<a href="/register-shop" data-mp-go="/register-shop">Register New Shop</a>';
    return `
            <p class="mp-menu-label">Manage</p>
            <div class="mp-menu-links">
                ${sellerLink}
                ${registerExtra}
                ${storeLink}
                <button type="button" class="mp-menu-dash" data-mp-dashboard="1">Dashboard</button>
            </div>`;
}

function mpVerifyMarkup(user) {
    if (mpHasVendorSession() || mpIsShopVendor(user)) {
        if (user.verified || user.isApproved === true || user.status === 'Active') {
            return '<button type="button" class="mp-menu-verify is-ok" disabled>Verified</button>';
        }
        return '<button type="button" class="mp-menu-verify is-pending" disabled>Pending</button>';
    }
    if (user.verified) {
        return '<button type="button" class="mp-menu-verify is-ok" data-mp-account="settings">Verified</button>';
    }
    return '<button type="button" class="mp-menu-verify" data-mp-account="settings">Verify now</button>';
}

function mpQuickLinksMarkup(user) {
    if (mpHasVendorSession() || mpIsShopVendor(user)) {
        return `
            <p class="mp-menu-label">Quick</p>
            <div class="mp-menu-links">
                <a href="/expenses" data-mp-go="/expenses">Wallet</a>
                <a href="/contact" data-mp-go="/contact">Help</a>
            </div>`;
    }
    return `
            <p class="mp-menu-label">Quick</p>
            <div class="mp-menu-links">
                <button type="button" data-mp-account="wallet">Wallet</button>
                <a href="/contact" data-mp-go="/contact">Help</a>
            </div>`;
}

function mpProfileMenuMarkup(user) {
    const role = String((user && user.role) || '').toLowerCase();
    const admin = role === 'admin';
    const shopkeeper = !admin && (mpHasVendorSession() || mpIsShopVendor(user)
        || Boolean(user && (user.isVendor || user.hasShop)));
    const displayName = typeof mpDisplayName === 'function'
        ? mpDisplayName(user)
        : (user.shopName || user.fullName || user.ownerName || user.name || user.email || 'Account');
    const name = mpEscAttr(displayName);
    const letter = String(displayName).trim().charAt(0).toUpperCase() || 'A';
    const badge = mpEscAttr(admin
        ? 'Super Admin'
        : (shopkeeper
            ? (user.subtitle === 'Vendor' ? 'Vendor' : 'Shopkeeper')
            : (user.subtitle || 'Account')));
    const avatarUser = Object.assign({}, user, { name: displayName, imageUrl: user.imageUrl || '' });
    const avatar = mpMenuAvatar(avatarUser);
    const pillAvatar = user.imageUrl
        ? `<img class="mp-pill-avatar mp-pill-photo" src="${mpEscAttr(user.imageUrl)}" alt="">`
        : `<span class="mp-pill-avatar">${letter}</span>`;
    const profileAct = admin
        ? 'data-mp-go="/admin#settings"'
        : (shopkeeper ? 'data-mp-go="/settings"' : 'data-mp-account="settings"');
    return `
        <button type="button" class="mp-pill" id="mpAuthMenuBtn" aria-label="Account menu" aria-expanded="false" aria-haspopup="true">
            ${pillAvatar}
            <span class="mp-pill-name">${name}</span>
            <span class="mp-pill-caret" aria-hidden="true">▾</span>
        </button>
        <div class="mp-auth-menu" id="mpAuthMenu" hidden>
            <div class="mp-menu-card">
                ${avatar}
                <div>
                    <strong>${name}</strong>
                    <span class="mp-role${shopkeeper || admin ? ' is-vendor' : ''}">${badge}</span>
                </div>
            </div>
            <div class="mp-menu-actions">
                <button type="button" class="mp-menu-view" ${profileAct}>Profile Settings</button>
                ${mpVerifyMarkup(user)}
            </div>
            ${mpQuickLinksMarkup(user)}
            <p class="mp-menu-label">Account</p>
            <div class="mp-menu-links">
                <button type="button" class="mp-menu-lang" data-mp-lang="en">Language <span>English</span></button>
            </div>
            ${mpManageMenuMarkup(user)}
            <button type="button" class="mp-signout" id="mpLogout">Sign out</button>
        </div>`;
}

function mpAuthModalMarkup() {
    return `
    <div class="mp-modal" id="mpAuthModal" hidden>
        <form class="mp-modal-card" id="mpAuthForm" autocomplete="off">
            <div class="mp-modal-head">
                <h2 id="mpAuthTitle">Sign In</h2>
                <button type="button" class="mp-icon" id="mpAuthClose" aria-label="Close">×</button>
            </div>
            <div class="mp-auth-switch">
                <button type="button" class="on" data-mp-mode="login">Sign In</button>
                <button type="button" data-mp-mode="register">Register</button>
            </div>
            <div class="mp-auth-switch" id="mpAuthChannels">
                <button type="button" class="on" data-mp-channel="email">Email</button>
                <button type="button" data-mp-channel="phone">Phone</button>
                <button type="button" data-mp-channel="google">Google</button>
            </div>
            <div id="mpGoogleBtn" class="mp-google-slot" hidden></div>
            <label id="mpAuthNameWrap">Name
                <input id="mpAuthName" name="buyerName" autocomplete="off" placeholder="Your name">
            </label>
            <label id="mpAuthEmailWrap">Email
                <input id="mpAuthEmail" name="buyerEmail" type="email" autocomplete="off" placeholder="name@email.com">
            </label>
            <label id="mpAuthPhoneWrap" hidden>Phone number
                <input id="mpAuthPhone" name="buyerPhone" autocomplete="off" placeholder="03001234567">
            </label>
            <label id="mpAuthPassWrap">Password
                <input id="mpAuthPass" name="buyerPassword" type="password" autocomplete="off" placeholder="At least 6 characters">
            </label>
            <p class="mp-auth-note" id="mpAuthNote" hidden>Use Google Sign-In below. Your Google credential is verified on the server.</p>
            <p class="mp-auth-error" id="mpAuthError" hidden></p>
            <button type="submit" class="mp-cta" id="mpAuthSubmit">Sign In</button>
            <p class="mp-auth-note"><a href="/forgot-password">Forgot password</a> · <a href="/signup">Full signup page</a> · <a href="/login">Full login page</a></p>
        </form>
    </div>`;
}

function mpAccountDrawerMarkup() {
    return `
    <div class="mp-drawer-back" id="mpAccountDrawer" hidden>
        <aside class="mp-drawer" aria-label="Customer account">
            <div class="mp-modal-head">
                <h2 id="mpAccountTitle">My Orders</h2>
                <button type="button" class="mp-icon" id="mpAccountClose" aria-label="Close">×</button>
            </div>
            <p class="mp-auth-note" id="mpAccountWho"></p>
            <div id="mpAccountBody"></div>
        </aside>
    </div>`;
}
