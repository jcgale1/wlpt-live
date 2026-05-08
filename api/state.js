// Simple in-memory state store with timestamp-based reconciliation
// Admin POSTs state with version, dashboard GETs latest

let cachedState = null
let cachedVersion = 0

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    const incomingVersion = body.version || Date.now()
    // Only accept newer state
    if (incomingVersion > cachedVersion) {
      cachedState = body
      cachedVersion = incomingVersion
    }
    return res.status(200).json({ ok: true, version: cachedVersion })
  }

  // GET
  if (!cachedState) {
    return res.status(200).json({ empty: true, version: 0 })
  }

  return res.status(200).json({ ...cachedState, version: cachedVersion })
}
