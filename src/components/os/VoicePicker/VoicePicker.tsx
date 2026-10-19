import React, { useEffect, useRef, useState } from 'react';
import type { UserSettings } from '@/types/user';
import { DEFAULT_VOICE_ID, LUNA_VOICES, pronunciation, type VoiceStatus } from '@/utils/pronunciation';
import { soundManager } from '@/utils/audio';
import { ChunkyButton } from '@/components/kit';
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
  // A voice saved before it stopped being offered (every voice used to run
  // on-device) shows as Luna, which is what the child is hearing, rather than
  // as an empty list with nothing selected.
  // None found means the index didn't load (offline), not that every voice
  // is gone: nothing is corrected then (BUG-10).
  const savedVoiceGone = rendered !== null && rendered.size > 0 && !rendered.has(settings.voiceId);
  const voiceId = savedVoiceGone ? DEFAULT_VOICE_ID : settings.voiceId;
  // the accent is the voice's own (SET-3): no setting of its own
  const language = LUNA_VOICES.find(v => v.id === voiceId)?.language ?? 'en-US';
  const voices = available.filter(v => v.language === language);
  const accents = (['en-US', 'en-GB'] as const).filter(code => available.some(v => v.language === code));
  // with one rendered voice there is nothing to pick, so no picker (SET-3)
  const picking = available.length > 1;

  // ...and the saved settings are corrected to match, once per open of
  // Settings: `onChange` is a new function on every render, and each save
  // re-renders Settings (BUG-10 saved thousands of times a second)
  const corrected = useRef(false);
  useEffect(() => {
    if (!savedVoiceGone || corrected.current) return;
    corrected.current = true;
    onChange({ voiceId });
  }, [savedVoiceGone, voiceId, onChange]);

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

  const activeVoice = voices.find(v => v.id === voiceId);

  return (
    <div className={styles.root}>
      <div className={styles.row}>
        <span className={styles.text}>
          <span className={styles.name}>Which voice</span>
          <span className={styles.status} data-state={status.state}>
            <span className={styles.dot} aria-hidden="true" />
            {statusLine}
          </span>
        </span>
        {(status.state === 'idle' || status.state === 'unavailable') && (
          <ChunkyButton
            onClick={() => {
              soundManager.playPop();
              void pronunciation.init().then(ok => {
                if (ok) void pronunciation.prewarmPhonics();
              });
            }}
          >
            Turn on voice
          </ChunkyButton>
        )}
      </div>

      {/* an accent only when both have a rendered voice */}
      {picking && accents.length > 1 && (
        <span className={styles.choices} role="group" aria-label="Accent">
          {accents.map(code => (
            <ChunkyButton
              key={code}
              aria-pressed={language === code}
              onClick={() => {
                soundManager.playPop();
                const first = available.find(v => v.language === code);
                if (first) {
                  onChange({ voiceId: first.id });
                  pronunciation.setVoice(first.id);
                }
              }}
            >
              {code === 'en-US' ? 'American' : 'British'}
            </ChunkyButton>
          ))}
        </span>
      )}

      {picking && (
        <span className={styles.choices} role="group" aria-label="Voice">
          {voices.map(voice => (
            <ChunkyButton
              key={voice.id}
              icon="speaker"
              aria-pressed={voiceId === voice.id}
              data-state={previewing === voice.id ? 'playing' : undefined}
              onClick={() => preview(voice.id)}
            >
              {voice.name}
            </ChunkyButton>
          ))}
        </span>
      )}

      <p className={styles.desc}>
        {activeVoice && <>{activeVoice.description}. </>}
        {picking && 'Tap a voice to hear it. '}
        Ms. Luna’s voice is built into the app: nothing is sent to a server.
      </p>
    </div>
  );
};
