import React, { useState, useEffect } from 'react';
import { SettingsIcon, TrophyIcon, Volume2Icon, VolumeXIcon } from '@/components/ui/Icons/Icons';
import { StarBadge } from '@/components/ui/StarBadge/StarBadge';
import { storageService } from '@/utils/storage';
import { soundManager } from '@/utils/audio';
import type { UserProgress } from '@/types/user';
import styles from './StatusBar.module.scss';
import { VoiceIndicator } from '../VoiceIndicator/VoiceIndicator';

interface StatusBarProps {
  progress: UserProgress;
  onOpenSettings: () => void;
  onOpenTrophies: () => void;
  appName?: string;
  onHomeClick?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  progress,
  onOpenSettings,
  onOpenTrophies,
  appName,
  onHomeClick
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const isAudioActive = progress.settings.soundEnabled && progress.settings.speechEnabled;

  const handleToggleSound = () => {
    const nextState = storageService.toggleMasterSound();
    if (nextState) {
      soundManager.playPop();
    }
  };

  return (
    <header className={styles.statusBarContainer} aria-label="Tablet Status Bar">
      {/* Left side: Clock */}
      <div className={styles.statusBarLeft}>
        <span className={styles.statusBarTime}>
          {currentTime || '9:41 AM'}
        </span>
      </div>

      {/* Center: Active App Title (when inside an app) */}
      <div className={styles.statusBarCenter}>
        {appName ? (
          <button
            onClick={onHomeClick}
            className={styles.appTitlePill}
            title="Return to Home Screen"
          >
            <span>{appName}</span>
          </button>
        ) : null}
      </div>

      {/* Right side: Star Points, Trophy Room, Audio Mute, Settings */}
      <div className={styles.statusBarRight}>
        <VoiceIndicator />

        <StarBadge
          stars={progress.totalStars}
          points={progress.totalPoints}
          size="sm"
          onClick={onOpenTrophies}
        />

        <button
          onClick={onOpenTrophies}
          className={styles.statusBarBtn}
          title="Trophy Room & Badges"
          aria-label="Trophy Room"
          data-shot="open-trophies"
        >
          <TrophyIcon size={18} color="#FFD166" />
          {progress.unlockedAchievements.length > 0 && (
            <span className={styles.badgeNotificationDot} />
          )}
        </button>

        <button
          onClick={handleToggleSound}
          className={styles.statusBarBtn}
          title={isAudioActive ? 'Mute All Audio' : 'Unmute All Audio'}
          aria-label="Toggle Sound"
        >
          {isAudioActive ? (
            <Volume2Icon size={18} />
          ) : (
            <VolumeXIcon size={18} color="#FF5964" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className={styles.statusBarBtn}
          title="Settings & Preferences"
          aria-label="Settings"
          data-shot="open-settings"
        >
          <SettingsIcon size={18} />
        </button>
      </div>
    </header>
  );
};
