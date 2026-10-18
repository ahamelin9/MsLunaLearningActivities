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
import { ChunkyButton } from '@/components/kit';
import { GameSurface } from '../shared/GameSurface/GameSurface';
import { cx, dataState } from '@/utils/cx';
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

const STONE_LABELS = ['🌿', '🪨', '🌴', '🦜', '⛰️', '🏝️'];

/**
 * The passage on the stone. A stopgap (GAME-1b) in the current style, until
 * GAME-1c redraws the stone on the DES-2 design: it only needs the lines, and
 * its look lives in `.treasure-passage` in games.scss.
 */
const TreasurePassage: React.FC<{ lines: string[] }> = ({ lines }) => (
  <p className={styles.treasurePassage}>{lines.join(' ')}</p>
);

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const step = api.ctx.roundIndex;
  const total = api.ctx.totalRounds;
  // Kindergarten is a read-along. From 1st grade the passage is the child's
  // to read first, as in the lessons: it stays silent until they have
  // answered once, and a wrong answer unlocks "Read it to me".
  const readAlong = api.ctx.grade === 'kindergarten';
  const tried = solved || api.attempts > 0;

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (round.kind === 'truefalse' && readAlong) {
        pronunciation.speakSequence(round.readBefore);
      } else if (round.kind === 'truefalse') {
        pronunciation.speakText('Read the story. Is it true or false?');
      } else {
        pronunciation.speakText('Read the story and choose the missing word.');
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [round, readAlong]);

  const readToMe = () => pronunciation.speakSequence(solved ? round.readAfter : round.readBefore);

  const choose = (option: string) => {
    if (api.locked || solved) return;

    if (option === round.answer) {
      setSolved(true);
      if (round.blank) pronunciation.speakSentence(round.blank.text);
      api.win({ delay: 2400 });
    } else {
      setWrong(option);
      window.setTimeout(() => setWrong(null), 600);
      api.miss({
        hint:
          round.kind === 'truefalse'
            ? [{ text: 'Read the story once more.' }, { text: 'Does it say the same thing?' }]
            : [{ text: 'Try the sentence with' }, { word: option }, { text: 'in the gap. Does it sound right?' }]
      });
    }
  };

  return (
    <GameSurface className={styles.treasure}>
      {/* the current stone's glow says where you are; Luna stays on her perch,
          one Luna per screen (DES-12) */}
      <div className={styles.treasurePath} aria-label={`Stone ${step + 1} of ${total}`}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={styles.stone} data-state={dataState(i < step ? 'passed' : false, i === step ? 'current' : false)}>
            <span>{STONE_LABELS[i % STONE_LABELS.length]}</span>
          </span>
        ))}
        <span className={styles.chest} data-state={solved && step === total - 1 ? 'open' : undefined}>
          {solved && step === total - 1 ? '💎' : '🧰'}
        </span>
      </div>

      <div className={cx(styles.treasureScroll, styles.hasPassage)}>
        <span className={styles.scrollEmoji}>{round.passage.emoji}</span>
        <TreasurePassage lines={round.passage.lines} />

        {round.kind === 'truefalse' ? (
          <p className={styles.scrollClaim}>“{round.statement}”</p>
        ) : (
          <p className={styles.scrollSentence}>
            {round.statement.split(GAP).map((chunk, i, arr) => (
              <React.Fragment key={i}>
                {chunk}
                {i < arr.length - 1 && (
                  <span className={styles.gap} data-state={solved ? 'filled' : undefined}>{solved ? round.answer : '?'}</span>
                )}
              </React.Fragment>
            ))}
          </p>
        )}

        <ChunkyButton
          variant="prompt"
          icon="speaker"
          onClick={readToMe}
          disabled={!readAlong && !tried}
          title={readAlong || tried ? 'Hear the story' : 'Try it first!'}
        >
          Read it to me
        </ChunkyButton>
      </div>

      <div className={styles.treasureOptions} data-state={round.kind === 'truefalse' ? 'binary' : undefined}>
        {round.options.map(option => (
          <button
            key={option}
            className={styles.treasureOption}
            data-state={dataState(wrong === option ? 'wrong' : false, solved && option === round.answer ? 'right' : false)}
            onClick={() => choose(option)}
          >
            {round.kind === 'truefalse' && <span>{option === 'True' ? '✅' : '❌'}</span>}
            {option}
          </button>
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
