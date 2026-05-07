import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'

export default function BrandingSlide() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 20, padding: '0 24px',
      }}
    >
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', justifyContent: 'center', width: '100%' }}>
        <QRBlock
          label="WLPT"
          handle="@worldlegendspadeltour"
          url="https://www.instagram.com/worldlegendspadeltour/"
          delay={0.2}
          color="#fff"
          logo="/logos/ea7-wlpt.svg"
          logoWidth={44}
          logoHeight={10}
        />
        <QRBlock
          label="PadX"
          handle="@padx.ai"
          url="https://www.instagram.com/padx.ai/"
          delay={0.4}
          color="#E60150"
          logo="/logos/padx-mark.svg"
        />
      </div>

      <div style={{ width: 60, height: 1, background: 'rgba(255,255,255,0.08)' }} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
      >
        <img src="/logos/padx-logo-white.svg" alt="PadX" style={{ height: 24, opacity: 0.6 }} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{
            fontFamily: '"DM Mono", monospace', fontSize: 11, color: '#E60150', letterSpacing: 0.5,
          }}>
            padx.ai
          </span>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>|</span>
          <span style={{
            fontFamily: '"DM Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5,
          }}>
            worldlegendspadeltour.com
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <p style={{
          fontFamily: '"DM Mono", monospace', fontSize: 10,
          color: 'rgba(255,255,255,0.15)', letterSpacing: 1, margin: 0,
        }}>
          8-9 MAY 2026 &middot; EPSOM, LONDON
        </p>
      </motion.div>
    </motion.div>
  )
}

function QRBlock({ label, handle, url, delay, color, logo, logoWidth, logoHeight }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.6 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, maxWidth: 170 }}
    >
      <div style={{ textAlign: 'center' }}>
        <h3 style={{
          fontFamily: '"Barlow Condensed", sans-serif',
          fontSize: 16, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: 2, color, margin: '0 0 2px',
        }}>
          {label}
        </h3>
        <span style={{
          fontFamily: '"DM Mono", monospace', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5,
        }}>
          {handle}
        </span>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(230,1,80,0.12), rgba(230,1,80,0.04))',
        border: '1px solid rgba(230,1,80,0.2)',
        borderRadius: 16, padding: 10, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(230,1,80,0.06) 0%, transparent 70%)',
        }} />
        <div style={{ background: '#fff', borderRadius: 10, padding: 8, position: 'relative' }}>
          <QRCodeSVG
            value={url}
            size={110}
            level="H"
            bgColor="#ffffff"
            fgColor="#040406"
            imageSettings={{
              src: logo,
              height: logoHeight || 24,
              width: logoWidth || 24,
              excavate: true,
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}
