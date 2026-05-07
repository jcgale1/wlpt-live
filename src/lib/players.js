export const TEAMS = [
  { id: 'terry-shevchenko', players: ['John Terry', 'Andriy Shevchenko'], image: '/players/terrysheva.jpg', faceX: [30, 70], faceY: [38, 38] },
  { id: 'hasselbaink-dimatteo', players: ['Jimmy Floyd Hasselbaink', 'Roberto Di Matteo'], image: '/players/hasselbainkdimatteo.jpg', faceX: [30, 68], faceY: [36, 36] },
  { id: 'bent-gayle', players: ['Darren Bent', 'Marcus Gayle'], image: '/players/bentgayle.jpg', faceX: [33, 65], faceY: [35, 35] },
  { id: 'cech-cudicini', players: ['Petr Čech', 'Carlo Cudicini'], image: '/players/cechcudicini.jpg', faceX: [32, 68], faceY: [38, 38] },
  { id: 'ohara-morris', players: ['Jamie O\'Hara', 'Jody Morris'], image: '/players/oharamorris.jpg', faceX: [32, 67], faceY: [36, 36] },
  { id: 'lesaux-sidwell', players: ['Graeme Le Saux', 'Steve Sidwell'], image: '/players/lesauxsidwell.jpg', faceX: [32, 68], faceY: [36, 36] },
]

export const ALL_PLAYERS = TEAMS.flatMap(t => t.players.map((name, i) => ({
  name,
  teamId: t.id,
  image: t.image,
  faceX: t.faceX[i],
  faceY: t.faceY[i],
})))

export function getPlayerImage(name) {
  return ALL_PLAYERS.find(p => p.name === name) || null
}
