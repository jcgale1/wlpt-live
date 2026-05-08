import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react'
import { TEAMS, ALL_PLAYERS } from './players.js'
import { initSync, broadcastState, destroySync, pushStateNow } from './sync.js'

const StoreContext = createContext()
const CLOSED_KEY = 'wlpt-tournament-closed'
const STARTED_KEY = 'wlpt-tournament-started'

function generateDummyData() {
  const matches = []
  const matchups = [
    [0, 1], [2, 3], [4, 5],
    [0, 2], [1, 4], [3, 5],
    [0, 3], [1, 5], [2, 4],
  ]

  const PADEL_SCORES = [[6,0],[6,1],[6,2],[6,3],[6,4],[7,5],[7,6]]

  matchups.forEach(([a, b], i) => {
    const t1 = TEAMS[a]
    const t2 = TEAMS[b]
    const score = PADEL_SCORES[Math.floor(Math.random() * PADEL_SCORES.length)]
    const t1Wins = Math.random() > 0.5
    const gamesWon1 = t1Wins ? score[0] : score[1]
    const gamesWon2 = t1Wins ? score[1] : score[0]

    const playerStats = {}
    ;[...t1.players, ...t2.players].forEach(name => {
      playerStats[name] = {
        winners: Math.floor(Math.random() * 8) + 1,
        errors: Math.floor(Math.random() * 5) + 1,
        distance: +(Math.random() * 1.2 + 0.3).toFixed(2),
      }
    })

    matches.push({
      id: `match-${i + 1}`,
      round: i < 3 ? 'Round 1' : i < 6 ? 'Round 2' : 'Round 3',
      team1Id: t1.id,
      team2Id: t2.id,
      team1Score: gamesWon1,
      team2Score: gamesWon2,
      winner: t1Wins ? t1.id : t2.id,
      playerStats,
      timestamp: new Date(2026, 4, 8, 9 + i, 0).toISOString(),
    })
  })

  return matches
}

function buildLeaderboard(matches) {
  const board = {}
  TEAMS.forEach(t => {
    board[t.id] = { teamId: t.id, matchesWon: 0, gamesWon: 0, matchesPlayed: 0 }
  })

  matches.forEach(m => {
    if (!board[m.team1Id] || !board[m.team2Id]) return
    board[m.team1Id].matchesPlayed++
    board[m.team2Id].matchesPlayed++
    board[m.team1Id].gamesWon += m.team1Score
    board[m.team2Id].gamesWon += m.team2Score
    if (m.winner === m.team1Id) board[m.team1Id].matchesWon++
    else board[m.team2Id].matchesWon++
  })

  return Object.values(board).sort((a, b) =>
    b.matchesWon - a.matchesWon || b.gamesWon - a.gamesWon
  )
}

