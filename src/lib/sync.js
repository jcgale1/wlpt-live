import { supabase } from './supabase.js'

const CHANNEL_NAME = 'wlpt-sync'
let channel = null

/**
 * Cross-device sync via Supabase Realtime Broadcast.
 * Admin pushes full state on every change.
 * Dashboard subscribes and applies incoming state.
 */

export function initSync(onStateReceived) {
  if (channel) channel.unsubscribe()

  channel = supabase.channel(CHANNEL_NAME, {
    config: { broadcast: { self: false } },
  })

  channel
    .on('broadcast', { event: 'state_update' }, ({ payload }) => {
      if (payload) onStateReceived(payload)
    })
    .on('broadcast', { event: 'state_request' }, () => {
      // Only admin responds — checked in broadcastState
    })
    .subscribe()

  return channel
}

export function broadcastState(state) {
  if (!channel) return
  channel.send({
    type: 'broadcast',
    event: 'state_update',
    payload: {
      matches: state.matches,
      tournamentStarted: state.tournamentStarted,
      tournamentClosed: state.tournamentClosed,
    },
  })
}

export function requestState() {
  if (!channel) return
  channel.send({
    type: 'broadcast',
    event: 'state_request',
    payload: {},
  })
}

export function destroySync() {
  if (channel) {
    channel.unsubscribe()
    channel = null
  }
}
