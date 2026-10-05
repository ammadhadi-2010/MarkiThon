const OB_MAP_DEFAULT = [30.1575, 71.5249];

function isPlusCode(value) {
    return /^[2-9C-HJ-NP-Z]{4,8}\+[2-9C-HJ-NP-Z]{2,3}\b/i.test(String(value || '').trim());
}

function isGoogleMapsLink(value) {
    try {
        const url = new URL(String(value || '').trim());
        const host = url.hostname.replace(/^www\./, '').toLowerCase();
        if (host === 'maps.app.goo.gl' || host === 'goo.gl') return true;
        if (host === 'maps.google.com' || host === 'google.com' || host.endsWith('.google.com')) {
            return url.pathname.includes('/maps') || host === 'maps.google.com';
        }
        return false;
    } catch (error) {
        return false;
    }
}

function parseMapsCoords(value) {
    const text = String(value || '');
    const at = text.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (at) return [Number(at[1]), Number(at[2])];
    const bang = text.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    if (bang) return [Number(bang[1]), Number(bang[2])];
    const query = text.match(/[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i);
    if (query) return [Number(query[1]), Number(query[2])];
    const path = text.match(/\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (path) return [Number(path[1]), Number(path[2])];
    return null;
}

function obEmbedSrc(lat, lng, query) {
    if (query && !(Number.isFinite(lat) && Number.isFinite(lng))) {
        return 'https://maps.google.com/maps?q=' + encodeURIComponent(query) + '&z=18&output=embed';
    }
    const pinLat = Number.isFinite(lat) ? lat : OB_MAP_DEFAULT[0];
    const pinLng = Number.isFinite(lng) ? lng : OB_MAP_DEFAULT[1];
    return 'https://maps.google.com/maps?q=' + pinLat + ',' + pinLng + '&z=18&output=embed';
}

function updateObEmbedMap() {
    const frame = document.getElementById('obMapEmbed');
    if (!frame) return;
    const lat = Number(document.getElementById('obLatitude').value);
    const lng = Number(document.getElementById('obLongitude').value);
    const query = (document.getElementById('obMapsLink') && document.getElementById('obMapsLink').value.trim()) || '';
    const next = (Number.isFinite(lat) && Number.isFinite(lng) && lat && lng)
        ? obEmbedSrc(lat, lng)
        : obEmbedSrc(NaN, NaN, query);
    if (frame.getAttribute('src') !== next) frame.src = next;
}

function writeObCoords(lat, lng) {
    const latEl = document.getElementById('obLatitude');
    const lngEl = document.getElementById('obLongitude');
    if (!latEl || !lngEl) return;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        latEl.value = '';
        lngEl.value = '';
        updateObEmbedMap();
        return;
    }
    latEl.value = Number(lat).toFixed(6);
    lngEl.value = Number(lng).toFixed(6);
    updateObEmbedMap();
}

function applyObMapsLink() {
    const input = document.getElementById('obMapsLink');
    const row = document.getElementById('obMapsRow');
    const hint = document.getElementById('obMapLabel');
    if (!input || !row) return;
    const value = input.value.trim();
    const valid = Boolean(value) && (isGoogleMapsLink(value) || isPlusCode(value));
    row.classList.toggle('filled', valid);
    const coords = value ? parseMapsCoords(value) : null;
    if (coords) {
        writeObCoords(coords[0], coords[1]);
        if (hint) hint.textContent = 'Coordinates saved: ' + coords[0].toFixed(5) + ', ' + coords[1].toFixed(5);
        return;
    }
    updateObEmbedMap();
    if (!hint) return;
    hint.textContent = valid
        ? 'Link saved. Detect live location if this short URL has no pin numbers.'
        : 'Use live GPS or paste a Google Maps link.';
}

function detectObLiveLocation() {
    if (!navigator.geolocation) return showToast('Live location is not supported.');
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            writeObCoords(pos.coords.latitude, pos.coords.longitude);
            const hint = document.getElementById('obMapLabel');
            if (hint) {
                hint.textContent = 'Live location: '
                    + pos.coords.latitude.toFixed(5) + ', '
                    + pos.coords.longitude.toFixed(5);
            }
            showToast('Live location detected.');
        },
        () => showToast('Could not detect live location.'),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}
