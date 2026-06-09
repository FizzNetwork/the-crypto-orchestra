// Yahoo Finance proxy — SPY, NVDA, AMC, QQQ etc
const INTERVAL_MAP = {
  '1d':  { interval: '1d',  range: '1mo'  },
  '1wk': { interval: '1wk', range: '6mo'  },
  '1h':  { interval: '1h',  range: '5d'   },
  '15m': { interval: '15m', range: '5d'   },
}

export default async function handler(req, res) {
  const { symbol = 'SPY', tf = '1d', limit = 10 } = req.query
  const cfg = INTERVAL_MAP[tf] || INTERVAL_MAP['1d']

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${cfg.interval}&range=${cfg.range}`
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    })
    if (!r.ok) { res.status(r.status).json({ error: `Yahoo ${r.status}` }); return }
    const json = await r.json()
    const result = json.chart?.result?.[0]
    if (!result) { res.status(500).json({ error: 'No data returned' }); return }

    const timestamps = result.timestamp || []
    const q = result.indicators?.quote?.[0] || {}
    const adjClose = result.indicators?.adjclose?.[0]?.adjclose

    const candles = timestamps
      .map((ts, i) => ({
        ts: ts * 1000,
        o:  q.open?.[i]  || 0,
        h:  q.high?.[i]  || 0,
        l:  q.low?.[i]   || 0,
        c:  (adjClose?.[i]) || q.close?.[i] || 0,
      }))
      .filter(c => c.c > 0)
      .slice(-parseInt(limit))

    res.setHeader('Cache-Control', 'no-store')
    res.json(candles)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}
