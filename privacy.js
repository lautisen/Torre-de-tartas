/**
 * Torre de Tartas - Privacy & Consent Manager
 * The cookie banner is managed by Google AdSense's official
 * Privacy & Messaging tool. This module only tracks the consent
 * state for internal use (e.g., blocking ads until consent is given).
 */
const privacyManager = {
    CONSENT_KEY: 'cake-tower-consent',

    init() {
        // The Google AdSense CMP (created at cake-game.online/privacysettings)
        // handles the consent banner automatically via the AdSense script.
        // We do not show a custom banner here to avoid policy conflicts.
    },

    hasUserInteracted() {
        return localStorage.getItem(this.CONSENT_KEY) !== null;
    },

    hasConsent() {
        // Default to true to not block ads — the Google CMP manages GDPR consent.
        // If you want to block ads until the Google CMP fires, wire this up
        // to the __tcfapi callback instead.
        return true;
    },

    acceptAll() {
        localStorage.setItem(this.CONSENT_KEY, 'true');
    },

    declineAll() {
        localStorage.setItem(this.CONSENT_KEY, 'false');
    }
};

window.addEventListener('DOMContentLoaded', () => {
    privacyManager.init();
});
