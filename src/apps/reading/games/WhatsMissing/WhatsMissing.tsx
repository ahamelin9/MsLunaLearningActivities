import React, { useEffect, useState } from 'react';
import type { GameApi, GameDef } from '../../engine/types';
import { shuffle, tierFor, wordsUpTo, type WordItem } from '../../engine/content';
import { distinctByEmoji, pickWrong, wordChoice } from '../../engine/distractors';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { StagePrompt } from '../shared/StagePrompt/StagePrompt';
import { GameSurface } from '../shared/GameSurface/GameSurface';
import { dataState } from '@/utils/cx';
import { afterMotion } from '@/utils/motion';
import { Choice, Icon } from '@/components/kit';
import styles from './WhatsMissing.module.scss';

interface Round {
  items: WordItem[];
  missing: WordItem;
  options: WordItem[];
  /** show words instead of pictures in the answer row */
  wordChoices: boolean;
  lookSeconds: number;
}

function buildRound(tier: 1 | 2 | 3): Round {
  const count = tier === 1 ? 4 : tier === 2 ? 5 : 6;
  const items = distinctByEmoji(wordsUpTo(tier), count);
  const missing = items[Math.floor(Math.random() * items.length)];
  // never something still on the desk, or the answer is just "the one I can't see"
  const distractors = pickWrong(missing, wordsUpTo(tier), 2, {
    as: wordChoice,
    onScreen: items.filter(i => i.word !== missing.word)
  });

  return {
    items,
    missing,
    options: shuffle([missing, ...distractors]),
    wordChoices: tier >= 2,
    lookSeconds: tier === 1 ? 5 : tier === 2 ? 4 : 3
  };
}

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  const [phase, setPhase] = useState<'look' | 'curtain' | 'guess'>('look');
  const [countdown, setCountdown] = useState(round.lookSeconds);
  const [found, setFound] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  // "show me" (FB-2): the missing one glows from the third miss
  const [shown, setShown] = useState(false);

  useEffect(() => {
    pronunciation.speakText('Look carefully at my desk...');
    const tick = window.setInterval(() => setCountdown(c => c - 1), 1000);
    const toCurtain = window.setTimeout(() => setPhase('curtain'), round.lookSeconds * 1000);
    const toGuess = window.setTimeout(() => {
      setPhase('guess');
      soundManager.playPop();
      pronunciation.speakText('What is missing?');
    }, round.lookSeconds * 1000 + 1100);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(toCurtain);
      window.clearTimeout(toGuess);
    };
  }, [round.lookSeconds]);

  const guess = (item: WordItem) => {
    if (api.locked || phase !== 'guess' || found) return;

    // the word, said whole before Luna reacts (FB-1)
    if (item.word === round.missing.word) {
      setFound(true);
      api.answer({ correct: true, say: [{ word: item.word }], delay: 2000 });
    } else {
      // a wrong pick wobbles, and clears when its wobble ends (components.md)
      setWrong(item.word);
      afterMotion('emphasis', () => setWrong(null));
      api.answer({
        correct: false,
        say: [{ word: item.word }],
        reveal: () => setShown(true),
        hint: [{ word: item.word }, { text: 'is still on the desk. Which one is not there any more?' }]
      });
    }
  };

  const visible = phase === 'guess' && !found ? round.items.filter(i => i.word !== round.missing.word) : round.items;

  return (
    <GameSurface>
      <div className={styles.desk}>
        {/* the curtain slides across while Luna takes something, then off again */}
        <div className={styles.curtain}
          data-state={dataState(phase === 'curtain' ? 'sweeping' : false, phase === 'guess' ? 'gone' : false)}>
          <Icon name="sparkle" size={40} filled />
        </div>

        <div className={styles.top}>
          {visible.map(item => (
            <span key={item.word} className={styles.item} title={item.word}>
              <span className={styles.picture}>{item.emoji}</span>
              {phase === 'look' && <span className={styles.word}>{item.word}</span>}
            </span>
          ))}
          {found && (
            <span className={styles.item} data-state="returned">
              <span className={styles.picture}>{round.missing.emoji}</span>
              <span className={styles.word}>{round.missing.word}</span>
            </span>
          )}
        </div>

        <div className={styles.edge} aria-hidden="true" />
      </div>

      {phase === 'look' && (
        <div className={styles.timer}>
          <span className={styles.label}>Memorise!</span>
          {/* a fresh key each second, so the count pops as it changes */}
          <span key={countdown} className={styles.count}>{Math.max(1, countdown)}</span>
        </div>
      )}

      {phase === 'curtain' && <StagePrompt>Luna is taking something…</StagePrompt>}

      {phase === 'guess' && (
        <div className={styles.choices}>
          <StagePrompt>What disappeared?</StagePrompt>
          <div className={styles.row}>
            {round.options.map(opt => {
              const isAnswer = opt.word === round.missing.word;
              return (
                <Choice
                  key={opt.word}
                  kind={round.wordChoices ? 'word' : 'picture'}
                  state={wrong === opt.word ? 'wrong' : found ? (isAnswer ? 'right' : 'faded') : shown && isAnswer ? 'revealed' : 'idle'}
                  // every choice is named: the target is the one that's gone, never shown
                  caption={round.wordChoices ? undefined : opt.word}
                  aria-label={opt.word}
                  onClick={() => guess(opt)}
                >
                  {round.wordChoices ? opt.word : opt.emoji}
                </Choice>
              );
            })}
          </div>
        </div>
      )}
    </GameSurface>
  );
};

export const whatsMissing: GameDef<Round> = {
  id: 'whats-missing',
  title: 'What’s Missing?',
  emoji: '🔦',
  tagline: 'Memorise Luna’s desk. She takes one thing away.',
  objective: 'Vocabulary recall — hold picture and word together in memory.',
  skill: 'vocabulary',
  mission: 'Look hard at my desk… I am about to take something!',
  roundsPerPlay: 4,
  shape: 'desk',
  sticker: 'lamp',
  makeRounds: ({ grade, difficulty, count }) => {
    const tier = tierFor(grade, difficulty);
    return Array.from({ length: count }, () => buildRound(tier));
  },
  Play
};
