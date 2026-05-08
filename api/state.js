// Simple in-memory state store for cross-device sync
// Admin POSTs state, dashboard GETs it
// Vercel serverless functions share memory within a single instance

let cachedState = null
let lastUpdated = 0

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'POST') {
    cachedState = req.body
    lastUpdated = Date.now()
    return res.status(200).json({ ok: true, lastUpdated })
  }

  // GET
  if (!cachedState) {
    return res.status(200).json({ empty: true })
  }

  return res.status(200).json({ ...cachedState, lastUpdated })
}
