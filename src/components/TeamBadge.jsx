import { TEAMS } from '../lib/players.js'
import { displayName } from '../lib/names.js'
import PlayerAvatar from './PlayerAvatar.jsx'

export default function TeamBadge({ teamId, size = 48, showNames = true, layout = 'row' }) {
  const team = TEAMS.find(t => t.id === teamId)
  if (!team) return null

  const isCol = layout === 'column'

  return (
    <div style={{
      display: 'flex',
      flexDirection: isCol ? 'column' : 'row',
      alignItems: 'center',
      gap: isCol ? 8 : 12,
    }}>
      <div style={{ display: 'flex', gap: -8, position: 'relative' }}>
        <PlayerAvatar name={team.players[0]} size={size} />
        <div style={{ marginLeft: -size * 0.25 }}>
          <PlayerAvatar name={team.players[1]} size={size} />
        </div>
      </div>
      {showNames && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          textAlign: isCol ? 'center' : 'left',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>
            {displayName(team.players[0])}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>
            {displayName(team.players[1])}
          </span>
        </div>
      )}
    </div>
  )
}
