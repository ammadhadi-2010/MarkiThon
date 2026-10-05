const OB_BANNER_LABELS = ['Banner 1 — Primary', 'Banner 2', 'Banner 3'];

function obUploadCard(prefix, title, hint, buttonLabel, extraClass) {
    return `
        <div class="ob-logo-card ob-drop ${extraClass || ''}" id="${prefix}Card" data-obdrop="${prefix}">
            <img id="${prefix}Preview" alt="${title}" hidden>
            <div id="${prefix}Hint" class="ob-logo-hint">${hint}</div>
            <button type="button" class="ob-logo-btn" id="${prefix}Change">${buttonLabel}</button>
            <p>${title}</p>
            <input id="${prefix}File" name="${prefix}File" type="file" accept="image/*" hidden autocomplete="off">
            <input id="${prefix}Url" name="${prefix}Url" type="hidden" autocomplete="off">
        </div>`;
}

function onboardingHeroSlidesMarkup() {
    return OB_BANNER_LABELS.map((label, i) => `
        <div class="ob-hero-slide${i === 0 ? ' on' : ''}" data-obslide="${i}">
            <img id="obBan${i}Stage" alt="${label}" hidden>
            <div class="ob-hero-empty" id="obBan${i}Empty">${label}</div>
        </div>`).join('');
}

function onboardingHeroDotsMarkup() {
    return [0, 1, 2].map((i) => `
        <button type="button" data-obdot="${i}" class="${i === 0 ? 'on' : ''}"
            aria-label="Show ${OB_BANNER_LABELS[i]}"></button>`).join('');
}

function onboardingMediaMarkup() {
    const slots = [0, 1, 2].map((i) =>
        obUploadCard('obBan' + i, OB_BANNER_LABELS[i], String(i + 1), 'Upload Banner'));
    return `
        <div class="ob-hero">
            <div class="ob-hero-stage" id="obHeroStage">
                ${onboardingHeroSlidesMarkup()}
                <button type="button" class="ob-hero-nav prev" id="obHeroPrev" aria-label="Previous banner">‹</button>
                <button type="button" class="ob-hero-nav next" id="obHeroNext" aria-label="Next banner">›</button>
                <div class="ob-hero-dots" id="obHeroDots">${onboardingHeroDotsMarkup()}</div>
                ${obUploadCard('obLogo', 'Shop Logo', 'M', 'Change Logo', 'ob-hero-logo')}
            </div>
            <p class="ob-label">Hero Banners (3 slides)</p>
            <div class="ob-hero-slots">${slots.join('')}</div>
        </div>`;
}
