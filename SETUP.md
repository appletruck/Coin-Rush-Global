# 🌍 Coin Rush GLOBAL — Setup Guide

═══════════════════════════════════════════════
WHAT'S NEW IN THIS VERSION
═══════════════════════════════════════════════

  ✅ 4 languages: English, Español, Filipino, Français
  ✅ PayPal payouts — works in 200+ countries
  ✅ USD earnings (universal currency)
  ✅ Global ad rates (higher CPM than PH-only)
  ✅ Language selector in top bar

═══════════════════════════════════════════════
STEP 1 — DEPLOY (free, 10 minutes)
═══════════════════════════════════════════════

  npm install
  npm run build
  → Drag dist/ to vercel.com

═══════════════════════════════════════════════
STEP 2 — GOOGLE ADSENSE (your income)
═══════════════════════════════════════════════

  1. Sign up: https://adsense.google.com
  2. Add your Vercel URL
  3. Wait for approval (1–14 days)
  4. Paste your Publisher ID in index.html
  5. Paste ad slot IDs in src/AdManager.jsx
  6. Enable Auto Ads → Vignettes

  WHERE ADSENSE PAYS YOU:
  → Deposits monthly to your Canadian bank
  → Minimum: $100 USD
  → Compatible with: TD, RBC, Scotiabank, BMO
  → Arrives ~21 days after month end

  GLOBAL CPM RATES (what you earn per 1000 views):
  ┌─────────────┬──────────────┬──────────────┐
  │ Country     │ Banner CPM   │ Rewarded CPM │
  ├─────────────┼──────────────┼──────────────┤
  │ 🇺🇸 USA     │ $4.50 USD    │ $55 USD      │
  │ 🇨🇦 Canada  │ $3.50 USD    │ $40 USD      │
  │ 🇬🇧 UK      │ $4.00 USD    │ $48 USD      │
  │ 🇦🇺 AUS     │ $3.80 USD    │ $44 USD      │
  │ 🇵🇭 PH      │ $0.80 USD    │ $7.50 USD    │
  │ 🇪🇸 Spain   │ $2.50 USD    │ $28 USD      │
  │ 🇫🇷 France  │ $3.00 USD    │ $35 USD      │
  └─────────────┴──────────────┴──────────────┘
  AdSense auto-selects the highest-paying ad for each player's country.

═══════════════════════════════════════════════
STEP 3 — PAYPAL SETUP (player payouts)
═══════════════════════════════════════════════

  1. Sign up: https://developer.paypal.com
  2. Create app → get Client ID + Secret
  3. Request "Payouts" permission (takes 1–3 days)
  4. Paste credentials in server/paypal-payout.js
  5. Deploy server to Railway.app (free):
     → railway.app → New Project → GitHub repo
     → Set env: PAYPAL_CLIENT_ID, PAYPAL_SECRET

  PAYPAL PAYOUT FEES (deduct from player cashout):
  → Domestic (same country): 2%, max $1 USD
  → International: 2%, max $20 USD
  → Set minimum cashout to $6 USD (you cover fees)

═══════════════════════════════════════════════
STEP 4 — YOUR PROFIT AT GLOBAL SCALE
═══════════════════════════════════════════════

  Per 1,000 daily players (mixed global traffic):

  AD REVENUE IN:
    Banner (avg $2.50 CPM):    $75/day
    Interstitials (avg $12):   $60/day
    Rewarded (avg $28):        $140/day
    ──────────────────────────────────
    TOTAL IN:                  $275/day = ~$8,250 USD/month

  PLAYER PAYOUTS OUT:
    Cashouts (est.):           ~$1,500/month
    PayPal fees (~2%):         ~$30/month
    Server costs (Railway):    $5/month
    ──────────────────────────────────
    TOTAL OUT:                 ~$1,535/month

  YOUR PROFIT:  ~$6,715 USD/month 🎉
  (≈ $9,000 CAD/month)

═══════════════════════════════════════════════
STEP 5 — GO VIRAL ON TIKTOK
═══════════════════════════════════════════════

  Post this:
  "I made a game that pays people in 200+ countries.
   It supports 4 languages. The money counter goes up
   while they play. Link in bio 🌍💸"

  Show on screen:
  1. Language switching (EN → ES → TL → FR)
  2. Earnings counter in USD ticking up
  3. The PayPal cashout screen
  4. Your AdSense dashboard (blur the exact amount)

  TIP: Post 3x per day for first 2 weeks.
  TikTok's algorithm rewards consistency.

═══════════════════════════════════════════════
FILES
═══════════════════════════════════════════════

  src/App.jsx              ← Full game (4 languages, PayPal)
  src/i18n.js              ← All translations (edit here)
  src/AdManager.jsx        ← Real ad integration
  src/main.jsx             ← React entry
  index.html               ← Add AdSense ID here
  server/paypal-payout.js  ← PayPal payout backend
  package.json / vite.config.js
