function vpB64ToBuf(value) {
    const text = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
    const pad = '='.repeat((4 - (text.length % 4)) % 4);
    const raw = atob(text + pad);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
    return out.buffer;
}

function vpBufToB64(buffer) {
    const bytes = new Uint8Array(buffer);
    let text = '';
    bytes.forEach((item) => { text += String.fromCharCode(item); });
    return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

authBindForm('authForm', async (form) => {
    try {
        const data = await authPost('/vendor/login', {
            email: form.authEmail.value,
            password: form.authPassword.value
        });
        authSaveToken('vendor', data.token);
        if (data.user) {
            localStorage.setItem('vendor', JSON.stringify(data.user));
            localStorage.setItem('mtVendorUser', JSON.stringify(data.user));
        }
        location.assign('/dashboard');
    } catch (error) {
        if (error.status === 403) {
            const ok = document.getElementById('authOk');
            if (ok) {
                ok.textContent = error.message;
                ok.classList.add('show');
            }
            return;
        }
        throw error;
    }
});

document.getElementById('authBioBtn').addEventListener('click', async () => {
    const error = document.getElementById('authError');
    error.classList.remove('show');
    try {
        if (!window.PublicKeyCredential) throw new Error('This device does not support thumb scan login.');
        const begin = await authPost('/vendor/webauthn/begin', {
            email: document.getElementById('authEmail').value
        });
        const assertion = await navigator.credentials.get({
            publicKey: {
                challenge: vpB64ToBuf(begin.challenge),
                rpId: begin.rpId,
                allowCredentials: (begin.allowCredentials || []).map((item) => ({
                    type: 'public-key',
                    id: vpB64ToBuf(item.id)
                })),
                userVerification: begin.userVerification,
                timeout: begin.timeout
            }
        });
        const data = await authPost('/vendor/webauthn/finish', {
            vendorId: begin.vendorId,
            id: assertion.id,
            rawId: vpBufToB64(assertion.rawId),
            type: assertion.type
        });
        authSaveToken('vendor', data.token);
        if (data.user) {
            localStorage.setItem('vendor', JSON.stringify(data.user));
            localStorage.setItem('mtVendorUser', JSON.stringify(data.user));
        }
        location.assign('/dashboard');
    } catch (err) {
        error.textContent = err.message || 'Thumb scan login failed.';
        error.classList.add('show');
    }
});
