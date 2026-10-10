function saShowToast(message, tone) {
    let host = document.getElementById('saToastHost');
    if (!host) {
        host = document.createElement('div');
        host.id = 'saToastHost';
        host.className = 'sa-toast-host';
        document.body.appendChild(host);
    }
    const item = document.createElement('div');
    item.className = 'sa-toast' + (tone === 'success' ? ' is-ok' : tone === 'error' ? ' is-err' : '');
    item.textContent = String(message || '');
    host.appendChild(item);
    window.setTimeout(() => {
        item.classList.add('is-out');
        window.setTimeout(() => item.remove(), 320);
    }, 4200);
}
