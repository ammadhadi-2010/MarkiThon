function topbarIsAdminSession() {
    if (localStorage.getItem('mtAuthToken:admin')) return true;
    try {
        const token = localStorage.getItem('mtAuthToken') || '';
        if (!token || token.indexOf('.') < 0) return false;
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload && payload.role === 'admin';
    } catch (error) {
        return false;
    }
}

function topbarCloseMenu() {
    const menu = document.getElementById('topProfileMenu');
    const wrap = document.getElementById('topProfile');
    if (menu) menu.hidden = true;
    if (wrap) wrap.setAttribute('aria-expanded', 'false');
}

function topbarToggleMenu(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const menu = document.getElementById('topProfileMenu');
    const wrap = document.getElementById('topProfile');
    if (!menu) return;
    const open = menu.hidden;
    menu.hidden = !open;
    if (wrap) wrap.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function topbarPaintMenu(isAdmin) {
    const menu = document.getElementById('topProfileMenu');
    if (!menu) return;
    const adminLink = isAdmin
        ? '<a class="top-profile-item" href="/admin">Admin Dashboard</a>'
        : '';
    menu.innerHTML = `
        ${adminLink}
        <button type="button" class="top-profile-item" data-nav="settings">Profile Settings</button>
        <button type="button" class="top-profile-item is-danger" id="topLogoutBtn">Sign Out</button>`;
}

function topbarAvatarUrl(row) {
    if (!row) return '';
    return String(
        row.imageUrl || row.avatarUrl || row.avatar || row.profileImage || ''
    ).trim();
}

function topbarPaintAvatar(row) {
    const box = document.querySelector('#topProfile .avatar, .profile .avatar');
    if (!box) return;
    const url = topbarAvatarUrl(row);
    const label = String(
        (row && (row.shopName || row.ownerName || row.fullName || row.name)) || 'A'
    ).trim();
    const letter = (label.charAt(0) || 'A').toUpperCase();
    if (url) {
        box.innerHTML = `<img class="avatar-img" src="${url.replace(/"/g, '&quot;')}" alt="">`;
        return;
    }
    box.textContent = letter;
}

function bindTopbarProfile() {
    const wrap = document.getElementById('topProfile') || document.querySelector('.top-actions .profile');
    if (!wrap || wrap.dataset.bound === '1') return;
    wrap.dataset.bound = '1';
    wrap.id = wrap.id || 'topProfile';
    wrap.classList.add('profile-menu-wrap');
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('tabindex', '0');
    wrap.setAttribute('aria-haspopup', 'true');
    wrap.setAttribute('aria-expanded', 'false');

    let menu = document.getElementById('topProfileMenu');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'topProfileMenu';
        menu.className = 'top-profile-menu';
        wrap.appendChild(menu);
    }
    menu.hidden = true;
    topbarPaintMenu(topbarIsAdminSession());

    wrap.addEventListener('click', (event) => {
        if (event.target.closest('.top-profile-menu')) return;
        topbarToggleMenu(event);
    });
    wrap.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        topbarToggleMenu(event);
    });
    document.addEventListener('click', (event) => {
        if (!event.target.closest('#topProfile, .profile-menu-wrap')) topbarCloseMenu();
    });
    menu.addEventListener('click', async (event) => {
        event.stopPropagation();
        const settings = event.target.closest('[data-nav="settings"]');
        if (settings) {
            topbarCloseMenu();
            if (typeof showView === 'function') showView('settings');
            return;
        }
        const logout = event.target.closest('#topLogoutBtn');
        if (!logout) return;
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include', body: '{}' });
        } catch (error) {
            /* clear local session anyway */
        }
        localStorage.removeItem('mtAuthToken');
        localStorage.removeItem('mtAuthToken:admin');
        localStorage.removeItem('mtAuthToken:vendor');
        localStorage.removeItem('mtAuthToken:customer');
        localStorage.removeItem('vendor');
        localStorage.removeItem('mtVendorUser');
        location.assign('/login');
    });

    fetch('/api/auth/admin/me', { credentials: 'include' })
        .then((response) => {
            if (response.ok) topbarPaintMenu(true);
        })
        .catch(() => {});

    const token = localStorage.getItem('mtAuthToken:vendor') || localStorage.getItem('mtAuthToken') || '';
    const headers = token ? { Authorization: 'Bearer ' + token } : {};
    fetch('/api/auth/vendor/me', { credentials: 'include', headers })
        .then((response) => response.ok ? response.json() : null)
        .then((data) => {
            if (data && data.user) topbarPaintAvatar(data.user);
        })
        .catch(() => {});
}

document.addEventListener('DOMContentLoaded', bindTopbarProfile);
