import React from 'react';
import type { AppDefinition } from '../../types/app';
import { BookIcon, SparklesIcon } from '../ui/Icons';
import { soundManager } from '../../utils/audio';
import './HomeScreen.scss';

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
    <div className="home-screen-container">
      {/* Decorative ambient background glows */}
      <div className="home-bg-bubble bubble-1" />
      <div className="home-bg-bubble bubble-2" />
      <div className="home-bg-bubble bubble-3" />

      {/* Centered iPad Reading App */}
      <main className="home-center-stage">
        <button
          onClick={handleLaunch}
          className="ipad-reading-app-card"
          title="Open Reading App"
          aria-label="Launch Reading App"
        >
          <div className="app-squircle-box">
            <BookIcon size={68} color="#FFFFFF" className="reading-icon-svg" />
          </div>
          <span className="app-title-text">Reading</span>
          <div className="app-tap-prompt">
            <SparklesIcon size={14} color="#FFFFFF" />
            <span>Tap to Play</span>
          </div>
        </button>
      </main>
    </div>
  );
};
