// pages/api/state.js — proxies VPS HTTP through Vercel HTTPS
export default async function handler(req, res) {
  try {
    const r = await fetch('http://srv1618156.hstgr.cloud:7842/api/state')
    if (!r.ok) throw new Error(`VPS ${r.status}`)
    const data = await r.json()
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json(data)
  } catch (e) {
    res.status(503).json({ error: e.message })
  }
}
