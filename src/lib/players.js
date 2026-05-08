export const TEAMS = [
  { id: 'terry-shevchenko', players: ['John Terry', 'Andriy Shevchenko'], image: '/players/terrysheva.jpg' },
  { id: 'hasselbaink-dimatteo', players: ['Jimmy Floyd Hasselbaink', 'Roberto Di Matteo'], image: '/players/hasselbainkdimatteo.jpg' },
  { id: 'bent-gayle', players: ['Darren Bent', 'Dwight Gayle'], image: '/players/bentgayle.jpg' },
  { id: 'cech-cudicini', players: ['Petr Čech', 'Carlo Cudicini'], image: '/players/cechcudicini.jpg' },
  { id: 'ohara-morris', players: ['Jamie O\'Hara', 'Jody Morris'], image: '/players/oharamorris.jpg' },
  { id: 'lesaux-sidwell', players: ['Graeme Le Saux', 'Steve Sidwell'], image: '/players/lesauxsidwell.jpg' },
]

const PLAYER_IMAGES = {
  'John Terry': '/players/terry.jpg',
  'Andriy Shevchenko': '/players/shevchenko.jpg',
  'Jimmy Floyd Hasselbaink': '/players/hasselbaink.jpg',
  'Roberto Di Matteo': '/players/dimatteo.jpg',
  'Darren Bent': '/players/bent.jpg',
  'Dwight Gayle': '/players/gayle.jpg',
  'Petr Čech': '/players/cech.jpg',
  'Carlo Cudicini': '/players/cudicini.jpg',
  "Jamie O'Hara": '/players/ohara.jpg',
  'Jody Morris': '/players/morris.jpg',
  'Graeme Le Saux': '/players/lesaux.jpg',
  'Steve Sidwell': '/players/sidwell.jpg',
}

export const ALL_PLAYERS = TEAMS.flatMap(t => t.players.map(name => ({
  name,
  teamId: t.id,
  image: PLAYER_IMAGES[name],
})))

export function getPlayerImage(name) {
  return ALL_PLAYERS.find(p => p.name === name) || null
}
