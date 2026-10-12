import React from 'react';
import type { AppDefinition } from '@/types/app';
import { Chip } from '@/components/kit';
import { cx } from '@/utils/cx';
import styles from './HomeScreen.module.scss';

interface HomeScreenProps {
  apps: AppDefinition[];
  onLaunchApp: (app: AppDefinition) => void;
}

/**
 * The home screen, as on the round 2 Home board (DES-9a): the iPad feel in
 * sand and cocoa. A sky with the sun, dunes and pampas, the one Reading app
 * in the middle (room is left for ESL companion apps, WRT-1), and the home
 * indicator. The status bar sits over it (App). The night scene, the moon
 * and stars, comes with DES-16.
 */
export const HomeScreen: React.FC<HomeScreenProps> = ({ apps, onLaunchApp }) => {
  const readingApp = apps.find(a => a.id === 'reading') || apps[0];

  return (
    <div className={styles.root} data-shot="home">
      <div className={styles.scenery} aria-hidden="true">
        <span className={styles.sun} />
        <span className={cx(styles.dune, styles.dune1)} />
        <span className={cx(styles.dune, styles.dune2)} />
        <span className={cx(styles.dune, styles.dune3)} />

        <svg className={cx(styles.pampas, styles.pampasLeft)} viewBox="0 0 170 330">
          <path className={styles.reed} d="M70 330 C66 240 60 170 40 70" strokeWidth={4} strokeLinecap="round" />
          <path className={styles.plume} d="M40 70 C20 40 26 10 36 0 C52 24 62 60 58 110 C48 100 44 86 40 70 Z" />
          <path
            className={styles.plumeLine}
            d="M40 30 l-10 -6 M44 48 l-12 -4 M48 66 l-12 -2 M50 84 l-11 0 M44 40 l10 -6 M50 58 l10 -4 M54 76 l9 -2"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <path className={styles.reed} d="M80 330 C84 250 96 190 122 120" strokeWidth={4} strokeLinecap="round" />
          <path className={styles.plume2} d="M122 120 C130 90 146 70 158 64 C158 96 146 132 124 160 C120 148 120 134 122 120 Z" />
          <path
            className={styles.plumeLine}
            d="M136 96 l8 -6 M130 112 l10 -4 M126 130 l10 -2 M132 104 l-8 -2 M126 122 l-8 0"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
        <svg className={cx(styles.pampas, styles.pampasRight)} viewBox="0 0 150 300">
          <path className={styles.reed} d="M90 300 C92 220 100 150 118 60" strokeWidth={4} strokeLinecap="round" />
          <path className={styles.plume} d="M118 60 C128 34 124 10 116 0 C100 26 92 62 98 104 C108 92 114 78 118 60 Z" />
          <path
            className={styles.plumeLine}
            d="M118 26 l9 -5 M114 44 l11 -3 M110 62 l11 -1 M112 36 l-9 -5 M106 54 l-10 -3 M102 74 l-9 -1"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <path className={styles.reed} d="M80 300 C74 230 58 180 30 130" strokeWidth={4} strokeLinecap="round" />
          <path className={styles.plume2} d="M30 130 C16 112 8 92 8 80 C26 88 44 110 50 140 C42 140 36 136 30 130 Z" />
        </svg>
      </div>

      <main className={styles.apps}>
        <button className={styles.app} onClick={() => onLaunchApp(readingApp)} data-shot="open-reading" aria-label="Open Reading">
          <span className={styles.icon}>
            {/* an open book under a moon, as on the Home board */}
            <svg viewBox="0 0 92 92" aria-hidden="true">
              <path className={styles.iconMoon} d="M66 14a9 9 0 1 0 8 13 7 7 0 1 1-8-13z" />
              <path className={styles.iconPage} d="M46 36c-8-5-18-6-28-4v34c10-2 20-1 28 4z" />
              <path className={styles.iconPage2} d="M46 36c8-5 18-6 28-4v34c-10-2-20-1-28 4z" />
              <path
                className={styles.iconLines}
                d="M24 44c5-1 11-.5 15 1.5M24 52c5-1 11-.5 15 1.5M53 45.5c4-2 10-2.5 15-1.5M53 53.5c4-2 10-2.5 15-1.5"
                strokeWidth={2.4}
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className={styles.name}>{readingApp.name}</span>
          <Chip variant="accent" icon="play">
            Tap to play
          </Chip>
        </button>
      </main>

      <span className={styles.indicator} aria-hidden="true" />
    </div>
  );
};
