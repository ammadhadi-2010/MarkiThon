function osWebIcon(paths) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${paths}</svg>`;
}

function osWebRow(id, icon, title, hint, onText, offText) {
    return `<div class="os-web-row">
        <span class="os-web-ico" aria-hidden="true">${icon}</span>
        <span class="os-web-copy">
            <strong>${title}</strong>
            <small>${hint}</small>
        </span>
        <span class="os-web-ctl">
            <label class="os-feat">
                <input id="${id}" name="${id}" type="checkbox" role="switch" autocomplete="off">
                <span></span>
            </label>
            <em data-oswebon="${onText}" data-osweboff="${offText}">${offText}</em>
        </span>
    </div>`;
}

function storeEditWebMarkup() {
    return `
        <div class="os-web-grid">
            ${osWebRow('osEditPub', osWebIcon('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'),
                'Website Status', 'Product is visible on your online store.', 'Published', 'Hidden')}
            ${osWebRow('osEditFeat', osWebIcon('<path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.8 7.2 17.9l.9-5.4-3.9-3.8 5.4-.8Z"/>'),
                'Featured Product', 'Show on homepage featured section.', 'Yes', 'No')}
            ${osWebRow('osEditNew', osWebIcon('<path d="M12 3v4"/><path d="M12 17v4"/><path d="M5 8l2.5 2"/><path d="M16.5 14 19 16"/><path d="M5 16l2.5-2"/><path d="M16.5 10 19 8"/><circle cx="12" cy="12" r="3"/>'),
                'New Arrival', 'Show in new arrivals section.', 'Yes', 'No')}
            ${osWebRow('osEditSale', osWebIcon('<path d="M8.5 14.5 3 21"/><path d="M14 3l7 7-8.5 8.5H5.5V11.5Z"/>'),
                'Sale Product', 'Show in sale section.', 'Yes', 'No')}
        </div>`;
}

function paintOsWebLabels() {
    document.querySelectorAll('.os-web-ctl em').forEach((el) => {
        const input = el.closest('.os-web-row')?.querySelector('input[type="checkbox"]');
        if (!input) return;
        el.textContent = input.checked ? (el.dataset.oswebon || 'Yes') : (el.dataset.osweboff || 'No');
        el.classList.toggle('on', input.checked);
    });
}
