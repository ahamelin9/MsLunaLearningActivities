/**
 * AppHeader: the one header inside an app (DES-8). A way back, the screen's
 * title, and what the screen puts at its end: the stars and the gear on the
 * library, a game's rounds and Again.
 *
 * Props:  back: 'home' (leaves the app) | 'library' (from a game) · onBack
 *         title · rounds?: { won, current, total }, a game's rounds as a bar
 *         and "Round 2 of 4" · children: the end of the header
 * Built from ChunkyButton and ProgressBar, with roles and the space scale
 * only. It lives with the tablet shell rather than in the kit (Alex,
 * 2026-10-11). It stays at the top while the screen under it scrolls.
 * Board:  the round 2 Library, Round and Done headers
 */

import type { ReactNode } from 'react';
import { ChunkyButton, ProgressBar } from '@/components/kit';
import styles from './AppHeader.module.scss';

interface AppHeaderProps {
  back: 'home' | 'library';
  onBack: () => void;
  title: string;
  rounds?: { won: number; current: number; total: number };
  children?: ReactNode;
}

export function AppHeader({ back, onBack, title, rounds, children }: AppHeaderProps) {
  const round = rounds && `Round ${rounds.current} of ${rounds.total}`;
  return (
    <header className={styles.root}>
      {back === 'home' ? (
        <ChunkyButton icon="home" onClick={onBack} data-shot="app-home">
          Home
        </ChunkyButton>
      ) : (
        <ChunkyButton icon="arrow-left" onClick={onBack} data-shot="shell-back">
          Library
        </ChunkyButton>
      )}

      <h1 className={styles.title}>{title}</h1>

      <div className={styles.end}>
        {rounds && (
          // the label changes each round: the shots and checks read it
          <span className={styles.rounds} data-shot="round-pips" aria-label={round}>
            <ProgressBar size="rounds" done={rounds.won} total={rounds.total} className={styles.roundsBar} />
            <span className={styles.roundText}>{round}</span>
          </span>
        )}
        {children}
      </div>
    </header>
  );
}
