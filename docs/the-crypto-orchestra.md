# The Crypto Orchestra
### How asset relationships play chord progressions — and why one chord predicts a trade 7 times out of 7

*A framework by fiz · traderlive.viktim.xyz*

---

Markets are usually described in the language of physics. Support and resistance. Momentum. Force. We talk about price *levels* as if the market were a ball rolling across a flat surface, occasionally bouncing off walls.

But price action doesn't feel like physics. It feels like music.

It has rhythm — the four-year halving cycle, the monthly options expiry, the daily session open. It has tension and resolution — the coiling range before a breakout, the retracement that finds exactly the right level. It has themes that return, never quite the same, recognisable but transformed. A musician would call it development. A trader calls it structure.

This is the story of what happens when you take that metaphor seriously.

---

## Two voices

Every piece of music is built from relationships between notes. A single note is just a frequency. Two notes played together create an *interval* — and intervals have character. A perfect fifth feels open and stable. A minor second feels tense and unresolved. A tritone — the diabolus in musica, the devil's interval — feels genuinely unsettling.

Bitcoin and Solana are two instruments in the same orchestra. They trade in the same market, respond to the same macro liquidity conditions, share the same investor base at the margin. But they're not the same instrument. BTC is the bass — slow, institutional, the global liquidity barometer. SOL is a higher voice — faster, more volatile, a risk-appetite amplifier.

When both rise together, the interval is consonant. Resolution. Confidence. When they diverge — one up, one down — you get tension. And tension, in music as in markets, always resolves. The question is which direction.

The core insight is this: **the *direction* of each instrument's last candle defines a chord, and that chord encodes the current market regime.**

This is what we call a **Synthony** — a harmonic indicator built on the relationship between two assets, where the mathematical structure of their interaction is expressed as a musical chord state. The name compresses three things: *synthesis* (the merging of two signals into one), *harmony* (the musical interval between them), and *symphony* (the larger orchestral system they belong to).

The BTC×SOL chord state is the first Synthony. SPY×NVDA and SPY×AMC are two more. Every asset pair that carries a meaningful relationship — a bass and a higher voice — can become a Synthony. The orchestra grows one instrument at a time.

---

## The four original chords

Map BTC and SOL's last candle close against the previous one. Each is either up or down. Two assets, two states each — four combinations:

| | SOL ↑ | SOL ↓ |
|---|---|---|
| **BTC ↑** | **MAJOR** | **DOMINANT** |
| **BTC ↓** | **SUSPENDED** | **TRITONE** |

**MAJOR** — both up. The resolution chord. Bull momentum is clean and confirmed. Both voices moving in the same direction, no dissonance. In music, the major chord is the most stable harmony in Western tonality — everything resolves here.

**DOMINANT** — BTC up, SOL down. Tension. The dominant seventh chord in music creates the strongest pull toward resolution — it *wants* to go somewhere. Here, BTC is leading but SOL isn't following. This is the chord of a divergence that hasn't resolved yet. BTC is pulling the market up but the risk appetite isn't fully engaged.

**TRITONE** — both down. The devil's interval. Maximum dissonance, risk-off, no ambiguity. Both voices descending together. In music the tritone was banned from church compositions for centuries because it sounded so wrong. In markets it means get flat.

**SUSPENDED** — BTC down, SOL up. This is the strange one. It's the chord that breaks the pattern.

---

## The signal chord

In music theory, the suspended chord is unresolved by definition. The third — the note that defines whether a chord is major or minor, happy or sad — is replaced by the fourth or second. The chord is neither happy nor sad. It's *waiting*. It has to resolve somewhere.

In market terms, SUSPENDED means Bitcoin is correcting while Solana is holding or rising. Solana is showing relative strength against a falling Bitcoin. Normally in a risk-off move, both would fall together. When they decouple — BTC down, SOL up — something unusual is happening.

The question is: does this reliably precede anything?

Running the chord history back through 2021 to 2026 on the weekly timeframe, SUSPENDED appeared dozens of times. Most were noise — brief decouplings that resolved either up or down without a clean signal. But a subset of SUSPENDED occurrences showed something different.

When SUSPENDED appeared *while Jupiter was in a specific orbital window*, the outcome was remarkably consistent.

