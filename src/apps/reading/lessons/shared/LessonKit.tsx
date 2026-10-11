// The pieces every guided-lesson question is drawn with (lessonHooks.ts has
// the behaviour they share).

import React from 'react';
import styles from './LessonKit.module.scss';

/**
 * The thing to listen for: a letter, a sound or a word that is heard, not
 * shown, until it has been found.
 */
export const ListenCue: React.FC<{ onClick: () => void; answer: string | null }> = ({ onClick, answer }) => (
  <button className={styles.lessonListen} data-state={answer ? 'found' : undefined} onClick={onClick} title="Hear it again">
    <span className={styles.listenIcon} aria-hidden="true">{answer ? '✨' : '👂'}</span>
    <span className={styles.listenAnswer}>{answer ?? '?'}</span>
    <span className={styles.listenLabel}>{answer ? 'found it!' : 'tap to listen'}</span>
  </button>
);

/** The question in writing, said aloud on tap. */
export const PromptChip: React.FC<{ text: string; onClick: () => void }> = ({ text, onClick }) => (
  <button className={styles.lessonPrompt} onClick={onClick}>
    <span aria-hidden="true">🔊</span> {text}
  </button>
);