function buildPlayerLeaderboard(matches) {
  const board = {}
  ALL_PLAYERS.forEach(p => {
    board[p.name] = { name: p.name, teamId: p.teamId, winners: 0, errors: 0, distance: 0, matchesPlayed: 0 }
  })

  matches.forEach(m => {
    if (!m.playerStats) return
    Object.entries(m.playerStats).forEach(([name, stats]) => {
      if (!board[name]) return
      board[name].winners += stats.winners || 0
      board[name].errors += stats.errors || 0
      board[name].distance += stats.distance || 0
      board[name].matchesPlayed++
    })
  })

  return Object.values(board).sort((a, b) =>
    b.winners - a.winners || (a.errors - b.errors) || b.distance - a.distance
  )
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MATCHES': {
      const deduped = action.payload.filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i)
      // Check if actually different (by id set + count)
      const oldIds = new Set(state.matches.map(m => m.id))
      const newIds = new Set(deduped.map(m => m.id))
      if (deduped.length === state.matches.length && [...newIds].every(id => oldIds.has(id))) return state
      return { ...state, matches: deduped, leaderboard: buildLeaderboard(deduped), playerLeaderboard: buildPlayerLeaderboard(deduped) }
    }
    case 'ADD_MATCH': {
      if (state.matches.some(m => m.id === action.payload.id)) return state
      const matches = [...state.matches, action.payload]
      return { ...state, matches, leaderboard: buildLeaderboard(matches), playerLeaderboard: buildPlayerLeaderboard(matches) }
    }
    case 'ADD_MATCHES': {
      const existingIds = new Set(state.matches.map(m => m.id))
      const newMatches = action.payload.filter(m => !existingIds.has(m.id))
      if (newMatches.length === 0) return state
      const matches = [...state.matches, ...newMatches]
      return { ...state, matches, leaderboard: buildLeaderboard(matches), playerLeaderboard: buildPlayerLeaderboard(matches) }
    }
    case 'UPDATE_MATCH': {
      const matches = state.matches.map(m => m.id === action.payload.id ? action.payload : m)
      return { ...state, matches, leaderboard: buildLeaderboard(matches), playerLeaderboard: buildPlayerLeaderboard(matches) }
    }
    case 'DELETE_MATCH': {
      const matches = state.matches.filter(m => m.id !== action.payload)
      return { ...state, matches, leaderboard: buildLeaderboard(matches), playerLeaderboard: buildPlayerLeaderboard(matches) }
    }
    case 'CLOSE_TOURNAMENT':
      return { ...state, tournamentClosed: true }
    case 'REOPEN_TOURNAMENT':
      return { ...state, tournamentClosed: false }
    case 'START_TOURNAMENT': {
      const matches = []
      return { ...state, tournamentStarted: true, tournamentClosed: false, matches, leaderboard: buildLeaderboard(matches), playerLeaderboard: buildPlayerLeaderboard(matches) }
    }
    case 'RESET_TOURNAMENT': {
      const matches = []
      return { ...state, tournamentStarted: false, tournamentClosed: false, matches, leaderboard: buildLeaderboard(matches), playerLeaderboard: buildPlayerLeaderboard(matches) }
    }
    case 'SET_STARTED':
      return { ...state, tournamentStarted: action.payload }
    default:
      return state
  }
}

const STORAGE_KEY = 'wlpt-matches-v3'

function loadMatches() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return null
}

function loadClosed() {
  try { return localStorage.getItem(CLOSED_KEY) === 'true' } catch { return false }
}

function loadStarted() {
  try { return localStorage.getItem(STARTED_KEY) === 'true' } catch { return false }
}

