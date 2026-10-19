import React, { useEffect, useState } from 'react';
import type { GameApi, GameDef } from '../../engine/types';
import {
  GAP,
  maskKey,
  passagesFor,
  pick,
  readWithGap,
  shuffle,
  type BlankItem,
  type PassageItem
} from '../../engine/content';
import { pickWrong, textChoice } from '../../engine/distractors';
import { pronunciation, type SpeechPart } from '@/utils/pronunciation';
import { Choice, ChunkyButton, Icon, PaperCard } from '@/components/kit';
import { afterMotion } from '@/utils/motion';
import { GameSurface } from '../shared/GameSurface/GameSurface';
import { dataState } from '@/utils/cx';
import styles from './TreasureRead.module.scss';

interface Round {
  kind: 'cloze' | 'truefalse';
  passage: PassageItem;
  /** the claim to judge, or the blank statement with its key as a gap */
  statement: string;
  /** a fill-in-the-blank round's statement, with its list of words that also fit */
  blank?: BlankItem;
  options: string[];
  answer: string;
  /** what "Read it to me" says until the round is solved: never the missing word */
  readBefore: SpeechPart[];
  /** and once it is solved */
  readAfter: SpeechPart[];
}

function buildRound(passage: PassageItem, kind: Round['kind']): Round {
  const lines: SpeechPart[] = passage.lines.map(text => ({ text }));

  if (kind === 'truefalse') {
    const { claim, isTrue } = pick(passage.truth);
    const read = [...lines, { text: 'Is this true?' }, { text: claim }];
    return {
      kind,
      passage,
      statement: claim,
      options: ['True', 'False'],
      answer: isTrue ? 'True' : 'False',
      readBefore: read,
      readAfter: read
    };
  }

  const blank = pick(passage.blanks);
  const statement = maskKey(blank);
  // a wrong word already in the statement is no choice at all, and neither is
  // one the blank lists as also making it true
  const decoys = pickWrong(blank.key, blank.decoys, 2, {
    as: textChoice,
    onScreen: statement.split(/\s+/).map(w => w.replace(/[^a-zA-Z']/g, '')),
    blank: { alsoFits: blank.alsoFits }
  });
  return {
    kind,
    passage,
    statement,
    blank,
    options: shuffle([blank.key, ...decoys]),
    answer: blank.key,
    // until the gap is filled, the statement is read with "what?" in it
    readBefore: [...lines, ...readWithGap(blank)],
    readAfter: [...lines, { text: blank.text }]
  };
}

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  // whether this round has an answer yet: its opening question waits for none (BUG-28)
  const { answered } = api;
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  // "show me" (FB-2): the right stone glows from the third miss
  const [shown, setShown] = useState(false);
  const step = api.ctx.roundIndex;
  const total = api.ctx.totalRounds;
  // Kindergarten is a read-along. From 1st grade the passage is the child's
  // to read first, as in the lessons: it stays silent until they have
  // answered once, and a wrong answer unlocks "Read it to me".
  const readAlong = api.ctx.grade === 'kindergarten';
  const tried = solved || api.attempts > 0;

  useEffect(() => {
    const t = window.setTimeout(() => {
      // not once the round has an answer: it would cut it off (BUG-28)
      if (answered()) return;
      if (round.kind === 'truefalse' && readAlong) {
        pronunciation.speakSequence(round.readBefore);
      } else if (round.kind === 'truefalse') {
        pronunciation.speakText('Read the story. Is it true or false?');
      } else {
        pronunciation.speakText('Read the story and choose the missing word.');
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [round, readAlong, answered]);

  const readToMe = () => pronunciation.speakSequence(solved ? round.readAfter : round.readBefore);

  const choose = (option: string) => {
    if (api.locked || solved) return;

    if (option === round.answer) {
      setSolved(true);
      // the finished sentence, read back whole before Luna cheers (FB-1, BUG-1)
      api.answer({ correct: true, say: round.blank ? [{ text: round.blank.text }] : undefined, delay: 2400 });
    } else {
      // a wrong answer wobbles, and clears when its wobble ends (components.md)
      setWrong(option);
      afterMotion('emphasis', () => setWrong(null));
      api.answer({
        correct: false,
        reveal: () => setShown(true),
        hint:
          round.kind === 'truefalse'
            ? [{ text: 'Read the story once more.' }, { text: 'Does it say the same thing?' }]
            : [{ text: 'Try the sentence with' }, { word: option }, { text: 'in the gap. Does it sound right?' }]
      });
    }
  };

  const open = solved && step === total - 1;

  return (
    <GameSurface>
      {/* the current stone's glow says where you are; Luna stays on her perch,
          one Luna per screen (DES-12) */}
      <div className={styles.path} aria-label={`Stone ${step + 1} of ${total}`}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={styles.stone} data-state={dataState(i < step ? 'passed' : false, i === step ? 'current' : false)}>
            {i < step ? <Icon name="check" size={20} /> : i + 1}
          </span>
        ))}
        {/* the treasure at the end: a star, filled once the last stone is read */}
        <span className={styles.chest} data-state={open ? 'open' : undefined}>
          <Icon name="star" size={32} filled={open} />
        </span>
      </div>

      {/* the stone being read (GAME-1c): its picture and "Read it to me" beside
          the passage, as Story Corner's book sets its cover beside the story,
          so a 2nd-grade passage of 50 words has the width it needs */}
      <PaperCard className={styles.story} data-shot="treasure-stone">
        <div className={styles.side}>
          <span className={styles.picture}>{round.passage.emoji}</span>
          <ChunkyButton
            variant="prompt"
            icon="speaker"
            data-shot="read-to-me"
            onClick={readToMe}
            disabled={!readAlong && !tried}
            title={readAlong || tried ? 'Hear the story' : 'Try it first!'}
          >
            Read it to me
          </ChunkyButton>
        </div>
        <p className={styles.passage} data-shot="treasure-passage">{round.passage.lines.join(' ')}</p>
      </PaperCard>

      {/* the question under it: a claim to judge, or a sentence with a gap */}
      <PaperCard variant="flat" className={styles.question} data-shot="treasure-question">
        {round.kind === 'truefalse' ? (
          <p className={styles.claim} data-shot="treasure-claim">“{round.statement}”</p>
        ) : (
          <p className={styles.sentence} data-shot="treasure-sentence">
            {round.statement.split(GAP).map((chunk, i, arr) => (
              <React.Fragment key={i}>
                {chunk}
                {i < arr.length - 1 && (
                  <span className={styles.gap} data-shot="treasure-gap" data-state={solved ? 'filled' : undefined}>{solved ? round.answer : '?'}</span>
                )}
              </React.Fragment>
            ))}
          </p>
        )}
      </PaperCard>

      <div className={styles.options}>
        {round.options.map(option => (
          <Choice
            key={option}
            kind="word"
            state={
              wrong === option
                ? 'wrong'
                : solved
                  ? option === round.answer ? 'right' : 'faded'
                  : shown && option === round.answer ? 'revealed' : 'idle'
            }
            aria-label={option}
            onClick={() => choose(option)}
          >
            {round.kind === 'truefalse' ? (
              <span className={styles.truth}>
                <Icon name={option === 'True' ? 'check' : 'close'} size={32} />
                {option}
              </span>
            ) : (
              option
            )}
          </Choice>
        ))}
      </div>
    </GameSurface>
  );
};

export const treasureRead: GameDef<Round> = {
  id: 'treasure-read',
  title: 'Treasure Path',
  emoji: '🗺️',
  tagline: 'Read each stone to step closer to the chest.',
  objective: 'Reading comprehension — read a short story, then judge true or false and fill in the missing word.',
  skill: 'reading',
  mission: 'Read every stone carefully or we will never reach the treasure!',
  roundsPerPlay: 5,
  // a passage to read each stone (PRG-6's first guess)
  roundSeconds: 60,
  shape: 'map',
  sticker: 'chest',
  // Passages are written per grade, so the grade picks them; the dial doesn't
  // change them yet (LVL-1 sets what it does).
  makeRounds: ({ grade, count }) => {
    const passages = shuffle(passagesFor(grade)).slice(0, count);
    // every play has both kinds: one of each, then either at random
    const kinds = shuffle(
      passages.map((_, i): Round['kind'] =>
        i === 0 ? 'cloze' : i === 1 ? 'truefalse' : Math.random() < 0.5 ? 'cloze' : 'truefalse'
      )
    );
    return passages.map((passage, i) => buildRound(passage, kinds[i]));
  },
  Play
};
