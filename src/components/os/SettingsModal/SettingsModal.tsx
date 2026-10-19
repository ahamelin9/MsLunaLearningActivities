import React, { useState } from 'react';
import type { ThemeChoice, UserProgress, UserSettings } from '@/types/user';
import type { GradeLevel } from '@/types/reading';
import { storageService } from '@/utils/storage';
import { GRADES } from '@/data/readingCurriculum';
import { soundManager } from '@/utils/audio';
import { ChunkyButton, Icon, Modal, Switch } from '@/components/kit';
import { VoicePicker } from '../VoicePicker/VoicePicker';
import { TeachesList } from './TeachesList';
import styles from './SettingsModal.module.scss';

interface SettingsModalProps {
  isOpen: boolean;
  progress: UserProgress;
  onClose: () => void;
  onGradeChange: (grade: GradeLevel) => void;
}

const SPEEDS = [
  { label: 'Beginner', value: 0.75 },
  { label: 'Normal', value: 0.95 },
  { label: 'Quick', value: 1.15 }
];

// light and dark (DES-16): the home screen's day/night button picks Light or Dark too;
// "Match the system", not "the iPad": it may be a Chromebook (Alex, 2026-10-18)
const THEMES: { label: string; value: ThemeChoice }[] = [
  { label: 'Match the system', value: 'match' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' }
];

/** Which speed button a saved rate belongs to. */
const speedOf = (rate: number) => (rate < 0.85 ? 0.75 : rate <= 1.05 ? 0.95 : 1.15);

/**
 * Settings, for grown-ups (DES-9b): a kit Modal of switches and pick-one
 * rows, in plain words, behind the grown-up gate (SET-1). Light and dark
 * is a pick-one row (DES-16). "What they learn" swaps the panel for what each
 * game and lesson teaches (SET-5, TeachesList).
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, progress, onClose, onGradeChange }) => {
  const [confirmingReset, setConfirmingReset] = useState(false);
  // what each game and lesson teaches, in place of the settings (SET-5)
  const [teaching, setTeaching] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const { settings } = progress;

  const update = (partial: Partial<UserSettings>) => {
    soundManager.playPop();
    storageService.updateSettings(partial);
  };

  const close = () => {
    soundManager.playPop();
    setConfirmingReset(false);
    setTeaching(false);
    onClose();
  };

  const reset = () => {
    soundManager.playFanfare();
    storageService.resetProgress();
    setResetDone(true);
    setTimeout(() => {
      setResetDone(false);
      setConfirmingReset(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      open={isOpen}
      onClose={close}
      title={teaching ? 'What each one teaches' : 'Settings'}
      closeLabel="Close settings"
      data-shot="settings"
    >
      {teaching ? (
        <TeachesList
          onBack={() => {
            soundManager.playPop();
            setTeaching(false);
          }}
        />
      ) : (
      <>
      <section className={styles.group}>
        <h3 className={styles.groupName}>Sound</h3>
        <div className={styles.row}>
          <span className={styles.text}>
            <span className={styles.name}>Sound effects</span>
            <span className={styles.desc}>Pops, chimes and cheers</span>
          </span>
          <Switch on={settings.soundEnabled} onChange={on => update({ soundEnabled: on })} label="Sound effects" />
        </div>
        <div className={styles.row}>
          <span className={styles.text}>
            <span className={styles.name}>Ms. Luna’s voice</span>
            <span className={styles.desc}>Reads words, sounds and hints aloud. The games need it.</span>
          </span>
          <Switch on={settings.speechEnabled} onChange={on => update({ speechEnabled: on })} label="Ms. Luna’s voice" />
        </div>
        <div className={styles.row}>
          <span className={styles.text}>
            <span className={styles.name}>Voice speed</span>
            <span className={styles.desc}>Beginners often need the slower one</span>
          </span>
          <span className={styles.choices} role="group" aria-label="Voice speed">
            {SPEEDS.map(speed => (
              <ChunkyButton
                key={speed.label}
                aria-pressed={speedOf(settings.speechRate) === speed.value}
                onClick={() => update({ speechRate: speed.value })}
              >
                {speed.label}
              </ChunkyButton>
            ))}
          </span>
        </div>
        <VoicePicker settings={settings} onChange={partial => storageService.updateSettings(partial)} />
      </section>

      <section className={styles.group}>
        <h3 className={styles.groupName}>Motion</h3>
        {/* DES-6: also on when the iPad's own Reduce Motion is */}
        <div className={styles.row}>
          <span className={styles.text}>
            <span className={styles.name}>Less motion</span>
            <span className={styles.desc}>Stops bouncing and moving pictures; bubbles rise slower</span>
          </span>
          <Switch
            on={settings.reducedMotion}
            onChange={on => update({ reducedMotion: on })}
            label="Less motion"
            data-shot="less-motion"
          />
        </div>
      </section>

      <section className={styles.group}>
        <h3 className={styles.groupName}>Light and dark</h3>
        <div className={styles.row}>
          <span className={styles.text}>
            <span className={styles.name}>Day or night</span>
            <span className={styles.desc}>“Match the system” follows the device’s own light or dark</span>
          </span>
          <span className={styles.choices} role="group" aria-label="Light and dark">
            {THEMES.map(theme => (
              <ChunkyButton
                key={theme.value}
                aria-pressed={settings.theme === theme.value}
                onClick={() => update({ theme: theme.value })}
                data-shot={`theme-${theme.value}`}
              >
                {theme.label}
              </ChunkyButton>
            ))}
          </span>
        </div>
      </section>

      <section className={styles.group}>
        <h3 className={styles.groupName}>Grade</h3>
        <span className={styles.choices} role="group" aria-label="Grade">
          {/* the curriculum's own list, so a grade added there shows here (SET-4) */}
          {GRADES.map(grade => (
            <ChunkyButton
              key={grade.id}
              aria-pressed={progress.selectedGrade === grade.id}
              onClick={() => {
                soundManager.playPop();
                onGradeChange(grade.id);
              }}
            >
              {grade.title}
            </ChunkyButton>
          ))}
        </span>
      </section>

      <section className={styles.group}>
        <h3 className={styles.groupName}>What they learn</h3>
        <div className={styles.row}>
          <span className={styles.text}>
            <span className={styles.name}>What each game and lesson teaches</span>
            <span className={styles.desc}>The skill behind each one, in plain words</span>
          </span>
          <ChunkyButton
            iconAfter="arrow-right"
            data-shot="open-teaches"
            onClick={() => {
              soundManager.playPop();
              setTeaching(true);
            }}
          >
            See them
          </ChunkyButton>
        </div>
      </section>

      <section className={styles.group}>
        <h3 className={styles.groupName}>Progress</h3>
        {!confirmingReset ? (
          <ChunkyButton
            variant="quiet"
            icon="replay"
            onClick={() => {
              soundManager.playPop();
              setConfirmingReset(true);
            }}
          >
            Reset all progress
          </ChunkyButton>
        ) : resetDone ? (
          <p className={styles.done}>
            <Icon name="check" size={20} /> Progress reset
          </p>
        ) : (
          <div className={styles.confirm}>
            <p className={styles.desc}>This clears every star, sticker and finished lesson. It can’t be undone.</p>
            <span className={styles.choices}>
              <ChunkyButton
                variant="action"
                onClick={() => {
                  soundManager.playPop();
                  setConfirmingReset(false);
                }}
              >
                Keep my progress
              </ChunkyButton>
              <ChunkyButton onClick={reset}>Yes, reset everything</ChunkyButton>
            </span>
          </div>
        )}
      </section>
      </>
      )}
    </Modal>
  );
};
