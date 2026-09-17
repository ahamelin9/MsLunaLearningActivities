import React from 'react';
import type { AppDefinition } from '../../types/app';
import { soundManager } from '../../utils/audio';
import { SparklesIcon, HomeIcon } from '../../components/ui/Icons';
import { Button } from '../../components/ui/Button';
import './ComingSoonApp.scss';

interface ComingSoonAppProps {
  app: AppDefinition;
  onReturnHome: () => void;
}

export const ComingSoonApp: React.FC<ComingSoonAppProps> = ({
  app,
  onReturnHome
}) => {
  return (
    <div className="coming-soon-container">
      <div
        className="coming-soon-icon"
        style={{
          background: `linear-gradient(135deg, ${app.color} 0%, ${app.accentColor} 100%)`
        }}
      >
        <span>{app.iconName === 'math' ? '🔢' : app.iconName === 'science' ? '🧪' : '🎨'}</span>
      </div>

      <div className="in-lab-pill">
        <SparklesIcon size={14} color="#7E22CE" /> In Ms. Luna's Workshop
      </div>

      <h2 className="coming-soon-title">
        {app.name} is Coming Soon!
      </h2>

      <p className="coming-soon-desc">
        Ms. Luna is busy drawing pictures and building fun learning games for {app.name}.
        Check back soon for new adventures!
      </p>

      <div className="coming-soon-actions">
        <Button
          variant="primary"
          size="lg"
          style={{ width: '100%' }}
          onClick={() => {
            soundManager.playPop();
            onReturnHome();
          }}
        >
          <HomeIcon size={18} />
          <span>Return Home</span>
        </Button>
      </div>
    </div>
  );
};

