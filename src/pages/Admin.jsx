import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { TEAMS } from '../lib/players.js'
import { displayName } from '../lib/names.js'
import { useStore } from '../lib/store.jsx'
import TeamBadge from '../components/TeamBadge.jsx'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (loading) return <Shell><p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</p></Shell>
  if (!session) return <Shell><LoginForm /></Shell>

  return (
    <Shell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{
          fontFamily: '"Barlow Condensed", sans-serif', fontSize: 22, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: 3, color: '#E60150', margin: 0,
        }}>
          Match Admin
        </h2>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', padding: '6px 14px', borderRadius: 8,
            fontSize: 11, fontFamily: '"DM Mono", monospace', cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>
      <MatchEntryForm />
      <MatchHistory />
    </Shell>
  )
}

function Shell({ children }) {
  return (
    <div style={{
      minHeight: '100dvh', width: '100%',
      background: 'linear-gradient(180deg, #040406 0%, #0a0a1a 100%)',
      color: '#fff', padding: '20px 16px',
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <img src="/logos/padx-logo-white.svg" alt="PadX" style={{ height: 18, opacity: 0.6 }} />
          <span style={{
            fontFamily: '"Barlow Condensed", sans-serif', fontSize: 14, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)',
          }}>
            WLPT Admin
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{
        fontFamily: '"Barlow Condensed", sans-serif', fontSize: 24, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: 3, color: '#fff', margin: '0 0 8px',
      }}>
        Sign In
      </h2>
      <input
        type="email" placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)} required
        style={inputStyle}
      />
      <input
        type="password" placeholder="Password" value={password}
        onChange={e => setPassword(e.target.value)} required
        style={inputStyle}
      />
      {error && <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p>}
      <button type="submit" disabled={submitting} style={btnPrimary}>
        {submitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}

