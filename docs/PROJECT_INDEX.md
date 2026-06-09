# The Crypto Orchestra (tCO) — Project Index

> The relationship between assets, music, and math.
> A research project that began as a musical metaphor and ended with a 7/7 signal.

**Live system:** [traderlive.viktim.xyz](https://traderlive.viktim.xyz)
**Status:** Active — 9-state chord system running, W8 wallet live, Synthonies v1.0

---

## Framework Naming

| Term | Definition |
|---|---|
| **The Crypto Orchestra (tCO)** | The overall framework — the system, the live app, the research body |
| **Synthony** | A single harmonic indicator built on the relationship between two assets. Each asset pair = one Synthony |
| **Chord state** | The 9-state output of a Synthony at any moment (MAJOR, SUSPENDED, TRITONE, etc.) |
| **Signal gate** | The compound condition that activates a trade signal (chord state + optional filter) |

The name *Synthony* compresses three concepts: *synthesis* (two signals merged into one), *harmony* (the musical interval between them), and *symphony* (the larger orchestral system they belong to).

---

## Current Synthonies

| ID | Asset Pair | Anchor | Oscillator | Signal Chord | Filter |
|---|---|---|---|---|---|
| S1 | BTC × SOL | BTC | SOL | SUSPENDED | Jupiter 340.9° ±60° |
| S2 | SPY × NVDA | SPY | NVDA | SUSPENDED | None (no Jupiter filter) |
| S3 | SPY × AMC | SPY | AMC | SUSPENDED | None |

Future candidates: Gold×DXY · ETH×BTC · VIX×SPY · BTC×ETH

---

## Framework Summary

The core claim: the *direction* of two correlated assets' last closed candle defines a **chord state** that encodes the current market regime better than price alone. When extended to three directions (up / flat / down), any two-asset system produces nine distinct states — each with a musical name, a characteristic sound in the Web Audio engine, and a distinct forward-looking behaviour.

The relationship between assets, music, and math is not metaphor — it's the actual structure. Price relationships have harmonic geometry. The Synthony is the instrument that reads it.

The **W8 signal** (S1): when the BTC×SOL Synthony is SUSPENDED and Jupiter is within 60° of 340.9° in its 398.88-day synodic orbit, the signal has produced a positive SOL return 7 consecutive times across 2021–2026.

**W8 formula:** `W8 = SUSPENDED(BTC↓, SOL↑) ∧ |Jupiter° − 340.9°| ≤ 60°  →  LONG SOL`

---

## The 9-State Chord System

| | SOL ↑ | SOL → | SOL ↓ |
|---|---|---|---|
| **BTC ↑** | MAJOR `#00ff88` | LEADING `#44ffaa` | DOMINANT `#f0b429` |
| **BTC →** | LYDIAN `#00d4ff` | PEDAL `#4a7090` | NEAPOLITAN `#ff8c00` |
| **BTC ↓** | **SUSPENDED** `#b44fff` ◈ | PHRYGIAN `#9d6fff` | TRITONE `#ff3d5a` |

Sideways threshold: ±0.2% per candle. Off-diagonal cells (divergence states) carry the highest information content.

---

## Research Arcs

### Arc 1–3 · Foundations
- Fetched full SOL lifecycle data (daily + weekly, 2020–2026)
- Ran geometric, mathematical, and statistical candle analysis
- Mapped celestial/macro cycle correlations — first indication that Jupiter synodic period correlated with SOL volatility regimes

### Arc 4 · Multi-Timeframe Entry Precision
- Analysed entry accuracy across 1m / 15m / 1H / 4H / Daily / Weekly
- Established that the 1H chord state is the optimal signal timeframe; 4H/Daily confirm regime

### Arc 5–7 · Full Cycle Statistical Laws
- Ran power-law regression on BTC price (log price vs log time from genesis)
- Derived the **power-law residual** as a cycle position indicator
- Built the full-cycle interactive dashboard

### Arc 8–10 · Residual + Signal Isolation
- Regressed SOL on BTC, extracted residuals
- Ran full signal isolation — identified SUSPENDED chord + residual zone as compound signal
- Built synthesis dashboard

### Arc 11–13 · Robustness + Cross-Asset Validation
- Sensitivity/robustness tests on the chord signal
- ETH cross-asset validation — ETH shows similar SUSPENDED structure but lower Jupiter correlation
- Compound signal + current positioning analysis

### Arc 14–15 · Phase Space Geometry
- 2D delay embedding — SOL price trajectories visualised in phase space
- 4D state space — added power-law residual + lunar phase as dimensions
- Phase space revealed distinct attractor basins for each chord state

### Arc 16 · k-NN Phase Space Backtest
- k-nearest-neighbours harness operating in the full 4D state space
- Key finding: same price ≠ same state. $50K BTC in 2019 and $50K in 2021 are different coordinates — different residual, halving phase, Jupiter position, Synthony reading

### Arc 17–19 · Transfer Entropy
- Computed transfer entropy BTC→SOL and SOL→BTC across 2021–2026
- Rolling TE analysis reveals regime switches — SOL→BTC spikes reliably precede major SOL outperformance
- Built live transfer entropy dashboard

### Arc 20–21 · Chord Progression History
- Mapped all weekly chord state transitions 2021–2026
- Identified the PHRYGIAN → SUSPENDED transition as the highest-probability W8 precursor

### Arc 22 · Multi-TF Entry Precision (refined)
- 6-TF chord detection: each TF fires independently
- Each TF has its own octave multiplier in the Web Audio engine

### Arc 23 · Extended Orchestra
- Added Gold, S&P 500, VIX, Crude Oil as additional instruments
- SUSPENDED chord with VIX falling = strongest combined signal

### Arc 24 · Missing Notes Hunt
- FM = F#4 confirmed as the Jupiter frequency in the musical mapping
- Lunar harmonic theory established: 29.5-day lunar cycle maps to the 2nd harmonic of the 4-year halving cycle

### Arc 25–26 · Formal Backtest + SUSPENDED Predictor
- Formal backtest of the SUSPENDED + Jupiter signal: 7/7 consecutive wins
- SUSPENDED resolution predictor: model trained on residual + Jupiter position to predict next-chord direction

### Arc 27 · Live Weekly Signal Script
- Python script: checks S1 chord state + Jupiter phase every week
- Outputs: current chord, gate status, expected resolution direction, confidence

### Arc 28 · Crypto Orchestra Audio Engine
- Web Audio API implementation of the chord arpeggio system
- Full octave mapping: 1m (×2.0) down to Weekly (×0.25)
- Trade entry/exit sounds: ENTRY arpeggio, EXIT_WIN descending, EXIT_LOSS chromatic fall

### Arc 29–31 · Dashboard Suite
- Arc 8 predictor dashboard HTML
- Arc 9 live signal Python script
- Arc 10 crypto orchestra audio engine (standalone HTML)

### Arc 32–33 · Cross-Pair + Stress Tests
- Tested chord framework across BTC/ETH, BTC/BNB, BTC/AVAX
- S1 (BTC×SOL) is strongest; signal degrades for other pairs

### Arc 34–35 · Celestial Phase Models
- Back-mapped 4D lunar orbit model for Bitcoin price
- Continuous phase estimator (0–360°) for Jupiter, Saturn, lunar
- Saturn correlation found for 4-year cycle length

### Arc 36 · PROJECT_INDEX.html (v1)
- First master documentation hub

### Arc 37–40 · Convergence + Live Monitor
- Macro convergence backtest — SUSPENDED + residual + Jupiter combined
- Live multi-market monitor dashboard

### Arc 41 · Celestial Cycle Phase Correlation Sweep
- Jupiter (398.88d) and Lunar (29.5d) confirmed as most significant correlators
- Venus (583.9d) shows weaker but present correlation — flagged for further study

### Arc 42 · S2 + S3 — Equities Synthonies
- SPY×NVDA and SPY×AMC Synthonies added to tCO
- Same 9-state chord framework, SPY as anchor, no Jupiter filter
- Live on STOCKS tab at traderlive.viktim.xyz
- W9 (SPY×NVDA) and W10 (SPY×AMC) wallet tracking active

### Arc 43 · Markov Transition Matrix
- Computed 9×9 empirical chord-to-chord transition probability matrix
- Dataset: 260 weekly BTC×SOL candles, Jan 2021–Jun 2026 (Kraken OHLC)
- **Key finding: the market is bimodal** — MAJOR (37.3%) + TRITONE (39.2%) = 76.5% of all states. PEDAL = 0 occurrences.
- SUSPENDED→MAJOR base rate: 37.5%. With Jupiter gate: 75.0% (6/8 events)
- PHRYGIAN: only 1 occurrence in 260 weeks — precursor hypothesis **empirically untested**
- DOMINANT→TRITONE: 50% — strongest warning signal in matrix
- TRITONE: 40.6% self-loop (bear persistence), 39.6% direct V-shape to MAJOR
- External validation: ChatGPT and Grok independently identified the chord strip as a Markov chain without prompting
- Dashboard: [docs/arc43-markov.html](./arc43-markov.html)

---

## Live System Architecture

```
traderlive.viktim.xyz (Next.js · Vercel)
│
├── /                           ← TraderLive.jsx (single React component)
│
├── /api/state                  ← proxies VPS: BTC 1H candles, trades, signals
├── /api/sol-klines             ← Kraken SOLUSDT OHLC (any TF)
├── /api/btc-klines             ← Kraken XBTUSDT OHLC (15m / 4h / 1d)
└── /api/stock-klines           ← Yahoo Finance proxy (SPY, NVDA, AMC, etc.)
```

**Tabs:**
- ◈ OVERVIEW — BTC chart with TF selector (15m/1H/4H/Daily), Synthony overlay toggle, portfolio total
- ◫ WALLETS — 11 wallet profiles (W1 Spot → W11 Perps)
- ⚡ AGGRESSIVE — 3x leverage profile, all signals
- ◉ CAUTIOUS — 1x, Config C only
- ⊕ SIGNALS — live signal feed + closed trade log
- ⊞ MACRO — 6-layer framework, FOMC calendar, key levels
- ◈ PHASE SIGNAL — S1 (BTC×SOL) Synthony display, Jupiter tracker, audio symphony, W8 backtest log
- ◎ STOCKS — S2 (SPY×NVDA) + S3 (SPY×AMC) Synthony display, W9/W10 wallets

**Audio engine (Web Audio API):**
- 9 chord arpeggios + 3 system sounds (ENTRY / EXIT_WIN / EXIT_LOSS)
- 6 TF channels firing independently on candle close
- Each TF: distinct octave multiplier, flash animation on fire

**Synthony markers on chart:**
- LightweightCharts `series.setMarkers()` — coloured dots at chord-change events
- TF-matched: 1H chart only shows 1H changes, 4H only 4H changes, etc.

---

## Key Numbers

| Metric | Value |
|---|---|
| W8 signal streak | 7/7 wins |
| W8 wallet return | +60.3% ($150 → $240.52) |
| Signal condition | S1 SUSPENDED + Jupiter 340.9° ±60° |
| Flat threshold | ±0.2% per candle |
| Jupiter period | 398.88 days synodic |
| Jupiter ref date | 2026-02-12 (last signal) |
| Chord states | 9 (extended from 4) |
| Timeframes | 6 (1m / 15m / 1H / 4H / Daily / Weekly) |
| Active Synthonies | 3 (S1 BTC×SOL · S2 SPY×NVDA · S3 SPY×AMC) |
| Wallets | 11 profiles ($150 each, $1,650 total) |

---

## Open Questions

1. **Transition probability matrix** — empirical chord→chord probabilities. PHRYGIAN→SUSPENDED vs PHRYGIAN→TRITONE?
2. **kNN signal sharpening** — does restricting entry to the most phase-space-similar historical moments improve W8 accuracy?
3. **Venus correlation** — is the 583.9d Venus synodic period a genuine third oscillator or spurious?
4. **9-state backtest** — formal backtest of all nine states' forward returns across all TFs
5. **SOL→BTC leadership spikes** — can the TE regime-switch signal be operationalised as a standalone trade?
6. **S2/S3 Jupiter filter** — does applying any celestial filter to the equities Synthonies improve signal quality?
7. **New Synthonies** — Gold×DXY, ETH×BTC, VIX×SPY as candidate S4/S5/S6

---

## Files

| File | Description |
|---|---|
| `the-crypto-orchestra.md` | Longform article — full tCO narrative, publish-ready |
| `PROJECT_INDEX.md` | This file — master research index |
| `btc-theatre/components/TraderLive.jsx` | Main app component (~1230 lines) |
| `btc-theatre/pages/api/sol-klines.js` | Kraken SOL OHLC proxy |
| `btc-theatre/pages/api/btc-klines.js` | Kraken BTC OHLC proxy |
| `btc-theatre/pages/api/stock-klines.js` | Yahoo Finance proxy (equities Synthonies) |
| `drop pack/pre-edit snapshots/` | All pre-edit snapshots |

---

*Last updated: June 2026. Framework: The Crypto Orchestra (tCO) v1.0. Synthonies: S1 S2 S3. Signal streak: 7/7.*
