const PW_EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const PW_EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-4.1 4.8"/><path d="M6.1 6.1C3.7 7.8 2 12 2 12a17.5 17.5 0 0 0 7.1 5.9"/></svg>';

function pwSetToggleIcon(btn, showing) {
    if (!btn) return;
    btn.innerHTML = showing ? PW_EYE_OFF : PW_EYE;
    btn.setAttribute('aria-label', showing ? 'Hide password' : 'Show password');
}

function wirePasswordToggle(input, btn) {
    if (!input || !btn || btn.dataset.pwBound === '1') return;
    btn.dataset.pwBound = '1';
    pwSetToggleIcon(btn, input.type === 'text');
    btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        pwSetToggleIcon(btn, show);
        input.focus();
    });
}

function enhancePasswordField(input) {
    if (!input || !input.matches || !input.matches('input')) return;
    const wrap = input.closest('.pw-field');
    if (wrap) {
        let btn = wrap.querySelector('.pw-toggle');
        if (!btn) {
            btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pw-toggle';
            wrap.appendChild(btn);
        }
        wirePasswordToggle(input, btn);
        input.dataset.pwReady = '1';
        return;
    }
    if (input.dataset.pwReady === '1') return;
    if (input.type !== 'password' && input.type !== 'text') return;
    input.dataset.pwReady = '1';
    const shell = document.createElement('span');
    shell.className = 'pw-field';
    input.parentNode.insertBefore(shell, input);
    shell.appendChild(input);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pw-toggle';
    shell.appendChild(btn);
    wirePasswordToggle(input, btn);
}

function resetPasswordFields(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('.pw-field input').forEach((input) => {
        input.value = '';
        input.type = 'password';
        const btn = input.closest('.pw-field').querySelector('.pw-toggle');
        pwSetToggleIcon(btn, false);
    });
}

function bindPasswordToggles(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('.pw-field input, input[type="password"]').forEach(enhancePasswordField);
}

document.addEventListener('DOMContentLoaded', () => bindPasswordToggles(document));
document.addEventListener('focusin', (event) => {
    const input = event.target;
    if (input && input.matches && input.matches('input[type="password"], .pw-field input')) {
        enhancePasswordField(input);
    }
});

window.bindPasswordToggles = bindPasswordToggles;
window.enhancePasswordField = enhancePasswordField;
window.resetPasswordFields = resetPasswordFields;
