/**
 * Cross-device sync via Supabase Realtime ONLY.
 * - Admin tracks state in Presence (server-side, persists for channel lifetime)
 * - Admin broadcasts on every state change (push)
 * - Dashboard reads admin Presence on connect + listens for broadcasts
 *
 * No HTTP polling — in-memory serverless state is unreliable across instances.
 */

import { supabase } from './supabase.js'

const CHANNEL_NAME = 'wlpt-sync'
const VERSION_KEY = 'wlpt-last-applied-version'

let channel = null
let heartbeat = null
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

export function initSync({ onStateReceived, getState, admin }) {
  if (channel) channel.unsubscribe()
  if (heartbeat) clearInterval(heartbeat)

  isAdmin = admin
  stateGetter = getState
  onStateCallback = onStateReceived

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
  if (!isAdmin || !channel) return
  const payload = makePayload(state)
  try { channel.track({ state: payload }) } catch {}
  channel.send({ type: 'broadcast', event: 'state_update', payload })
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
  if (channel) {
    channel.unsubscribe()
    channel = null
  }
}
