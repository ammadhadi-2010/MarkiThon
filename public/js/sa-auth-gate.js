const SA_AUTH_KEY = 'mtAuthToken:admin';
const saNativeFetch = window.fetch.bind(window);

function saAuthToken() {
    return localStorage.getItem(SA_AUTH_KEY) || localStorage.getItem('mtAuthToken') || '';
}

function saAuthHeaders(extra) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, extra || {});
    const token = saAuthToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    return headers;
}

window.fetch = function saGuardedFetch(url, options) {
    let path = String(url || '');
    if (typeof apiUrl === 'function' && path.indexOf('/api/') === 0) {
        path = apiUrl(path);
    }
    const next = Object.assign({}, options || {});
    if (path.indexOf('/api/') !== -1 || path.indexOf('/api/auth/') !== -1
        || String(url || '').indexOf('/api/admin/') === 0
        || String(url || '').indexOf('/api/platform/') === 0
        || String(url || '').indexOf('/api/subscription/') === 0
        || String(url || '').indexOf('/api/auth/') === 0) {
        next.credentials = 'include';
        next.headers = saAuthHeaders(next.headers);
    }
    return saNativeFetch(path, next);
};

async function saRequireAdmin() {
    try {
        const response = await fetch('/api/auth/admin/me', { credentials: 'include' });
        if (response.ok) return true;
    } catch (error) {
        /* Fall through to login. */
    }
    location.replace('/login?reason=unauthorized&next=' + encodeURIComponent('/admin'));
    return false;
}

async function saLogoutAdmin() {
    try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include', body: '{}' });
    } catch (error) {
        /* Clear local session anyway. */
    }
    localStorage.removeItem(SA_AUTH_KEY);
    localStorage.removeItem('mtAuthToken');
    location.replace('/login');
}

window.saLogoutAdmin = saLogoutAdmin;

saRequireAdmin().then(async (ok) => {
    if (!ok) return;
    if (typeof saLoadAdminWho === 'function') await saLoadAdminWho();
    if (typeof window.saBoot === 'function') window.saBoot();
});
