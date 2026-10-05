function authRememberCustomer(token) {
    authSaveToken('customer', token);
    localStorage.setItem('mpBuyerToken', token);
}

authBindForm('authForm', async (form) => {
    const data = await authPost('/customer/login', {
        email: form.authEmail.value,
        password: form.authPassword.value
    });
    authRememberCustomer(data.token);
    location.assign('/');
});
