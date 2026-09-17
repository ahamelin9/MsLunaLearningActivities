import React from 'react';
import { Volume2Icon } from './Icons';
import { soundManager } from '../../utils/audio';
import './Mascot.scss';

interface MascotProps {
  speechText?: string;
  expression?: 'happy' | 'thinking' | 'celebrate' | 'encouraging';
  onSpeak?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const Mascot: React.FC<MascotProps> = ({
  speechText,
  expression = 'happy',
  onSpeak,
  size = 'md'
}) => {
  const handleMascotClick = () => {
    soundManager.playPop();
    if (speechText) {
      soundManager.speak(speechText);
    }
    onSpeak?.();
  };

  return (
    <div className="mascot-container">
      <button
        onClick={handleMascotClick}
        className={`mascot-avatar size-${size}`}
        title="Tap Ms. Luna to listen!"
        aria-label="Tap Ms. Luna to listen"
      >
        <span className="mascot-emoji">
          {expression === 'celebrate' ? '🎉' : expression === 'thinking' ? '🦉' : expression === 'encouraging' ? '✨' : '🦉'}
        </span>
        <div className="mascot-sound-indicator">
          <Volume2Icon size={14} />
        </div>
      </button>

      {speechText && (
        <div
          onClick={handleMascotClick}
          className="mascot-speech-bubble"
        >
          <div className="speech-arrow" />
          <p className="mascot-speech-text">
            {speechText}
          </p>
          <span className="mascot-tap-prompt">
            <Volume2Icon size={12} /> Tap to hear again
          </span>
        </div>
      )}
    </div>
  );
};

