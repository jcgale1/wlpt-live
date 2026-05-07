export const TEAMS = [
  { id: 'terry-shevchenko', players: ['John Terry', 'Andriy Shevchenko'], image: '/players/terrysheva.jpg', positions: ['left', 'right'] },
  { id: 'hasselbaink-dimatteo', players: ['Jimmy Floyd Hasselbaink', 'Roberto Di Matteo'], image: '/players/hasselbainkdimatteo.jpg', positions: ['left', 'right'] },
  { id: 'bent-gayle', players: ['Darren Bent', 'Marcus Gayle'], image: '/players/bentgayle.jpg', positions: ['left', 'right'] },
  { id: 'cech-cudicini', players: ['Petr Čech', 'Carlo Cudicini'], image: '/players/cechcudicini.jpg', positions: ['left', 'right'] },
  { id: 'ohara-morris', players: ['Jamie O\'Hara', 'Jody Morris'], image: '/players/oharamorris.jpg', positions: ['left', 'right'] },
  { id: 'lesaux-sidwell', players: ['Graeme Le Saux', 'Steve Sidwell'], image: '/players/lesauxsidwell.jpg', positions: ['left', 'right'] },
]

export const ALL_PLAYERS = TEAMS.flatMap(t => t.players.map((name, i) => ({
  name,
  teamId: t.id,
  image: t.image,
  position: t.positions[i],
})))

export function getPlayerImage(name) {
  return ALL_PLAYERS.find(p => p.name === name) || null
}
