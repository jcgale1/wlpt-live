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
        gap: 24, padding: '0 24px',
      }}
    >
      {/* WLPT Instagram QR */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{ textAlign: 'center' }}
      >
        <h2 style={{
          fontFamily: '"Barlow Condensed", sans-serif',
          fontSize: 20,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 3,
          color: 'rgba(255,255,255,0.5)',
          margin: '0 0 4px',
        }}>
          Follow the Tour
        </h2>
        <span style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: 12,
          color: '#E60150',
          letterSpacing: 1,
        }}>
          @worldlegendspadeltour
        </span>
      </motion.div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'linear-gradient(135deg, rgba(230,1,80,0.12), rgba(230,1,80,0.04))',
          border: '1px solid rgba(230,1,80,0.2)',
          borderRadius: 24,
          padding: 16,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(230,1,80,0.06) 0%, transparent 70%)',
        }} />
        <div style={{
          background: '#fff',
          borderRadius: 14,
          padding: 12,
          position: 'relative',
        }}>
          <QRCodeSVG
            value="https://www.instagram.com/worldlegendspadeltour/"
            size={150}
            level="H"
            bgColor="#ffffff"
            fgColor="#040406"
          />
        </div>
      </motion.div>

      {/* Divider */}
      <div style={{ width: 60, height: 1, background: 'rgba(255,255,255,0.08)' }} />

      {/* PadX branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
      >
        <img src="/logos/padx-logo-white.svg" alt="PadX" style={{ height: 24, opacity: 0.6 }} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: 11,
            color: '#E60150',
            letterSpacing: 0.5,
          }}>
            @padx.ai
          </span>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>|</span>
          <span style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: 11,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: 0.5,
          }}>
            padx.ai
          </span>
        </div>
      </motion.div>

      {/* Event info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <p style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: 10,
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: 1,
          margin: 0,
        }}>
          worldlegendspadeltour.com
        </p>
        <p style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: 10,
          color: 'rgba(255,255,255,0.15)',
          letterSpacing: 1,
          margin: '4px 0 0',
        }}>
          8-9 MAY 2026 &middot; EPSOM, LONDON
        </p>
      </motion.div>
    </motion.div>
  )
}
