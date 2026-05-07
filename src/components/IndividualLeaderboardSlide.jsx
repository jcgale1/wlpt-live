import { motion } from 'framer-motion'
import { useStore } from '../lib/store.jsx'
import { displayName } from '../lib/names.js'
import PlayerAvatar from './PlayerAvatar.jsx'

export default function IndividualLeaderboardSlide() {
  const { playerLeaderboard } = useStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '0 16px' }}
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
        Player Rankings
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, overflow: 'hidden' }}>
        {playerLeaderboard.map((p, i) => (
          <motion.div
            key={p.name}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 10px',
              borderRadius: 10,
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
              fontSize: 16,
              fontWeight: 800,
              color: i === 0 ? '#FACC15' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'rgba(255,255,255,0.3)',
              width: 22,
              textAlign: 'center',
            }}>
              {i + 1}
            </span>

            <PlayerAvatar name={p.name} size={30} />

            <span style={{
              flex: 1,
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              fontFamily: '"Barlow Condensed", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              {displayName(p.name)}
            </span>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <MiniStat label="WNR" value={p.winners} color="#E60150" />
              <MiniStat label="ERR" value={p.errors} color="#f87171" />
              <MiniStat label="KM" value={p.distance.toFixed(1)} color="#60a5fa" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      <span style={{ fontSize: 7, fontFamily: '"DM Mono", monospace', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 700, fontFamily: '"Barlow Condensed", sans-serif', color }}>{value}</span>
    </div>
  )
}