function MatchEntryForm() {
  const { addMatches } = useStore()
  const [rows, setRows] = useState([emptyRow()])

  function emptyRow() {
    return {
      team1Id: '', team2Id: '', team1Score: '', team2Score: '',
      round: 'Round 1',
      playerStats: {},
    }
  }

  function updateRow(index, field, value) {
    setRows(prev => prev.map((r, i) => {
      if (i !== index) return r
      const updated = { ...r, [field]: value }
      if (field === 'team1Id' || field === 'team2Id') {
        updated.playerStats = buildPlayerStatsTemplate(updated.team1Id, updated.team2Id)
      }
      return updated
    }))
  }

  function buildPlayerStatsTemplate(team1Id, team2Id) {
    const ps = {}
    const t1 = TEAMS.find(t => t.id === team1Id)
    const t2 = TEAMS.find(t => t.id === team2Id)
    if (t1) t1.players.forEach(n => { ps[n] = { winners: '', errors: '', distance: '' } })
    if (t2) t2.players.forEach(n => { ps[n] = { winners: '', errors: '', distance: '' } })
    return ps
  }

  function updatePlayerStat(rowIndex, playerName, field, value) {
    setRows(prev => prev.map((r, i) => {
      if (i !== rowIndex) return r
      return {
        ...r,
        playerStats: {
          ...r.playerStats,
          [playerName]: { ...r.playerStats[playerName], [field]: value },
        },
      }
    }))
  }

  function addRow() {
    setRows(prev => [...prev, emptyRow()])
  }

  function removeRow(index) {
    setRows(prev => prev.filter((_, i) => i !== index))
  }

  function submitAll(e) {
    e.preventDefault()
    const newMatches = rows.filter(r => r.team1Id && r.team2Id).map((r, i) => {
      const playerStats = {}
      Object.entries(r.playerStats).forEach(([name, s]) => {
        playerStats[name] = {
          winners: parseInt(s.winners) || 0,
          errors: parseInt(s.errors) || 0,
          distance: parseFloat(s.distance) || 0,
        }
      })
      return {
        id: `match-${Date.now()}-${i}`,
        round: r.round,
        team1Id: r.team1Id,
        team2Id: r.team2Id,
        team1Score: parseInt(r.team1Score) || 0,
        team2Score: parseInt(r.team2Score) || 0,
        winner: (parseInt(r.team1Score) || 0) >= (parseInt(r.team2Score) || 0) ? r.team1Id : r.team2Id,
        playerStats,
        timestamp: new Date().toISOString(),
      }
    })

    if (newMatches.length > 0) {
      addMatches(newMatches)
      setRows([emptyRow()])
    }
  }

  function getPlayersForRow(row) {
    const players = []
    const t1 = TEAMS.find(t => t.id === row.team1Id)
    const t2 = TEAMS.find(t => t.id === row.team2Id)
    if (t1) players.push(...t1.players)
    if (t2) players.push(...t2.players)
    return players
  }

  return (
    <form onSubmit={submitAll} style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {rows.map((row, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14, padding: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontFamily: '"DM Mono", monospace', color: 'rgba(255,255,255,0.35)' }}>
                Match {i + 1}
              </span>
              {rows.length > 1 && (
                <button type="button" onClick={() => removeRow(i)} style={{
                  background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 12,
                  fontFamily: '"DM Mono", monospace',
                }}>Remove</button>
              )}
            </div>

            <select value={row.round} onChange={e => updateRow(i, 'round', e.target.value)} style={selectStyle}>
              <option value="Round 1">Round 1</option>
              <option value="Round 2">Round 2</option>
              <option value="Round 3">Round 3</option>
              <option value="Quarter Final">Quarter Final</option>
              <option value="Semi Final">Semi Final</option>
              <option value="Final">Final</option>
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              <div>
                <label style={labelStyle}>Team 1</label>
                <select value={row.team1Id} onChange={e => updateRow(i, 'team1Id', e.target.value)} style={selectStyle} required>
                  <option value="">Select team...</option>
                  {TEAMS.map(t => (
                    <option key={t.id} value={t.id}>{displayName(t.players[0])} & {displayName(t.players[1])}</option>
                  ))}
                </select>
                <input type="number" placeholder="Games won" value={row.team1Score} onChange={e => updateRow(i, 'team1Score', e.target.value)} style={inputStyle} min="0" />
              </div>
              <div>
                <label style={labelStyle}>Team 2</label>
                <select value={row.team2Id} onChange={e => updateRow(i, 'team2Id', e.target.value)} style={selectStyle} required>
                  <option value="">Select team...</option>
                  {TEAMS.map(t => (
                    <option key={t.id} value={t.id}>{displayName(t.players[0])} & {displayName(t.players[1])}</option>
                  ))}
                </select>
                <input type="number" placeholder="Games won" value={row.team2Score} onChange={e => updateRow(i, 'team2Score', e.target.value)} style={inputStyle} min="0" />
              </div>
            </div>

            {getPlayersForRow(row).length > 0 && (
              <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                <label style={{ ...labelStyle, marginBottom: 8, display: 'block' }}>Player Stats</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {getPlayersForRow(row).map(name => (
                    <div key={name} style={{
                      background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '8px 10px',
                    }}>
                      <span style={{
                        fontSize: 12, fontWeight: 600, color: '#fff',
                        fontFamily: '"Barlow Condensed", sans-serif',
                        textTransform: 'uppercase', letterSpacing: 1,
                        display: 'block', marginBottom: 6,
                      }}>
                        {displayName(name)}
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                        <input
                          type="number" placeholder="Winners"
                          value={row.playerStats[name]?.winners || ''}
                          onChange={e => updatePlayerStat(i, name, 'winners', e.target.value)}
                          style={{ ...inputStyle, marginTop: 0, fontSize: 12, padding: '6px 8px' }}
                          min="0"
                        />
                        <input
                          type="number" placeholder="Errors"
                          value={row.playerStats[name]?.errors || ''}
                          onChange={e => updatePlayerStat(i, name, 'errors', e.target.value)}
                          style={{ ...inputStyle, marginTop: 0, fontSize: 12, padding: '6px 8px' }}
                          min="0"
                        />
                        <input
                          type="number" placeholder="Dist (km)"
                          value={row.playerStats[name]?.distance || ''}
                          onChange={e => updatePlayerStat(i, name, 'distance', e.target.value)}
                          style={{ ...inputStyle, marginTop: 0, fontSize: 12, padding: '6px 8px' }}
                          step="0.01" min="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button type="button" onClick={addRow} style={btnSecondary}>
          + Add Match
        </button>
        <button type="submit" style={btnPrimary}>
          Submit All
        </button>
      </div>
    </form>
  )
}

function MatchHistory() {
  const { matches } = useStore()
  const recent = [...matches].reverse().slice(0, 10)

  return (
    <div>
      <h3 style={{
        fontFamily: '"Barlow Condensed", sans-serif', fontSize: 18, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px',
      }}>
        Recent Matches ({matches.length} total)
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recent.map(m => (
          <div key={m.id} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10, padding: '10px 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <TeamBadge teamId={m.team1Id} size={24} showNames={false} />
              <span style={{ fontSize: 16, fontWeight: 700, fontFamily: '"Barlow Condensed"', color: m.winner === m.team1Id ? '#E60150' : 'rgba(255,255,255,0.4)' }}>
                {m.team1Score}
              </span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>vs</span>
              <span style={{ fontSize: 16, fontWeight: 700, fontFamily: '"Barlow Condensed"', color: m.winner === m.team2Id ? '#E60150' : 'rgba(255,255,255,0.4)' }}>
                {m.team2Score}
              </span>
              <TeamBadge teamId={m.team2Id} size={24} showNames={false} />
            </div>
            <span style={{ fontSize: 9, fontFamily: '"DM Mono", monospace', color: 'rgba(255,255,255,0.25)' }}>
              {m.round}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', fontSize: 14, fontFamily: '"Barlow", sans-serif',
  outline: 'none', marginTop: 6, boxSizing: 'border-box',
}

const selectStyle = {
  ...inputStyle,
  appearance: 'auto',
}

const labelStyle = {
  fontSize: 10, fontFamily: '"DM Mono", monospace',
  color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
  letterSpacing: 1,
}

const btnPrimary = {
  flex: 1, padding: '12px', borderRadius: 10,
  background: 'linear-gradient(135deg, #E60150, #c7013f)',
  border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
  fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase',
  letterSpacing: 2, cursor: 'pointer',
}

const btnSecondary = {
  flex: 1, padding: '12px', borderRadius: 10,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600,
  fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase',
  letterSpacing: 2, cursor: 'pointer',
}
