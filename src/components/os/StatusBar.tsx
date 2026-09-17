import React, { useState, useEffect } from 'react';
import { SettingsIcon, TrophyIcon, Volume2Icon, VolumeXIcon } from '../ui/Icons';
import { StarBadge } from '../ui/StarBadge';
import { storageService } from '../../utils/storage';
import { soundManager } from '../../utils/audio';
import type { UserProgress } from '../../types/user';
import './StatusBar.scss';
import { VoiceIndicator } from './VoiceIndicator';

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
    <header className="status-bar-container" aria-label="Tablet Status Bar">
      {/* Left side: Clock */}
      <div className="status-bar-left">
        <span className="status-bar-time">
          {currentTime || '9:41 AM'}
        </span>
      </div>

      {/* Center: Active App Title (when inside an app) */}
      <div className="status-bar-center">
        {appName ? (
          <button
            onClick={onHomeClick}
            className="app-title-pill"
            title="Return to Home Screen"
          >
            <span>{appName}</span>
          </button>
        ) : null}
      </div>

      {/* Right side: Star Points, Trophy Room, Audio Mute, Settings */}
      <div className="status-bar-right">
        <VoiceIndicator />

        <StarBadge
          stars={progress.totalStars}
          points={progress.totalPoints}
          size="sm"
          onClick={onOpenTrophies}
        />

        <button
          onClick={onOpenTrophies}
          className="status-bar-btn"
          title="Trophy Room & Badges"
          aria-label="Trophy Room"
        >
          <TrophyIcon size={18} color="#FFD166" />
          {progress.unlockedAchievements.length > 0 && (
            <span className="badge-notification-dot" />
          )}
        </button>

        <button
          onClick={handleToggleSound}
          className="status-bar-btn"
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
          className="status-bar-btn"
          title="Settings & Preferences"
          aria-label="Settings"
        >
          <SettingsIcon size={18} />
        </button>
      </div>
    </header>
  );
};
