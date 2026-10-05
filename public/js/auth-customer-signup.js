function authRememberCustomer(token) {
    authSaveToken('customer', token);
    localStorage.setItem('mpBuyerToken', token);
}

authBindForm('authForm', async (form) => {
    const data = await authPost('/customer/register', {
        name: form.authName.value,
        email: form.authEmail.value,
        password: form.authPassword.value
    });
    authRememberCustomer(data.token);
    location.assign('/');
});
