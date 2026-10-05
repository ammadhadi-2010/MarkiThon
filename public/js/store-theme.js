function paintOsThemeSelected() {
    document.querySelectorAll('.os-th-card').forEach((label) => {
        const on = label.querySelector('input[name="osStoreTheme"]');
        label.classList.toggle('on', Boolean(on && on.checked));
    });
}

function fillOsTheme(row) {
    const data = row || {};
    const themeId = data.themeId || 'standard-retail';
    const assets = data.assets || {};
    document.querySelectorAll('input[name="osStoreTheme"]').forEach((input) => {
        input.checked = input.value === themeId;
    });
    paintOsThemeSlots(themeId);
    Object.keys(osThemeAssetsRead()).forEach((key) => paintOsThemeAsset(key, assets[key] || ''));
    paintOsThemeSelected();
    paintOsThemePreview();
}

async function loadStoreTheme() {
    try {
        fillOsTheme(await api.get('/api/online-store/theme'));
    } catch (error) {
        fillOsTheme({ themeId: 'standard-retail', assets: {} });
        showToast(error.message);
    }
}

async function saveStoreTheme() {
    const btn = document.getElementById('osThemeSave');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Saving...';
    }
    try {
        const payload = { themeId: osSelectedThemeId(), assets: osThemeAssetsRead() };
        const data = await api.put('/api/online-store/theme', payload);
        fillOsTheme(data.theme || payload);
        showToast(data.message || 'Theme and branding saved.');
    } catch (error) {
        showToast(error.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Save Theme & Branding';
        }
    }
}

function bindStoreTheme() {
    const card = document.getElementById('osThemeCard');
    if (!card || card.dataset.bound) return;
    card.dataset.bound = '1';
    const retail = card.querySelector('input[name="osStoreTheme"][value="standard-retail"]');
    if (retail) retail.checked = true;
    bindOsThemeUploads();
    card.addEventListener('change', (event) => {
        if (event.target && event.target.name === 'osStoreTheme') {
            paintOsThemeSlots(event.target.value);
            paintOsThemeSelected();
        }
    });
    document.getElementById('osThemeSave')?.addEventListener('click', () => {
        saveStoreTheme().catch((err) => showToast(err.message));
    });
    paintOsThemeSelected();
    paintOsThemePreview();
}
