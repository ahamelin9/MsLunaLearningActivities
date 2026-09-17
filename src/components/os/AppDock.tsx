import React from 'react';
import type { AppDefinition } from '../../types/app';
import { BookIcon, MathIcon, ScienceIcon, ArtIcon } from '../ui/Icons';
import { soundManager } from '../../utils/audio';
import './AppDock.scss';

interface AppDockProps {
  apps: AppDefinition[];
  activeAppId: string | null;
  onLaunchApp: (app: AppDefinition) => void;
}

export const AppDock: React.FC<AppDockProps> = ({ apps, onLaunchApp }) => {
  const getIcon = (iconName: string, size = 30) => {
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

  const handleAppClick = (app: AppDefinition) => {
    soundManager.playAppLaunch();
    onLaunchApp(app);
  };

  return (
    <nav className="tablet-dock-container" aria-label="Quick Launch Dock">
      <div className="tablet-dock-glass">
        {apps.map(app => {
          return (
            <button
              key={app.id}
              onClick={() => handleAppClick(app)}
              className="dock-item-btn"
              title={app.name}
              aria-label={`Open ${app.name}`}
            >
              <div
                className="dock-icon-squircle"
                style={{
                  background: `linear-gradient(140deg, ${app.color} 0%, ${app.accentColor} 100%)`
                }}
              >
                {getIcon(app.iconName, 30)}
              </div>
              {app.isReady && (
                <span className="dock-active-indicator" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

