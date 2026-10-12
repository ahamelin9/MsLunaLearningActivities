// The Icon's drawings (DES-7a), on a 24 grid, stroked by Icon.module.scss.
// From the round 2 boards where they're drawn there; book, play, sparkle, close,
// mute, trophy and lightbulb redrawn from the old components/ui/Icons in the
// same line (the board's book, a bare cover, read as a square at 24px).
// A dice dot is `data-dot`: filled, not stroked.

import type { ReactNode } from 'react';

export const SHAPES = {
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  clock: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>,
  unlock: <><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 7.6-1.8" /></>,
  'chevron-left': <path d="M15 5l-7 7 7 7" />,
  'chevron-right': <path d="M9 5l7 7-7 7" />,
  'arrow-left': <path d="M19 12H5M11 6l-6 6 6 6" />,
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
  home: <path d="M3.5 11L12 4l8.5 7M6 9.5V20h12V9.5" />,
  speaker: <path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />,
  mute: <path d="M4 9v6h4l5 4V5L8 9zM16.5 9.5l5 5M21.5 9.5l-5 5" />,
  ear: <path d="M6 8.5a6 6 0 1 1 12 0c0 3.5-3 4.5-3 7.5a3.5 3.5 0 0 1-6.5 1.8M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-1.5 3.5" />,
  replay: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />,
  // a toothed cog: the boards' circle with eight spokes read as a sun (DES-9a)
  gear: <><path d="M10.6 5.3L10.7 2.5L13.3 2.5L13.4 5.3A6.9 6.9 0 0 1 15.8 6.2L17.8 4.3L19.7 6.2L17.8 8.2A6.9 6.9 0 0 1 18.7 10.6L21.5 10.7L21.5 13.3L18.7 13.4A6.9 6.9 0 0 1 17.8 15.8L19.7 17.8L17.8 19.7L15.8 17.8A6.9 6.9 0 0 1 13.4 18.7L13.3 21.5L10.7 21.5L10.6 18.7A6.9 6.9 0 0 1 8.2 17.8L6.2 19.7L4.3 17.8L6.2 15.8A6.9 6.9 0 0 1 5.3 13.4L2.5 13.3L2.5 10.7L5.3 10.6A6.9 6.9 0 0 1 6.2 8.2L4.3 6.2L6.2 4.3L8.2 6.2A6.9 6.9 0 0 1 10.6 5.3Z" /><circle cx="12" cy="12" r="3" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.1" /></>,
  book: <path d="M5 18.5V5.5A2.5 2.5 0 0 1 7.5 3H19v13H7.5A2.5 2.5 0 0 0 5 18.5zM5 18.5A2.5 2.5 0 0 0 7.5 21H19v-5" />,
  dice: <>
    <rect x="4" y="4" width="16" height="16" rx="4" />
    <circle data-dot cx="9" cy="9" r="1.4" /><circle data-dot cx="15" cy="9" r="1.4" />
    <circle data-dot cx="12" cy="12" r="1.4" />
    <circle data-dot cx="9" cy="15" r="1.4" /><circle data-dot cx="15" cy="15" r="1.4" />
  </>,
  play: <path d="M8 5.5v13l10.5-6.5z" />,
  star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
  sparkle: <path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  trophy: <path d="M8 4h8v6a4 4 0 0 1-8 0zM8 6H5.5a3 3 0 0 0 3 4.2M16 6h2.5a3 3 0 0 1-3 4.2M12 14v4M8.5 20h7" />,
  lightbulb: <path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof SHAPES;

/** Every icon's name, in drawing order (the Kit page shows them all). */
export const ICON_NAMES = Object.keys(SHAPES) as IconName[];
