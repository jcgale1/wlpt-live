const DISPLAY_NAMES = {
  'John Terry': 'Terry',
  'Andriy Shevchenko': 'Shevchenko',
  'Jimmy Floyd Hasselbaink': 'Hasselbaink',
  'Roberto Di Matteo': 'Di Matteo',
  'Darren Bent': 'Bent',
  'Marcus Gayle': 'Gayle',
  'Petr Čech': 'Čech',
  'Carlo Cudicini': 'Cudicini',
  "Jamie O'Hara": "O'Hara",
  'Jody Morris': 'Morris',
  'Graeme Le Saux': 'Le Saux',
  'Steve Sidwell': 'Sidwell',
}

export function displayName(fullName) {
  return DISPLAY_NAMES[fullName] || fullName.split(' ').pop()
}
