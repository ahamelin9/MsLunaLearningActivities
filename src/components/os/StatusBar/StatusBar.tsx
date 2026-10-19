import React, { useEffect, useState } from 'react';
import { ChunkyButton } from '@/components/kit';
import type { Theme } from '@/utils/theme';
import styles from './StatusBar.module.scss';

interface StatusBarProps {
  onOpenSettings: () => void;
  /** the mode showing, so the day/night button offers the other one (DES-16) */
  theme: Theme;
  onToggleTheme: () => void;
}

/** "9:41", as an iPad shows it */
const clock = (now: Date) => `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')}`;

/**
 * The home screen's status bar, as on the round 2 Home board: the time, and
 * the gear for grown-ups (DES-9a), behind the grown-up gate: a 1.5s press and
 * hold (SET-1). Beside the gear, a day/night button a child may tap: the moon
 * by day, the sun at night (DES-16; not on the board, Alex's idea). Inside an
 * app there is none: the app's own header takes its place (DES-8).
 */
export const StatusBar: React.FC<StatusBarProps> = ({ onOpenSettings, theme, onToggleTheme }) => {
  const [time, setTime] = useState(() => clock(new Date()));

  useEffect(() => {
    const timer = setInterval(() => setTime(clock(new Date())), 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className={styles.root} aria-label="Status bar">
      <span className={styles.time}>{time}</span>
      <span className={styles.buttons}>
        <ChunkyButton
          variant="icon"
          icon={theme === 'dark' ? 'sun' : 'moon'}
          aria-label={theme === 'dark' ? 'Turn it to day' : 'Turn it to night'}
          data-shot="day-night"
          onClick={onToggleTheme}
        />
        <ChunkyButton
          variant="icon"
          icon="gear"
          aria-label="Grown-ups: settings"
          data-shot="open-settings"
          onHold={onOpenSettings}
        />
      </span>
    </header>
  );
};
