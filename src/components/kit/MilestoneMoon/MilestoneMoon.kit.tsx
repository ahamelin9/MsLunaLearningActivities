// MilestoneMoon on the Kit page (DES-17): her two looks, talking (held on
// here; in the app her mouth follows the voice), and her sizes.

import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { MilestoneMoon } from './MilestoneMoon';

export default function MilestoneMoonKit() {
  return (
    <>
      <Specimens title="Her two looks" on="card">
        <Specimen label="happy: open eyes that blink"><MilestoneMoon mood="happy" talking={false} /></Specimen>
        <Specimen label="cheer: smiling eyes, a wide smile"><MilestoneMoon mood="cheer" talking={false} /></Specimen>
      </Specimens>
      <Specimens title="Talking" on="card">
        <Specimen label="her mouth talking (only while a clip plays)"><MilestoneMoon mood="cheer" talking /></Specimen>
        <Specimen label="her mouth follows the voice (still: no clip here)"><MilestoneMoon mood="happy" /></Specimen>
      </Specimens>
      <Specimens title="Sizes" on="card">
        {[96, 160, 200].map(s => (
          <Specimen key={s} label={String(s)}><MilestoneMoon mood="happy" size={s} talking={false} /></Specimen>
        ))}
      </Specimens>
    </>
  );
}
