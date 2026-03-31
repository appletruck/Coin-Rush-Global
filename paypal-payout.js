// server/paypal-payout.js
// ─────────────────────────────────────────────────────────────────
// PayPal Payouts API — sends money to any PayPal account worldwide
// Sign up: https://developer.paypal.com
// Works in 200+ countries, 25 currencies
// ─────────────────────────────────────────────────────────────────

const PAYPAL_CLIENT_ID     = "YOUR_PAYPAL_CLIENT_ID";      // ← from developer.paypal.com
const PAYPAL_CLIENT_SECRET = "YOUR_PAYPAL_CLIENT_SECRET";  // ← from developer.paypal.com
const PAYPAL_BASE = "https://api-m.paypal.com";            // switch to sandbox for testing:
// const PAYPAL_BASE = "https://api-m.sandbox.paypal.com";

// ── Get OAuth token ───────────────────────────────────────────────
async function getPayPalToken() {
  const creds = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token;
}

// ── Send payout to player ─────────────────────────────────────────
export async function sendPayPalPayout({ email, amountUsd, playerId, note }) {
  const token = await getPayPalToken();

  const payload = {
    sender_batch_header: {
      sender_batch_id: `CR_${playerId}_${Date.now()}`,
      email_subject: "Your Coin Rush earnings are here! 🎮💰",
      email_message: note || "Thanks for playing Coin Rush! Your cashout has been processed.",
    },
    items: [
      {
        recipient_type: "EMAIL",
        amount: {
          value: amountUsd.toFixed(2),
          currency: "USD",
        },
        receiver: email,
        note: "Coin Rush earnings payout",
        sender_item_id: `item_${playerId}_${Date.now()}`,
      },
    ],
  };

  const res = await fetch(`${PAYPAL_BASE}/v1/payments/payouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`PayPal error: ${data.message}`);
  }

  return {
    success: true,
    batchId: data.batch_header.payout_batch_id,
    status: data.batch_header.batch_status, // PENDING → SUCCESS
  };
}

// ── Check payout status ───────────────────────────────────────────
export async function checkPayoutStatus(batchId) {
  const token = await getPayPalToken();
  const res = await fetch(`${PAYPAL_BASE}/v1/payments/payouts/${batchId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.batch_header.batch_status;
}

// ── Express server endpoint ───────────────────────────────────────
//
// import express from 'express';
// import { sendPayPalPayout } from './paypal-payout.js';
//
// const app = express();
// app.use(express.json());
//
// app.post('/api/cashout', async (req, res) => {
//   const { email, amountUsd, playerId } = req.body;
//
//   // Security checks:
//   // 1. Verify player exists in your DB
//   // 2. Verify player has enough coins
//   // 3. Deduct coins atomically before paying
//   // 4. Log the payout to prevent double-spend
//
//   try {
//     const result = await sendPayPalPayout({ email, amountUsd, playerId });
//     // deduct coins from DB here
//     res.json(result);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });
//
// app.listen(3001, () => console.log('Payout server running on :3001'));

// ── PayPal fees (deduct from player payout) ───────────────────────
// Domestic (US):  2% of payout, max $1 USD
// International:  2% of payout, max $20 USD
// Recommended minimum cashout: $5 USD (after fees you keep profit)

export const PAYOUT_FEES = {
  domestic:      { percent: 0.02, max: 1.00 },
  international: { percent: 0.02, max: 20.00 },
};

export function calcNetPayout(amountUsd, isInternational = false) {
  const fees = isInternational ? PAYOUT_FEES.international : PAYOUT_FEES.domestic;
  const fee = Math.min(amountUsd * fees.percent, fees.max);
  return { gross: amountUsd, fee, net: amountUsd - fee };
}
