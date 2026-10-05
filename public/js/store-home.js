const OS_HOME_KEY = 'storeHomeControl';
const OS_HOME_DEFAULTS = {
    featured: true,
    newArrivals: true,
    sale: true,
    categories: true
};

function loadOsHomeState() {
    try {
        const raw = JSON.parse(localStorage.getItem(OS_HOME_KEY) || '{}');
        return { ...OS_HOME_DEFAULTS, ...(raw && typeof raw === 'object' ? raw : {}) };
    } catch (error) {
        return { ...OS_HOME_DEFAULTS };
    }
}

function saveOsHomeState(state) {
    localStorage.setItem(OS_HOME_KEY, JSON.stringify(state));
}

function readOsHomeForm() {
    return {
        featured: Boolean(document.getElementById('osHomeFeatured')?.checked),
        newArrivals: Boolean(document.getElementById('osHomeNew')?.checked),
        sale: Boolean(document.getElementById('osHomeSale')?.checked),
        categories: Boolean(document.getElementById('osHomeCats')?.checked)
    };
}

function paintOsHomeForm(state) {
    const data = state || loadOsHomeState();
    const map = [
        ['osHomeFeatured', data.featured],
        ['osHomeNew', data.newArrivals],
        ['osHomeSale', data.sale],
        ['osHomeCats', data.categories]
    ];
    map.forEach(([id, on]) => {
        const el = document.getElementById(id);
        if (el) el.checked = Boolean(on);
    });
}

function bindStoreHome() {
    const card = document.getElementById('osHomeCard');
    if (!card || card.dataset.bound) return;
    card.dataset.bound = '1';
    paintOsHomeForm(loadOsHomeState());
    card.querySelectorAll('input[type="checkbox"]').forEach((el) => {
        el.addEventListener('change', () => {
            const state = readOsHomeForm();
            saveOsHomeState(state);
            showToast('Homepage control saved.');
        });
    });
}
