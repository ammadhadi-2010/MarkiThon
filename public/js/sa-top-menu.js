function saCloseUserMenu() {
    const menu = document.getElementById('saUserMenu');
    const trigger = document.getElementById('saUserTrigger');
    if (menu) menu.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
}

function saToggleUserMenu(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('saUserMenu');
    const trigger = document.getElementById('saUserTrigger');
    if (!menu || !trigger) return;
    const open = menu.hidden;
    menu.hidden = !open;
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function saBindTopMenu() {
    const trigger = document.getElementById('saUserTrigger');
    if (!trigger || trigger.dataset.bound === '1') return;
    trigger.dataset.bound = '1';
    trigger.addEventListener('click', saToggleUserMenu);
    const menu = document.getElementById('saUserMenu');
    if (menu) {
        menu.addEventListener('click', (event) => event.stopPropagation());
    }
    const profile = document.getElementById('saMenuProfile');
    if (profile) {
        profile.addEventListener('click', () => {
            saCloseUserMenu();
            if (/^\/admin\/(shops|support)\//.test(location.pathname)) {
                location.assign('/admin#settings');
                return;
            }
            location.hash = 'settings';
        });
    }
    const logout = document.getElementById('saMenuLogout');
    if (logout) {
        logout.addEventListener('click', () => {
            saCloseUserMenu();
            if (typeof saLogoutAdmin === 'function') saLogoutAdmin();
        });
    }
}

if (!window.saTopMenuDocBound) {
    window.saTopMenuDocBound = true;
    document.addEventListener('click', () => saCloseUserMenu());
}
