// Modal on the Kit page (DES-7a): open over a framed patch of screen, so it
// dims the frame instead of the page. Close it (the X, a tap on the dim, or
// Escape) and the button under it opens it again.

import { useState } from 'react';
import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { ChunkyButton } from '../ChunkyButton/ChunkyButton';
import { Modal } from './Modal';

export default function ModalKit() {
  const [open, setOpen] = useState(true);
  return (
    <Specimens title="States">
      <Specimen label={open ? 'open' : 'closed'} frame>
        <ChunkyButton onClick={() => setOpen(true)} style={{ margin: 'var(--space-4)' }}>Open it</ChunkyButton>
        <Modal open={open} onClose={() => setOpen(false)} title="Settings">
          <p>Grown-up settings sit here: plain words, kit buttons and chips.</p>
          <ChunkyButton variant="action" onClick={() => setOpen(false)}>Done</ChunkyButton>
        </Modal>
      </Specimen>
    </Specimens>
  );
}
