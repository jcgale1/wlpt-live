import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TEAMS } from '../lib/players.js'
import { displayName } from '../lib/names.js'
import PlayerAvatar from './PlayerAvatar.jsx'
import { useIsLandscape } from '../lib/useMediaQuery.js'

const ROTATE_INTERVAL = 4000

// Per-team image tuning — some AI images need different crop points
const IMAGE_POSITIONS = {
  'cech-cudicini': 'center 40%',
}

export default function TeamShowcaseSlide() {
  const [index, setIndex] = useState(0)
  const landscape = useIsLandscape()

  useEffect(() => {
    const t = setInterval(() => setIndex(prev => (prev + 1) % TEAMS.length), ROTATE_INTERVAL)
    return () => clearInterval(t)
  }, [])

  const team = TEAMS[index]
  const imgPos = IMAGE_POSITIONS[team.id] || 'center 30%'

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
        fontSize: landscape ? 32 : 24,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 3,
        color: '#FACC15',
        textAlign: 'center',
        margin: '0 0 6px',
      }}>
        Today's Line-Up
      </h2>

      <span style={{
        fontFamily: '"DM Mono", monospace',
        fontSize: 10,
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: landscape ? 20 : 16,
      }}>
        {index + 1} / {TEAMS.length} pairs
      </span>

      <AnimatePresence mode="wait">
        <motion.div
          key={team.id}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '100%',
            maxWidth: landscape ? 700 : 360,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            overflow: 'hidden',
            display: landscape ? 'flex' : 'block',
            flexDirection: landscape ? 'row' : undefined,
          }}
        >
          {/* Hero image */}
          <div style={{
            position: 'relative',
            height: landscape ? 'auto' : 180,
            width: landscape ? '55%' : '100%',
            minHeight: landscape ? 220 : undefined,
            flexShrink: 0,
          }}>
            <img
              src={team.image}
              alt={team.players.join(' & ')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: imgPos,
                display: 'block',
              }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: landscape
                ? 'linear-gradient(90deg, transparent 50%, rgba(4,4,6,0.9) 100%)'
                : 'linear-gradient(180deg, transparent 40%, rgba(4,4,6,0.9) 100%)',
            }} />
            {!landscape && (
              <div style={{
                position: 'absolute', bottom: 12, left: 14, right: 14,
              }}>
                <span style={{
                  fontFamily: '"Barlow Condensed", sans-serif',
                  fontSize: 20, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: 1.5,
                  color: '#fff',
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                }}>
                  {displayName(team.players[0])} & {displayName(team.players[1])}
                </span>
              </div>
            )}
          </div>

          {/* Player cards */}
          <div style={{
            display: 'flex',
            flexDirection: landscape ? 'column' : 'row',
            padding: landscape ? '20px 24px' : '14px 12px',
            gap: landscape ? 14 : 10,
            flex: landscape ? 1 : undefined,
            justifyContent: 'center',
          }}>
            {landscape && (
              <span style={{
                fontFamily: '"Barlow Condensed", sans-serif',
                fontSize: 22, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: 2,
                color: '#fff',
                marginBottom: 4,
              }}>
                {displayName(team.players[0])} & {displayName(team.players[1])}
              </span>
            )}
            {team.players.map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: i === 0 ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                style={{
                  flex: landscape ? undefined : 1,
                  display: 'flex',
                  flexDirection: landscape ? 'row' : 'column',
                  alignItems: 'center',
                  gap: landscape ? 14 : 6,
                  padding: landscape ? '10px 14px' : '10px 0',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 10,
                }}
              >
                <PlayerAvatar name={name} size={landscape ? 56 : 48} />
                <span style={{
                  fontFamily: '"Barlow Condensed", sans-serif',
                  fontSize: landscape ? 16 : 13, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                  color: '#fff', textAlign: landscape ? 'left' : 'center',
                }}>
                  {displayName(name)}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Team dots */}
      <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
        {TEAMS.map((t, i) => (
          <div key={t.id} style={{
            width: i === index ? 18 : 6,
            height: 6,
            borderRadius: 3,
            background: i === index ? '#E60150' : 'rgba(255,255,255,0.15)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
    </motion.div>
  )
}
