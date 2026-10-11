import React, { useEffect, useState } from 'react';
import type { GameApi, GameDef } from '../../engine/types';
import { shuffle, tierFor, wordsUpTo, type WordItem } from '../../engine/content';
import { distinctByEmoji, pickWrong, wordChoice } from '../../engine/distractors';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { StagePrompt } from '../shared/StagePrompt/StagePrompt';
import { GameSurface } from '../shared/GameSurface/GameSurface';
import { cx, dataState } from '@/utils/cx';
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
    pronunciation.speakWord(item.word);

    if (item.word === round.missing.word) {
      setFound(true);
      api.win({ delay: 2000 });
    } else {
      setWrong(item.word);
      window.setTimeout(() => setWrong(null), 600);
      api.miss({
        hint: [{ word: item.word }, { text: 'is still on the desk. Which one is not there any more?' }]
      });
    }
  };

  const visible = phase === 'guess' && !found ? round.items.filter(i => i.word !== round.missing.word) : round.items;

  return (
    <GameSurface className={styles.missing}>
      <div className={styles.deskScene}>
        <div className={styles.deskCurtain}
          data-state={dataState(phase === 'curtain' ? 'sweeping' : false, phase === 'guess' ? 'gone' : false)}>
          <span aria-hidden="true">✨</span>
        </div>

        <div className={styles.deskTop}>
          {visible.map(item => (
            <span key={item.word} className={styles.deskItem} title={item.word}>
              <span className={styles.itemEmoji}>{item.emoji}</span>
              {phase === 'look' && <span className={styles.itemWord}>{item.word}</span>}
            </span>
          ))}
          {found && (
            <span className={styles.deskItem} data-state="returned">
              <span className={styles.itemEmoji}>{round.missing.emoji}</span>
              <span className={styles.itemWord}>{round.missing.word}</span>
            </span>
          )}
        </div>

        <div className={styles.deskEdge} aria-hidden="true" />
      </div>

      {phase === 'look' && (
        <div className={styles.lookTimer}>
          <span className={styles.timerLabel}>Memorise!</span>
          <span className={styles.timerCount}>{Math.max(1, countdown)}</span>
        </div>
      )}

      {phase === 'curtain' && <StagePrompt>Luna is taking something…</StagePrompt>}

      {phase === 'guess' && (
        <div className={styles.missingChoices}>
          <StagePrompt>What disappeared?</StagePrompt>
          <div className={styles.choiceRow}>
            {round.options.map(opt => (
              <button
                key={opt.word}
                className={styles.missingChoice}
                data-state={dataState(wrong === opt.word ? 'wrong' : false, found && opt.word === round.missing.word ? 'right' : false)}
                onClick={() => guess(opt)}
              >
                {round.wordChoices ? (
                  <span className={styles.choiceWord}>{opt.word}</span>
                ) : (
                  <>
                    <span className={styles.choiceEmoji}>{opt.emoji}</span>
                    <span className={cx(styles.choiceWord, styles.small)}>{opt.word}</span>
                  </>
                )}
              </button>
            ))}
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
