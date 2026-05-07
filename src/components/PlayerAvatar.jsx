import { getPlayerImage } from '../lib/players.js'

export default function PlayerAvatar({ name, size = 64 }) {
  const player = getPlayerImage(name)
  if (!player) return null

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      overflow: 'hidden',
      border: '2px solid rgba(255,255,255,0.15)',
      flexShrink: 0,
      boxShadow: '0 0 20px rgba(0,0,0,0.4)',
    }}>
      <img
        src={player.image}
        alt={name}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  )
}
