import React from 'react';
import type { AppDefinition } from '@/types/app';
import { BookIcon, SparklesIcon } from '@/components/ui/Icons/Icons';
import { soundManager } from '@/utils/audio';
import { cx } from '@/utils/cx';
import styles from './HomeScreen.module.scss';

interface HomeScreenProps {
  apps: AppDefinition[];
  onLaunchApp: (app: AppDefinition) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  apps,
  onLaunchApp
}) => {
  const readingApp = apps.find(a => a.id === 'reading') || apps[0];

  const handleLaunch = () => {
    soundManager.playAppLaunch();
    onLaunchApp(readingApp);
  };

  return (
    <div className={styles.homeScreenContainer} data-shot="home">
      {/* Decorative ambient background glows */}
      <div className={cx(styles.homeBgBubble, styles.bubble1)} />
      <div className={cx(styles.homeBgBubble, styles.bubble2)} />
      <div className={cx(styles.homeBgBubble, styles.bubble3)} />

      {/* Centered iPad Reading App */}
      <main className={styles.homeCenterStage}>
        <button
          onClick={handleLaunch}
          className={styles.ipadReadingAppCard}
          data-shot="open-reading"
          title="Open Reading App"
          aria-label="Launch Reading App"
        >
          <div className={styles.appSquircleBox}>
            <BookIcon size={68} color="#FFFFFF" className={styles.readingIconSvg} />
          </div>
          <span className={styles.appTitleText}>Reading</span>
          <div className={styles.appTapPrompt}>
            <SparklesIcon size={14} color="#FFFFFF" />
            <span>Tap to Play</span>
          </div>
        </button>
      </main>
    </div>
  );
};
