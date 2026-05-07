import { useStore } from '../lib/store.jsx'

export default function StatsBar() {
  const { matches, leaderboard } = useStore()
  const totalWinners = leaderboard.reduce((sum, e) => sum + e.winners, 0)
  const totalDistance = leaderboard.reduce((sum, e) => sum + e.distance, 0)

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-around',
      padding: '10px 8px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.06)',
      margin: '0 16px',
    }}>
      <Stat label="Matches" value={matches.length} />
      <Divider />
      <Stat label="Winners" value={totalWinners} color="#4ade80" />
      <Divider />
      <Stat label="Distance" value={`${totalDistance.toFixed(1)}km`} color="#a78bfa" />
    </div>
  )
}

function Stat({ label, value, color = '#fff' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <span style={{ fontSize: 8, fontFamily: '"DM Mono", monospace', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      <span style={{ fontSize: 20, fontWeight: 700, fontFamily: '"Barlow Condensed", sans-serif', color }}>{value}</span>
    </div>
  )
}

function Divider() {
  return <div style={{ width: 1, background: 'rgba(255,255,255,0.06)', alignSelf: 'stretch' }} />
}
