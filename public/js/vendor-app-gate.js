(function vendorAppGate() {
    const path = String(location.pathname || '');
    const needsApproval = path === '/app' || path.indexOf('/app/') === 0
        || path === '/dashboard' || path.indexOf('/dashboard/') === 0
        || path === '/inventory' || path.indexOf('/inventory/') === 0;
    if (!needsApproval) return;

    const token = localStorage.getItem('mtAuthToken:vendor')
        || localStorage.getItem('mtAuthToken')
        || '';
    const headers = {};
    if (token) headers.Authorization = 'Bearer ' + token;

    fetch('/api/auth/vendor/me', { credentials: 'include', headers })
        .then((response) => response.json().then((data) => ({ response, data })))
        .then(({ response, data }) => {
            if (response.ok && data.user) {
                const active = data.user.status === 'Active' || data.user.isApproved === true;
                if (active) return;
                localStorage.removeItem('mtAuthToken:vendor');
                location.replace('/login?reason=pending');
                return;
            }
            if (response.status === 401 || response.status === 403) {
                location.replace('/login?reason=unauthorized&next=' + encodeURIComponent('/app'));
            }
        })
        .catch(() => {
            /* Stay on page when offline; API calls will fail separately. */
        });
}());