---

## The Jupiter filter

This is where the research becomes uncomfortable for a traditional quant. Jupiter is a planet. Its orbital position, measured as a 0–360° phase angle with a period of 398.88 days, is not in any standard financial model.

But here's the empirical observation: there is a 120° arc of Jupiter's orbit — centred at 340.9°, spanning ±60° — within which SUSPENDED weekly chord states have resolved upward with unusual consistency. Outside this window, SUSPENDED is noise. Inside it, the signal sharpens dramatically.

Why Jupiter? The honest answer is: we don't know with certainty. The correlation could be spurious — the dataset isn't large enough to rule that out statistically. But there are some reasonable hypotheses.

Jupiter's synodic period (398.88 days, the time between successive oppositions as seen from Earth) is close to but slightly longer than a calendar year. This means Jupiter-correlated patterns drift slowly against the annual calendar, picking up different macro contexts over time. The ~60-day signal window recurs once per Jupiter year, roughly every 13 months. This is a different rhythm from the Bitcoin halving (every ~4 years), the annual seasonal cycle, or the monthly options cycle. It's an *independent* oscillator.

Whether it's causally connected to Jupiter or is simply a recurring macro/sentiment cycle that happens to be phase-locked with Jupiter's orbit is an open question. What's not open is the empirical record.

**Seven SUSPENDED + Jupiter-window occurrences. Seven wins. Average return on SOL spot over the holding period: strongly positive across all seven.**

The W8 wallet — starting at $150, compounding those seven trades — sits at $240.52.

---

## The 9-state extension

The original four-chord Synthony uses binary direction: up or down. But real price action has three states: up, flat, and down. A 0.2% move and a 3% move are both "up" in the binary system, but they're informationally different. When a candle closes within ±0.2% of the open, neither voice is really moving — it's a sustained note.

Extending to three states per instrument gives a 3×3 matrix — nine chords. Five are new:

**LEADING** (BTC ↑, SOL →) — BTC breaks out but SOL is flat. In music, the leading tone is the seventh degree of the scale, the note that creates the strongest pull toward the tonic. It resolves up. When BTC leads and SOL is flat, SOL hasn't confirmed yet — but it usually follows. A precursor to MAJOR.

**LYDIAN** (BTC →, SOL ↑) — SOL moves independently upward while BTC is flat. The Lydian mode has a raised fourth, giving it a floating, ethereal quality. SOL breaking out without BTC often signals alt-season rotation — capital moving from the anchor into higher-beta instruments.

**PEDAL** (BTC →, SOL →) — Both flat. In music, a pedal point is a sustained note in the bass while harmonies shift above it. The market is at rest. Energy is accumulating or distributing. Silence before the phrase.

**PHRYGIAN** (BTC ↓, SOL →) — BTC corrects, SOL holds. The Phrygian mode is dark but distinctive — compressed tension at the half-step between root and second degree. SOL is showing relative strength against a falling BTC. Watch for a transition to SUSPENDED.

**NEAPOLITAN** (BTC →, SOL ↓) — SOL distributes while BTC holds flat. The Neapolitan chord (the flat-II major) is a dramatic pre-cadential harmony, often placed just before a large resolution. SOL weakening while BTC is flat is a distribution warning — the more vulnerable instrument is already breaking.

The off-diagonal cells — the divergence states — carry the most information. When both instruments move together (MAJOR, TRITONE) the regime is clear. When they decouple, you're watching the market decide where to go next. The divergence states are transitional, and transitions are where the opportunity lives.

---

## The orchestra expands

The same Synthony logic applies to any pair of correlated assets where one acts as anchor and the other as a high-beta oscillator.

SPY is to US equities what BTC is to crypto: the broad-market baseline, the institutional reference, the liquidity barometer. NVDA and AMC are higher voices — amplifiers of sentiment, faster-moving, more sensitive to regime shifts. SPY×NVDA and SPY×AMC are their own Synthonies, running the same 9-state chord detection with SPY as the anchor.

The signal carries over directly. When SPY is falling and NVDA is holding — a SUSPENDED chord in the equities Synthony — NVDA is showing relative strength. That's the same information structure as BTC↓ SOL↑. Different instruments, same harmony, same mathematical relationship.

