const AUTH_TOKEN_KEY = 'mtAuthToken';

function authToken(role) {
    return localStorage.getItem(AUTH_TOKEN_KEY + ':' + role) || localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

function authSaveToken(role, token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_TOKEN_KEY + ':' + role, token);
}

function authClearToken(role) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    if (role) localStorage.removeItem(AUTH_TOKEN_KEY + ':' + role);
}

function authShow(id, message, kind) {
    const node = document.getElementById(id);
    if (!node) return;
    node.textContent = message || '';
    node.classList.toggle('show', Boolean(message));
    if (kind === 'ok') node.classList.add('auth-ok');
}

async function authPost(path, body) {
    const response = await fetch((typeof apiUrl === 'function' ? apiUrl('/api/auth' + path) : '/api/auth' + path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body || {})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(data.message || 'Request failed.');
        error.status = response.status;
        error.data = data;
        throw error;
    }
    return data;
}

async function authGet(path, role) {
    const response = await fetch((typeof apiUrl === 'function' ? apiUrl('/api/auth' + path) : '/api/auth' + path), {
        headers: { Authorization: 'Bearer ' + authToken(role) },
        credentials: 'include'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Sign in required.');
    return data;
}

function authBindForm(formId, handler) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const error = document.getElementById('authError');
        const ok = document.getElementById('authOk');
        if (error) { error.textContent = ''; error.classList.remove('show'); }
        if (ok) { ok.textContent = ''; ok.classList.remove('show'); }
        try {
            await handler(form);
        } catch (err) {
            if (error) {
                error.textContent = err.message || 'Request failed.';
                error.classList.add('show');
            }
        }
    });
}
