import React from 'react';
import { Volume2Icon } from '../Icons/Icons';
import { soundManager } from '@/utils/audio';
import { Luna, type LunaMood } from '@/components/kit';
import styles from './Mascot.module.scss';

interface MascotProps {
  speechText?: string;
  expression?: 'happy' | 'thinking' | 'celebrate' | 'encouraging';
  onSpeak?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const MOODS: Record<NonNullable<MascotProps['expression']>, LunaMood> = {
  happy: 'happy',
  thinking: 'think',
  celebrate: 'cheer',
  encouraging: 'happy'
};
const LUNA_SIZE = { sm: 40, md: 56, lg: 76 };

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
    <div className={styles.mascotContainer}>
      <button
        onClick={handleMascotClick}
        className={styles.mascotAvatar}
        data-size={size}
        title="Tap Ms. Luna to listen!"
        aria-label="Tap Ms. Luna to listen"
      >
        {/* the drawn Luna in place of the emoji owl (DES-15); DES-9c retires the Mascot */}
        <Luna mood={MOODS[expression]} size={LUNA_SIZE[size]} />
        <div className={styles.mascotSoundIndicator}>
          <Volume2Icon size={14} />
        </div>
      </button>

      {speechText && (
        <div
          onClick={handleMascotClick}
          className={styles.mascotSpeechBubble}
        >
          <div className={styles.speechArrow} />
          <p className={styles.mascotSpeechText}>
            {speechText}
          </p>
          <span className={styles.mascotTapPrompt}>
            <Volume2Icon size={12} /> Tap to hear again
          </span>
        </div>
      )}
    </div>
  );
};

