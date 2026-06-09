// Proxy BTC klines from Kraken — same source as the VPS
const INTERVAL_MIN = { '15m':15, '1h':60, '4h':240, '1d':1440 }

export default async function handler(req, res) {
  const tf       = req.query.interval || '1h'
  const limit    = parseInt(req.query.limit) || 150
  const interval = INTERVAL_MIN[tf] || 60

  try {
    const r = await fetch(
      `https://api.kraken.com/0/public/OHLC?pair=XBTUSDT&interval=${interval}`
    )
    if (!r.ok) { res.status(r.status).json({ error: 'Kraken error' }); return }
    const json = await r.json()
    if (json.error?.length) { res.status(500).json({ error: json.error[0] }); return }

    const pairKey = Object.keys(json.result).find(k => k !== 'last')
    const raw = json.result[pairKey] || []

    // Convert to our candle format: { ts, o, h, l, c }
    const candles = raw.slice(-limit).map(k => ({
      ts: k[0] * 1000,
      o:  parseFloat(k[1]),
      h:  parseFloat(k[2]),
      l:  parseFloat(k[3]),
      c:  parseFloat(k[4]),
    }))

    res.setHeader('Cache-Control', 'no-store')
    res.json(candles)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}
