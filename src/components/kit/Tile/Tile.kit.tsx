// Tile on the Kit page (DES-7a): the five tints, and pressed. The pictures are
// stand-ins until DES-21 draws each game's.

import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { Icon } from '../Icon/Icon';
import { Tile } from './Tile';

const GAMES = [
  { name: 'The Letter Jar', icon: 'book', tint: 1 },
  { name: 'Bubble Sounds', icon: 'ear', tint: 2 },
  { name: 'Feed Luna', icon: 'star', tint: 3 },
  { name: 'Muddled Cards', icon: 'dice', tint: 4 },
  { name: 'Treasure Path', icon: 'sparkle', tint: 5 },
] as const;

export default function TileKit() {
  return (
    <>
      <Specimens title="Tints 1–5">
        {GAMES.map(g => (
          <Specimen key={g.tint} label={`tint ${g.tint}`} wide>
            <Tile name={g.name} tint={g.tint} picture={<Icon name={g.icon} size={32} />} style={{ flex: 1 }} />
          </Specimen>
        ))}
      </Specimens>
      <Specimens title="States">
        <Specimen label="idle" wide>
          <Tile name="Story Corner" picture={<Icon name="book" size={32} />} style={{ flex: 1 }} />
        </Specimen>
        <Specimen label="pressed" wide>
          <Tile name="Story Corner" picture={<Icon name="book" size={32} />} data-state="pressed" style={{ flex: 1 }} />
        </Specimen>
      </Specimens>
    </>
  );
}
