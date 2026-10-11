import React, { useEffect, useState } from 'react';
import type { UserSettings } from '@/types/user';
import { DEFAULT_VOICE_ID, LUNA_VOICES, pronunciation, type VoiceStatus } from '@/utils/pronunciation';
import { soundManager } from '@/utils/audio';
import { SpeakerIcon, CheckIcon } from '@/components/ui/Icons/Icons';
import styles from './VoicePicker.module.scss';

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
  const [rendered, setRendered] = useState<Set<string> | null>(null);

  useEffect(() => pronunciation.onStatus(setStatus), []);

  // A voice exists for the child only if its clips were rendered. Adding one
  // is `npm run voice:render -- --voice <id>`; until then it is not offered,
  // because picking it would silently drop Luna to the browser voice.
  useEffect(() => {
    let live = true;
    void pronunciation.renderedVoices().then(set => {
      if (live) setRendered(set);
    });
    return () => {
      live = false;
    };
  }, []);

  const available = LUNA_VOICES.filter(v => !rendered || rendered.has(v.id));
  // A voice or accent saved before it stopped being offered (every voice used
  // to run on-device) shows as Luna, which is what the child is hearing,
  // rather than as an empty list with nothing selected.
  const savedVoiceGone = rendered !== null && !rendered.has(settings.voiceId);
  const voiceId = savedVoiceGone ? DEFAULT_VOICE_ID : settings.voiceId;
  const savedLanguage = settings.voiceLanguage ?? 'en-US';
  const language = available.some(v => v.language === savedLanguage)
    ? savedLanguage
    : (LUNA_VOICES.find(v => v.id === DEFAULT_VOICE_ID)?.language ?? 'en-US');
  const voices = available.filter(v => v.language === language);

  // ...and the saved settings are corrected to match
  useEffect(() => {
    if (savedVoiceGone || language !== savedLanguage) {
      onChange({ voiceId, voiceLanguage: language });
    }
  }, [savedVoiceGone, language, savedLanguage, voiceId, onChange]);

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
        return status.engine === 'neural' ? 'Natural voice ready' : 'Built-in browser voice';
      case 'unavailable':
        return status.reason;
      default:
        return 'Natural voice ready';
    }
  })();

  return (
    <div className={styles.voicePicker}>
      <div className={styles.voiceStatus} data-state={status.state}>
        <span className={styles.statusDot} aria-hidden="true" />
        <span className={styles.statusText}>{statusLine}</span>

        {status.state === 'loading' && (
          <span className={styles.statusBar} aria-hidden="true">
            <span className={styles.statusFill} style={{ width: `${status.progress}%` }} />
          </span>
        )}

        {(status.state === 'idle' || status.state === 'unavailable') && (
          <button
            className={styles.statusAction}
            onClick={() => {
              soundManager.playPop();
              void pronunciation.init().then(ok => {
                if (ok) void pronunciation.prewarmPhonics();
              });
            }}
          >
            Turn on voice
          </button>
        )}
      </div>

      <div className={styles.languageRow} role="group" aria-label="Accent">
        {(['en-US', 'en-GB'] as const)
          .filter(code => available.some(v => v.language === code))
          .map(code => (
          <button
            key={code}
            className={styles.languageChip}
            data-state={language === code ? 'active' : undefined}
            onClick={() => {
              soundManager.playPop();
              const first = available.find(v => v.language === code);
              onChange({ voiceLanguage: code, voiceId: first?.id ?? voiceId });
              if (first) pronunciation.setVoice(first.id);
            }}
          >
            {code === 'en-US' ? '🇺🇸 American' : '🇬🇧 British'}
          </button>
        ))}
      </div>

      <div className={styles.voiceList}>
        {voices.map(voice => {
          const isActive = voiceId === voice.id;
          return (
            <button
              key={voice.id}
              className={styles.voiceOption}
              data-state={isActive ? 'active' : undefined}
              onClick={() => preview(voice.id)}
            >
              <span>
                <span className={styles.voiceName}>
                  {voice.name}
                  {isActive && <CheckIcon size={13} />}
                </span>
                <span className={styles.voiceDesc}>{voice.description}</span>
              </span>
              <span
                className={styles.voicePlay}
                data-state={previewing === voice.id ? 'playing' : undefined}
              >
                <SpeakerIcon size={15} />
              </span>
            </button>
          );
        })}
      </div>

      <p className={styles.voiceNote}>
        Tap a voice to hear it. Ms. Luna speaks from audio built into the app — nothing is
        sent to a server.
      </p>
    </div>
  );
};
