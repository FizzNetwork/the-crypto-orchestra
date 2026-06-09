# The Crypto Orchestra (tCO)

> The relationship between assets, music, and math.

**Live system:** [traderlive.viktim.xyz](https://traderlive.viktim.xyz)

---

## What is this?

tCO is a live trading research instrument built on a single idea: **the directional relationship between two correlated assets defines a chord state, and that chord state encodes the current market regime.**

The indicator family is called **Synthonies** — each Synthony tracks one asset pair and outputs one of nine named chord states in real time.

| Synthony | Anchor | Oscillator | Signal |
|---|---|---|---|
| S1 | BTC | SOL | SUSPENDED + Jupiter 340.9° ±60° |
| S2 | SPY | NVDA | SUSPENDED |
| S3 | SPY | AMC | SUSPENDED |

---

## The 9-State Chord System

Each Synthony maps two assets' last candle direction (↑ flat ↓, threshold ±0.2%) onto a 3×3 matrix:

| | OSC ↑ | OSC → | OSC ↓ |
|---|---|---|---|
| **ANCHOR ↑** | MAJOR | LEADING | DOMINANT |
| **ANCHOR →** | LYDIAN | PEDAL | NEAPOLITAN |
| **ANCHOR ↓** | **SUSPENDED** ◈ | PHRYGIAN | TRITONE |

SUSPENDED = anchor correcting, oscillator holding / rising. The signal chord.

---

## The W8 Signal

BTC×SOL Synthony reads SUSPENDED + Jupiter within 60° of 340.9° in its 398.88-day orbit.

**Result: 7/7 wins across 2021–2026.** W8 wallet: $150 → $240.52 (+60.3%).

---

## Stack

- **Next.js 14** on Vercel
- **LightweightCharts** for the BTC price chart
- **Web Audio API** — 9 chord arpeggios, 6 timeframes, each at its own octave
- **Kraken API** — BTC + SOL klines
- **Yahoo Finance proxy** — SPY, NVDA, AMC klines
- **React** — single component (`components/TraderLive.jsx`)

---

## Structure

```
btc-theatre/
├── components/
│   └── TraderLive.jsx      ← entire app (~1230 lines)
├── pages/
│   ├── index.js
│   └── api/
│       ├── state.js        ← BTC 1H candles + signals proxy
│       ├── btc-klines.js   ← Kraken BTC OHLC (15m/4h/1d)
│       ├── sol-klines.js   ← Kraken SOL OHLC
│       └── stock-klines.js ← Yahoo Finance proxy
├── docs/
│   ├── the-crypto-orchestra.md   ← longform article
│   └── PROJECT_INDEX.md          ← full research index
└── README.md
```

---

## Docs

- [The Crypto Orchestra](./docs/the-crypto-orchestra.md) — the full narrative. Start here.
- [Project Index](./docs/PROJECT_INDEX.md) — all 42 research arcs, key numbers, open questions.

---

## Tabs

| Tab | Description |
|---|---|
| ◈ OVERVIEW | BTC chart · TF selector · Synthony overlay · portfolio total |
| ◫ WALLETS | 11 paper wallets (W1 Spot → W11 Perps) |
| ⚡ AGGRESSIVE | 3x leverage profile |
| ◉ CAUTIOUS | 1x, Config C only |
| ⊕ SIGNALS | Live signal feed + closed trade log |
| ⊞ MACRO | 6-layer framework · FOMC · key levels |
| ◈ PHASE SIGNAL | S1 chord display · Jupiter tracker · audio symphony · W8 log |
| ◎ STOCKS | S2 + S3 Synthony display · W9/W10 wallets |

---

*tCO v1.0 · June 2026 · by fiz*
