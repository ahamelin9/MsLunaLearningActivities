import React, { useEffect, useState } from 'react';
import { ChunkyButton } from '@/components/kit';
import styles from './StatusBar.module.scss';

interface StatusBarProps {
  onOpenSettings: () => void;
}

/** "9:41", as an iPad shows it */
const clock = (now: Date) => `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')}`;

/**
 * The home screen's status bar, as on the round 2 Home board: the time, and
 * the gear for grown-ups (DES-9a), behind the grown-up gate: a 2s press and
 * hold (SET-1). Inside an app there is none: the app's own header takes its
 * place (DES-8).
 */
export const StatusBar: React.FC<StatusBarProps> = ({ onOpenSettings }) => {
  const [time, setTime] = useState(() => clock(new Date()));

  useEffect(() => {
    const timer = setInterval(() => setTime(clock(new Date())), 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className={styles.root} aria-label="Status bar">
      <span className={styles.time}>{time}</span>
      <ChunkyButton
        variant="icon"
        icon="gear"
        aria-label="Grown-ups: settings"
        data-shot="open-settings"
        onHold={onOpenSettings}
      />
    </header>
  );
};
