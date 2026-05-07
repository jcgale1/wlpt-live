import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { TEAMS } from './players.js'

const StoreContext = createContext()

function generateDummyData() {
  const matches = []
  const teamIds = TEAMS.map(t => t.id)

  const matchups = [
    [0, 1], [2, 3], [4, 5],
    [0, 2], [1, 4], [3, 5],
    [0, 3], [1, 5], [2, 4],
  ]

  matchups.forEach(([a, b], i) => {
    const team1 = TEAMS[teamIds[a]] ? teamIds[a] : TEAMS[a].id
    const team2 = TEAMS[teamIds[b]] ? teamIds[b] : TEAMS[b].id
    const gamesWon1 = Math.floor(Math.random() * 3)
    const gamesWon2 = Math.floor(Math.random() * 3)
    matches.push({
      id: `match-${i + 1}`,
      round: i < 3 ? 'Round 1' : i < 6 ? 'Round 2' : 'Round 3',
      team1Id: TEAMS[a].id,
      team2Id: TEAMS[b].id,
      team1Score: gamesWon1,
      team2Score: gamesWon2,
      winner: gamesWon1 > gamesWon2 ? TEAMS[a].id : TEAMS[b].id,
      stats: {
        [TEAMS[a].id]: {
          winners: Math.floor(Math.random() * 12) + 3,
          errors: Math.floor(Math.random() * 8) + 1,
          distance: +(Math.random() * 1.5 + 0.8).toFixed(2),
        },
        [TEAMS[b].id]: {
          winners: Math.floor(Math.random() * 12) + 3,
          errors: Math.floor(Math.random() * 8) + 1,
          distance: +(Math.random() * 1.5 + 0.8).toFixed(2),
        },
      },
      timestamp: new Date(2026, 4, 8, 9 + i, 0).toISOString(),
    })
  })

  return matches
}

function buildLeaderboard(matches) {
  const board = {}
  TEAMS.forEach(t => {
    board[t.id] = { teamId: t.id, matchesWon: 0, gamesWon: 0, winners: 0, errors: 0, distance: 0, matchesPlayed: 0 }
  })

  matches.forEach(m => {
    if (!board[m.team1Id] || !board[m.team2Id]) return
    board[m.team1Id].matchesPlayed++
    board[m.team2Id].matchesPlayed++
    board[m.team1Id].gamesWon += m.team1Score
    board[m.team2Id].gamesWon += m.team2Score
    if (m.winner === m.team1Id) board[m.team1Id].matchesWon++
    else board[m.team2Id].matchesWon++

    const s1 = m.stats[m.team1Id]
    const s2 = m.stats[m.team2Id]
    if (s1) {
      board[m.team1Id].winners += s1.winners
      board[m.team1Id].errors += s1.errors
      board[m.team1Id].distance += s1.distance
    }
    if (s2) {
      board[m.team2Id].winners += s2.winners
      board[m.team2Id].errors += s2.errors
      board[m.team2Id].distance += s2.distance
    }
  })

  return Object.values(board).sort((a, b) =>
    b.matchesWon - a.matchesWon || b.gamesWon - a.gamesWon || b.winners - a.winners
  )
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MATCHES':
      return { ...state, matches: action.payload, leaderboard: buildLeaderboard(action.payload) }
    case 'ADD_MATCH': {
      const matches = [...state.matches, action.payload]
      return { ...state, matches, leaderboard: buildLeaderboard(matches) }
    }
    case 'ADD_MATCHES': {
      const matches = [...state.matches, ...action.payload]
      return { ...state, matches, leaderboard: buildLeaderboard(matches) }
    }
    default:
      return state
  }
}

const STORAGE_KEY = 'wlpt-matches'

function loadMatches() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return null
}

export function StoreProvider({ children }) {
  const saved = loadMatches()
  const initial = saved || generateDummyData()
  const [state, dispatch] = useReducer(reducer, {
    matches: initial,
    leaderboard: buildLeaderboard(initial),
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.matches))
  }, [state.matches])

  useEffect(() => {
    const bc = new BroadcastChannel('wlpt-live')
    bc.onmessage = (e) => {
      if (e.data.type === 'NEW_MATCH') dispatch({ type: 'ADD_MATCH', payload: e.data.match })
      if (e.data.type === 'NEW_MATCHES') dispatch({ type: 'ADD_MATCHES', payload: e.data.matches })
    }
    return () => bc.close()
  }, [])

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

  return (
    <StoreContext.Provider value={{ ...state, addMatch, addMatches }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  return useContext(StoreContext)
}
