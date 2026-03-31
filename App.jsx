import { useState, useEffect, useRef, useCallback } from "react";
import { T, LANGS } from "./i18n.js";

// ── Constants ──────────────────────────────────────────────────────
const GAME_W = 360;
const GAME_H = 440;
const PLAYER_W = 34;
const LANE_COUNT = 5;
const LANE_W = GAME_W / LANE_COUNT;
const USD_PER_COIN  = 0.00025;   // 4000 coins = $1 USD
const MIN_CASHOUT   = 5;          // $5 USD minimum
const REFERRAL_BONUS = 200;

const MILESTONES = [
  { score: 50,   reward: 10,  emoji: "🌟" },
  { score: 100,  reward: 20,  emoji: "💯" },
  { score: 250,  reward: 50,  emoji: "🔥" },
  { score: 500,  reward: 100, emoji: "👑" },
  { score: 1000, reward: 250, emoji: "⚡" },
];

const ADS = [
  { brand: "Spotify",    emoji: "🎵", bg: "#0d1a0d", accent: "#1db954" },
  { brand: "Duolingo",   emoji: "🦉", bg: "#0a1a06", accent: "#58cc02" },
  { brand: "Amazon",     emoji: "📦", bg: "#0d0d00", accent: "#ff9900" },
  { brand: "Booking.com",emoji: "✈️", bg: "#00001a", accent: "#003580" },
];

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function laneX(l) { return l * LANE_W + LANE_W / 2 - PLAYER_W / 2; }
function coinsToUsd(c) { return (c * USD_PER_COIN).toFixed(2); }
function genCode() { return "CR" + Math.random().toString(36).slice(2,7).toUpperCase(); }

// ── UI Atoms ───────────────────────────────────────────────────────
const G = ({ children, color = "#00d4ff", size = 14, bold = true, style = {} }) => (
  <span style={{ fontFamily: "monospace", fontSize: size, fontWeight: bold ? 800 : 400, color, textShadow: `0 0 10px ${color}50`, ...style }}>{children}</span>
);
const Btn = ({ onClick, color = "#00d4ff", children, style = {}, disabled = false }) => (
  <div onClick={disabled ? null : onClick} style={{
    background: disabled ? "#111" : `${color}15`, border: `1.5px solid ${disabled ? "#333" : color}`,
    color: disabled ? "#444" : color, fontFamily: "monospace", fontWeight: 800, fontSize: 12,
    padding: "10px 22px", borderRadius: 8, cursor: disabled ? "default" : "pointer",
    letterSpacing: 1, textAlign: "center", boxShadow: disabled ? "none" : `0 0 12px ${color}25`,
    transition: "all 0.2s", ...style,
  }}>{children}</div>
);

// ── Language Picker ────────────────────────────────────────────────
function LangPicker({ lang, setLang }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Object.entries(LANGS).map(([code, { flag }]) => (
        <div key={code} onClick={() => setLang(code)} style={{
          fontSize: 16, cursor: "pointer", opacity: lang === code ? 1 : 0.35,
          transform: lang === code ? "scale(1.2)" : "scale(1)",
          transition: "all 0.2s", userSelect: "none",
        }}>{flag}</div>
      ))}
    </div>
  );
}

// ── Ad Overlay ─────────────────────────────────────────────────────
function AdOverlay({ ad, countdown, reward, onDone, t }) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 60, background: ad.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "monospace",
    }}>
      <div style={{ fontSize: 9, color: "#ffffff40", letterSpacing: 3, marginBottom: 20 }}>{t.adLabel}</div>
      <div style={{ fontSize: 64, marginBottom: 12 }}>{ad.emoji}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>{ad.brand}</div>
      <div style={{ marginTop: 20, marginBottom: 8 }}><G color="#26de81" size={12}>{t.watchForBonus}</G></div>
      <div style={{ width: 200, height: 5, background: "#ffffff15", borderRadius: 3, marginBottom: 24, overflow: "hidden" }}>
        <div style={{
          width: `${((5 - countdown) / 5) * 100}%`, height: "100%",
          background: ad.accent, borderRadius: 3, transition: "width 0.9s linear",
          boxShadow: `0 0 8px ${ad.accent}`,
        }} />
      </div>
      {countdown > 0
        ? <G color="#ffffff50" size={12}>{t.watchingAd} {countdown}s</G>
        : <Btn onClick={onDone} color="#26de81">{t.claimCoins} (+{reward})</Btn>
      }
    </div>
  );
}

