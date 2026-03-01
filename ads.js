/**
 * Rewarded Ads Manager
 * Uses Google Ad Placement API (H5 Games Ads) for rewarded video ads.
 * Falls back to a simulated ad if the API isn't available (e.g., ad blockers).
 */
const rewardedAds = {
    initialized: false,
    adBreak: null,

    init() {
        // Set up the Ad Placement API bridge
        window.adsbygoogle = window.adsbygoogle || [];
        const _adBreak = window.adConfig = window.adBreak = function (o) {
            window.adsbygoogle.push(o);
        };
        this.adBreak = _adBreak;

        // Configure ad preloading
        try {
            this.adBreak({ preloadAdBreaks: 'on', sound: 'on' });
            this.initialized = true;
            console.log('[Ads] Ad Placement API initialized.');
        } catch (e) {
            console.warn('[Ads] Could not initialize Ad Placement API:', e);
        }
    },

    /**
     * Show a rewarded ad. If the ad is available it will show;
     * if not (ad blocker, no fill, etc.) it falls back to a simulated "ad".
     * @param {string} name - Identifier for the ad placement
     * @param {function} onRewarded - Callback when the user earns the reward
     * @param {function} [onDismissed] - Optional callback if user skips/dismisses
     */
    showRewarded(name, onRewarded, onDismissed) {
        if (!this.initialized || !this.adBreak) {
            console.warn('[Ads] API not available, using fallback.');
            this._fallbackAd(name, onRewarded, onDismissed);
            return;
        }

        try {
            this.adBreak({
                type: 'reward',
                name: name,
                beforeReward: (showAdFn) => {
                    showAdFn();
                },
                adViewed: () => {
                    console.log(`[Ads] Reward earned: ${name}`);
                    if (onRewarded) onRewarded();
                },
                adDismissed: () => {
                    console.log(`[Ads] Ad dismissed: ${name}`);
                    if (onDismissed) onDismissed();
                },
                adBreakDone: (placementInfo) => {
                    // If no ad was available (noAdAvailable), use fallback
                    if (placementInfo && placementInfo.breakStatus === 'notReady') {
                        console.log('[Ads] No ad available, using fallback.');
                        this._fallbackAd(name, onRewarded, onDismissed);
                    }
                }
            });
        } catch (e) {
            console.warn('[Ads] Error showing ad, using fallback:', e);
            this._fallbackAd(name, onRewarded, onDismissed);
        }
    },

    /**
     * Fallback "ad" — shows a brief countdown overlay when real ads aren't available.
     * This ensures the reward flow always works during development or with ad blockers.
     */
    _fallbackAd(name, onRewarded, onDismissed) {
        const overlay = document.createElement('div');
        overlay.id = 'fallback-ad-overlay';
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.85)',
            zIndex: '9999', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: 'white',
            fontFamily: 'Outfit, sans-serif', textAlign: 'center'
        });

        overlay.innerHTML = `
            <p style="font-size: 1.2em; margin-bottom: 10px; opacity: 0.7;">📺 Anuncio</p>
            <p id="fallback-ad-timer" style="font-size: 4em; font-weight: 900; margin: 0;">5</p>
            <p style="font-size: 0.85em; margin-top: 15px; opacity: 0.5;">El anuncio se mostrará aquí cuando esté disponible</p>
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

// Initialize when the script loads
window.addEventListener('DOMContentLoaded', () => {
    rewardedAds.init();
});
