import { motion } from 'framer-motion'
import { useStore } from '../lib/store.jsx'
import { useIsLandscape } from '../lib/useMediaQuery.js'
import TeamBadge from './TeamBadge.jsx'

export default function LeaderboardSlide() {
  const { leaderboard } = useStore()
  const landscape = useIsLandscape()

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '0 20px', maxWidth: landscape ? 700 : undefined, margin: landscape ? '0 auto' : undefined }}
    >
      <h2 style={{
        fontFamily: '"Barlow Condensed", sans-serif',
        fontSize: 28,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 3,
        color: '#E60150',
        textAlign: 'center',
        margin: '0 0 20px',
      }}>
        Team Leaderboard
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflow: 'hidden' }}>
        {leaderboard.map((entry, i) => (
          <motion.div
            key={entry.teamId}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 12,
              background: i === 0
                ? 'linear-gradient(135deg, rgba(250,204,21,0.15), rgba(250,204,21,0.05))'
                : i === 1
                ? 'linear-gradient(135deg, rgba(192,192,192,0.12), rgba(192,192,192,0.04))'
                : i === 2
                ? 'linear-gradient(135deg, rgba(205,127,50,0.12), rgba(205,127,50,0.04))'
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${i === 0 ? 'rgba(250,204,21,0.25)' : i === 1 ? 'rgba(192,192,192,0.2)' : i === 2 ? 'rgba(205,127,50,0.2)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <span style={{
              fontFamily: '"Barlow Condensed", sans-serif',
              fontSize: 22,
              fontWeight: 800,
              color: i === 0 ? '#FACC15' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'rgba(255,255,255,0.3)',
              width: 28,
              textAlign: 'center',
            }}>
              {i + 1}
            </span>

            <TeamBadge teamId={entry.teamId} size={36} showNames={true} />

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
              <StatPill label="W" value={entry.matchesWon} color="#4ade80" />
              <StatPill label="G" value={entry.gamesWon} color="#FACC15" />
              <StatPill label="MP" value={entry.matchesPlayed} color="rgba(255,255,255,0.5)" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <span style={{ fontSize: 9, fontFamily: '"DM Mono", monospace', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </span>
      <span style={{ fontSize: 18, fontWeight: 700, fontFamily: '"Barlow Condensed", sans-serif', color }}>
        {value}
      </span>
    </div>
  )
}
