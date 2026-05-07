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
        gap: 28, padding: '0 24px',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{ textAlign: 'center' }}
      >
        <h2 style={{
          fontFamily: '"Barlow Condensed", sans-serif',
          fontSize: 22,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 4,
          color: 'rgba(255,255,255,0.6)',
          margin: '0 0 6px',
        }}>
          Follow the Tour
        </h2>
        <span style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: 13,
          color: '#22D3EE',
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
          background: 'linear-gradient(135deg, rgba(34,211,238,0.12), rgba(250,204,21,0.08))',
          border: '1px solid rgba(34,211,238,0.2)',
          borderRadius: 24,
          padding: 20,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(34,211,238,0.06) 0%, transparent 70%)',
        }} />
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 16,
          position: 'relative',
        }}>
          <QRCodeSVG
            value="https://www.instagram.com/worldlegendspadeltour/"
            size={180}
            level="H"
            bgColor="#ffffff"
            fgColor="#040406"
            imageSettings={{
              src: '/logos/padx-x-cyan.svg',
              height: 32,
              width: 32,
              excavate: true,
            }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <p style={{
          fontFamily: '"Barlow", sans-serif',
          fontSize: 14,
          color: 'rgba(255,255,255,0.45)',
          margin: '0 0 4px',
        }}>
          worldlegendspadeltour.com
        </p>
        <p style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: 11,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: 1,
        }}>
          8-9 MAY 2026 &middot; EPSOM, LONDON
        </p>
      </motion.div>
    </motion.div>
  )
}
