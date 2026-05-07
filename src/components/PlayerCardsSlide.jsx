import { motion } from 'framer-motion'
import { useStore } from '../lib/store.jsx'
import { TEAMS } from '../lib/players.js'
import { displayName } from '../lib/names.js'

export default function PlayerCardsSlide() {
  const { leaderboard, playerLeaderboard } = useStore()
  const top3 = leaderboard.slice(0, 3)

  function getPlayerStats(name) {
    return playerLeaderboard.find(p => p.name === name) || { winners: 0, errors: 0, distance: 0 }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' }}
    >
      <h2 style={{
        fontFamily: '"Barlow Condensed", sans-serif',
        fontSize: 28,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 3,
        color: '#FACC15',
        textAlign: 'center',
        margin: '0 0 14px',
      }}>
        Top Teams
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 380 }}>
        {top3.map((entry, i) => {
          const team = TEAMS.find(t => t.id === entry.teamId)
          if (!team) return null

          return (
            <motion.div
              key={entry.teamId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              {/* Pair hero image */}
              <div style={{ position: 'relative', height: 120 }}>
                <img
                  src={team.image}
                  alt={`${displayName(team.players[0])} & ${displayName(team.players[1])}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center 35%',
                    display: 'block',
                  }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg, transparent 30%, rgba(4,4,6,0.85) 100%)',
                }} />
                <div style={{
                  position: 'absolute', top: 8, left: 10,
                  width: 28, height: 28, borderRadius: '50%',
                  background: i === 0 ? '#FACC15' : i === 1 ? '#C0C0C0' : '#CD7F32',
                  display: 'grid', placeItems: 'center',
                  fontSize: 14, fontWeight: 800, color: '#040406',
                  fontFamily: '"Barlow Condensed", sans-serif',
                }}>
                  {i + 1}
                </div>
                <div style={{
                  position: 'absolute', bottom: 8, left: 12, right: 12,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                }}>
                  <span style={{
                    fontSize: 16, fontWeight: 700, color: '#fff',
                    fontFamily: '"Barlow Condensed", sans-serif',
                    textTransform: 'uppercase', letterSpacing: 1,
                    textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                  }}>
                    {displayName(team.players[0])} & {displayName(team.players[1])}
                  </span>
                  <span style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.6)',
                    fontFamily: '"DM Mono", monospace',
                    textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                  }}>
                    {entry.matchesWon}W / {entry.gamesWon}G
                  </span>
                </div>
              </div>

              {/* Per-player stats */}
              <div style={{ display: 'flex', padding: '10px 12px', gap: 8 }}>
                {team.players.map(name => {
                  const ps = getPlayerStats(name)
                  return (
                    <div key={name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
                        fontFamily: '"Barlow Condensed", sans-serif',
                        textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        {displayName(name)}
                      </span>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontSize: 12, fontFamily: '"DM Mono", monospace', color: '#E60150' }}>{ps.winners} <span style={{ fontSize: 9, opacity: 0.6 }}>WNR</span></span>
                        <span style={{ fontSize: 12, fontFamily: '"DM Mono", monospace', color: '#f87171' }}>{ps.errors} <span style={{ fontSize: 9, opacity: 0.6 }}>ERR</span></span>
                        <span style={{ fontSize: 12, fontFamily: '"DM Mono", monospace', color: '#60a5fa' }}>{ps.distance.toFixed(1)} <span style={{ fontSize: 9, opacity: 0.6 }}>KM</span></span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
