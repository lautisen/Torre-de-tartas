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
    currentAd: null,

    init() {
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
            console.warn('[Ads] IMA not initialized, using fallback.');
            this._fallbackAd(name, onRewarded, onDismissed);
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
        console.warn('[Ads] IMA Ad Error:', adErrorEvent.getError());
        if (this.adsManager) this.adsManager.destroy();
        this._fallbackAd('error', this.onRewarded, this.onDismissed);
        this._closeAd();
    },

    _closeAd() {
        const adContainer = document.getElementById('ad-container');
        if (adContainer) adContainer.classList.add('hidden');
        if (this.adsManager) {
            this.adsManager.destroy();
            this.adsManager = null;
        }
    },

    _fallbackAd(name, onRewarded, onDismissed) {
        const overlay = document.createElement('div');
        overlay.id = 'fallback-ad-overlay';
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.85)',
            zIndex: '10000', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: 'white',
            fontFamily: 'Outfit, sans-serif', textAlign: 'center'
        });

        overlay.innerHTML = `
            <p style="font-size: 1.2em; margin-bottom: 10px; opacity: 0.7;">📺 Anuncio (Simulado)</p>
            <p id="fallback-ad-timer" style="font-size: 4em; font-weight: 900; margin: 0;">5</p>
            <p style="font-size: 0.85em; margin-top: 15px; opacity: 0.5;">Usando modo de compatibilidad IMA</p>
        `;

        document.body.appendChild(overlay);

        let seconds = 5;
        const timerEl = overlay.querySelector('#fallback-ad-timer');
        const interval = setInterval(() => {
            seconds--;
            timerEl.innerText = seconds;
            if (seconds <= 0) {
                clearInterval(interval);
                overlay.remove();
                if (onRewarded) onRewarded();
            }
        }, 1000);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    rewardedAds.init();
});
