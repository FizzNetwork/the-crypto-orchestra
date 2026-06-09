// Proxy SOL klines from Kraken — avoids Binance 451 geo-block on US Vercel servers
const INTERVAL_MIN = { '1m':1, '15m':15, '1h':60, '4h':240, '1d':1440, '1w':10080 }

export default async function handler(req, res) {
  const tf       = req.query.interval || '1h'
  const limit    = parseInt(req.query.limit) || 10
  const interval = INTERVAL_MIN[tf] || 60

  try {
    const r = await fetch(
      `https://api.kraken.com/0/public/OHLC?pair=SOLUSDT&interval=${interval}`
    )
    if (!r.ok) { res.status(r.status).json({ error: 'Kraken error' }); return }
    const json = await r.json()
    if (json.error?.length) { res.status(500).json({ error: json.error[0] }); return }

    // Kraken: [time, open, high, low, close, vwap, volume, count]
    // Normalise to Binance-style so frontend [4]=close stays the same
    const pairKey = Object.keys(json.result).find(k => k !== 'last')
    const raw = json.result[pairKey] || []

    const normalized = raw.slice(-limit).map(k => [
      k[0] * 1000,              // [0] openTime ms
      String(k[1]),             // [1] open
      String(k[2]),             // [2] high
      String(k[3]),             // [3] low
      String(k[4]),             // [4] close  ← what computeChord reads
      String(k[6]),             // [5] volume
      (k[0] + interval * 60) * 1000, // [6] closeTime ms
    ])

    res.setHeader('Cache-Control', 'no-store')
    res.json(normalized)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}
