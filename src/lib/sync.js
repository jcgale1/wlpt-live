/**
 * Cross-device sync via Supabase Realtime + HTTP polling fallback.
 * Both paths converge via applyIncoming() which uses version reconciliation.
 * Realtime is fastest; HTTP catches devices where WebSockets are blocked (smart TVs).
 */

import { supabase } from './supabase.js'

const CHANNEL_NAME = 'wlpt-sync'
const VERSION_KEY = 'wlpt-last-applied-version'
const API_URL = '/api/state'
const POLL_INTERVAL = 3000

let channel = null
let heartbeat = null
let httpPoll = null
let isAdmin = false
let stateGetter = null
let onStateCallback = null
let lastAppliedVersion = (() => {
  try { return parseInt(localStorage.getItem(VERSION_KEY) || '0', 10) || 0 } catch { return 0 }
})()
let myVersion = 0

function setLastAppliedVersion(v) {
  lastAppliedVersion = v
  try { localStorage.setItem(VERSION_KEY, String(v)) } catch {}
}

function makePayload(state) {
  myVersion = Date.now()
  return {
    matches: state.matches,
    tournamentStarted: state.tournamentStarted,
    tournamentClosed: state.tournamentClosed,
    version: myVersion,
  }
}

function applyIncoming(payload) {
  if (!payload || !onStateCallback) return
  const v = payload.version || 0
  if (v <= lastAppliedVersion) return
  setLastAppliedVersion(v)
  onStateCallback(payload)
}

function startHttpPoll() {
  if (httpPoll) clearInterval(httpPoll)

  if (isAdmin) {
    // Admin: push state to API every 3s (HTTP fallback for TVs without WebSocket)
    const pushHttp = () => {
      if (!stateGetter) return
      const payload = makePayload(stateGetter())
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {})
    }
    pushHttp()
    httpPoll = setInterval(pushHttp, POLL_INTERVAL)
  } else {
    // Dashboard: pull from API every 3s (only applies if version is newer)
    const pullHttp = () => {
      fetch(API_URL + '?t=' + Date.now(), { cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
          if (!data || data.empty) return
          applyIncoming(data)
        })
        .catch(() => {})
    }
    pullHttp()
    setTimeout(pullHttp, 1000)
    httpPoll = setInterval(pullHttp, POLL_INTERVAL)
  }
}

export function initSync({ onStateReceived, getState, admin }) {
  if (channel) channel.unsubscribe()
  if (heartbeat) clearInterval(heartbeat)
  if (httpPoll) clearInterval(httpPoll)

  isAdmin = admin
  stateGetter = getState
  onStateCallback = onStateReceived

  // Start HTTP polling immediately (works on any browser)
  startHttpPoll()

  channel = supabase.channel(CHANNEL_NAME, {
    config: { broadcast: { self: false }, presence: { key: admin ? 'admin' : `viewer-${Date.now()}` } },
  })

  // Listen for broadcast state updates
  channel.on('broadcast', { event: 'state_update' }, ({ payload }) => {
    if (!isAdmin) applyIncoming(payload)
  })

  // Admin responds to state requests
  channel.on('broadcast', { event: 'state_request' }, () => {
    if (isAdmin && stateGetter) {
      const payload = makePayload(stateGetter())
      channel.send({ type: 'broadcast', event: 'state_update', payload })
    }
  })

  // Dashboard reads admin Presence
  channel.on('presence', { event: 'sync' }, () => {
    if (isAdmin) return
    const presenceState = channel.presenceState()
    const adminPresence = presenceState['admin']
    if (adminPresence && adminPresence.length > 0 && adminPresence[0].state) {
      applyIncoming(adminPresence[0].state)
    }
  })

  channel.subscribe(async (status) => {
    if (status !== 'SUBSCRIBED') return
    if (isAdmin && stateGetter) {
      // Admin: track state in presence + broadcast every 5s as heartbeat
      const push = async () => {
        if (!stateGetter) return
        const payload = makePayload(stateGetter())
        try { await channel.track({ state: payload }) } catch {}
        channel.send({ type: 'broadcast', event: 'state_update', payload })
      }
      await push()
      heartbeat = setInterval(push, 5000)
    } else {
      // Dashboard: request state from admin immediately + at 1s, 3s
      const req = () => channel.send({ type: 'broadcast', event: 'state_request', payload: {} })
      req()
      setTimeout(req, 1000)
      setTimeout(req, 3000)
    }
  })

  return channel
}

// Force an immediate push (admin only) — for reset/start/close to propagate fast
export function pushStateNow(state) {
  if (!isAdmin) return
  const payload = makePayload(state)
  // Realtime
  if (channel) {
    try { channel.track({ state: payload }) } catch {}
    channel.send({ type: 'broadcast', event: 'state_update', payload })
  }
  // HTTP
  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {})
}

// Compatibility shim
export function broadcastState(state) {
  pushStateNow(state)
}

export function requestState() {
  if (!channel) return
  channel.send({ type: 'broadcast', event: 'state_request', payload: {} })
}

export function destroySync() {
  if (heartbeat) {
    clearInterval(heartbeat)
    heartbeat = null
  }
  if (httpPoll) {
    clearInterval(httpPoll)
    httpPoll = null
  }
  if (channel) {
    channel.unsubscribe()
    channel = null
  }
}
