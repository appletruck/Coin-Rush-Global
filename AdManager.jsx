// AdManager.jsx
// ─────────────────────────────────────────────────────────────────
// Replace YOUR_AD_CLIENT and YOUR_AD_SLOT_* with values from:
// https://adsense.google.com → Ads → By ad unit
// ─────────────────────────────────────────────────────────────────

const AD_CLIENT = "ca-pub-XXXXXXXXXXXXXXXX";   // ← YOUR AdSense Publisher ID
const AD_SLOTS = {
  banner:        "1234567890",                  // ← Banner ad slot
  interstitial:  "0987654321",                  // ← Interstitial ad slot
  rewarded:      "1122334455",                  // ← Rewarded ad slot
};

// Load AdSense script once
let adsenseLoaded = false;
export function loadAdSense() {
  if (adsenseLoaded || typeof window === "undefined") return;
  adsenseLoaded = true;
  const script = document.createElement("script");
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;
  script.async = true;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}

// ── Banner Ad ─────────────────────────────────────────────────────
// Place at the bottom of your game. Shows a real Google ad.
export function BannerAd({ width = 360 }) {
  return (
    <div style={{ width, overflow: "hidden", background: "#f0f0f0", minHeight: 50 }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOTS.banner}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <script dangerouslySetInnerHTML={{ __html: "(adsbygoogle = window.adsbygoogle || []).push({});" }} />
    </div>
  );
}

// ── Rewarded Ad ───────────────────────────────────────────────────
// Call this to show a rewarded ad. User watches → gets coins.
// Usage: showRewardedAd(onRewarded, onFailed)
export function showRewardedAd(onRewarded, onFailed) {
  if (typeof window === "undefined") { onFailed?.(); return; }

  window.adsbygoogle = window.adsbygoogle || [];

  window.adsbygoogle.push({
    googletag: {
      pubads: () => ({
        addEventListener: () => {},
      }),
    },
  });

  // AdSense Rewarded API
  const adConfig = {
    type: "reward",
    adSlot: AD_SLOTS.rewarded,
    adClient: AD_CLIENT,
  };

  try {
    window.adsbygoogle.push({
      params: adConfig,
      callback: (result) => {
        if (result?.reward) {
          onRewarded?.(result.reward);
        } else {
          onFailed?.();
        }
      },
    });
  } catch (e) {
    console.warn("Rewarded ad failed:", e);
    onFailed?.();
  }
}

// ── Interstitial Ad (Vignette) ────────────────────────────────────
// Google Auto Ads handles vignettes automatically when enabled.
// Enable in AdSense → Auto ads → Vignettes
// This function manually triggers one if the API supports it.
export function showInterstitialAd(onClose) {
  if (typeof window === "undefined") { onClose?.(); return; }

  try {
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({
      google_ad_client: AD_CLIENT,
      enable_page_level_ads: true,
    });
  } catch (e) {
    console.warn("Interstitial ad failed:", e);
  }

  // Fallback: close after 5s if no ad fires
  setTimeout(() => onClose?.(), 5000);
}

// ── Revenue Estimator (for your dashboard) ───────────────────────
// Rough estimates based on Philippine traffic CPM rates
export const REVENUE_RATES = {
  banner_cpm_php:       3.20,   // ₱3.20 per 1000 banner views
  interstitial_cpm_php: 16.00,  // ₱16 per 1000 interstitials
  rewarded_cpm_php:     32.00,  // ₱32 per 1000 rewarded views (highest!)
};

export function estimateRevenue({ bannerViews, interstitials, rewardedViews }) {
  const b = (bannerViews / 1000) * REVENUE_RATES.banner_cpm_php;
  const i = (interstitials / 1000) * REVENUE_RATES.interstitial_cpm_php;
  const r = (rewardedViews / 1000) * REVENUE_RATES.rewarded_cpm_php;
  return { banner: b, interstitial: i, rewarded: r, total: b + i + r };
}
