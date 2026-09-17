import React, { type ReactNode } from 'react';
import type { AppDefinition } from '../../types/app';
import type { UserProgress } from '../../types/user';
import { HomeIcon, BookIcon, MathIcon, ScienceIcon, ArtIcon, Volume2Icon, VolumeXIcon } from '../ui/Icons';
import { StarBadge } from '../ui/StarBadge';
import { soundManager } from '../../utils/audio';
import { storageService } from '../../utils/storage';
import { VoiceIndicator } from './VoiceIndicator';
import './AppWindow.scss';

interface AppWindowProps {
  app: AppDefinition;
  progress: UserProgress;
  onClose: () => void;
  children: ReactNode;
}

export const AppWindow: React.FC<AppWindowProps> = ({
  app,
  progress,
  onClose,
  children
}) => {
  const getIcon = (iconName: string, size = 18) => {
    switch (iconName) {
      case 'book':
        return <BookIcon size={size} color="#FFFFFF" />;
      case 'math':
        return <MathIcon size={size} color="#FFFFFF" />;
      case 'science':
        return <ScienceIcon size={size} color="#FFFFFF" />;
      case 'art':
        return <ArtIcon size={size} color="#FFFFFF" />;
      default:
        return <BookIcon size={size} color="#FFFFFF" />;
    }
  };

  const handleReturnHome = () => {
    soundManager.playPop();
    onClose();
  };

  const isAudioActive = progress.settings.soundEnabled && progress.settings.speechEnabled;

  const handleToggleSound = () => {
    const nextState = storageService.toggleMasterSound();
    if (nextState) {
      soundManager.playPop();
    }
  };

  return (
    <div className="app-window-overlay">
      {/* OS App Window Header Bar */}
      <header className="app-window-header">
        <div className="header-left">
          <button
            onClick={handleReturnHome}
            className="home-nav-btn"
            title="Return to Tablet Home"
            aria-label="Return to Home"
          >
            <HomeIcon size={16} />
            <span>Home</span>
          </button>

          <div className="app-title-group">
            <div
              className="app-header-icon"
              style={{
                background: `linear-gradient(135deg, ${app.color} 0%, ${app.accentColor} 100%)`
              }}
            >
              {getIcon(app.iconName, 18)}
            </div>
            <span className="app-header-title">
              {app.name}
            </span>
          </div>
        </div>

        {/* Right Header Controls: Voice status, Stars and Audio */}
        <div className="header-right">
          <VoiceIndicator />

          <StarBadge
            stars={progress.totalStars}
            points={progress.totalPoints}
            size="sm"
          />

          <button
            onClick={handleToggleSound}
            className="audio-toggle-btn"
            title={isAudioActive ? 'Mute All Audio' : 'Unmute All Audio'}
            aria-label="Toggle Sound"
          >
            {isAudioActive ? (
              <Volume2Icon size={16} />
            ) : (
              <VolumeXIcon size={16} color="#FF5964" />
            )}
          </button>
        </div>
      </header>

      {/* App Body Content */}
      <main className="app-window-content">
        {children}
      </main>

      {/* Tablet Bottom Home Indicator Bar */}
      <footer className="tablet-home-indicator-bar">
        <button
          onClick={handleReturnHome}
          className="tablet-home-pill"
          title="Tap to return to Home"
          aria-label="Home Indicator Bar"
        />
      </footer>
    </div>
  );
};
