import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useStore } from '../lib/store.jsx'
import { TEAMS } from '../lib/players.js'
import { displayName } from '../lib/names.js'
import { useIsLandscape } from '../lib/useMediaQuery.js'

const BRAND_COLORS = ['#FACC15', '#E60150', '#4ade80', '#ffffff', '#60a5fa']
const MEDAL_COLORS = ['#FACC15', '#C0C0C0', '#CD7F32']
const MEDAL_LABELS = ['1ST', '2ND', '3RD']

function fireBurst() {
  const defaults = {
    spread: 70,
    ticks: 120,
    gravity: 0.9,
    decay: 0.92,
    startVelocity: 30,
    colors: BRAND_COLORS,
    scalar: 1.1,
    shapes: ['circle', 'square'],
  }

  confetti({ ...defaults, particleCount: 60, origin: { x: 0.2, y: 0.7 }, angle: 60 })
  confetti({ ...defaults, particleCount: 60, origin: { x: 0.8, y: 0.7 }, angle: 120 })
  confetti({ ...defaults, particleCount: 40, origin: { x: 0.5, y: 0.6 }, angle: 90, spread: 100 })
}

function fireStars() {
  confetti({
    particleCount: 15,
    spread: 360,
    ticks: 80,
    gravity: 0.3,
    decay: 0.96,
    startVelocity: 8,
    shapes: ['star'],
    colors: ['#FACC15', '#fff'],
    scalar: 1.4,
    origin: { x: Math.random() * 0.4 + 0.3, y: Math.random() * 0.3 + 0.3 },
  })
}

export default function PodiumSlide() {
  const { leaderboard, playerLeaderboard } = useStore()
  const landscape = useIsLandscape()
  const top3 = leaderboard.slice(0, 3)
  const intervalRef = useRef(null)
  const [showContent, setShowContent] = useState(false)

  function getPlayerStats(name) {
    return playerLeaderboard.find(p => p.name === name) || { winners: 0, errors: 0, distance: 0 }
  }

  useEffect(() => {
    // Initial big burst
    setTimeout(() => fireBurst(), 300)
    setTimeout(() => fireBurst(), 800)
    setTimeout(() => fireBurst(), 1400)
    setTimeout(() => setShowContent(true), 600)

    // Ongoing bursts
    intervalRef.current = setInterval(() => {
      if (Math.random() > 0.5) fireBurst()
      else fireStars()
    }, 2500)

    return () => {
      clearInterval(intervalRef.current)
      confetti.reset()
    }
  }, [])

  // Display order: 2nd, 1st, 3rd (podium visual)
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3
  const podiumHeights = [140, 180, 110]
  const podiumRanks = [1, 0, 2]

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Trophy icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={showContent ? { scale: 1, rotate: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        style={{ fontSize: 48, marginBottom: 4 }}
      >
        🏆
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={showContent ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          fontFamily: '"Barlow Condensed", sans-serif',
          fontSize: 26,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: 4,
          color: '#FACC15',
          textAlign: 'center',
          margin: '0 0 4px',
          textShadow: '0 0 20px rgba(250,204,21,0.4)',
        }}
      >
        Tournament Complete
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={showContent ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: 10,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          letterSpacing: 2,
          margin: '0 0 16px',
        }}
      >
        London Masters 2026
      </motion.p>

      {/* Podium blocks: 2nd | 1st | 3rd */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: landscape ? 16 : 6,
        width: '100%',
        maxWidth: landscape ? 700 : 400,
        padding: '0 12px',
      }}>
        {podiumOrder.map((entry, i) => {
          if (!entry) return null
          const team = TEAMS.find(t => t.id === entry.teamId)
          if (!team) return null
          const rank = podiumRanks[i]
          const height = podiumHeights[i]

          return (
            <motion.div
              key={entry.teamId}
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={showContent ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.4 + rank * 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Team image */}
              <div style={{
                width: rank === 0 ? (landscape ? 130 : 100) : (landscape ? 105 : 80),
                height: rank === 0 ? (landscape ? 130 : 100) : (landscape ? 105 : 80),
                borderRadius: '50%',
                overflow: 'hidden',
                border: `3px solid ${MEDAL_COLORS[rank]}`,
                boxShadow: rank === 0
                  ? '0 0 20px rgba(250,204,21,0.5), 0 0 40px rgba(250,204,21,0.2)'
                  : `0 0 12px ${MEDAL_COLORS[rank]}44`,
                marginBottom: 8,
              }}>
                <img
                  src={team.image}
                  alt={team.players.join(' & ')}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center 30%',
                  }}
                />
              </div>

              {/* Names */}
              <span style={{
                fontFamily: '"Barlow Condensed", sans-serif',
                fontSize: rank === 0 ? 13 : 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: '#fff',
                textAlign: 'center',
                lineHeight: 1.3,
                marginBottom: 4,
              }}>
                {displayName(team.players[0])}<br />& {displayName(team.players[1])}
              </span>

              {/* Stats */}
              <span style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: 10,
                color: 'rgba(255,255,255,0.5)',
                marginBottom: 6,
              }}>
                {entry.matchesWon}W / {entry.gamesWon}G
              </span>

              {/* Podium block */}
              <motion.div
                initial={{ height: 0 }}
                animate={showContent ? { height } : {}}
                transition={{ duration: 0.8, delay: 0.6 + rank * 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width: '100%',
                  borderRadius: '12px 12px 0 0',
                  background: `linear-gradient(180deg, ${MEDAL_COLORS[rank]}22, ${MEDAL_COLORS[rank]}08)`,
                  border: `1px solid ${MEDAL_COLORS[rank]}33`,
                  borderBottom: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingTop: 12,
                  overflow: 'hidden',
                }}
              >
                {/* Medal */}
                <span style={{
                  fontSize: 24,
                  marginBottom: 4,
                }}>
                  {rank === 0 ? '🥇' : rank === 1 ? '🥈' : '🥉'}
                </span>
                <span style={{
                  fontFamily: '"Barlow Condensed", sans-serif',
                  fontSize: 18,
                  fontWeight: 800,
                  color: MEDAL_COLORS[rank],
                  letterSpacing: 2,
                }}>
                  {MEDAL_LABELS[rank]}
                </span>

                {/* Player stats inside podium */}
                <div style={{
                  marginTop: 10,
                  width: '100%',
                  padding: '0 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}>
                  {team.players.map(name => {
                    const ps = getPlayerStats(name)
                    return (
                      <div key={name} style={{
                        textAlign: 'center',
                        padding: '4px 0',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                      }}>
                        <span style={{
                          fontFamily: '"Barlow Condensed"',
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          color: 'rgba(255,255,255,0.5)',
                          display: 'block',
                          marginBottom: 2,
                        }}>
                          {displayName(name)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
