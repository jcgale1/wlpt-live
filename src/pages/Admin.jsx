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
      <TournamentControl />
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

const ROUND_OPTIONS = ['Round 1', 'Round 2', 'Round 3', 'Quarter Final', 'Semi Final', 'Final']

function RoundPicker({ value, onChange }) {
  const isCustom = value && !ROUND_OPTIONS.includes(value)
  const [custom, setCustom] = useState(isCustom)
  const [customText, setCustomText] = useState(isCustom ? value : '')

  return custom ? (
    <div style={{ display: 'flex', gap: 6 }}>
      <input
        type="text"
        placeholder="Custom round name..."
        value={customText}
        onChange={e => { setCustomText(e.target.value); onChange(e.target.value) }}
        style={{ ...inputStyle, flex: 1 }}
      />
      <button type="button" onClick={() => { setCustom(false); onChange('Round 1') }} style={{
        ...inputStyle, width: 'auto', flex: 'none', padding: '10px 12px', cursor: 'pointer',
        color: 'rgba(255,255,255,0.4)', fontSize: 12,
      }}>
        Preset
      </button>
    </div>
  ) : (
    <div style={{ display: 'flex', gap: 6 }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ ...selectStyle, flex: 1 }}>
        {ROUND_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <button type="button" onClick={() => setCustom(true)} style={{
        ...inputStyle, width: 'auto', flex: 'none', padding: '10px 12px', cursor: 'pointer',
        color: 'rgba(255,255,255,0.4)', fontSize: 12,
      }}>
        Custom
      </button>
    </div>
  )
}

function buildPlayerStatsTemplate(team1Id, team2Id) {
  const ps = {}
  const t1 = TEAMS.find(t => t.id === team1Id)
  const t2 = TEAMS.find(t => t.id === team2Id)
  if (t1) t1.players.forEach(n => { ps[n] = { winners: '', errors: '', distance: '' } })
  if (t2) t2.players.forEach(n => { ps[n] = { winners: '', errors: '', distance: '' } })
  return ps
}

function getPlayersForTeams(team1Id, team2Id) {
  const players = []
  const t1 = TEAMS.find(t => t.id === team1Id)
  const t2 = TEAMS.find(t => t.id === team2Id)
  if (t1) players.push(...t1.players)
  if (t2) players.push(...t2.players)
  return players
}

