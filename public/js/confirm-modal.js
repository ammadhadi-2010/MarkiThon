let confirmDelWait = null;

function closeConfirmDelete(ok) {
    const back = document.getElementById('confirmDel');
    if (back) {
        back.classList.remove('open');
        back.hidden = true;
    }
    const wait = confirmDelWait;
    confirmDelWait = null;
    if (wait) wait(Boolean(ok));
}

function openConfirmDelete(opts) {
    const options = opts || {};
    const back = document.getElementById('confirmDel');
    if (!back) return Promise.resolve(false);
    document.getElementById('confirmDelTitle').textContent = options.title || 'Delete record';
    const name = document.getElementById('confirmDelName');
    const detail = String(options.detail || '').trim();
    name.textContent = detail;
    name.hidden = !detail;
    document.getElementById('confirmDelText').textContent = options.warning
        || 'Are you sure you want to delete this record? This action cannot be undone.';
    document.getElementById('confirmDelYes').textContent = options.yesLabel || 'Delete';
    back.hidden = false;
    back.classList.add('open');
    return new Promise((resolve) => {
        confirmDelWait = resolve;
    });
}

function bindConfirmDelete() {
    const back = document.getElementById('confirmDel');
    if (!back || back.dataset.bound) return;
    back.dataset.bound = '1';
    document.getElementById('confirmDelNo').addEventListener('click', () => closeConfirmDelete(false));
    document.getElementById('confirmDelYes').addEventListener('click', () => closeConfirmDelete(true));
    back.addEventListener('click', (event) => {
        if (event.target === back) closeConfirmDelete(false);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('confirmDel')) {
        document.body.insertAdjacentHTML('beforeend', confirmDelMarkup());
    }
    bindConfirmDelete();
});
