import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import LeaderboardSlide from '../components/LeaderboardSlide.jsx'
import PlayerCardsSlide from '../components/PlayerCardsSlide.jsx'
import MatchFeedSlide from '../components/MatchFeedSlide.jsx'
import BrandingSlide from '../components/BrandingSlide.jsx'
import StatsBar from '../components/StatsBar.jsx'

const SLIDES = [LeaderboardSlide, PlayerCardsSlide, MatchFeedSlide, BrandingSlide]
const SLIDE_DURATION = 8000

export default function Dashboard() {
  const [active, setActive] = useState(0)
  const timerRef = useRef(null)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % SLIDES.length)
    }, SLIDE_DURATION)
  }, [])

  useEffect(() => {
    resetTimer()
    return () => clearInterval(timerRef.current)
  }, [resetTimer])

  const goToSlide = useCallback((i) => {
    setActive(i)
    resetTimer()
  }, [resetTimer])

  const ActiveSlide = SLIDES[active]

  return (
    <div style={{
      minHeight: '100dvh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #040406 0%, #0a0a1a 50%, #040406 100%)',
      color: '#fff',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(34,211,238,0.04) 0%, transparent 60%)',
      }} />

      {/* Header */}
      <header style={{
        padding: '16px 20px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logos/padx-logo-white.svg" alt="PadX" style={{ height: 22, opacity: 0.7 }} />
          <span style={{
            fontSize: 10, fontFamily: '"DM Mono", monospace',
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase', letterSpacing: 2,
          }}>presents</span>
        </div>

        <h1 style={{
          fontFamily: '"Barlow Condensed", sans-serif',
          fontSize: 20,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: 4,
          color: '#fff',
          margin: 0,
          textAlign: 'center',
          lineHeight: 1.2,
        }}>
          World Legends Padel Tour
        </h1>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            fontFamily: '"Barlow Condensed", sans-serif',
            fontSize: 14,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 2,
            color: '#FACC15',
          }}>
            London Masters 2026
          </span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginTop: 2,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#4ade80',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{
            fontSize: 10, fontFamily: '"DM Mono", monospace',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            LIVE &middot; EPSOM, LONDON &middot; 8-9 MAY
          </span>
        </div>
      </header>

      {/* Stats bar */}
      <StatsBar />

      {/* Slide area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingTop: 16,
        position: 'relative',
        zIndex: 2,
        minHeight: 0,
        overflow: 'hidden',
      }}>
        <AnimatePresence mode="wait">
          <ActiveSlide key={active} />
        </AnimatePresence>
      </div>

      {/* Slide indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
        padding: '12px 0 6px',
        position: 'relative',
        zIndex: 2,
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            style={{
              width: active === i ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: active === i ? '#22D3EE' : 'rgba(255,255,255,0.15)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Footer */}
      <footer style={{
        padding: '8px 20px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2,
      }}>
        <span style={{
          fontSize: 9, fontFamily: '"DM Mono", monospace',
          color: 'rgba(255,255,255,0.2)',
          textTransform: 'uppercase', letterSpacing: 1,
        }}>
          Powered by PadX
        </span>
        <span style={{
          fontSize: 9, fontFamily: '"DM Mono", monospace',
          color: 'rgba(255,255,255,0.2)',
          textTransform: 'uppercase', letterSpacing: 1,
        }}>
          EA7 Armani
        </span>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