function MatchForm({ initial, onSubmit, onCancel, submitLabel }) {
  const [row, setRow] = useState(initial)

  function update(field, value) {
    setRow(prev => {
      const updated = { ...prev, [field]: value }
      if (field === 'team1Id' || field === 'team2Id') {
        updated.playerStats = buildPlayerStatsTemplate(updated.team1Id, updated.team2Id)
      }
      return updated
    })
  }

  function updatePlayerStat(playerName, field, value) {
    setRow(prev => ({
      ...prev,
      playerStats: {
        ...prev.playerStats,
        [playerName]: { ...prev.playerStats[playerName], [field]: value },
      },
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!row.team1Id || !row.team2Id) return
    const playerStats = {}
    Object.entries(row.playerStats).forEach(([name, s]) => {
      playerStats[name] = {
        winners: parseInt(s.winners) || 0,
        errors: parseInt(s.errors) || 0,
        distance: parseFloat(s.distance) || 0,
      }
    })
    onSubmit({
      ...row,
      team1Score: parseInt(row.team1Score) || 0,
      team2Score: parseInt(row.team2Score) || 0,
      winner: (parseInt(row.team1Score) || 0) >= (parseInt(row.team2Score) || 0) ? row.team1Id : row.team2Id,
      playerStats,
    })
  }

  const players = getPlayersForTeams(row.team1Id, row.team2Id)

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14, padding: 14, marginBottom: 16,
    }}>
      <RoundPicker value={row.round} onChange={v => update('round', v)} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
        <div>
          <label style={labelStyle}>Team 1</label>
          <select value={row.team1Id} onChange={e => update('team1Id', e.target.value)} style={selectStyle} required>
            <option value="">Select team...</option>
            {TEAMS.map(t => (
              <option key={t.id} value={t.id}>{displayName(t.players[0])} & {displayName(t.players[1])}</option>
            ))}
          </select>
          <input type="number" placeholder="Games won" value={row.team1Score} onChange={e => update('team1Score', e.target.value)} style={inputStyle} min="0" />
        </div>
        <div>
          <label style={labelStyle}>Team 2</label>
          <select value={row.team2Id} onChange={e => update('team2Id', e.target.value)} style={selectStyle} required>
            <option value="">Select team...</option>
            {TEAMS.map(t => (
              <option key={t.id} value={t.id}>{displayName(t.players[0])} & {displayName(t.players[1])}</option>
            ))}
          </select>
          <input type="number" placeholder="Games won" value={row.team2Score} onChange={e => update('team2Score', e.target.value)} style={inputStyle} min="0" />
        </div>
      </div>

      {players.length > 0 && (
        <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
          <label style={{ ...labelStyle, marginBottom: 8, display: 'block' }}>Player Stats</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {players.map(name => (
              <div key={name} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '8px 10px' }}>
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
                    value={row.playerStats[name]?.winners ?? ''}
                    onChange={e => updatePlayerStat(name, 'winners', e.target.value)}
                    style={{ ...inputStyle, marginTop: 0, fontSize: 12, padding: '6px 8px' }}
                    min="0"
                  />
                  <input
                    type="number" placeholder="Errors"
                    value={row.playerStats[name]?.errors ?? ''}
                    onChange={e => updatePlayerStat(name, 'errors', e.target.value)}
                    style={{ ...inputStyle, marginTop: 0, fontSize: 12, padding: '6px 8px' }}
                    min="0"
                  />
                  <input
                    type="number" placeholder="Dist (km)"
                    value={row.playerStats[name]?.distance ?? ''}
                    onChange={e => updatePlayerStat(name, 'distance', e.target.value)}
                    style={{ ...inputStyle, marginTop: 0, fontSize: 12, padding: '6px 8px' }}
                    step="0.01" min="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        {onCancel && (
          <button type="button" onClick={onCancel} style={btnSecondary}>Cancel</button>
        )}
        <button type="submit" style={btnPrimary}>{submitLabel}</button>
      </div>
    </form>
  )
}

