// The pieces every guided-lesson question is drawn with (lessonHooks.ts has
// the behaviour they share).

import React from 'react';
import './lesson.scss';

/**
 * The thing to listen for: a letter, a sound or a word that is heard, not
 * shown, until it has been found.
 */
export const ListenCue: React.FC<{ onClick: () => void; answer: string | null }> = ({ onClick, answer }) => (
  <button className={`lesson-listen ${answer ? 'is-found' : ''}`} onClick={onClick} title="Hear it again">
    <span className="listen-icon" aria-hidden="true">{answer ? '✨' : '👂'}</span>
    <span className="listen-answer">{answer ?? '?'}</span>
    <span className="listen-label">{answer ? 'found it!' : 'tap to listen'}</span>
  </button>
);

/** The question in writing, said aloud on tap. */
export const PromptChip: React.FC<{ text: string; onClick: () => void }> = ({ text, onClick }) => (
  <button className="lesson-prompt" onClick={onClick}>
    <span aria-hidden="true">🔊</span> {text}
  </button>
);
