import React, { useEffect, useState } from 'react';
import { pronunciation, type VoiceStatus } from '@/utils/pronunciation';
import styles from './VoiceIndicator.module.scss';

/**
 * Quiet status for Ms. Luna's voice: only shows itself while the voice is
 * downloading or if it could not load, so it never nags a happy child.
 */
export const VoiceIndicator: React.FC = () => {
  const [status, setStatus] = useState<VoiceStatus>(pronunciation.getStatus());
  const [justReady, setJustReady] = useState(false);

  useEffect(
    () =>
      pronunciation.onStatus(next => {
        setStatus(prev => {
          if (prev.state === 'loading' && next.state === 'ready') {
            setJustReady(true);
            window.setTimeout(() => setJustReady(false), 3200);
          }
          return next;
        });
      }),
    []
  );

  if (status.state === 'loading') {
    return (
      <div className={styles.voiceIndicator} data-state="loading" title="Downloading Ms. Luna’s voice">
        <span className={styles.viOwl} aria-hidden="true">🦉</span>
        <span className={styles.viTrack} aria-hidden="true">
          <span className={styles.viFill} style={{ width: `${status.progress}%` }} />
        </span>
        <span className={styles.viLabel}>Waking Luna… {status.progress}%</span>
      </div>
    );
  }

  if (justReady) {
    return (
      <div className={styles.voiceIndicator} data-state="ready">
        <span className={styles.viOwl} aria-hidden="true">🦉</span>
        <span className={styles.viLabel}>Luna’s voice is ready!</span>
      </div>
    );
  }

  if (status.state === 'unavailable') {
    return (
      <div className={styles.voiceIndicator} data-state="fallback" title={status.reason}>
        <span className={styles.viOwl} aria-hidden="true">🔈</span>
        <span className={styles.viLabel}>Basic voice</span>
      </div>
    );
  }

  return null;
};
