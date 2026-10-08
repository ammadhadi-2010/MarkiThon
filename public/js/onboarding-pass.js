function obPassToken() {
    return localStorage.getItem('mtAuthToken:vendor') || localStorage.getItem('mtAuthToken') || '';
}

function obPassNote(message, bad) {
    const el = document.getElementById('obPassNote');
    if (!el) return;
    el.textContent = message || '';
    el.classList.toggle('is-bad', Boolean(bad));
}

async function obChangePassword(body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = obPassToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    const response = await fetch('/api/vendor/change-password', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Could not update the password.');
    return data;
}

function bindObPassword() {
    const save = document.getElementById('obPassSave');
    const box = document.getElementById('obPassForm');
    if (!save || !box || save.dataset.bound) return;
    save.dataset.bound = '1';
    if (typeof bindPasswordToggles === 'function') bindPasswordToggles(box);
    save.addEventListener('click', async () => {
        const currentPassword = document.getElementById('obCurrentPass').value;
        const newPassword = document.getElementById('obNewPass').value;
        const confirmPassword = document.getElementById('obConfirmPass').value;
        if (!currentPassword || !newPassword || !confirmPassword) {
            obPassNote('Fill in all password fields.', true);
            return;
        }
        if (newPassword.length < 6) {
            obPassNote('Use a new password of at least 6 characters.', true);
            return;
        }
        if (newPassword !== confirmPassword) {
            obPassNote('New password and confirmation do not match.', true);
            return;
        }
        try {
            const data = await obChangePassword({ currentPassword, newPassword, confirmPassword });
            if (typeof resetPasswordFields === 'function') resetPasswordFields(box);
            else {
                document.getElementById('obCurrentPass').value = '';
                document.getElementById('obNewPass').value = '';
                document.getElementById('obConfirmPass').value = '';
            }
            obPassNote(data.message || 'Password updated.');
            if (typeof showToast === 'function') showToast(data.message || 'Password updated.');
        } catch (error) {
            obPassNote(error.message, true);
            if (typeof showToast === 'function') showToast(error.message);
        }
    });
    if (typeof disableAutofill === 'function') disableAutofill(box);
}
