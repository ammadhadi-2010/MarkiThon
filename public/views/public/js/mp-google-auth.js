let mpGoogleClientId = '';
let mpGoogleReady = null;

function mpGoogleScript() {
    if (window.google && window.google.accounts && window.google.accounts.id) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-mp-gis]');
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('Could not load Google Sign-In.')), { once: true });
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.dataset.mpGis = '1';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Could not load Google Sign-In.'));
        document.head.appendChild(script);
    });
}

async function mpResolveGoogleClientId() {
    if (mpGoogleClientId) return mpGoogleClientId;
    const local = (window.MARKITHON_CLOUD && window.MARKITHON_CLOUD.GOOGLE_CLIENT_ID) || '';
    if (local) {
        mpGoogleClientId = local;
        return mpGoogleClientId;
    }
    const base = typeof apiUrl === 'function' ? apiUrl('/api/auth/google-config') : '/api/auth/google-config';
    const res = await fetch(base, { credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (data.enabled === false) {
        mpGoogleClientId = '';
        return '';
    }
    mpGoogleClientId = String(data.clientId || '').trim();
    return mpGoogleClientId;
}

async function mpEnsureGoogle() {
    if (mpGoogleReady) return mpGoogleReady;
    mpGoogleReady = (async () => {
        const clientId = await mpResolveGoogleClientId();
        if (!clientId) throw new Error('Google Sign-In is not configured.');
        await mpGoogleScript();
        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: mpHandleGoogleCredential,
            auto_select: false,
            cancel_on_tap_outside: true,
            context: 'signin',
            ux_mode: 'popup'
        });
        return clientId;
    })();
    try {
        return await mpGoogleReady;
    } catch (error) {
        mpGoogleReady = null;
        throw error;
    }
}

async function mpHandleGoogleCredential(response) {
    const credential = response && response.credential;
    if (!credential) {
        if (typeof mpSetAuthError === 'function') mpSetAuthError('Google did not return a credential.');
        return;
    }
    try {
        const url = typeof apiUrl === 'function' ? apiUrl('/api/auth/google') : '/api/auth/google';
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ credential })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Google sign-in failed.');
        if (typeof mpApplyBuyerSession === 'function') {
            mpApplyBuyerSession(data);
        } else if (data.role === 'shopkeeper' || data.role === 'vendor') {
            if (data.token) {
                localStorage.setItem('mtAuthToken:vendor', data.token);
                localStorage.setItem('mtAuthToken', data.token);
            }
            if (data.user) {
                localStorage.setItem('vendor', JSON.stringify(data.user));
                localStorage.setItem('mtVendorUser', JSON.stringify(data.user));
                window.mpVendor = data.user;
            }
            if (typeof mpCloseAuth === 'function') mpCloseAuth();
            if (typeof mpPaintAuth === 'function') mpPaintAuth();
        } else {
            if (data.token) localStorage.setItem('mpBuyerToken', data.token);
            if (data.buyer || data.user) {
                const buyer = data.buyer || data.user;
                window.mpBuyer = buyer;
                try {
                    localStorage.setItem('mpBuyerUser', JSON.stringify(buyer));
                } catch (error) {
                    /* ignore */
                }
            }
            if (typeof mpCloseAuth === 'function') mpCloseAuth();
            if (typeof mpPaintAuth === 'function') mpPaintAuth();
        }
    } catch (error) {
        if (typeof mpSetAuthError === 'function') mpSetAuthError(error.message);
    }
}

async function mpRenderGoogleButton() {
    const slot = document.getElementById('mpGoogleBtn');
    if (!slot) return;
    try {
        const clientId = await mpResolveGoogleClientId();
        if (!clientId) {
            slot.hidden = false;
            slot.innerHTML = '<p class="mp-auth-note">Google Sign-In is unavailable. Use Email or Phone.</p>';
            return;
        }
        await mpEnsureGoogle();
        slot.hidden = false;
        slot.textContent = '';
        window.google.accounts.id.renderButton(slot, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            text: 'continue_with',
            width: Math.min(360, slot.clientWidth || 320)
        });
    } catch (error) {
        slot.hidden = false;
        slot.innerHTML = `<p class="mp-auth-note">${error.message}</p>`;
    }
}

async function mpPromptGoogleOneTap() {
    try {
        await mpEnsureGoogle();
        window.google.accounts.id.prompt();
    } catch (error) {
        /* One Tap optional when client id is missing. */
    }
}

window.mpHandleGoogleCredential = mpHandleGoogleCredential;
