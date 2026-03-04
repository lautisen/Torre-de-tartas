/**
 * Rewarded Ads Manager using Google IMA SDK v3
 * Delivers video ads via VAST tags for AdSense/AdMob.
 */
const rewardedAds = {
    initialized: false,
    adsLoader: null,
    adsManager: null,
    adDisplayContainer: null,
    onRewarded: null,
    onDismissed: null,

    init() {
        // Enforce consent check if the privacyManager is available
        if (window.privacyManager && !window.privacyManager.hasConsent()) {
            console.warn('[Ads] Consent not granted yet. Waiting.');
            return;
        }

        if (!window.google || !window.google.ima) {
            console.warn('[Ads] IMA SDK not loaded.');
            return;
        }

        const adContainer = document.getElementById('ad-container');
        if (!adContainer) return;

        this.adDisplayContainer = new google.ima.AdDisplayContainer(adContainer);
        this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);

        this.adsLoader.addEventListener(
            google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
            (e) => this._onAdsManagerLoaded(e),
            false
        );

        this.adsLoader.addEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            (e) => this._onAdError(e),
            false
        );

        this.initialized = true;
        console.log('[Ads] IMA SDK initialized.');
    },

    /**
     * Show a rewarded ad using IMA SDK.
     */
    showRewarded(name, onRewarded, onDismissed) {
        this.onRewarded = onRewarded;
        this.onDismissed = onDismissed;

        if (!this.initialized) {
            console.warn('[Ads] IMA not initialized. No ad available.');
            if (onDismissed) onDismissed();
            return;
        }

        const adContainer = document.getElementById('ad-container');
        adContainer.classList.remove('hidden');
        this.adDisplayContainer.initialize();

        const adsRequest = new google.ima.AdsRequest();
        adsRequest.adTagUrl = firebaseConfig.adVastTag;

        // Configuration for video area
        adsRequest.linearAdSlotWidth = window.innerWidth;
        adsRequest.linearAdSlotHeight = window.innerHeight;
        adsRequest.nonLinearAdSlotWidth = window.innerWidth;
        adsRequest.nonLinearAdSlotHeight = window.innerHeight;

        this.adsLoader.requestAds(adsRequest);
    },

    _onAdsManagerLoaded(adsManagerLoadedEvent) {
        const adsRenderingSettings = new google.ima.AdsRenderingSettings();
        adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

        this.adsManager = adsManagerLoadedEvent.getAdsManager(adsRenderingSettings);

        this.adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, (e) => this._onAdError(e));

        this.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, () => {
            // Pause game audio/logic if needed
        });

        this.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, () => {
            this._closeAd();
        });

        this.adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
            if (this.onRewarded) this.onRewarded();
            this._closeAd();
        });

        this.adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPED, () => {
            if (this.onDismissed) this.onDismissed();
            this._closeAd();
        });

        try {
            this.adsManager.init(window.innerWidth, window.innerHeight, google.ima.ViewMode.FULLSCREEN);
            this.adsManager.start();
        } catch (adError) {
            this._onAdError(adError);
        }
    },

    _onAdError(adErrorEvent) {
        console.warn('[Ads] IMA Ad Error:', adErrorEvent.getError ? adErrorEvent.getError() : adErrorEvent);
        if (this.adsManager) this.adsManager.destroy();
        this._closeAd();
        // If the ad fails, just dismiss gracefully — no fake countdown.
        if (this.onDismissed) this.onDismissed();
    },

    _closeAd() {
        const adContainer = document.getElementById('ad-container');
        if (adContainer) adContainer.classList.add('hidden');
        if (this.adsManager) {
            this.adsManager.destroy();
            this.adsManager = null;
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    rewardedAds.init();
});
