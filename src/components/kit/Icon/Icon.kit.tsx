// Icon on the Kit page (DES-7a): every drawing, the sizes (96 is the done
// screen's mark, DES-22d), a filled star, and the colour following the text
// around it.

import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { Icon } from './Icon';
import { ICON_NAMES } from './shapes';

export default function IconKit() {
  return (
    <>
      <Specimens title="The set (24)">
        {ICON_NAMES.map(name => (
          <Specimen key={name} label={name}><Icon name={name} /></Specimen>
        ))}
      </Specimens>
      <Specimens title="Sizes">
        {([16, 20, 24, 32, 40] as const).map(size => (
          <Specimen key={size} label={String(size)}><Icon name="clock" size={size} /></Specimen>
        ))}
        <Specimen label="star, filled"><Icon name="star" size={32} filled /></Specimen>
        <Specimen label="96, the done mark"><Icon name="check" size={96} /></Specimen>
      </Specimens>
      <Specimens title="currentColor: it takes the text's colour">
        <Specimen label="in --ink"><span style={{ color: 'var(--ink)' }}><Icon name="speaker" size={32} /></span></Specimen>
        <Specimen label="in --ink-soft"><span style={{ color: 'var(--ink-soft)' }}><Icon name="gear" size={32} /></span></Specimen>
        <Specimen label="in --right-text"><span style={{ color: 'var(--right-text)' }}><Icon name="check" size={32} /></span></Specimen>
        <Specimen label="in --accent-text"><span style={{ color: 'var(--accent-text)' }}><Icon name="ear" size={32} /></span></Specimen>
      </Specimens>
    </>
  );
}