export function StoreProvider({ children }) {
  const saved = loadMatches()
  const started = loadStarted()
  const initial = started ? (saved || []) : []
  const [state, dispatch] = useReducer(reducer, {
    matches: initial,
    leaderboard: buildLeaderboard(initial),
    playerLeaderboard: buildPlayerLeaderboard(initial),
    tournamentClosed: loadClosed(),
    tournamentStarted: loadStarted(),
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.matches))
  }, [state.matches])

  useEffect(() => {
    localStorage.setItem(CLOSED_KEY, state.tournamentClosed ? 'true' : 'false')
  }, [state.tournamentClosed])

  useEffect(() => {
    localStorage.setItem(STARTED_KEY, state.tournamentStarted ? 'true' : 'false')
  }, [state.tournamentStarted])

  useEffect(() => {
    // Same-browser cross-tab sync only (events from this device's other tabs)
    const bc = new BroadcastChannel('wlpt-live')
    bc.onmessage = (e) => {
      if (e.data.type === 'NEW_MATCH') dispatch({ type: 'ADD_MATCH', payload: e.data.match })
      if (e.data.type === 'NEW_MATCHES') dispatch({ type: 'ADD_MATCHES', payload: e.data.matches })
      if (e.data.type === 'TOURNAMENT_CLOSED') dispatch({ type: 'CLOSE_TOURNAMENT' })
      if (e.data.type === 'TOURNAMENT_REOPENED') dispatch({ type: 'REOPEN_TOURNAMENT' })
      if (e.data.type === 'TOURNAMENT_STARTED') dispatch({ type: 'START_TOURNAMENT' })
      if (e.data.type === 'TOURNAMENT_RESET') dispatch({ type: 'RESET_TOURNAMENT' })
    }
    return () => bc.close()
  }, [])

  // Cross-device sync via Supabase Realtime
  const stateRef = useRef(state)
  stateRef.current = state
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('admin')

  useEffect(() => {
    initSync({
      admin: isAdmin,
      getState: () => stateRef.current,
      onStateReceived: (payload) => {
        // Admin ignores incoming state — admin is the source of truth
        if (isAdmin) return
        if (Array.isArray(payload.matches)) {
          dispatch({ type: 'SET_MATCHES', payload: payload.matches })
        }
        if (typeof payload.tournamentStarted === 'boolean') {
          dispatch({ type: 'SET_STARTED', payload: payload.tournamentStarted })
        }
        if (typeof payload.tournamentClosed === 'boolean') {
          dispatch({ type: payload.tournamentClosed ? 'CLOSE_TOURNAMENT' : 'REOPEN_TOURNAMENT' })
        }
      },
    })
    return () => destroySync()
  }, [isAdmin])

  // Admin broadcasts on every state change
  useEffect(() => {
    if (isAdmin) {
      broadcastState(state)
    }
  }, [state.matches, state.tournamentStarted, state.tournamentClosed, isAdmin])

  const addMatch = useCallback((match) => {
    dispatch({ type: 'ADD_MATCH', payload: match })
    const bc = new BroadcastChannel('wlpt-live')
    bc.postMessage({ type: 'NEW_MATCH', match })
    bc.close()
  }, [])

  const addMatches = useCallback((matches) => {
    dispatch({ type: 'ADD_MATCHES', payload: matches })
    const bc = new BroadcastChannel('wlpt-live')
    bc.postMessage({ type: 'NEW_MATCHES', matches })
    bc.close()
  }, [])

  const updateMatch = useCallback((match) => {
    dispatch({ type: 'UPDATE_MATCH', payload: match })
  }, [])

  const deleteMatch = useCallback((matchId) => {
    dispatch({ type: 'DELETE_MATCH', payload: matchId })
  }, [])

  const closeTournament = useCallback(() => {
    dispatch({ type: 'CLOSE_TOURNAMENT' })
    const bc = new BroadcastChannel('wlpt-live')
    bc.postMessage({ type: 'TOURNAMENT_CLOSED' })
    bc.close()
    if (isAdmin) pushStateNow({ ...stateRef.current, tournamentClosed: true })
  }, [isAdmin])

  const reopenTournament = useCallback(() => {
    dispatch({ type: 'REOPEN_TOURNAMENT' })
    const bc = new BroadcastChannel('wlpt-live')
    bc.postMessage({ type: 'TOURNAMENT_REOPENED' })
    bc.close()
    if (isAdmin) pushStateNow({ ...stateRef.current, tournamentClosed: false })
  }, [isAdmin])

  const startTournament = useCallback(() => {
    dispatch({ type: 'START_TOURNAMENT' })
    const bc = new BroadcastChannel('wlpt-live')
    bc.postMessage({ type: 'TOURNAMENT_STARTED' })
    bc.close()
    if (isAdmin) pushStateNow({ matches: [], tournamentStarted: true, tournamentClosed: false })
  }, [isAdmin])

  const resetTournament = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(CLOSED_KEY)
    localStorage.removeItem(STARTED_KEY)
    dispatch({ type: 'RESET_TOURNAMENT' })
    const bc = new BroadcastChannel('wlpt-live')
    bc.postMessage({ type: 'TOURNAMENT_RESET' })
    bc.close()
    // Immediate push so dashboards see reset within 1s instead of 3s
    if (isAdmin) {
      pushStateNow({ matches: [], tournamentStarted: false, tournamentClosed: false })
    }
  }, [isAdmin])

  return (
    <StoreContext.Provider value={{ ...state, addMatch, addMatches, updateMatch, deleteMatch, closeTournament, reopenTournament, startTournament, resetTournament }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  return useContext(StoreContext)
}
