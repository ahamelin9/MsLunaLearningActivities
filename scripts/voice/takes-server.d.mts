import type { Plugin } from 'vite';

/** Where the recording page's takes are saved (git ignores it). */
export const TAKES_DIR: string;
/** The recording page's save, under `npm run dev` only (VOX-7). */
export function takesServer(): Plugin;
