import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import LeaderboardSlide from '../components/LeaderboardSlide.jsx'
import MatchFeedSlide from '../components/MatchFeedSlide.jsx'
import BrandingSlide from '../components/BrandingSlide.jsx'
import PodiumSlide from '../components/PodiumSlide.jsx'
import RecentMatchSlide, { hasSpotlightMatch } from '../components/RecentMatchSlide.jsx'
import TeamShowcaseSlide from '../components/TeamShowcaseSlide.jsx'
import StatsBar from '../components/StatsBar.jsx'
import { useStore } from '../lib/store.jsx'
import { TEAMS } from '../lib/players.js'
import { displayName } from '../lib/names.js'
import { useIsLandscape } from '../lib/useMediaQuery.js'

const BASE_SLIDES = [LeaderboardSlide, MatchFeedSlide, BrandingSlide]
const PRE_SLIDES = [TeamShowcaseSlide, TeamShowcaseSlide, TeamShowcaseSlide, BrandingSlide]
const SLIDE_DURATION = 14000
const PRE_SLIDE_DURATION = 10000
const CLOSED_SLIDE_DURATION = 20000

export default function Dashboard() {
  const { tournamentStarted, tournamentClosed, leaderboard, matches } = useStore()
  const [now, setNow] = useState(Date.now())
  const [active, setActive] = useState(0)
  const timerRef = useRef(null)
  const slidesRef = useRef(null)

  // Tick every 30s so recent-match slide appears/disappears on time
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  // Check if any match is currently in its spotlight window
  const hasRecentMatch = hasSpotlightMatch(matches)

  // Build slides array based on tournament state
  const slides = (() => {
    if (!tournamentStarted) return PRE_SLIDES
    const base = [...BASE_SLIDES]
    if (hasRecentMatch) base.unshift(RecentMatchSlide)
    if (tournamentClosed) base.unshift(PodiumSlide)
    return base
  })()
  const duration = !tournamentStarted ? PRE_SLIDE_DURATION : tournamentClosed ? CLOSED_SLIDE_DURATION : SLIDE_DURATION

  // Reset carousel when slides array changes length
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % slidesRef.current.length)
    }, duration)
  }, [duration])

  // Keep ref in sync so interval closure always has current slides
  slidesRef.current = slides

  useEffect(() => {
    setActive(prev => prev >= slides.length ? 0 : prev)
    resetTimer()
    return () => clearInterval(timerRef.current)
  }, [slides.length, resetTimer])

  const goToSlide = useCallback((i) => {
    setActive(i)
    resetTimer()
  }, [resetTimer])

  const ActiveSlide = slides[active] || slides[0]
  const [logoPulse, setLogoPulse] = useState(false)

  useEffect(() => {
    setLogoPulse(true)
    const t = setTimeout(() => setLogoPulse(false), 800)
    return () => clearTimeout(t)
  }, [active])

  const landscape = useIsLandscape()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const isTvRoute = typeof window !== 'undefined' && window.location.pathname.includes('/tv')

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // Auto-reload when a new deploy is detected
  useEffect(() => {
    const myBuildId = typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : null
    if (!myBuildId) return
    const checkVersion = () => {
      fetch('/version.json?t=' + Date.now(), { cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
          if (data && data.buildId && data.buildId !== myBuildId) {
            console.log('[update] New build detected, hard-reloading...', data.buildId, 'vs', myBuildId)
            // Force cache miss by navigating to a URL with a fresh cache-bust param
            const url = new URL(window.location.href)
            url.searchParams.set('_v', data.buildId)
            window.location.replace(url.toString())
          }
        })
        .catch(() => {})
    }
    const t = setInterval(checkVersion, 30000)
    setTimeout(checkVersion, 3000)
    return () => clearInterval(t)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }, [])

  // Get winner team name for badge
  const winnerTeam = tournamentClosed && leaderboard.length > 0
    ? TEAMS.find(t => t.id === leaderboard[0].teamId)
    : null

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
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(230,1,80,0.06) 0%, transparent 60%)',
      }} />

      {isTvRoute && (
        <div style={{
          position: 'fixed',
          top: 12,
          left: 12,
          background: 'rgba(230,1,80,0.9)',
          color: '#fff',
          fontFamily: '"Barlow Condensed", sans-serif',
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
          padding: '6px 12px',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          zIndex: 100,
          boxShadow: '0 0 12px rgba(230,1,80,0.5)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="14" rx="2" />
            <line x1="8" y1="22" x2="16" y2="22" />
            <line x1="12" y1="18" x2="12" y2="22" />
          </svg>
          TV
          <span style={{
            opacity: 0.7,
            fontSize: 10,
            fontFamily: '"DM Mono", monospace',
            marginLeft: 4,
            letterSpacing: 1,
          }}>v{typeof __BUILD_VERSION__ !== 'undefined' ? __BUILD_VERSION__ : 'dev'}</span>
        </div>
      )}
      <header style={{
        padding: landscape ? '10px 24px 6px' : '16px 20px 12px',
        display: 'flex',
        flexDirection: landscape ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: landscape ? 'center' : undefined,
        gap: landscape ? 16 : 6,
        position: 'relative',
        zIndex: 2,
        flexWrap: landscape ? 'wrap' : undefined,
      }}>
        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'absolute',
            top: landscape ? 8 : 14,
            right: 16,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            width: 32, height: 32,
            display: 'grid', placeItems: 'center',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)',
            fontSize: 14,
            padding: 0,
            zIndex: 10,
          }}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="6,1 6,6 1,6" /><polyline points="10,15 10,10 15,10" />
              <polyline points="15,6 10,6 10,1" /><polyline points="1,10 6,10 6,15" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="1,6 1,1 6,1" /><polyline points="15,10 15,15 10,15" />
              <polyline points="10,1 15,1 15,6" /><polyline points="6,15 1,15 1,10" />
            </svg>
          )}
        </button>
        {!landscape && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 11, fontFamily: '"Barlow Condensed", sans-serif',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase', letterSpacing: 3,
            }}>EA7 Armani</span>
            <span style={{
              fontSize: 10, fontFamily: '"DM Mono", monospace',
              color: 'rgba(255,255,255,0.25)',
              textTransform: 'uppercase', letterSpacing: 2,
            }}>presents</span>
          </div>
        )}

        <h1 style={{
          fontFamily: '"Barlow Condensed", sans-serif',
          fontSize: landscape ? 18 : 20,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: landscape ? 3 : 4,
          color: '#fff',
          margin: 0,
          textAlign: 'center',
          lineHeight: 1.2,
        }}>
          {landscape ? 'WLPT' : 'World Legends Padel Tour'}
        </h1>

        <span style={{
          fontFamily: '"Barlow Condensed", sans-serif',
          fontSize: landscape ? 13 : 14,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 2,
          color: '#E60150',
        }}>
          London Masters 2026
        </span>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginTop: landscape ? 0 : 2,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: !tournamentStarted ? '#60a5fa' : tournamentClosed ? '#FACC15' : '#4ade80',
            animation: !tournamentStarted ? 'pulse 2s infinite' : tournamentClosed ? 'none' : 'pulse 2s infinite',
          }} />
          <span style={{
            fontSize: 10, fontFamily: '"DM Mono", monospace',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            {!tournamentStarted ? 'COMING UP' : tournamentClosed ? 'COMPLETE' : 'LIVE'} &middot; EPSOM, LONDON &middot; 8-9 MAY
          </span>
        </div>
      </header>

      {tournamentStarted && (
        <>
          <StatsBar />
          <div style={{
            textAlign: 'center',
            padding: '6px 16px 0',
            position: 'relative',
            zIndex: 2,
          }}>
            <span style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: 8,
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: 0.5,
            }}>
              W wins · G games · MP played
            </span>
          </div>
        </>
      )}

      {tournamentClosed && winnerTeam && (
        <div style={{
          textAlign: 'center',
          padding: '6px 16px 0',
          position: 'relative',
          zIndex: 2,
        }}>
          <span style={{
            display: 'inline-block',
            fontFamily: '"Barlow Condensed", sans-serif',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 2,
            color: '#FACC15',
            background: 'rgba(250,204,21,0.08)',
            border: '1px solid rgba(250,204,21,0.2)',
            borderRadius: 20,
            padding: '4px 14px',
          }}>
            Tournament Ended &middot; Winners: {displayName(winnerTeam.players[0])} & {displayName(winnerTeam.players[1])}
          </span>
        </div>
      )}

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

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
        padding: '12px 0 6px',
        position: 'relative',
        zIndex: 2,
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            style={{
              width: active === i ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: active === i ? '#E60150' : 'rgba(255,255,255,0.15)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </div>

      <footer style={{
        padding: '8px 20px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 9, fontFamily: '"DM Mono", monospace',
            color: '#E60150',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            Powered by
          </span>
          <img
            src={logoPulse ? '/logos/padx-logo-pink.svg' : '/logos/padx-logo-white.svg'}
            alt="PadX"
            style={{
              height: 16,
              opacity: logoPulse ? 1 : 0.6,
              transform: logoPulse ? 'scale(2)' : 'scale(1)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: logoPulse
                ? 'drop-shadow(0 0 6px #E60150) drop-shadow(0 0 16px #E60150) drop-shadow(0 0 30px rgba(230,1,80,0.5))'
                : 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 9, fontFamily: '"DM Mono", monospace',
            color: 'rgba(255,255,255,0.45)',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            Built by
          </span>
          <img
            src="/logos/genius-digital.png"
            alt="Genius Digital"
            style={{
              height: 28,
              opacity: logoPulse ? 1 : 0.6,
              transform: logoPulse ? 'scale(1.4)' : 'scale(1)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: logoPulse
                ? 'drop-shadow(0 0 6px rgba(255,255,255,0.6)) drop-shadow(0 0 14px rgba(255,255,255,0.3))'
                : 'none',
            }}
          />
          <span style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: 10, letterSpacing: 0.5,
            opacity: logoPulse ? 1 : 0.7,
            color: logoPulse ? '#fff' : 'rgba(255,255,255,0.5)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            Genius-Digital.net
          </span>
        </div>
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
