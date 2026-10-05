(function bootCloudApi() {
    const meta = document.querySelector('meta[name="api-url"]');
    const fromMeta = meta && meta.content ? String(meta.content).trim() : '';
    const cloud = window.MARKITHON_CLOUD || {};
    const fromCloud = cloud.API_URL ? String(cloud.API_URL).trim() : '';
    window.API_URL = String(fromMeta || fromCloud || window.API_URL || '').replace(/\/$/, '');
    window.FRONTEND_URL = String(cloud.FRONTEND_URL || window.FRONTEND_URL || '').replace(/\/$/, '');
    window.apiUrl = function apiUrl(path) {
        const value = String(path || '');
        if (!window.API_URL || /^https?:\/\//i.test(value)) return value;
        return window.API_URL + (value.charAt(0) === '/' ? value : '/' + value);
    };
    if (window.API_URL && !window.__mtFetchPatched) {
        const nativeFetch = window.fetch.bind(window);
        window.fetch = function (input, init) {
            const next = Object.assign({ credentials: 'include' }, init || {});
            if (typeof input === 'string' && input.indexOf('/api/') === 0) {
                return nativeFetch(window.apiUrl(input), next);
            }
            return nativeFetch(input, next);
        };
        window.__mtFetchPatched = true;
    }
}());
