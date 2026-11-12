import React, { useState } from 'react';
import type { UserProgress } from '@/types/user';
import { tierFor, type CategoryId, type Difficulty } from '@/apps/reading/engine/content';
import { PICKABLE_WORDS, WEEK_WORDS_MAX } from '@/apps/reading/engine/weekWords';
import { GRADES } from '@/data/readingCurriculum';
import { storageService } from '@/utils/storage';
import { soundManager } from '@/utils/audio';
import { Chip, ChunkyButton, Modal, Tile } from '@/components/kit';
import styles from './WeekWords.module.scss';

interface WeekWordsProps {
  open: boolean;
  progress: UserProgress;
  onBack: () => void;
  onClose: () => void;
}

/** The bank's kinds of thing, in the order the picker shows them, each with a picture tint. */
const KINDS: { id: CategoryId; name: string; tint: 1 | 2 | 3 | 4 | 5 }[] = [
  { id: 'animal', name: 'Animals', tint: 1 },
  { id: 'food', name: 'Food', tint: 2 },
  { id: 'nature', name: 'Outside', tint: 3 },
  { id: 'home', name: 'At home', tint: 4 },
  { id: 'clothes', name: 'Clothes', tint: 5 },
  { id: 'vehicle', name: 'Things that go', tint: 1 },
  { id: 'toy', name: 'Toys', tint: 2 }
];

/** Each grade's own words: the tier its "Just right" plays (DIFFICULTY_TABLE). */
const SETS = GRADES.map(grade => ({ id: grade.id, title: grade.title, tier: tierFor(grade.id, 2) }));

const byWord = new Map(PICKABLE_WORDS.map(w => [w.word, w]));

/**
 * This week's words (CUR-9): the teacher picks up to 10 words her class is
 * working on, by their pictures, and the games deal them first wherever a
 * round can use one (engine/weekWords.ts). Its own wide window behind the
 * grown-up gate, opened from Settings like the cheat sheet. The bank is in
 * buckets: one grade's words at a time, opening on the grade being played,
 * in kinds (Animals, Food…). A tap picks a word or takes it off, and the
 * picked ones sit at the top with a "Clear" for next week. Saved on the
 * device (a setting), so every group playing on it gets the same words. The
 * words are written here, behind the gate; no child's screen shows them.
 */
export const WeekWords: React.FC<WeekWordsProps> = ({ open, progress, onBack, onClose }) => {
  const playing = SETS.find(set => set.id === progress.selectedGrade) ?? SETS[0];
  const [tier, setTier] = useState<Difficulty>(playing.tier);
  const picked = progress.settings.weekWords.filter(word => byWord.has(word));
  const full = picked.length >= WEEK_WORDS_MAX;

  const save = (words: string[]) => {
    soundManager.playPop();
    storageService.updateSettings({ weekWords: words });
  };
  const toggle = (word: string) =>
    save(picked.includes(word) ? picked.filter(w => w !== word) : [...picked, word]);

  const words = PICKABLE_WORDS.filter(w => w.tier === tier);

  return (
    <Modal open={open} onClose={onClose} title="This week’s words" data-shot="week-words" className={styles.sheet}>
      <div className={styles.top}>
        <ChunkyButton icon="arrow-left" onClick={onBack} data-shot="week-back">
          Back
        </ChunkyButton>
        <ChunkyButton
          variant="quiet"
          icon="replay"
          disabled={picked.length === 0}
          onClick={() => save([])}
          data-shot="week-clear"
        >
          Clear for next week
        </ChunkyButton>
      </div>

      <section className={styles.part} data-shot="week-picked">
        <h3 className={styles.partName}>
          Picked: {picked.length} of {WEEK_WORDS_MAX}
        </h3>
        <p className={styles.note}>
          The games deal these first, at every grade they fit: a word comes up from its own grade on. Lessons stay as
          they are. Saved on this device, so every group gets them.
        </p>
        {picked.length > 0 ? (
          <ul className={styles.picked}>
            {picked.map(word => (
              <li key={word} data-word={word}>
                <Chip variant="accent">
                  <span aria-hidden="true">{byWord.get(word)?.emoji}</span> {word}
                </Chip>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.note}>None yet: tap a picture below.</p>
        )}
        {full && <p className={styles.note}>That’s {WEEK_WORDS_MAX}. Tap a picked word to take it off and pick another.</p>}
      </section>

      <section className={styles.part}>
        <span className={styles.grades} role="group" aria-label="Words for">
          {SETS.map(set => (
            <ChunkyButton
              key={set.id}
              aria-pressed={tier === set.tier}
              data-shot={`week-grade-${set.id}`}
              onClick={() => {
                soundManager.playPop();
                setTier(set.tier);
              }}
            >
              {set.title} words
            </ChunkyButton>
          ))}
        </span>
        {KINDS.map(kind => {
          const ofKind = words.filter(w => w.cat === kind.id);
          if (ofKind.length === 0) return null;
          return (
            <div key={kind.id} className={styles.kind}>
              <h4 className={styles.kindName}>{kind.name}</h4>
              <div className={styles.grid}>
                {ofKind.map(w => {
                  const on = picked.includes(w.word);
                  return (
                    <Tile
                      key={w.word}
                      name={w.word}
                      tint={kind.tint}
                      picture={<span className={styles.emoji}>{w.emoji}</span>}
                      aria-pressed={on}
                      disabled={full && !on}
                      onClick={() => toggle(w.word)}
                      data-shot="week-word"
                      data-word={w.word}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </Modal>
  );
};
