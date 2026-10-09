function saCatToast(message, isError) {
    let el = document.getElementById('saCatToast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'saCatToast';
        el.className = 'sa-cat-toast';
        document.body.appendChild(el);
    }
    el.textContent = message || '';
    el.classList.toggle('is-error', Boolean(isError));
    el.classList.add('on');
    clearTimeout(saCatToast._t);
    saCatToast._t = setTimeout(() => el.classList.remove('on'), 2400);
}

function saPaintSubTags(tags) {
    const list = document.getElementById('saFormSubList');
    if (!list) return;
    list.innerHTML = tags.map((name, index) => `
        <span class="sa-cat-tag">
            <em>${saText(name)}</em>
            <button type="button" data-tag-x="${index}" aria-label="Remove">×</button>
        </span>`).join('');
}

function saWireSubTags(tags) {
    const input = document.getElementById('saFormSubInput');
    const box = document.getElementById('saFormSubTags');
    if (!input || !box) return;
    const push = (raw) => {
        String(raw || '').split(',').forEach((part) => {
            const name = String(part || '').trim();
            if (name.length < 2) return;
            if (tags.some((row) => row.toLowerCase() === name.toLowerCase())) return;
            tags.push(name);
        });
        input.value = '';
        saPaintSubTags(tags);
    };
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            push(input.value.replace(/,/g, ''));
        } else if (event.key === 'Backspace' && !input.value && tags.length) {
            tags.pop();
            saPaintSubTags(tags);
        }
    });
    input.addEventListener('blur', () => {
        if (input.value.trim()) push(input.value);
    });
    box.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-tag-x]');
        if (btn) {
            tags.splice(Number(btn.dataset.tagX), 1);
            saPaintSubTags(tags);
            return;
        }
        input.focus();
    });
}

function saFlushSubDraft(tags) {
    const draft = document.getElementById('saFormSubInput');
    if (!draft || !draft.value.trim()) return;
    const name = draft.value.trim();
    if (name.length >= 2 && !tags.some((row) => row.toLowerCase() === name.toLowerCase())) {
        tags.push(name);
    }
    draft.value = '';
}
