import { motion } from 'framer-motion'
import { useStore } from '../lib/store.jsx'
import { TEAMS } from '../lib/players.js'
import TeamBadge from './TeamBadge.jsx'

export default function MatchFeedSlide() {
  const { matches } = useStore()
  const recent = [...matches].reverse().slice(0, 5)

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
        color: '#E60150',
        textAlign: 'center',
        margin: '0 0 16px',
      }}>
        Recent Matches
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflow: 'hidden' }}>
        {recent.map((match, i) => {
          const t1 = TEAMS.find(t => t.id === match.team1Id)
          const t2 = TEAMS.find(t => t.id === match.team2Id)
          if (!t1 || !t2) return null
          const t1Won = match.winner === match.team1Id

          return (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14,
                padding: '12px 14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontFamily: '"DM Mono", monospace', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {match.round}
                </span>
                <span style={{ fontSize: 10, fontFamily: '"DM Mono", monospace', color: 'rgba(255,255,255,0.25)' }}>
                  {new Date(match.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, opacity: t1Won ? 1 : 0.5 }}>
                  <TeamBadge teamId={match.team1Id} size={28} />
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '4px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)',
                }}>
                  <span style={{
                    fontSize: 22, fontWeight: 800, fontFamily: '"Barlow Condensed", sans-serif',
                    color: t1Won ? '#22D3EE' : 'rgba(255,255,255,0.4)',
                  }}>{match.team1Score}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontWeight: 300 }}>-</span>
                  <span style={{
                    fontSize: 22, fontWeight: 800, fontFamily: '"Barlow Condensed", sans-serif',
                    color: !t1Won ? '#22D3EE' : 'rgba(255,255,255,0.4)',
                  }}>{match.team2Score}</span>
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', opacity: !t1Won ? 1 : 0.5 }}>
                  <TeamBadge teamId={match.team2Id} size={28} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