function TournamentControl() {
  const { tournamentStarted, tournamentClosed, closeTournament, reopenTournament, startTournament, resetTournament } = useStore()
  const [confirming, setConfirming] = useState(null) // 'start' | 'close' | 'reset' | null

  // Pre-tournament: show Start button
  if (!tournamentStarted) {
    if (confirming === 'start') {
      return (
        <div style={{
          background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: 14, padding: 16, marginBottom: 24, textAlign: 'center',
        }}>
          <p style={{
            fontFamily: '"Barlow Condensed", sans-serif', fontSize: 14, fontWeight: 600,
            color: '#4ade80', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1,
          }}>
            Start tournament?
          </p>
          <p style={{
            fontFamily: '"DM Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,0.4)',
            margin: '0 0 14px',
          }}>
            Clears all data and switches to the live leaderboard
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => setConfirming(null)} style={btnSecondary}>Cancel</button>
            <button onClick={() => { startTournament(); setConfirming(null) }} style={{
              flex: 1, padding: '12px', borderRadius: 10,
              background: 'linear-gradient(135deg, #4ade80, #22c55e)',
              border: 'none', color: '#040406', fontSize: 14, fontWeight: 700,
              fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase',
              letterSpacing: 2, cursor: 'pointer',
            }}>
              Start Tournament
            </button>
          </div>
        </div>
      )
    }

    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{
          background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)',
          borderRadius: 14, padding: 16, textAlign: 'center', marginBottom: 10,
        }}>
          <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>🎾</span>
          <p style={{
            fontFamily: '"Barlow Condensed", sans-serif', fontSize: 16, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: 2, color: '#60a5fa', margin: '0 0 4px',
          }}>
            Pre-Tournament
          </p>
          <p style={{
            fontFamily: '"DM Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,0.35)',
            margin: '0 0 14px',
          }}>
            Dashboard is showing the player preview
          </p>
          <button onClick={() => setConfirming('start')} style={{
            width: '100%', padding: '14px', borderRadius: 10,
            background: 'linear-gradient(135deg, #4ade80, #22c55e)',
            border: 'none', color: '#040406', fontSize: 15, fontWeight: 700,
            fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase',
            letterSpacing: 3, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            ▶ Start Tournament
          </button>
        </div>
      </div>
    )
  }

  // Tournament complete
  if (tournamentClosed) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(250,204,21,0.08), rgba(250,204,21,0.02))',
        border: '1px solid rgba(250,204,21,0.2)',
        borderRadius: 14, padding: 16, marginBottom: 24, textAlign: 'center',
      }}>
        <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>🏆</span>
        <p style={{
          fontFamily: '"Barlow Condensed", sans-serif', fontSize: 16, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: 2, color: '#FACC15', margin: '0 0 12px',
        }}>
          Tournament Complete
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={reopenTournament} style={{
            flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.6)', padding: '10px 20px', borderRadius: 10,
            fontSize: 13, fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: 2, cursor: 'pointer',
          }}>
            Reopen
          </button>
          {confirming === 'reset' ? (
            <div style={{ flex: 2, display: 'flex', gap: 6 }}>
              <button onClick={() => { resetTournament(); setConfirming(null) }} style={{
                flex: 1, background: 'rgba(230,1,80,0.2)', border: '1px solid #E60150',
                color: '#E60150', padding: '10px', borderRadius: 10,
                fontSize: 11, fontFamily: '"DM Mono", monospace', cursor: 'pointer',
              }}>
                Confirm Reset
              </button>
              <button onClick={() => setConfirming(null)} style={{
                background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.3)', padding: '10px',
                fontSize: 11, fontFamily: '"DM Mono", monospace', cursor: 'pointer',
              }}>
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirming('reset')} style={{
              flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.3)', padding: '10px 20px', borderRadius: 10,
              fontSize: 13, fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: 2, cursor: 'pointer',
            }}>
              Reset
            </button>
          )}
        </div>
      </div>
    )
  }

  // Tournament live: close button
  if (confirming === 'close') {
    return (
      <div style={{
        background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)',
        borderRadius: 14, padding: 16, marginBottom: 24, textAlign: 'center',
      }}>
        <p style={{
          fontFamily: '"Barlow Condensed", sans-serif', fontSize: 14, fontWeight: 600,
          color: '#FACC15', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1,
        }}>
          Close tournament?
        </p>
        <p style={{
          fontFamily: '"DM Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,0.4)',
          margin: '0 0 14px',
        }}>
          The dashboard will show the podium celebration view
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => setConfirming(null)} style={btnSecondary}>Cancel</button>
          <button onClick={() => { closeTournament(); setConfirming(null) }} style={{
            flex: 1, padding: '12px', borderRadius: 10,
            background: 'linear-gradient(135deg, #FACC15, #e6b800)',
            border: 'none', color: '#040406', fontSize: 14, fontWeight: 700,
            fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase',
            letterSpacing: 2, cursor: 'pointer',
          }}>
            Close Tournament
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
      <button onClick={() => setConfirming('close')} style={{
        flex: 1, padding: '14px', borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(250,204,21,0.12), rgba(250,204,21,0.04))',
        border: '1px solid rgba(250,204,21,0.2)',
        color: '#FACC15', fontSize: 15, fontWeight: 700,
        fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase',
        letterSpacing: 3, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        🏆 Close
      </button>
      {confirming === 'reset-live' ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => { resetTournament(); setConfirming(null) }} style={{
            background: 'rgba(230,1,80,0.2)', border: '1px solid #E60150',
            color: '#E60150', padding: '14px 16px', borderRadius: 12,
            fontSize: 11, fontFamily: '"DM Mono", monospace', cursor: 'pointer',
          }}>
            Confirm Reset
          </button>
          <button onClick={() => setConfirming(null)} style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.3)', padding: '14px 8px',
            fontSize: 11, fontFamily: '"DM Mono", monospace', cursor: 'pointer',
          }}>
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirming('reset-live')} style={{
          padding: '14px 16px', borderRadius: 12,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 600,
          fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase',
          letterSpacing: 2, cursor: 'pointer',
        }}>
          Reset
        </button>
      )}
    </div>
  )
}

