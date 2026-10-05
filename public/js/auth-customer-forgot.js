authBindForm('authForgotForm', async (form) => {
    const data = await authPost('/customer/forgot', { email: form.forgotEmail.value });
    const ok = document.getElementById('authOk');
    if (ok) {
        ok.textContent = data.message || 'If an account exists, a reset code is ready.';
        ok.classList.add('show');
    }
    document.getElementById('authForgotForm').hidden = true;
    document.getElementById('authResetForm').hidden = false;
    document.getElementById('resetEmail').value = form.forgotEmail.value;
    if (data.resetToken) document.getElementById('resetToken').value = data.resetToken;
});

document.getElementById('authResetForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = document.getElementById('resetError');
    const ok = document.getElementById('resetOk');
    error.classList.remove('show');
    ok.classList.remove('show');
    try {
        const data = await authPost('/customer/reset', {
            email: document.getElementById('resetEmail').value,
            resetToken: document.getElementById('resetToken').value,
            password: document.getElementById('resetPassword').value
        });
        authSaveToken('customer', data.token);
        localStorage.setItem('mpBuyerToken', data.token);
        ok.textContent = 'Password updated. Redirecting...';
        ok.classList.add('show');
        setTimeout(() => location.assign('/'), 700);
    } catch (err) {
        error.textContent = err.message || 'Could not reset the password.';
        error.classList.add('show');
    }
});
