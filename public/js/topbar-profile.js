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
    if (menu) menu.hidden = true;
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

function bindTopbarProfile() {
    const wrap = document.querySelector('.top-actions .profile');
    if (!wrap || wrap.dataset.bound === '1') return;
    wrap.dataset.bound = '1';
    wrap.classList.add('profile-menu-wrap');
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('tabindex', '0');
    wrap.setAttribute('aria-haspopup', 'true');
    const menu = document.createElement('div');
    menu.id = 'topProfileMenu';
    menu.className = 'top-profile-menu';
    menu.hidden = true;
    wrap.appendChild(menu);
    topbarPaintMenu(topbarIsAdminSession());

    wrap.addEventListener('click', (event) => {
        if (event.target.closest('.top-profile-menu')) return;
        menu.hidden = !menu.hidden;
    });
    wrap.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        menu.hidden = !menu.hidden;
    });
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.profile-menu-wrap')) topbarCloseMenu();
    });
    menu.addEventListener('click', async (event) => {
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
        location.assign('/login');
    });

    fetch('/api/auth/admin/me', { credentials: 'include' })
        .then((response) => {
            if (response.ok) topbarPaintMenu(true);
        })
        .catch(() => {});
}

document.addEventListener('DOMContentLoaded', bindTopbarProfile);
