/**
 * Torre de Tartas - Privacy & Consent Manager
 */
const privacyManager = {
    CONSENT_KEY: 'cake-tower-consent',

    init() {
        if (!this.hasUserInteracted()) {
            this.showBanner();
        }
    },

    hasUserInteracted() {
        return localStorage.getItem(this.CONSENT_KEY) !== null;
    },

    hasConsent() {
        return localStorage.getItem(this.CONSENT_KEY) === 'true';
    },

    acceptAll() {
        localStorage.setItem(this.CONSENT_KEY, 'true');
        this.hideBanner();
        // Trigger ad reload or initialization if needed
        if (window.rewardedAds) {
            window.rewardedAds.init();
        }
    },

    declineAll() {
        localStorage.setItem(this.CONSENT_KEY, 'false');
        this.hideBanner();
    },

    showBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="consent-content">
                <div class="consent-text">
                    <p>🍪 Usamos cookies para mejorar tu experiencia y mostrar anuncios relevantes. 
                    Al jugar, aceptas nuestra <a href="privacy.html" target="_blank">Política de Privacidad</a>.</p>
                </div>
                <div class="consent-actions">
                    <button id="consent-accept" class="btn-green">Aceptar</button>
                    <button id="consent-decline" class="btn-outline" style="font-size: 0.8em; opacity: 0.7;">Solo esenciales</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);

        document.getElementById('consent-accept').addEventListener('click', () => this.acceptAll());
        document.getElementById('consent-decline').addEventListener('click', () => this.declineAll());
    },

    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.style.transform = 'translateY(100%)';
            setTimeout(() => banner.remove(), 400);
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    privacyManager.init();
});
