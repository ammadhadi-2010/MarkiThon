const PW_EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const PW_EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-4.1 4.8"/><path d="M6.1 6.1C3.7 7.8 2 12 2 12a17.5 17.5 0 0 0 7.1 5.9"/></svg>';

function enhancePasswordField(input) {
    if (!input || input.dataset.pwReady === '1') return;
    if (input.closest('.pw-field')) {
        input.dataset.pwReady = '1';
        return;
    }
    input.dataset.pwReady = '1';
    const wrap = document.createElement('div');
    wrap.className = 'pw-field';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pw-toggle';
    btn.setAttribute('aria-label', 'Show password');
    btn.innerHTML = PW_EYE;
    btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.innerHTML = show ? PW_EYE_OFF : PW_EYE;
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        input.focus();
    });
    wrap.appendChild(btn);
}

function bindPasswordToggles(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('input[type="password"]').forEach(enhancePasswordField);
}

document.addEventListener('DOMContentLoaded', () => bindPasswordToggles(document));
document.addEventListener('focusin', (event) => {
    const input = event.target;
    if (input && input.matches && input.matches('input[type="password"]')) {
        enhancePasswordField(input);
    }
});

window.bindPasswordToggles = bindPasswordToggles;
window.enhancePasswordField = enhancePasswordField;
