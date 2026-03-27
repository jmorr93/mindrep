const WORD_BANK = [
  'apple', 'bridge', 'castle', 'dolphin', 'engine', 'forest', 'garden',
  'harbor', 'island', 'jungle', 'kitchen', 'lantern', 'mountain', 'needle',
  'ocean', 'palace', 'quarter', 'river', 'shadow', 'temple', 'umbrella',
  'valley', 'window', 'anchor', 'blanket', 'candle', 'desert', 'eagle',
  'feather', 'glacier', 'helmet', 'ivory', 'jacket', 'kettle', 'ladder',
  'marble', 'napkin', 'orchid', 'pillow', 'quartz', 'ribbon', 'silver',
  'thunder', 'violin', 'walnut', 'crystal', 'diamond', 'emerald', 'falcon',
  'guitar', 'horizon', 'igloo', 'jasmine', 'kitten', 'lemon', 'mirror',
  'novel', 'olive', 'pepper', 'rabbit', 'salmon', 'trophy', 'velvet',
  'waffle', 'yogurt', 'zipper', 'bamboo', 'cactus', 'dagger', 'eclipse',
  'flame', 'goblin', 'honey', 'insect', 'jigsaw', 'kernel', 'lizard',
  'magnet', 'noodle', 'orbit', 'parrot', 'riddle', 'saddle', 'ticket',
  'basket', 'cherry', 'dragon', 'fossil', 'gentle', 'hammer', 'infant',
  'journey', 'knight', 'legend', 'muscle', 'noble', 'oyster', 'puzzle',
];

export function getRandomWords(count: number): string[] {
  const shuffled = [...WORD_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
