import { getPlayerImage } from '../lib/players.js'

export default function PlayerAvatar({ name, size = 64 }) {
  const player = getPlayerImage(name)
  if (!player) return null

  const isLeft = player.position === 'left'
  const offset = isLeft ? '25%' : '75%'

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      overflow: 'hidden',
      border: '2px solid rgba(255,255,255,0.15)',
      flexShrink: 0,
      position: 'relative',
      boxShadow: '0 0 20px rgba(0,0,0,0.4)',
    }}>
      <img
        src={player.image}
        alt={name}
        style={{
          position: 'absolute',
          height: '100%',
          width: 'auto',
          minWidth: '200%',
          left: '50%',
          top: 0,
          transform: `translateX(-${offset})`,
          objectFit: 'cover',
        }}
      />
    </div>
  )
}
