function actionMenuHtml(id, extra = '', opts = {}) {
    const share = opts.share
        ? `<button type="button" data-id="${id}" data-act="share">Share Product</button>`
        : '';
    const history = opts.history
        ? `<button type="button" data-id="${id}" data-act="history">View History</button>`
        : '';
    const editLabel = opts.editLabel || (opts.history ? 'Edit Product' : 'Edit');
    const deleteLabel = opts.deleteLabel || (opts.history ? 'Delete Product' : 'Delete');
    return `
        <div class="action-menu">
            <button type="button" class="dots" data-menu="1" title="Actions" aria-haspopup="true">⋮</button>
            <div class="action-drop">
                ${extra}
                <button type="button" data-id="${id}" data-act="edit">${editLabel}</button>
                ${share}
                ${history}
                <button type="button" class="danger" data-id="${id}" data-act="delete">${deleteLabel}</button>
            </div>
        </div>`;
}

document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-menu]');
    const current = toggle ? toggle.closest('.action-menu') : null;
    document.querySelectorAll('.action-menu.open').forEach((menu) => {
        if (menu !== current) menu.classList.remove('open', 'drop-up');
    });
    if (current) {
        event.preventDefault();
        const willOpen = !current.classList.contains('open');
        current.classList.toggle('open');
        if (willOpen) placeActionMenu(current);
        else current.classList.remove('drop-up');
    }
});

function placeActionMenu(menu) {
    const drop = menu.querySelector('.action-drop');
    if (!drop) return;
    menu.classList.remove('drop-up');
    const btn = menu.getBoundingClientRect();
    const need = Math.max(drop.offsetHeight || 0, 132) + 12;
    const below = window.innerHeight - btn.bottom;
    if (below < need && btn.top > below) menu.classList.add('drop-up');
}

function disableAutofill(root = document) {
    root.querySelectorAll('form, input, select, textarea').forEach((el) => {
        el.setAttribute('autocomplete', 'off');
        if (el.tagName === 'FORM') el.setAttribute('autocomplete', 'off');
    });
}
