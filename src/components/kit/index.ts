// The kit list: every kit component, exported once (docs/design-system/
// components.md). Screens import from here: `import { ChunkyButton } from '@/components/kit'`.
// Each component's <Name>.kit.tsx shows its states on the Kit page (`/?kit`).

export { Icon, type IconName } from './Icon/Icon';
export { ChunkyButton } from './ChunkyButton/ChunkyButton';
export { PaperCard } from './PaperCard/PaperCard';
export { Chip, TimeChip } from './Chip/Chip';
export { Tile } from './Tile/Tile';
export { Modal } from './Modal/Modal';
