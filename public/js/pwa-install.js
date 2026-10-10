const PWA_DISMISS_KEY = 'mtPwaInstallDismissed';
let pwaInstallEvent = null;
let pwaPromptBound = false;

function pwaIsStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;
}

function pwaWasDismissed() {
    try {
        const raw = localStorage.getItem(PWA_DISMISS_KEY);
        if (!raw) return false;
        const at = Number(raw);
        if (!at) return false;
        return Date.now() - at < 7 * 24 * 60 * 60 * 1000;
    } catch (error) {
        return false;
    }
}

function pwaDismiss() {
    try {
        localStorage.setItem(PWA_DISMISS_KEY, String(Date.now()));
    } catch (error) {
        /* ignore */
    }
    pwaHidePrompt();
}

function pwaHidePrompt() {
    const back = document.getElementById('pwaInstallBack');
    if (back) back.hidden = true;
}

function pwaEnsurePrompt() {
    let back = document.getElementById('pwaInstallBack');
    if (back) return back;
    back = document.createElement('div');
    back.id = 'pwaInstallBack';
    back.className = 'pwa-install-back';
    back.hidden = true;
    back.innerHTML = `
        <div class="pwa-install-card" role="dialog" aria-labelledby="pwaInstallTitle" aria-modal="true">
            <div class="pwa-install-head">
                <img class="pwa-install-logo" src="/logo192.png" alt="MarkiThon" width="64" height="64">
                <div>
                    <h2 id="pwaInstallTitle">Install MarkiThon App</h2>
                    <p>MarkiThon · Local Shops, Global Reach</p>
                </div>
            </div>
            <p class="pwa-install-copy">
                Get fast access to POS, Inventory, and Marketplace right from your Desktop or Mobile home screen.
            </p>
            <div class="pwa-install-actions">
                <button type="button" class="pwa-install-now" id="pwaInstallNow">Install Now</button>
                <button type="button" class="pwa-install-dismiss" id="pwaInstallDismiss">Dismiss</button>
            </div>
        </div>`;
    document.body.appendChild(back);
    back.addEventListener('click', (event) => {
        if (event.target === back) pwaDismiss();
    });
    document.getElementById('pwaInstallNow').addEventListener('click', pwaTriggerInstall);
    document.getElementById('pwaInstallDismiss').addEventListener('click', pwaDismiss);
    return back;
}

function pwaShowPrompt() {
    if (pwaIsStandalone() || pwaWasDismissed() || !pwaInstallEvent) return;
    const back = pwaEnsurePrompt();
    back.hidden = false;
}

async function pwaTriggerInstall() {
    if (!pwaInstallEvent) return;
    const event = pwaInstallEvent;
    pwaInstallEvent = null;
    pwaHidePrompt();
    try {
        await event.prompt();
        const choice = await event.userChoice;
        if (choice && choice.outcome === 'dismissed') pwaDismiss();
        else {
            try {
                localStorage.removeItem(PWA_DISMISS_KEY);
            } catch (error) {
                /* ignore */
            }
        }
    } catch (error) {
        pwaDismiss();
    }
}

function pwaBindInstallPrompt() {
    if (pwaPromptBound || pwaIsStandalone()) return;
    pwaPromptBound = true;
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        pwaInstallEvent = event;
        window.setTimeout(pwaShowPrompt, 1200);
    });
    window.addEventListener('appinstalled', () => {
        pwaInstallEvent = null;
        pwaHidePrompt();
        try {
            localStorage.removeItem(PWA_DISMISS_KEY);
        } catch (error) {
            /* ignore */
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pwaBindInstallPrompt);
} else {
    pwaBindInstallPrompt();
}
