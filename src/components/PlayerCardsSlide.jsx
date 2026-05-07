import { motion } from 'framer-motion'
import { useStore } from '../lib/store.jsx'
import { TEAMS } from '../lib/players.js'
import { displayName } from '../lib/names.js'
import PlayerAvatar from './PlayerAvatar.jsx'

export default function PlayerCardsSlide() {
  const { leaderboard } = useStore()
  const top3 = leaderboard.slice(0, 3)

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
        margin: '0 0 16px',
      }}>
        Top Teams
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 380 }}>
        {top3.map((entry, i) => {
          const team = TEAMS.find(t => t.id === entry.teamId)
          if (!team) return null

          return (
            <motion.div
              key={entry.teamId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: i === 0 ? '#FACC15' : i === 1 ? '#C0C0C0' : '#CD7F32',
                  display: 'grid', placeItems: 'center',
                  fontSize: 16, fontWeight: 800, color: '#040406',
                  fontFamily: '"Barlow Condensed", sans-serif',
                }}>
                  {i + 1}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <PlayerAvatar name={team.players[0]} size={48} />
                  <PlayerAvatar name={team.players[1]} size={48} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {displayName(team.players[0])} & {displayName(team.players[1])}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: '"DM Mono", monospace' }}>
                    {entry.matchesPlayed} matches played
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <MiniStat label="Matches Won" value={entry.matchesWon} color="#22D3EE" />
                <MiniStat label="Winners" value={entry.winners} color="#4ade80" />
                <MiniStat label="Errors" value={entry.errors} color="#f87171" />
                <MiniStat label="Distance" value={`${entry.distance.toFixed(1)}km`} color="#a78bfa" />
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <span style={{ fontSize: 8, fontFamily: '"DM Mono", monospace', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 700, fontFamily: '"Barlow Condensed", sans-serif', color }}>{value}</span>
    </div>
  )
}