This is what the orchestral metaphor is actually claiming: **the interval matters more than the pitch.** The specific assets are less important than the *relationship structure* between them. A Synthony captures that structure and names it. Gold×DXY. ETH×BTC. VIX×SPY. Each pair is a potential voice in the ensemble. The framework is the instrument; the assets are the notes you feed it.

---

## Same price, different coordinates

There's a deeper geometric insight underneath all of this.

When traders say "BTC is back at $50,000" and look at what happened last time price was at that level, they're implicitly assuming that $50,000 in 2019 and $50,000 in 2021 are the *same market state*. They're not.

Price is a single dimension. The market exists in a much higher-dimensional space.

The full state vector at any moment includes: the price (the pitch), the power-law residual (which *octave* you're in), the time since the last halving (the tempo of the cycle), Jupiter's orbital phase (the key signature), the lunar phase (a rhythmic accent), the BTC×SOL Synthony reading (the chord voicing), and the macro regime (the time signature).

$50,000 in early 2019: residual deeply negative, pre-halving, no SOL existed, different Jupiter phase, different macro. The key signature was minor, the tempo slow, the texture sparse.

$50,000 in mid-2021: residual at peak, post-halving blow-off, SOL surging, pandemic-era liquidity flood. The key signature was major, the tempo frantic, the texture dense.

Same note. Completely different music.

This is why kNN analysis in phase space works better than price-level analysis. A $50,000 BTC with a negative residual, in a SUSPENDED Synthony with Jupiter in the signal window, is a fundamentally different situation from $50,000 with a positive residual, in a TRITONE Synthony during a FOMC hiking cycle. The k-nearest-neighbours approach finds the historical moments whose *full coordinate vector* matches — not just the ones where price touched the same number.

The note is the same. The music is different.

---

## The live system

All of this runs live at **traderlive.viktim.xyz** as The Crypto Orchestra (tCO).

The ◈ PHASE SIGNAL tab shows the BTC×SOL Synthony in real time — current chord state, colour-coded, updating every candle close across six timeframes. When a candle closes, the system plays the corresponding arpeggio through the Web Audio API — each timeframe at its own octave, so 1-minute chimes ring high and fast, weekly chords ring low and slow. The orchestra is audible.

The ◎ STOCKS tab runs two equities Synthonies: SPY×NVDA and SPY×AMC. Same framework, different instruments. When SUSPENDED fires on either, the gate opens.

The Jupiter phase tracker shows the current orbital position and highlights the signal window. When the BTC×SOL Synthony reads SUSPENDED *and* Jupiter is in the window, the W8 gate opens — the compound signal with seven consecutive wins.

Eleven paper wallets track different strategy profiles simultaneously. The Overview chart carries Synthony change markers — coloured dots at each chord-shift event, filtered to the chart's timeframe.

This is a pure observation instrument. No orders, no automation, no leverage. Watch the orchestra. Learn its grammar.

---

## What's next

The Synthony framework has opened more questions than it's answered.

The SUSPENDED + Jupiter signal has seven data points. That's not enough to build a fund on — but it's enough to watch carefully. The next occurrence will either extend or break the streak, and that data point will matter.

The 9-state system needs its own backtest. Which divergence states (LEADING, LYDIAN, PHRYGIAN) best predict the subsequent chord? What's the transition probability matrix? If you're in PHRYGIAN, how often do you move to SUSPENDED vs TRITONE vs back to PEDAL?

The phase space approach needs a rigorous kNN implementation against the full state vector. When the nearest historical neighbours agree, does the signal sharpen?

And the ensemble has more voices to add. Gold×DXY. ETH×BTC. VIX×SPY. Each pair is a potential Synthony — the same mathematical structure, a new harmonic context. The score is incomplete. The ensemble is growing.

---

*The live system is at traderlive.viktim.xyz. The research began as a curiosity about the relationship between assets, music, and math. It ended, so far, with a 7/7 signal and a framework for thinking about market state that might actually be true.*

*The chord is currently playing. Listen.*

---

**The Crypto Orchestra (tCO)** · Synthonies indicator family · v1.0 · June 2026
