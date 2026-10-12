import type { AppDefinition } from '../types/app';

// The apps on the home screen. Reading is the one app; later ESL companion
// apps (WRT-1) go here, never school subjects (OPS-3). An app's look lives in
// its home-screen icon and the tokens, never here (DES-9a).
export const APP_REGISTRY: AppDefinition[] = [
  {
    id: 'reading',
    name: 'Reading',
    tagline: 'Letters, Phonics, CVC Words & Stories',
    category: 'reading',
    gradeLevels: ['Kindergarten', '1st Grade', '2nd Grade']
  }
];
