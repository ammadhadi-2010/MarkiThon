async function apiRequest(url, options = {}) {
    const target = typeof apiUrl === 'function' ? apiUrl(url) : url;
    const res = await fetch(target, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
    }).catch(() => {
        throw new Error('OFFLINE');
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.message || 'Request failed');
    }
    return data;
}

const api = {
    get: (url) => apiRequest(url),
    post: (url, body) => apiRequest(url, { method: 'POST', body: JSON.stringify(body) }),
    put: (url, body) => apiRequest(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
    del: (url) => apiRequest(url, { method: 'DELETE' })
};
