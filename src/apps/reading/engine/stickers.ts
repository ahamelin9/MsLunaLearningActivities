// Luna's sticker tin. Stickers are the collectible reward: you can see the
// empty slots waiting on the shelf, which is the point.

export interface Sticker {
  id: string;
  emoji: string;
  name: string;
  /** Luna's one-line reaction when it is peeled off the sheet */
  line: string;
}

export const STICKERS: Sticker[] = [
  { id: 'magnifier', emoji: '🔎', name: 'Sound Detective', line: 'Official detective badge. Wear it proudly.' },
  { id: 'jar', emoji: '🫙', name: 'Letter Jar', line: 'Every letter safely home. Good.' },
  { id: 'bubble', emoji: '🫧', name: 'Bubble Popper', line: 'Soapy, sparkly, earned.' },
  { id: 'cookie', emoji: '🍪', name: "Luna's Snack", line: 'I saved you half. Mostly.' },
  { id: 'cards', emoji: '🃏', name: 'Memory Master', line: 'You remember better than I do!' },
  { id: 'quill', emoji: '🪶', name: 'Sentence Builder', line: 'A feather from my very own wing.' },
  { id: 'lamp', emoji: '🔦', name: 'Sharp Eyes', line: 'Nothing disappears around you.' },
  { id: 'headphones', emoji: '🎧', name: 'Golden Ears', line: 'These ears are trained now.' },
  { id: 'chest', emoji: '💎', name: 'Treasure Reader', line: 'Straight from the chest. Shiny!' },
  { id: 'basket', emoji: '🧺', name: 'Tidy Sorter', line: 'My shelves have never looked better.' },
  { id: 'book', emoji: '📗', name: 'Story Friend', line: 'A green book for a good reader.' },
  { id: 'moon', emoji: '🌙', name: 'Night Reader', line: 'For reading past bedtime. Shh.' },
  { id: 'star', emoji: '🌟', name: 'Bright Spark', line: 'It glows. Careful, it is warm.' },
  { id: 'leaf', emoji: '🍀', name: 'Lucky Leaf', line: 'Four leaves. I counted twice.' },
  { id: 'cat', emoji: '🐈', name: 'Library Cat', line: 'He sleeps on the dictionary.' },
  { id: 'rainbow', emoji: '🌈', name: 'Rainbow Shelf', line: 'It appeared right over the tree!' },
  { id: 'cupcake', emoji: '🧁', name: 'Reading Treat', line: 'Baked by me. Do not ask about the flour.' },
  { id: 'crown', emoji: '👑', name: 'Library Royalty', line: 'Now you run the place.' }
];

export function stickerById(id: string): Sticker | undefined {
  return STICKERS.find(s => s.id === id);
}

/**
 * Awards the game's signature sticker first, then works through the tin.
 * Returns null once the whole collection is complete.
 */
export function nextSticker(owned: string[], signature: string): Sticker | null {
  if (!owned.includes(signature)) {
    const sig = stickerById(signature);
    if (sig) return sig;
  }
  const remaining = STICKERS.filter(s => !owned.includes(s.id));
  if (remaining.length === 0) return null;
  return remaining[Math.floor(Math.random() * remaining.length)];
}
