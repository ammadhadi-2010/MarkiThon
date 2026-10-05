const OS_STORE_THEMES = [
    {
        id: 'modern-apparel',
        name: 'Modern Apparel',
        blurb: 'Editorial fashion with wide heroes and airy cards.',
        slots: [
            { key: 'logo', label: 'Brand Logo' },
            { key: 'hero', label: 'Hero Banner' },
            { key: 'showcaseA', label: 'Collection Showcase' },
            { key: 'showcaseB', label: 'Lookbook Image' }
        ]
    },
    {
        id: 'luxury-boutique',
        name: 'Luxury Boutique',
        blurb: 'Gold accents, oval frames, and a refined two-column grid.',
        slots: [
            { key: 'logo', label: 'Brand Logo' },
            { key: 'hero', label: 'Salon Hero Banner' },
            { key: 'showcaseA', label: 'Vitrine Showcase' },
            { key: 'showcaseB', label: 'Campaign Image' }
        ]
    },
    {
        id: 'urban-streetwear',
        name: 'Urban Streetwear',
        blurb: 'Bold type, sharp frames, and high-contrast drops.',
        slots: [
            { key: 'logo', label: 'Brand Logo' },
            { key: 'hero', label: 'Drop Hero Banner' },
            { key: 'showcaseA', label: 'Street Look' },
            { key: 'showcaseB', label: 'Collection Poster' }
        ]
    },
    {
        id: 'standard-retail',
        name: 'Standard Retail',
        blurb: 'Classic shop layout with rounded cards and a clear header.',
        slots: [
            { key: 'logo', label: 'Brand Logo' },
            { key: 'hero', label: 'Store Hero Banner' },
            { key: 'showcaseA', label: 'Featured Collection' },
            { key: 'showcaseB', label: 'Aisle Showcase' }
        ]
    }
];

function osThemeById(id) {
    return OS_STORE_THEMES.find((row) => row.id === id) || OS_STORE_THEMES[3];
}

function osSelectedThemeId() {
    const on = document.querySelector('input[name="osStoreTheme"]:checked');
    return (on && on.value) || 'standard-retail';
}

function osThemeAssetsRead() {
    return {
        logo: String(document.getElementById('osTh_logo')?.value || ''),
        hero: String(document.getElementById('osTh_hero')?.value || ''),
        showcaseA: String(document.getElementById('osTh_showcaseA')?.value || ''),
        showcaseB: String(document.getElementById('osTh_showcaseB')?.value || '')
    };
}
