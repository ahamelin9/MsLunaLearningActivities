import React, { useEffect, useState } from 'react';
import type { UserSettings } from '../../types/user';
import { LUNA_VOICES, pronunciation, type VoiceStatus } from '../../utils/pronunciation';
import { soundManager } from '../../utils/audio';
import { SpeakerIcon, CheckIcon } from '../ui/Icons';
import './VoicePicker.scss';

interface VoicePickerProps {
  settings: UserSettings;
  onChange: (partial: Partial<UserSettings>) => void;
}

/** Shows off both halves of the phonics split: the letter name, then its sound. */
const SAMPLE_PARTS = [
  { text: 'Hello! I am Ms. Luna.' },
  { text: 'This letter is called' },
  { name: 'M' },
  { text: 'and it says' },
  { sound: 'M' },
  { text: 'like' },
  { word: 'moon' }
];

export const VoicePicker: React.FC<VoicePickerProps> = ({ settings, onChange }) => {
  const [status, setStatus] = useState<VoiceStatus>(pronunciation.getStatus());
  const [previewing, setPreviewing] = useState<string | null>(null);

  useEffect(() => pronunciation.onStatus(setStatus), []);

  const language = settings.voiceLanguage ?? 'en-US';
  const voices = LUNA_VOICES.filter(v => v.language === language);

  const preview = (voiceId: string) => {
    soundManager.playLetterTap();
    onChange({ voiceId });
    pronunciation.setVoice(voiceId);
    setPreviewing(voiceId);
    pronunciation.speakSequence(SAMPLE_PARTS, { onEnd: () => setPreviewing(null) });
    window.setTimeout(() => setPreviewing(null), 6000);
  };

  const statusLine = (() => {
    switch (status.state) {
      case 'loading':
        return `${status.label} ${status.progress}%`;
      case 'ready':
        return status.engine === 'neural'
          ? `Natural voice ready (${status.device === 'webgpu' ? 'graphics card' : 'on device'})`
          : 'Built-in browser voice';
      case 'unavailable':
        return status.reason;
      default:
        return 'Natural voice not downloaded yet';
    }
  })();

  return (
    <div className="voice-picker">
      <div className={`voice-status state-${status.state}`}>
        <span className="status-dot" aria-hidden="true" />
        <span className="status-text">{statusLine}</span>

        {status.state === 'loading' && (
          <span className="status-bar" aria-hidden="true">
            <span className="status-fill" style={{ width: `${status.progress}%` }} />
          </span>
        )}

        {(status.state === 'idle' || status.state === 'unavailable') && (
          <button
            className="status-action"
            onClick={() => {
              soundManager.playPop();
              void pronunciation.init().then(ok => {
                if (ok) void pronunciation.prewarmPhonics();
              });
            }}
          >
            Download voice
          </button>
        )}
      </div>

      <div className="language-row" role="group" aria-label="Accent">
        {(['en-US', 'en-GB'] as const).map(code => (
          <button
            key={code}
            className={`language-chip ${language === code ? 'is-active' : ''}`}
            onClick={() => {
              soundManager.playPop();
              const first = LUNA_VOICES.find(v => v.language === code);
              onChange({ voiceLanguage: code, voiceId: first?.id ?? settings.voiceId });
              if (first) pronunciation.setVoice(first.id);
            }}
          >
            {code === 'en-US' ? '🇺🇸 American' : '🇬🇧 British'}
          </button>
        ))}
      </div>

      <div className="voice-list">
        {voices.map(voice => {
          const isActive = settings.voiceId === voice.id;
          return (
            <button
              key={voice.id}
              className={`voice-option ${isActive ? 'is-active' : ''}`}
              onClick={() => preview(voice.id)}
            >
              <span className="voice-info">
                <span className="voice-name">
                  {voice.name}
                  {isActive && <CheckIcon size={13} />}
                </span>
                <span className="voice-desc">{voice.description}</span>
              </span>
              <span className={`voice-play ${previewing === voice.id ? 'is-playing' : ''}`}>
                <SpeakerIcon size={15} />
              </span>
            </button>
          );
        })}
      </div>

      <p className="voice-note">
        Tap a voice to hear it. The voice runs on this device — nothing is sent to a server.
      </p>
    </div>
  );
};