function MatchEntryForm() {
  const { addMatches } = useStore()
  const [formKey, setFormKey] = useState(0)

  function handleSubmit(match) {
    addMatches([{
      ...match,
      id: `match-${Date.now()}-0`,
      timestamp: new Date().toISOString(),
    }])
    setFormKey(k => k + 1)
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{
        fontFamily: '"Barlow Condensed", sans-serif', fontSize: 16, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px',
      }}>
        New Match
      </h3>
      <MatchForm
        key={formKey}
        initial={{ team1Id: '', team2Id: '', team1Score: '', team2Score: '', round: 'Round 1', playerStats: {} }}
        onSubmit={handleSubmit}
        submitLabel="Submit Match"
      />
    </div>
  )
}

function MatchHistory() {
  const { matches, updateMatch, deleteMatch } = useStore()
  const [editingId, setEditingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const sorted = [...matches].reverse()

  function handleEdit(match) {
    const ps = {}
    if (match.playerStats) {
      Object.entries(match.playerStats).forEach(([name, s]) => {
        ps[name] = {
          winners: s.winners?.toString() || '',
          errors: s.errors?.toString() || '',
          distance: s.distance?.toString() || '',
        }
      })
    }
    return {
      ...match,
      team1Score: match.team1Score?.toString() || '',
      team2Score: match.team2Score?.toString() || '',
      playerStats: ps,
    }
  }

  function handleSave(match) {
    updateMatch({ ...match, timestamp: matches.find(m => m.id === match.id)?.timestamp || new Date().toISOString() })
    setEditingId(null)
  }

  function handleDelete(id) {
    deleteMatch(id)
    setConfirmDeleteId(null)
  }

  return (
    <div>
      <h3 style={{
        fontFamily: '"Barlow Condensed", sans-serif', fontSize: 18, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px',
      }}>
        All Matches ({matches.length} total)
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map(m => {
          if (editingId === m.id) {
            return (
              <div key={m.id}>
                <MatchForm
                  initial={handleEdit(m)}
                  onSubmit={saved => handleSave({ ...saved, id: m.id })}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Save Changes"
                />
              </div>
            )
          }

          return (
            <div key={m.id} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10, padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <TeamBadge teamId={m.team1Id} size={24} showNames={false} />
                  <span style={{ fontSize: 16, fontWeight: 700, fontFamily: '"Barlow Condensed"', color: m.winner === m.team1Id ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>
                    {m.team1Score}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>vs</span>
                  <span style={{ fontSize: 16, fontWeight: 700, fontFamily: '"Barlow Condensed"', color: m.winner === m.team2Id ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>
                    {m.team2Score}
                  </span>
                  <TeamBadge teamId={m.team2Id} size={24} showNames={false} />
                </div>
                <span style={{ fontSize: 9, fontFamily: '"DM Mono", monospace', color: 'rgba(255,255,255,0.25)' }}>
                  {m.round}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="button" onClick={() => setEditingId(m.id)} style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)', padding: '4px 10px', borderRadius: 6,
                  fontSize: 10, fontFamily: '"DM Mono", monospace', cursor: 'pointer',
                }}>
                  Edit
                </button>
                {confirmDeleteId === m.id ? (
                  <>
                    <button type="button" onClick={() => handleDelete(m.id)} style={{
                      background: 'rgba(230,1,80,0.2)', border: '1px solid #E60150',
                      color: '#E60150', padding: '4px 10px', borderRadius: 6,
                      fontSize: 10, fontFamily: '"DM Mono", monospace', cursor: 'pointer',
                    }}>
                      Confirm Delete
                    </button>
                    <button type="button" onClick={() => setConfirmDeleteId(null)} style={{
                      background: 'none', border: 'none',
                      color: 'rgba(255,255,255,0.3)', padding: '4px 10px',
                      fontSize: 10, fontFamily: '"DM Mono", monospace', cursor: 'pointer',
                    }}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setConfirmDeleteId(m.id)} style={{
                    background: 'none', border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.25)', padding: '4px 10px', borderRadius: 6,
                    fontSize: 10, fontFamily: '"DM Mono", monospace', cursor: 'pointer',
                  }}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          )
        })}
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
