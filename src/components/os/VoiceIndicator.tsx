import React, { useEffect, useState } from 'react';
import { pronunciation, type VoiceStatus } from '../../utils/pronunciation';
import './VoiceIndicator.scss';

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
      <div className="voice-indicator is-loading" title="Downloading Ms. Luna’s voice">
        <span className="vi-owl" aria-hidden="true">🦉</span>
        <span className="vi-track" aria-hidden="true">
          <span className="vi-fill" style={{ width: `${status.progress}%` }} />
        </span>
        <span className="vi-label">Waking Luna… {status.progress}%</span>
      </div>
    );
  }

  if (justReady) {
    return (
      <div className="voice-indicator is-ready">
        <span className="vi-owl" aria-hidden="true">🦉</span>
        <span className="vi-label">Luna’s voice is ready!</span>
      </div>
    );
  }

  if (status.state === 'unavailable') {
    return (
      <div className="voice-indicator is-fallback" title={status.reason}>
        <span className="vi-owl" aria-hidden="true">🔈</span>
        <span className="vi-label">Basic voice</span>
      </div>
    );
  }

  return null;
};
