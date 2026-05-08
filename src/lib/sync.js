import { supabase } from './supabase.js'

const CHANNEL_NAME = 'wlpt-sync'
let channel = null
let heartbeat = null
let reloadTimer = null
let isAdmin = false
let stateGetter = null
let lastReceived = 0

/**
 * Cross-device sync via Supabase Realtime.
 * - Admin tracks presence with full state, broadcasts on changes
 * - Dashboard reads admin presence on connect + listens for broadcasts
 */

export function initSync({ onStateReceived, getState, admin }) {
  if (channel) channel.unsubscribe()
  isAdmin = admin
  stateGetter = getState

  channel = supabase.channel(CHANNEL_NAME, {
    config: { broadcast: { self: false }, presence: { key: admin ? 'admin' : `viewer-${Date.now()}` } },
  })

  // Listen for broadcast state updates
  channel.on('broadcast', { event: 'state_update' }, ({ payload }) => {
    if (payload) {
      lastReceived = Date.now()
      onStateReceived(payload)
    }
  })

  // Listen for state requests (admin responds)
  channel.on('broadcast', { event: 'state_request' }, () => {
    if (isAdmin && stateGetter) {
      broadcastState(stateGetter())
    }
  })

  // On presence sync, dashboard reads admin's presence state
  channel.on('presence', { event: 'sync' }, () => {
    if (!isAdmin) {
      const presenceState = channel.presenceState()
      const adminPresence = presenceState['admin']
      if (adminPresence && adminPresence.length > 0 && adminPresence[0].state) {
        lastReceived = Date.now()
        onStateReceived(adminPresence[0].state)
      }
    }
  })

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      if (isAdmin && stateGetter) {
        // Admin sets presence with current state
        const state = stateGetter()
        await channel.track({
          state: {
            matches: state.matches,
            tournamentStarted: state.tournamentStarted,
            tournamentClosed: state.tournamentClosed,
          }
        })
        // Heartbeat: admin pushes state every 5s so dashboard always catches up
        if (heartbeat) clearInterval(heartbeat)
        heartbeat = setInterval(() => {
          if (stateGetter) broadcastState(stateGetter())
        }, 5000)
      } else {
        // Dashboard: request state immediately, then poll every 3s
        const pullState = () => {
          // Try presence first (persists across reconnects)
          const presenceState = channel.presenceState()
          const adminPresence = presenceState['admin']
          if (adminPresence && adminPresence.length > 0 && adminPresence[0].state) {
            onStateReceived(adminPresence[0].state)
          }
          // Also ask admin to broadcast (belt + suspenders)
          channel.send({ type: 'broadcast', event: 'state_request', payload: {} })
        }
        pullState()
        setTimeout(pullState, 1000)
        setTimeout(pullState, 3000)
        // Keep polling every 5s so we always converge
        if (heartbeat) clearInterval(heartbeat)
        heartbeat = setInterval(pullState, 5000)
        // Self-healing: if no state received after 20s, force reload
        if (reloadTimer) clearTimeout(reloadTimer)
        reloadTimer = setTimeout(() => {
          if (lastReceived === 0) {
            console.warn('[sync] No state received after 20s, reloading...')
            window.location.reload()
          }
        }, 20000)
      }
    }
  })

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
  // Also update presence so new joiners get it
  if (isAdmin) {
    channel.track({ state: payload })
  }
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
  if (reloadTimer) {
    clearTimeout(reloadTimer)
    reloadTimer = null
  }
  if (channel) {
    channel.unsubscribe()
    channel = null
  }
}
