const OB_WIZARD = [1, 2, 4, 5, 6, 7];

function obWizardIndex(step) {
    const i = OB_WIZARD.indexOf(Number(step));
    return i < 0 ? 0 : i;
}

function onboardingHeaderMarkup(step) {
    const titles = {
        1: ['Shop Basic Information', 'Tell us about your shop so we can set up your system properly.'],
        2: ['Product Types', 'Select the product categories you deal in. This will help us set up the right inventory fields for you.'],
        4: ['Package Selection', 'Choose a plan that fits your business needs.'],
        5: ['Staff / Employees', 'Add your staff members and set their access permissions.'],
        6: ['Digital Presence', 'Add your online presence, store location, and live store link.'],
        7: ['Store Verification & Digital Assets', 'Admin approval unlocks branded QR, sharing, and your digital business card.']
    };
    const [title, sub] = titles[step] || titles[1];
    const current = obWizardIndex(step);
    const display = current + 1;
    const free = typeof obCanJumpSteps === 'function' && obCanJumpSteps();
    const dots = OB_WIZARD.map((n, i) => {
        const can = free || (typeof obCanOpenStep === 'function' && obCanOpenStep(n));
        let cls = '';
        if (i < current) cls = 'done';
        else if (i === current) cls = 'on';
        if (can) cls = (cls ? cls + ' ' : '') + 'jump';
        const label = i < current ? '✓' : String(i + 1);
        return `<button type="button" class="ob-step-dot${cls ? ' ' + cls : ''}" data-objump="${n}"
            aria-label="Go to step ${i + 1}" ${can ? '' : 'disabled'}>${label}</button>`;
    }).join('');
    return `
        <div class="ob-head">
            <div class="ob-heading">
                <span class="ob-badge">${display}</span>
                <div>
                    <h2>${title}</h2>
                    <p>${sub}</p>
                </div>
            </div>
            <div class="ob-steps">${dots}</div>
        </div>`;
}

function obInput(id, label, extra) {
    return `<div class="field">
        <label>${label}</label>
        <input id="${id}" name="${id}" ${extra} autocomplete="off">
    </div>`;
}

function onboardingStep1Markup() {
    return `
        <form id="obForm" class="ob-panel" data-obstep="1" autocomplete="off">
            ${typeof onboardingMediaMarkup === 'function' ? onboardingMediaMarkup() : ''}
            <div class="ob-fields ob-grid">
                ${obInput('obShopName', 'Shop Name *', 'required placeholder="Ammad Hadi Stor"')}
                ${obInput('obOwnerName', 'Owner Name *', 'required placeholder="Ammad Hadi"')}
                ${obInput('obOwnerCnic', 'ID Card Number / CNIC', 'placeholder="e.g. 36302-1234567-1" maxlength="20"')}
                ${obInput('obShopSku', 'Shop SKU / Store Code', 'placeholder="e.g. GMS-MLT-01" maxlength="40"')}
                ${obInput('obEmailAddress', 'Email Address *', 'type="email" required placeholder="ammad@hadistor.pk"')}
                ${obInput('obPhoneNumber', 'Phone Number *', 'required placeholder="0300-1234567"')}
                ${obInput('obOrderWhatsapp', 'WhatsApp Number (Orders)', 'type="tel" inputmode="numeric" placeholder="0300-1234567" maxlength="12"')}
                ${obInput('obMarketName', 'Market Name *', 'required placeholder="Central Market"')}
                ${obInput('obShopNumber', 'Shop Number *', 'required placeholder="12-B"')}
                ${obInput('obShopAddress', 'Shop Address *', 'required placeholder="Main Market, Punjab"')}
            </div>
            <div class="field ob-bio">
                <label>Shop Description / Bio</label>
                <textarea id="obShopBio" name="obShopBio" rows="3" maxlength="500"
                    placeholder="Premium bedding, towels, and home textiles from Ammad Hadi Stor."
                    autocomplete="off"></textarea>
            </div>
            <p class="ob-label">Shop Type</p>
            <div class="ob-choice shop-types" id="obShopType">
                ${typeof obShopTypeMarkup === 'function'
                    ? obShopTypeMarkup('Clothing & Fashion')
                    : '<button type="button" class="ob-chip on" data-shoptype="Clothing & Fashion"><span>👗</span>Clothing & Fashion</button>'}
            </div>
            <p class="ob-label">Business Type</p>
            <div class="ob-choice slim" id="obBusinessType">
                <button type="button" class="ob-chip" data-bustype="Retail"><span>🛍️</span>Retail</button>
                <button type="button" class="ob-chip" data-bustype="Wholesale"><span>📦</span>Wholesale</button>
                <button type="button" class="ob-chip on" data-bustype="Both"><span>🏬</span>Both</button>
            </div>
            <div class="ob-actions">
                <button type="button" class="ghost" id="obCancel">Cancel</button>
                <button type="submit" class="primary" id="obNext">Next →</button>
            </div>
        </form>`;
}

function onboardingPassMarkup() {
    return `
        <section class="ob-pass-card" id="obPassCard" hidden>
            <p class="ob-label">Password Management</p>
            <div id="obPassForm" autocomplete="off">
                <label>Current Password
                    <span class="pw-field">
                        <input id="obCurrentPass" name="obCurrentPass" type="password" autocomplete="off">
                        <button type="button" class="pw-toggle" aria-label="Show password"></button>
                    </span>
                </label>
                <label>New Password
                    <span class="pw-field">
                        <input id="obNewPass" name="obNewPass" type="password" autocomplete="off">
                        <button type="button" class="pw-toggle" aria-label="Show password"></button>
                    </span>
                </label>
                <label>Confirm Password
                    <span class="pw-field">
                        <input id="obConfirmPass" name="obConfirmPass" type="password" autocomplete="off">
                        <button type="button" class="pw-toggle" aria-label="Show password"></button>
                    </span>
                </label>
                <p class="ob-pass-note" id="obPassNote"></p>
                <button class="primary" type="button" id="obPassSave">Update Password</button>
            </div>
        </section>`;
}

function onboardingMarkup() {
    return `<div class="ob-card" id="obCard">
        <div id="obHead">${onboardingHeaderMarkup(1)}</div>
        ${onboardingStep1Markup()}
        ${typeof onboardingStep2Markup === 'function' ? onboardingStep2Markup() : ''}
        ${typeof onboardingStep4Markup === 'function' ? onboardingStep4Markup() : ''}
        ${typeof onboardingStep5Markup === 'function' ? onboardingStep5Markup() : ''}
        ${typeof onboardingStep6Markup === 'function' ? onboardingStep6Markup() : ''}
        ${typeof onboardingStep7Markup === 'function' ? onboardingStep7Markup() : ''}
        ${onboardingPassMarkup()}
    </div>`;
}
