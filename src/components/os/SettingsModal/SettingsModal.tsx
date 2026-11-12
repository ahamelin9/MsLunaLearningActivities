import React, { useState } from 'react';
import type { ThemeChoice, UserProgress, UserSettings } from '@/types/user';
import type { GradeLevel } from '@/types/reading';
import { storageService } from '@/utils/storage';
import { GRADES } from '@/data/readingCurriculum';
import { soundManager } from '@/utils/audio';
import { Chip, ChunkyButton, Icon, Modal, PaperCard, Switch } from '@/components/kit';
import { PICKABLE_WORDS, WEEK_WORDS_MAX } from '@/apps/reading/engine/weekWords';
import { CheatSheet } from '../CheatSheet/CheatSheet';
import { WeekWords } from '../WeekWords/WeekWords';
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

/** A picked word's picture, for its chip. */
const emojiOf = (word: string) => PICKABLE_WORDS.find(w => w.word === word)?.emoji;

/** Which speed button a saved rate belongs to. */
const speedOf = (rate: number) => (rate < 0.85 ? 0.75 : rate <= 1.05 ? 0.95 : 1.15);

/**
 * The Teacher's corner, once Settings (DES-9b, DES-29): a wide kit Modal behind
 * the grown-up gate (SET-1), with two panels side by side, stacked on a
 * portrait iPad. "My class": the grade, this week's words (CUR-9), what they
 * learn (the cheat sheet, CUR-8) and resetting progress. "On this device":
 * sound, Ms. Luna's voice and its speed, less motion, and light and dark
 * (DES-16). "Which voice" went in DES-30: one rendered voice, nothing to pick. The cheat sheet and the word picker open in its place, and their
 * "Back" comes here.
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, progress, onClose, onGradeChange }) => {
  const [confirmingReset, setConfirmingReset] = useState(false);
  // the cheat sheet, in place of Settings (CUR-8)
  const [teaching, setTeaching] = useState(false);
  // this week's words, in place of Settings (CUR-9)
  const [picking, setPicking] = useState(false);
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
    setPicking(false);
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

  // the cheat sheet, in its own wide window (CUR-8); its "Back" comes here
  if (teaching) {
    return (
      <CheatSheet
        open={isOpen}
        progress={progress}
        onClose={close}
        onBack={() => {
          soundManager.playPop();
          setTeaching(false);
        }}
      />
    );
  }

  // this week's words, in their own wide window (CUR-9); its "Back" comes here
  if (picking) {
    return (
      <WeekWords
        open={isOpen}
        progress={progress}
        onClose={close}
        onBack={() => {
          soundManager.playPop();
          setPicking(false);
        }}
      />
    );
  }

  const week = settings.weekWords;

  return (
    <Modal
      open={isOpen}
      onClose={close}
      title="Teacher’s corner"
      closeLabel="Close the Teacher’s corner"
      data-shot="settings"
      className={styles.sheet}
    >
      <div className={styles.panels}>
        {/* what the teacher sets for her group (DES-29) */}
        <PaperCard variant="flat" className={styles.panel} data-shot="my-class">
          <h3 className={styles.panelName}>My class</h3>

          <section className={styles.group}>
            <span className={styles.name}>Grade</span>
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
            <div className={styles.row}>
              <span className={styles.text}>
                <span className={styles.name}>This week’s words</span>
                <span className={styles.desc} data-shot="week-summary">
                  {week.length > 0
                    ? `${week.length} of ${WEEK_WORDS_MAX} picked; the games deal them first`
                    : `Up to ${WEEK_WORDS_MAX} your class is working on; the games deal them first`}
                </span>
              </span>
              <ChunkyButton
                iconAfter="arrow-right"
                data-shot="open-week-words"
                onClick={() => {
                  soundManager.playPop();
                  setPicking(true);
                }}
              >
                Pick words
              </ChunkyButton>
            </div>
            {week.length > 0 && (
              <span className={styles.chips} data-shot="week-chips">
                {week.map(word => (
                  <Chip key={word} variant="accent">
                    <span aria-hidden="true">{emojiOf(word)}</span> {word}
                  </Chip>
                ))}
              </span>
            )}
          </section>

          <section className={styles.group}>
            <div className={styles.row}>
              <span className={styles.text}>
                <span className={styles.name}>What they learn</span>
                <span className={styles.desc}>The skill behind each game and lesson, in plain words</span>
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

          <section className={styles.group} data-place="last">
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
                <p className={styles.desc}>This clears every star, squishy and finished lesson. It can’t be undone.</p>
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
        </PaperCard>

        {/* how this iPad or Chromebook plays: sound, Luna's voice, motion,
            light and dark (DES-29; not "this iPad", it may be a Chromebook) */}
        <PaperCard variant="flat" className={styles.panel} data-shot="this-device">
          <h3 className={styles.panelName}>On this device</h3>

          <section className={styles.group}>
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
          </section>

          <section className={styles.group}>
            <span className={styles.text}>
              <span className={styles.name}>Voice speed</span>
              <span className={styles.desc}>Beginner slows Ms. Luna and the words. Letter sounds stay the same.</span>
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
          </section>

          {/* the screen: how it moves and its light or dark */}
          <section className={styles.group}>
            {/* DES-6: also on when the device's own Reduce Motion is */}
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
            <span className={styles.text}>
              <span className={styles.name}>Day or night</span>
              <span className={styles.desc}>“Match the system” follows the device’s own setting</span>
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
          </section>
        </PaperCard>
      </div>
    </Modal>
  );
};
