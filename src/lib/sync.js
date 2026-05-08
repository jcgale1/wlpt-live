/**
 * Cross-device sync via HTTP polling (primary) + Supabase Realtime (bonus).
 * - Admin POSTs state to /api/state every 3s
 * - Dashboard GETs state from /api/state every 3s
 * - Supabase Realtime still runs as a fast-path for instant updates
 */

import { supabase } from './supabase.js'

const CHANNEL_NAME = 'wlpt-sync'
const API_URL = '/api/state'
const POLL_INTERVAL = 3000

let channel = null
let httpPoll = null
let isAdmin = false
let stateGetter = null
let onStateCallback = null
let lastAppliedVersion = 0
let myVersion = 0

// ---- HTTP polling (works on any browser, no WebSocket needed) ----

function startHttpPoll() {
  if (httpPoll) clearInterval(httpPoll)

  if (isAdmin) {
    // Admin: push state to API every 3s with monotonic version
    const pushState = () => {
      if (!stateGetter) return
      const state = stateGetter()
      myVersion = Date.now()
      const payload = {
        matches: state.matches,
        tournamentStarted: state.tournamentStarted,
        tournamentClosed: state.tournamentClosed,
        version: myVersion,
      }
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {})
    }
    pushState()
    httpPoll = setInterval(pushState, POLL_INTERVAL)
  } else {
    // Dashboard: pull state from API every 3s, only apply if newer
    const pullState = () => {
      fetch(API_URL)
        .then(r => r.json())
        .then(data => {
          if (!data || data.empty || !onStateCallback) return
          // Only apply if this state is newer than what we last applied
          const incomingVersion = data.version || 0
          if (incomingVersion <= lastAppliedVersion) return
          lastAppliedVersion = incomingVersion
          onStateCallback(data)
        })
        .catch(() => {})
    }
    pullState()
    setTimeout(pullState, 1000)
    httpPoll = setInterval(pullState, POLL_INTERVAL)
  }
}

// ---- Supabase Realtime (fast-path, bonus on top of HTTP) ----

function startRealtime(onStateReceived) {
  try {
    channel = supabase.channel(CHANNEL_NAME, {
      config: { broadcast: { self: false }, presence: { key: isAdmin ? 'admin' : `viewer-${Date.now()}` } },
    })

    channel.on('broadcast', { event: 'state_update' }, ({ payload }) => {
      if (payload) onStateReceived(payload)
    })

    channel.on('broadcast', { event: 'state_request' }, () => {
      if (isAdmin && stateGetter) {
        broadcastState(stateGetter())
      }
    })

    channel.on('presence', { event: 'sync' }, () => {
      if (!isAdmin) {
        const presenceState = channel.presenceState()
        const adminPresence = presenceState['admin']
        if (adminPresence && adminPresence.length > 0 && adminPresence[0].state) {
          onStateReceived(adminPresence[0].state)
        }
      }
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && isAdmin && stateGetter) {
        const state = stateGetter()
        await channel.track({
          state: {
            matches: state.matches,
            tournamentStarted: state.tournamentStarted,
            tournamentClosed: state.tournamentClosed,
          }
        })
      }
    })
  } catch (e) {
    console.warn('[sync] Realtime init failed, HTTP polling still active:', e)
  }
}

// ---- Public API ----

export function initSync({ onStateReceived, getState, admin }) {
  if (channel) channel.unsubscribe()
  if (httpPoll) clearInterval(httpPoll)

  isAdmin = admin
  stateGetter = getState
  onStateCallback = onStateReceived

  // HTTP polling is the primary sync mechanism
  startHttpPoll()

  // Supabase Realtime is a bonus fast-path
  startRealtime(onStateReceived)

  return channel
}

export function broadcastState(state) {
  if (!channel) return
  const payload = {
    matches: state.matches,
    tournamentStarted: state.tournamentStarted,
    tournamentClosed: state.tournamentClosed,
  }
  channel.send({ type: 'broadcast', event: 'state_update', payload })
  if (isAdmin) {
    channel.track({ state: payload })
  }
}

export function requestState() {
  // HTTP pull
  fetch(API_URL)
    .then(r => r.json())
    .then(data => {
      if (data && !data.empty && onStateCallback) {
        onStateCallback(data)
      }
    })
    .catch(() => {})
  // Also try Realtime
  if (channel) {
    channel.send({ type: 'broadcast', event: 'state_request', payload: {} })
  }
}

export function destroySync() {
  if (httpPoll) {
    clearInterval(httpPoll)
    httpPoll = null
  }
  if (channel) {
    channel.unsubscribe()
    channel = null
  }
}
