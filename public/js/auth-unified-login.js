function authLoginRedirect(data) {
    const role = data.role === 'shopkeeper' ? 'vendor' : data.role;
    if (data.token) authSaveToken(role || 'customer', data.token);
    if (data.role === 'shopkeeper' && data.user) {
        localStorage.setItem('vendor', JSON.stringify(data.user));
        localStorage.setItem('mtVendorUser', JSON.stringify(data.user));
    }
    if (data.role === 'customer' && data.token) {
        localStorage.setItem('mpBuyerToken', data.token);
    }
    const params = new URLSearchParams(location.search);
    const next = params.get('next');
    if (next && data.role === 'admin' && next.indexOf('/admin') === 0) {
        location.assign(next);
        return;
    }
    location.assign(data.redirect || (data.role === 'admin' ? '/admin' : data.role === 'shopkeeper' ? '/app' : '/'));
}

function authShowUnauthorized() {
    const params = new URLSearchParams(location.search);
    if (params.get('reason') !== 'unauthorized') return;
    authShow('authError', 'Unauthorized. Sign in with a Super Admin account to open the Admin Dashboard.');
}

authShowUnauthorized();

authBindForm('authForm', async (form) => {
    const data = await authPost('/login', {
        email: form.authEmail.value,
        password: form.authPassword.value
    });
    authLoginRedirect(data);
});
