authBindForm('authForm', async (form) => {
    const data = await authPost('/vendor/register', {
        shopName: form.shopName.value,
        ownerName: form.ownerName.value,
        email: form.authEmail.value,
        phone: form.phone.value,
        address: form.address.value,
        password: form.authPassword.value
    });
    const ok = document.getElementById('authOk');
    if (ok) {
        ok.textContent = data.message || 'Registration submitted for admin approval.';
        ok.classList.add('show');
    }
    form.reset();
});
