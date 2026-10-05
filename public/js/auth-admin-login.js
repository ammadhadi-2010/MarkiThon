authBindForm('authForm', async (form) => {
    const data = await authPost('/admin/login', {
        email: form.authEmail.value,
        password: form.authPassword.value
    });
    authSaveToken('admin', data.token);
    location.assign('/admin');
});