// ── Wallet ─────────────────────────────────────────────────────────
function WalletScreen({ coins, onBack, referralCode, referralCount, t, lang }) {
  const [step, setStep] = useState("wallet");
  const [email, setEmail] = useState("");
  const usd = parseFloat(coinsToUsd(coins));
  const canCashout = usd >= MIN_CASHOUT;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div style={{ width: GAME_W, minHeight: GAME_H + 92, background: "#07071a", fontFamily: "monospace", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1a1a3a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span onClick={onBack} style={{ color: "#00d4ff", cursor: "pointer", fontSize: 18 }}>←</span>
          <G color="#00d4ff" size={15}>{t.myEarnings}</G>
        </div>
        <G color="#ffffff30" size={10} bold={false}>PayPal · 200+ countries</G>
      </div>

      {step === "wallet" && (
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Balance */}
          <div style={{ background: "linear-gradient(135deg, #0a1a3a, #0d2a4a)", border: "1px solid #00d4ff30", borderRadius: 16, padding: 20, textAlign: "center" }}>
            <G color="#ffffff60" size={10} bold={false}>{t.balance}</G>
            <div style={{ fontSize: 46, fontWeight: 900, color: "#fff", margin: "8px 0 4px", textShadow: "0 0 30px #00d4ff60" }}>
              ${usd.toFixed(2)}
            </div>
            <G color="#00d4ff70" size={11} bold={false}>{coins.toLocaleString()} coins · USD</G>
            <div style={{ marginTop: 12, fontSize: 10, color: "#ffffff30" }}>{t.minCashout}: ${MIN_CASHOUT} · 4,000 coins = $1.00</div>
          </div>

          {/* Referral card */}
          <div style={{ background: "#0d1a0d", border: "1px solid #26de8130", borderRadius: 12, padding: 14 }}>
            <G color="#26de81" size={11}>👥 {t.referEarn}</G>
            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{referralCount} {t.friendsJoined}</div>
                <div style={{ color: "#26de8170", fontSize: 10, marginTop: 2 }}>+{REFERRAL_BONUS} coins {t.each}</div>
              </div>
              <G color="#26de81" size={16}>+{referralCount * REFERRAL_BONUS} coins</G>
            </div>
          </div>

          {/* Cashout */}
          <Btn onClick={() => canCashout && setStep("enter")} color="#0070ba" disabled={!canCashout} style={{ padding: 14, fontSize: 13 }}>
            🅿  {t.cashout} TO PAYPAL
          </Btn>
          {!canCashout && (
            <div style={{ textAlign: "center", color: "#ffffff30", fontSize: 10 }}>
              ${(MIN_CASHOUT - usd).toFixed(2)} {t.needMore}
            </div>
          )}

          {/* Progress bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <G color="#ffffff40" size={10} bold={false}>{t.progressTo} (${MIN_CASHOUT})</G>
              <G color="#26de81" size={10}>${usd.toFixed(2)} / ${MIN_CASHOUT}</G>
            </div>
            <div style={{ width: "100%", height: 6, background: "#1a1a3a", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${Math.min((usd / MIN_CASHOUT) * 100, 100)}%`, height: "100%", background: "linear-gradient(90deg, #00d4ff, #26de81)", borderRadius: 3, boxShadow: "0 0 8px #26de8150" }} />
            </div>
          </div>

          {/* How to earn */}
          <div style={{ color: "#ffffff40", fontSize: 10, lineHeight: 2.2 }}>
            <div style={{ color: "#ffffff70", fontWeight: 800, marginBottom: 4 }}>{t.howEarn}</div>
            {[["🎮", t.playing, t.perSec], ["📺", t.watchAds, t.perAd], ["🏆", t.milestones, t.bonus], ["👥", t.referFriends, t.perRef]].map(([e, l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{e} {l}</span><span style={{ color: "#26de81" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "enter" && (
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <G color="#fff" size={15}>{t.paypalEmail}</G>
          <G color="#ffffff50" size={10} bold={false}>{t.paypalHint}</G>
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" type="email"
            style={{ background: "#0d1a2e", border: `1.5px solid ${validEmail ? "#0070ba" : "#1a2a4a"}`, borderRadius: 8, color: "#fff", fontFamily: "monospace", fontSize: 16, padding: "12px 16px", outline: "none", width: "100%", boxSizing: "border-box" }}
          />
          <div style={{ background: "#0a0a1f", border: "1px solid #0070ba30", borderRadius: 10, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <G color="#ffffff60" size={11} bold={false}>Amount</G><G color="#26de81" size={13}>${usd.toFixed(2)} USD</G>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <G color="#ffffff60" size={11} bold={false}>{t.to}</G><G color="#fff" size={11}>{email || "—"}</G>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <G color="#ffffff60" size={11} bold={false}>{t.processing}</G><G color="#ffffff60" size={11} bold={false}>{t.processingTime}</G>
            </div>
          </div>
          <Btn onClick={() => validEmail && setStep("confirm")} color="#0070ba" disabled={!validEmail}>{t.continue}</Btn>
          <Btn onClick={() => setStep("wallet")} color="#ffffff30" style={{ background: "transparent", boxShadow: "none", border: "1px solid #ffffff15" }}>{t.back}</Btn>
        </div>
      )}

      {step === "confirm" && (
        <div style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 56, marginTop: 20 }}>🅿</div>
          <G color="#fff" size={16}>{t.confirmCashout}</G>
          <div style={{ background: "#0a0a1f", borderRadius: 12, padding: 20, width: "100%", boxSizing: "border-box", textAlign: "center" }}>
            <G color="#ffffff60" size={11} bold={false}>{t.sending}</G>
            <div style={{ fontSize: 40, fontWeight: 900, color: "#0070ba", margin: "8px 0", textShadow: "0 0 20px #0070ba60" }}>${usd.toFixed(2)}</div>
            <G color="#ffffff80" size={12}>{t.to} {email}</G>
            <div style={{ marginTop: 8, color: "#ffffff30", fontSize: 10 }}>{t.poweredBy}</div>
          </div>
          <G color="#ffffff40" size={10} bold={false} style={{ textAlign: "center", lineHeight: 1.8 }}>{t.verifyWarning}</G>
          <Btn onClick={() => setStep("sent")} color="#0070ba" style={{ width: "100%", fontSize: 14, padding: 14 }}>{t.confirm}</Btn>
          <Btn onClick={() => setStep("enter")} color="#ffffff30" style={{ background: "transparent", boxShadow: "none", border: "1px solid #ffffff15" }}>{t.editEmail}</Btn>
        </div>
      )}

      {step === "sent" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16, textAlign: "center" }}>
          <div style={{ fontSize: 72 }}>🎉</div>
          <G color="#26de81" size={22}>{t.sent}</G>
          <G color="#ffffff60" size={11} bold={false} style={{ lineHeight: 1.8 }}>{t.sentDesc}</G>
          <div style={{ background: "#0a1a0a", borderRadius: 10, padding: 14, width: "100%", boxSizing: "border-box" }}>
            <div style={{ color: "#26de8170", fontSize: 10, marginBottom: 6 }}>{t.refNumber}</div>
            <G color="#ffd700" size={14}>#CR-{Date.now().toString().slice(-8)}</G>
          </div>
          <Btn onClick={onBack} color="#00d4ff" style={{ width: "100%", marginTop: 8 }}>{t.backToGame}</Btn>
        </div>
      )}
    </div>
  );
}

// ── Referral Screen ────────────────────────────────────────────────
function ReferralScreen({ code, count, onBack, t }) {
  const [copied, setCopied] = useState(false);
  const link = `https://coinrush.app/join?ref=${code}`;
  const copy = () => { navigator.clipboard?.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ width: GAME_W, minHeight: GAME_H + 92, background: "#07071a", fontFamily: "monospace" }}>
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #1a1a3a" }}>
        <span onClick={onBack} style={{ color: "#ffd700", cursor: "pointer", fontSize: 18 }}>←</span>
        <G color="#ffd700" size={15}>{t.referEarn}</G>
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <G color="#ffd700" size={28}>+{REFERRAL_BONUS} coins</G>
          <div style={{ color: "#ffffff60", fontSize: 11, marginTop: 4 }}>= ${(REFERRAL_BONUS * USD_PER_COIN).toFixed(3)} USD per friend</div>
        </div>
        <div style={{ background: "#1a1400", border: "1px solid #ffd70040", borderRadius: 12, padding: 20, width: "100%", boxSizing: "border-box", textAlign: "center" }}>
          <div style={{ color: "#ffd70060", fontSize: 10, marginBottom: 8 }}>{t.yourCode}</div>
          <G color="#ffd700" size={30}>{code}</G>
          <div style={{ marginTop: 12, background: "#ffffff08", borderRadius: 6, padding: "8px 10px", fontSize: 10, color: "#ffffff40", wordBreak: "break-all" }}>{link}</div>
          <Btn onClick={copy} color="#ffd700" style={{ marginTop: 12, width: "100%" }}>{copied ? t.copied : t.copyLink}</Btn>
        </div>
        <div style={{ background: "#0a0a1a", border: "1px solid #ffffff10", borderRadius: 12, padding: 16, width: "100%", boxSizing: "border-box" }}>
          <div style={{ color: "#ffffff50", fontSize: 10, marginBottom: 10 }}>{t.yourReferrals}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <G color="#fff" size={32}>{count}</G>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#26de81", fontSize: 14, fontWeight: 800 }}>+{count * REFERRAL_BONUS} {t.coinsEarned}</div>
              <div style={{ color: "#26de8160", fontSize: 10 }}>≈ ${(count * REFERRAL_BONUS * USD_PER_COIN).toFixed(2)} USD</div>
            </div>
          </div>
        </div>
        <div style={{ width: "100%", color: "#ffffff40", fontSize: 10, lineHeight: 2.2 }}>
          <div style={{ color: "#ffffff70", fontWeight: 800, marginBottom: 4 }}>{t.howItWorks}</div>
          {[t.ref1, t.ref2, t.ref3, t.ref4].map(s => <div key={s}>{s}</div>)}
        </div>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────
export default function CoinRushGlobal() {
  const [lang, setLang] = useState("en");
  const t = T[lang];

  const [screen, setScreen] = useState("menu");
  const [playerLane, setPlayerLane] = useState(2);
  const [obstacles, setObstacles] = useState([]);
  const [coinObjs, setCoinObjs] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [coins, setCoins] = useState(480);
  const [flash, setFlash] = useState(false);
  const [milestonePopup, setMilestonePopup] = useState(null);
  const [claimedMilestones, setClaimedMilestones] = useState([]);
  const [adData, setAdData] = useState(null);
  const [adCountdown, setAdCountdown] = useState(5);
  const [adReward, setAdReward] = useState(50);
  const [afterAd, setAfterAd] = useState(null);
  const [earnPopup, setEarnPopup] = useState(null);
  const [referralCode] = useState(genCode);
  const [referralCount] = useState(4);

  const gameLoop = useRef(null);
  const adTimer = useRef(null);
  const playTimer = useRef(null);
  const frameRef = useRef(0);
  const speedRef = useRef(1);
  const scoreRef = useRef(0);
  const startX = useRef(null);

  const addCoins = useCallback((amount, label) => {
    setCoins(c => c + amount);
    setEarnPopup({ amount, label });
    setTimeout(() => setEarnPopup(null), 2000);
  }, []);

  const showAd = useCallback((reward = 50, after = null) => {
    const ad = ADS[randInt(0, ADS.length - 1)];
    setAdData(ad); setAdReward(reward); setAfterAd(after);
    setAdCountdown(5);
    clearInterval(adTimer.current);
    let c = 5;
    adTimer.current = setInterval(() => { c--; setAdCountdown(c); if (c <= 0) clearInterval(adTimer.current); }, 1000);
    setScreen("ad");
  }, []);

  const claimAd = useCallback(() => {
    addCoins(adReward, `📺 ${t.watchAds}`);
    setScreen(afterAd || "playing");
    if (afterAd === "playing") setLives(3);
    setAdData(null);
  }, [adReward, afterAd, addCoins, t]);

  useEffect(() => {
    if (screen !== "playing") { clearInterval(playTimer.current); return; }
    playTimer.current = setInterval(() => { addCoins(10, `🎮 ${t.playing}`); }, 30000);
    return () => clearInterval(playTimer.current);
  }, [screen, addCoins, t]);

  useEffect(() => {
    if (screen !== "playing") return;
    for (const m of MILESTONES) {
      if (score >= m.score && !claimedMilestones.includes(m.score)) {
        setClaimedMilestones(p => [...p, m.score]);
        addCoins(m.reward, `${m.emoji} ${t.milestones}`);
        setMilestonePopup(m);
        setTimeout(() => setMilestonePopup(null), 2500);
      }
    }
  }, [score, screen, claimedMilestones, addCoins, t]);

  const spawnObs = useCallback(() => setObstacles(o => [...o, { id: Math.random(), lane: randInt(0, LANE_COUNT - 1), y: -40 }]), []);
  const spawnCoin = useCallback(() => setCoinObjs(c => [...c, { id: Math.random(), lane: randInt(0, LANE_COUNT - 1), y: -40 }]), []);

  const handleDeath = useCallback(() => {
    setHighScore(h => Math.max(h, scoreRef.current));
    clearInterval(gameLoop.current);
    setTimeout(() => showAd(50, "dead"), 300);
  }, [showAd]);

  useEffect(() => {
    if (screen !== "playing") return;
    frameRef.current = 0; speedRef.current = 1;
    gameLoop.current = setInterval(() => {
      frameRef.current++;
      if (frameRef.current % 300 === 0) speedRef.current = Math.min(speedRef.current + 0.25, 3.2);
      const rate = Math.max(42 - Math.floor(speedRef.current * 10), 18);
      if (frameRef.current % rate === 0) spawnObs();
      if (frameRef.current % 60 === 0) spawnCoin();
      if (frameRef.current % 8 === 0) { scoreRef.current++; setScore(scoreRef.current); }
      setObstacles(o => o.map(x => ({ ...x, y: x.y + 4 * speedRef.current })).filter(x => x.y < GAME_H + 50));
      setCoinObjs(c => c.map(x => ({ ...x, y: x.y + 3 * speedRef.current })).filter(x => x.y < GAME_H + 50));
    }, 30);
    return () => clearInterval(gameLoop.current);
  }, [screen, spawnObs, spawnCoin]);

  useEffect(() => {
    if (screen !== "playing") return;
    const px = laneX(playerLane), py = GAME_H - 75;
    setCoinObjs(cs => {
      const keep = [];
      for (const c of cs) {
        if (Math.hypot(laneX(c.lane) + 17 - px - 17, c.y + 16 - py - 17) < 32) addCoins(5, "🪙 Coin");
        else keep.push(c);
      }
      return keep;
    });
    for (const o of obstacles) {
      const ox = laneX(o.lane);
      if (px < ox + PLAYER_W - 4 && px + PLAYER_W - 4 > ox && py < o.y + PLAYER_W - 4 && py + PLAYER_W - 4 > o.y) {
        setLives(l => { if (l - 1 <= 0) { handleDeath(); return 0; } setFlash(true); setTimeout(() => setFlash(false), 400); return l - 1; });
        setObstacles(p => p.filter(x => x.id !== o.id));
        break;
      }
    }
  }, [screen, playerLane, obstacles, coinObjs, handleDeath, addCoins]);

  useEffect(() => {
    if (screen !== "playing") return;
    const k = e => {
      if (e.key === "ArrowLeft")  setPlayerLane(l => Math.max(0, l - 1));
      if (e.key === "ArrowRight") setPlayerLane(l => Math.min(LANE_COUNT - 1, l + 1));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [screen]);

  const startGame = () => {
    setScore(0); scoreRef.current = 0; setLives(3);
    setObstacles([]); setCoinObjs([]); setPlayerLane(2);
    setClaimedMilestones([]); setScreen("playing");
  };

  const usd = parseFloat(coinsToUsd(coins));

  if (screen === "wallet") return <WalletScreen coins={coins} onBack={() => setScreen("menu")} referralCode={referralCode} referralCount={referralCount} t={t} lang={lang} />;
  if (screen === "referral") return <ReferralScreen code={referralCode} count={referralCount} onBack={() => setScreen("menu")} t={t} />;

  return (
    <div style={{ minHeight: "100vh", background: "#030310", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Top bar */}
        <div style={{ width: GAME_W, background: "#08081f", border: "1px solid #1a1a3a", borderBottom: "none", padding: "10px 14px", boxSizing: "border-box", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div onClick={() => setScreen("wallet")} style={{ cursor: "pointer" }}>
            <G color="#26de81" size={10}>{t.myEarnings}</G>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <G color="#26de81" size={18}>${usd.toFixed(2)}</G>
              <G color="#26de8140" size={9} bold={false}>USD</G>
            </div>
          </div>
          <LangPicker lang={lang} setLang={setLang} />
          <div style={{ display: "flex", gap: 6 }}>
            <div onClick={() => setScreen("referral")} style={{ background: "#ffd70015", border: "1px solid #ffd70040", borderRadius: 6, padding: "5px 8px", cursor: "pointer" }}>
              <G color="#ffd700" size={9}>{t.refer}</G>
            </div>
            <div onClick={() => setScreen("wallet")} style={{ background: "#00d4ff15", border: "1px solid #00d4ff40", borderRadius: 6, padding: "5px 8px", cursor: "pointer" }}>
              <G color="#00d4ff" size={9}>{t.cashout}</G>
            </div>
          </div>
        </div>

        {/* Game area */}
        <div
          onTouchStart={e => { startX.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            if (screen !== "playing" || startX.current === null) return;
            const dx = e.changedTouches[0].clientX - startX.current;
            if (Math.abs(dx) > 25) setPlayerLane(l => dx > 0 ? Math.min(LANE_COUNT - 1, l + 1) : Math.max(0, l - 1));
            startX.current = null;
          }}
          style={{ width: GAME_W, height: GAME_H, background: "linear-gradient(180deg, #04040f 0%, #080820 100%)", border: "1px solid #1a1a3a", position: "relative", overflow: "hidden" }}
        >
          {[1,2,3,4].map(i => <div key={i} style={{ position: "absolute", left: i * LANE_W, top: 0, width: 1, height: "100%", background: "#ffffff05" }} />)}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 30, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)" }} />
          {flash && <div style={{ position: "absolute", inset: 0, background: "rgba(255,50,50,0.2)", zIndex: 25, pointerEvents: "none" }} />}

          {earnPopup && (
            <div style={{ position: "absolute", right: 10, top: 50, zIndex: 40, background: "#26de8120", border: "1px solid #26de8150", borderRadius: 8, padding: "5px 10px" }}>
              <G color="#26de81" size={12}>+{earnPopup.amount} {earnPopup.label}</G>
            </div>
          )}

          {milestonePopup && (
            <div style={{ position: "absolute", left: "50%", top: "28%", transform: "translateX(-50%)", zIndex: 45, background: "#0a0a1a", border: "2px solid #ffd700", borderRadius: 12, padding: "12px 24px", textAlign: "center", boxShadow: "0 0 30px #ffd70050" }}>
              <div style={{ fontSize: 30 }}>{milestonePopup.emoji}</div>
              <G color="#ffd700" size={12}>{t.milestones}</G>
              <div><G color="#26de81" size={16}>+{milestonePopup.reward} coins!</G></div>
            </div>
          )}

          {/* MENU */}
          {screen === "menu" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>
              <div style={{ fontSize: 10, letterSpacing: 5, color: "#ffffff20", marginBottom: 10 }}>🌍 WORLDWIDE</div>
              <div style={{ fontSize: 40, fontWeight: 900, color: "#00d4ff", textShadow: "0 0 30px #00d4ff", letterSpacing: 3, marginBottom: 4 }}>COIN RUSH</div>
              <div style={{ fontSize: 12, color: "#26de81", marginBottom: 8, textShadow: "0 0 8px #26de8160" }}>{t.tagline}</div>
              <div style={{ fontSize: 10, color: "#ffffff20", marginBottom: 28 }}>PayPal · 200+ countries · 4 languages</div>
              <Btn onClick={startGame} color="#00d4ff" style={{ fontSize: 14, padding: "12px 44px", marginBottom: 12 }}>{t.play}</Btn>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn onClick={() => setScreen("wallet")} color="#26de81" style={{ fontSize: 10 }}>{t.wallet}</Btn>
                <Btn onClick={() => setScreen("referral")} color="#ffd700" style={{ fontSize: 10 }}>{t.refer}</Btn>
              </div>
              <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px", fontSize: 9, color: "#ffffff30" }}>
                <span>🎮 {t.perSec}</span><span>📺 {t.perAd}</span>
                <span>🏆 {t.bonus}</span><span>👥 {t.perRef}</span>
              </div>
            </div>
          )}

          {/* PLAYING */}
          {screen === "playing" && <>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "8px 12px", zIndex: 10, background: "linear-gradient(180deg, rgba(4,4,20,0.95) 0%, transparent 100%)" }}>
              <G color="#00d4ff" size={20}>{score}</G>
              <div style={{ display: "flex", gap: 3 }}>{[0,1,2].map(i => <span key={i} style={{ fontSize: 13, opacity: i < lives ? 1 : 0.15 }}>❤️</span>)}</div>
              <G color="#ffd700" size={12}>HI {highScore}</G>
            </div>

            {[0,1,2,3,4].map(i => <div key={i} onClick={() => setPlayerLane(i)} style={{ position: "absolute", left: i * LANE_W, top: 0, width: LANE_W, height: GAME_H, zIndex: 5 }} />)}

            <div style={{ position: "absolute", left: laneX(playerLane), top: GAME_H - 75, width: PLAYER_W, height: PLAYER_W, transition: "left 0.1s cubic-bezier(0.1,0,0,1)", zIndex: 20, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", filter: "drop-shadow(0 0 8px #00d4ff)" }}>🚀</div>
            {obstacles.map(o => <div key={o.id} style={{ position: "absolute", left: laneX(o.lane), top: o.y, width: PLAYER_W, height: PLAYER_W, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", filter: "drop-shadow(0 0 6px #ff4444)" }}>💀</div>)}
            {coinObjs.map(c => <div key={c.id} style={{ position: "absolute", left: laneX(c.lane) + 6, top: c.y, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", filter: "drop-shadow(0 0 6px #ffd700)" }}>🪙</div>)}

            <div onClick={() => showAd(50)} style={{ position: "absolute", bottom: 10, right: 10, zIndex: 20, background: "#00000080", border: "1px solid #ffd70040", borderRadius: 8, padding: "5px 8px", cursor: "pointer" }}>
              <G color="#ffd700" size={9}>📺 +50 coins</G>
            </div>
          </>}

          {/* DEAD */}
          {screen === "dead" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, zIndex: 20, background: "rgba(4,4,20,0.88)" }}>
              <div style={{ fontSize: 46 }}>💀</div>
              <G color="#ff4444" size={26}>{t.gameOver}</G>
              <div style={{ textAlign: "center" }}>
                <G color="#fff" size={22}>{score}</G>
                <G color="#ffffff40" size={11} bold={false} style={{ display: "block" }}>{t.score}</G>
              </div>
              <Btn onClick={() => showAd(50, "playing")} color="#26de81">{t.watchForLives}</Btn>
              <Btn onClick={startGame} color="#00d4ff">{t.playAgain}</Btn>
              <Btn onClick={() => setScreen("wallet")} color="#ffd700" style={{ fontSize: 10 }}>{t.withdraw}</Btn>
            </div>
          )}

          {/* AD */}
          {screen === "ad" && adData && <AdOverlay ad={adData} countdown={adCountdown} reward={adReward} onDone={claimAd} t={t} />}
        </div>

        {/* Banner Ad */}
        <div style={{ width: GAME_W, background: "#08081f", border: "1px solid #1a1a3a", borderTop: "none", padding: "8px 14px", boxSizing: "border-box", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <G color="#ffffff20" size={8} bold={false}>AD</G>
          <G color="#ffffff50" size={10}>🎵 Spotify Premium — 3 months free</G>
          <div style={{ background: "#1db95420", border: "1px solid #1db95440", borderRadius: 4, padding: "3px 8px", cursor: "pointer" }}>
            <G color="#1db954" size={9}>TRY</G>
          </div>
        </div>

        {/* Progress */}
        <div style={{ width: GAME_W, background: "#07071a", border: "1px solid #1a1a3a", borderTop: "none", padding: "10px 14px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <G color="#ffffff40" size={9} bold={false}>{t.progressTo} (${MIN_CASHOUT})</G>
            <G color="#26de81" size={9}>${usd.toFixed(2)} / ${MIN_CASHOUT}</G>
          </div>
          <div style={{ width: "100%", height: 5, background: "#1a1a3a", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${Math.min((usd / MIN_CASHOUT) * 100, 100)}%`, height: "100%", background: "linear-gradient(90deg, #00d4ff, #26de81)", borderRadius: 3 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
