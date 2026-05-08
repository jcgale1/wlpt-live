import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store.jsx'
import { TEAMS } from '../lib/players.js'
import { displayName } from '../lib/names.js'
import PlayerAvatar from './PlayerAvatar.jsx'

const SPOTLIGHT_DURATION = 10 * 60 * 1000 // 10 min per match

/**
 * Returns the match currently in the spotlight.
 * Matches queue by upload order — each gets a dedicated 10-min window.
 * e.g. 3 matches uploaded at 14:00 → match1 14:00-14:10, match2 14:10-14:20, match3 14:20-14:30
 */
function getSpotlightMatch(matches) {
  // Sort by timestamp ascending (upload order)
  const sorted = [...matches].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  const now = Date.now()

  // Find matches that haven't had their full spotlight yet
  // Walk through in order, each one's window starts when the previous one's ends
  let windowStart = null
  for (const m of sorted) {
    const uploaded = new Date(m.timestamp).getTime()
    // This match's window starts at whichever is later: its upload time, or the end of the previous match's window
    const start = windowStart ? Math.max(uploaded, windowStart) : uploaded
    const end = start + SPOTLIGHT_DURATION

    if (now >= start && now < end) {
      return { match: m, queuePosition: sorted.indexOf(m) + 1, queueTotal: countQueued(sorted, now) }
    }

    windowStart = end
  }

  return null
}

function countQueued(sorted, now) {
  let windowStart = null
  let count = 0
  for (const m of sorted) {
    const uploaded = new Date(m.timestamp).getTime()
    const start = windowStart ? Math.max(uploaded, windowStart) : uploaded
    const end = start + SPOTLIGHT_DURATION
    if (end > now) count++
    windowStart = end
  }
  return count
}

export function hasSpotlightMatch(matches) {
  return getSpotlightMatch(matches) !== null
}

export default function RecentMatchSlide() {
  const { matches } = useStore()
  const [now, setNow] = useState(Date.now())

  // Tick every 10s so spotlight transitions happen on time
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10000)
    return () => clearInterval(t)
  }, [])

  const spotlight = getSpotlightMatch(matches)
  if (!spotlight) return null

  const { match, queuePosition, queueTotal } = spotlight
  const team1 = TEAMS.find(t => t.id === match.team1Id)
  const team2 = TEAMS.find(t => t.id === match.team2Id)
  if (!team1 || !team2) return null

  const t1Won = match.winner === match.team1Id
  const queueLabel = queueTotal > 1 ? `${queuePosition} / ${queueTotal}` : null

  function statRow(name) {
    const s = match.playerStats?.[name] || { winners: 0, errors: 0, distance: 0 }
    return s
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <span style={{
          display: 'inline-block',
          fontFamily: '"DM Mono", monospace',
          fontSize: 9,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 2,
          color: '#E60150',
          background: 'rgba(230,1,80,0.1)',
          border: '1px solid rgba(230,1,80,0.2)',
          borderRadius: 20,
          padding: '3px 12px',
          marginBottom: 6,
        }}>
          Latest Result{queueLabel ? ` · ${queueLabel}` : ''}
        </span>
        <p style={{
          fontFamily: '"Barlow Condensed", sans-serif',
          fontSize: 13,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 2,
          color: 'rgba(255,255,255,0.35)',
          margin: 0,
        }}>
          {match.round}
        </p>
      </div>

      {/* Scoreboard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: 380,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        {/* Team images side by side */}
        <div style={{ display: 'flex', height: 100, position: 'relative' }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <img src={team1.image} alt="" style={{
              width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%',
              opacity: t1Won ? 1 : 0.5,
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, transparent 20%, rgba(4,4,6,0.85) 100%)',
            }} />
          </div>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            fontSize: 10, fontFamily: '"DM Mono", monospace', color: 'rgba(255,255,255,0.25)',
            background: 'rgba(4,4,6,0.8)', borderRadius: 20, padding: '2px 8px',
            zIndex: 2, letterSpacing: 1,
          }}>
            VS
          </div>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <img src={team2.image} alt="" style={{
              width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%',
              opacity: t1Won ? 0.5 : 1,
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, transparent 20%, rgba(4,4,6,0.85) 100%)',
            }} />
          </div>
        </div>

        {/* Score row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '12px 16px', gap: 16,
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{
              fontFamily: '"Barlow Condensed", sans-serif', fontSize: 12, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 1,
              color: t1Won ? '#fff' : 'rgba(255,255,255,0.4)',
              display: 'block', marginBottom: 4,
            }}>
              {displayName(team1.players[0])} & {displayName(team1.players[1])}
            </span>
            {t1Won && <span style={{ fontSize: 8, color: '#4ade80', fontFamily: '"DM Mono"', letterSpacing: 1 }}>WINNER</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              style={{
                fontFamily: '"Barlow Condensed", sans-serif',
                fontSize: 36, fontWeight: 800,
                color: t1Won ? '#4ade80' : 'rgba(255,255,255,0.3)',
              }}
            >
              {match.team1Score}
            </motion.span>
            <span style={{
              fontSize: 14, color: 'rgba(255,255,255,0.15)',
              fontFamily: '"Barlow Condensed"', fontWeight: 300,
            }}>
              -
            </span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
              style={{
                fontFamily: '"Barlow Condensed", sans-serif',
                fontSize: 36, fontWeight: 800,
                color: !t1Won ? '#4ade80' : 'rgba(255,255,255,0.3)',
              }}
            >
              {match.team2Score}
            </motion.span>
          </div>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{
              fontFamily: '"Barlow Condensed", sans-serif', fontSize: 12, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 1,
              color: !t1Won ? '#fff' : 'rgba(255,255,255,0.4)',
              display: 'block', marginBottom: 4,
            }}>
              {displayName(team2.players[0])} & {displayName(team2.players[1])}
            </span>
            {!t1Won && <span style={{ fontSize: 8, color: '#4ade80', fontFamily: '"DM Mono"', letterSpacing: 1 }}>WINNER</span>}
          </div>
        </div>
      </motion.div>

      {/* Player stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{
          width: '100%', maxWidth: 380,
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 6,
        }}
      >
        {[...team1.players, ...team2.players].map((name, i) => {
          const s = statRow(name)
          const isWinnerTeam = (i < 2 && t1Won) || (i >= 2 && !t1Won)
          return (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: i < 2 ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
              style={{
                background: isWinnerTeam ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isWinnerTeam ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 10, padding: '8px 10px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <PlayerAvatar name={name} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  fontFamily: '"Barlow Condensed"', fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: 0.5, color: '#fff',
                  display: 'block', marginBottom: 3,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {displayName(name)}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 11, fontFamily: '"DM Mono"', color: '#4ade80' }}>
                    {s.winners} <span style={{ fontSize: 7, opacity: 0.6 }}>WNR</span>
                  </span>
                  <span style={{ fontSize: 11, fontFamily: '"DM Mono"', color: '#E60150' }}>
                    {s.errors} <span style={{ fontSize: 7, opacity: 0.6 }}>ERR</span>
                  </span>
                  <span style={{ fontSize: 11, fontFamily: '"DM Mono"', color: '#60a5fa' }}>
                    {(s.distance || 0).toFixed(1)} <span style={{ fontSize: 7, opacity: 0.6 }}>KM</span>
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
