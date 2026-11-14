import React, { useEffect, useState } from 'react';
import type { GameApi, GameDef } from '../../engine/types';
import { shuffle, tierFor, wordsUpTo, type WordItem } from '../../engine/content';
import { dealWeekFirst } from '../../engine/deck';
import { ROUNDS_PER_PLAY } from '../../engine/practice';
import { isWeekWord } from '../../engine/weekWords';
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
  /**
   * one wrong choice begins as the missing word does (CUR-19), so its first
   * letter alone doesn't give it away
   */
  startsAlike: boolean;
}

const firstLetter = (w: WordItem) => w.word.charAt(0).toLowerCase();

function buildRound(tier: 1 | 2 | 3, missing: WordItem, startsAlike: boolean): Round {
  const count = tier === 1 ? 4 : tier === 2 ? 5 : 6;
  // the one that goes missing has its turn (GAME-8); the desk fills in around it
  const items = shuffle(distinctByEmoji(wordsUpTo(tier), count, [], [missing]));
  const pool = wordsUpTo(tier);
  // never something still on the desk, or the answer is just "the one I can't see"
  const opts = { as: wordChoice, onScreen: items.filter(i => i.word !== missing.word) };

  // Alex (2026-11-13): "ship and shoe or something to trip them up sometimes".
  // The same beginning sound where the bank has a fair one, else the same letter
  let alike: WordItem[] = [];
  if (startsAlike) {
    alike = pickWrong(missing, pool.filter(w => w.initial === missing.initial), 1, opts);
    if (alike.length === 0) alike = pickWrong(missing, pool.filter(w => firstLetter(w) === firstLetter(missing)), 1, opts);
  }
  // the rest from anywhere, fair beside the one that starts alike
  const rest = pickWrong(missing, pool, 2 - alike.length, { ...opts, onScreen: [...opts.onScreen, ...alike] });

  return {
    items,
    missing,
    options: shuffle([missing, ...alike, ...rest]),
    wordChoices: tier >= 2,
    lookSeconds: tier === 1 ? 5 : tier === 2 ? 4 : 3,
    startsAlike: alike.length > 0
  };
}

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  const [phase, setPhase] = useState<'look' | 'curtain' | 'guess'>('look');
  const [countdown, setCountdown] = useState(round.lookSeconds);
  const [found, setFound] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  // "show me" (FB-2): the missing one glows from the third miss
  const [shown, setShown] = useState(false);
  // stable, so the round's timers aren't set again on a render
  const { asking } = api;

  useEffect(() => {
    pronunciation.speakText('Look carefully at my desk...');
    const tick = window.setInterval(() => setCountdown(c => c - 1), 1000);
    const toCurtain = window.setTimeout(() => setPhase('curtain'), round.lookSeconds * 1000);
    const toGuess = window.setTimeout(() => {
      setPhase('guess');
      soundManager.playPop();
      pronunciation.speakText('What is missing?');
      // the round's countdown starts now (CUR-16), with its question (CUR-18)
      asking();
    }, round.lookSeconds * 1000 + 1100);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(toCurtain);
      window.clearTimeout(toGuess);
    };
  }, [round.lookSeconds, asking]);

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
        // true of every wrong choice: none was on the desk (BUG-33)
        hint: [{ word: item.word }, { text: 'was not on my desk. Which one did I take away?' }]
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
          <span className={styles.label}>Memorize!</span>
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
  tagline: 'Memorize Luna’s desk. She takes one thing away.',
  objective: 'New words: remembers the pictures on Luna’s desk with their words, then finds the one she took away.',
  skill: 'vocabulary',
  mission: 'Look hard at my desk… I am about to take something!',
  // about 20 a play, as a lesson (CUR-15)
  roundsPerPlay: ROUNDS_PER_PLAY,
  // a few seconds to look, then one to find (CUR-15's first guess, until real plays are timed)
  roundSeconds: 15,
  shape: 'desk',
  // the missing one to find, against the clock at 1st and 2nd grade (CUR-16),
  // from when the desk is hidden: the looking has its own count
  timer: () => 'listen',
  waitsToAsk: true,
  sticker: 'lamp',
  makeRounds: ({ grade, difficulty, count }) => {
    const tier = tierFor(grade, difficulty);
    // this week's words go missing first (CUR-9)
    const missing = dealWeekFirst('whats-missing', wordsUpTo(tier), count, w => w.word, w => isWeekWord(w.word));
    // half the rounds offer a wrong choice that starts alike, spread through
    // the play (CUR-19). Rounds are built in a random order, and one whose
    // word has nothing fair that starts like it passes its turn on
    const rounds: Round[] = [];
    let alikeLeft = Math.floor(missing.length / 2);
    for (const i of shuffle(missing.map((_, i) => i))) {
      rounds[i] = buildRound(tier, missing[i], alikeLeft > 0);
      if (rounds[i].startsAlike) alikeLeft--;
    }
    return rounds;
  },
  Play
};
