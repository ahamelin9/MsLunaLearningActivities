import React, { useEffect, useState } from 'react';
import type { GameApi, GameDef } from '../engine/types';
import { GAP, maskKey, pick, readWithGap, sample, sentencesFor, shuffle, tierFor, type SentenceItem } from '../engine/content';
import { pronunciation, type SpeechPart } from '../../../utils/pronunciation';

interface Round {
  kind: 'cloze' | 'truefalse';
  sentence: SentenceItem;
  /** sentence with the key word replaced by a gap */
  masked: string;
  options: string[];
  answer: string;
  claim?: string;
  /** a cloze sentence read with "what?" in the gap, so hearing it gives nothing away */
  gapRead?: SpeechPart[];
}

function buildRound(tier: 1 | 2 | 3): Round {
  const sentence = pick(sentencesFor(tier));
  const useTrueFalse = !!sentence.truth && Math.random() < 0.4;

  if (useTrueFalse && sentence.truth) {
    const claim = pick(sentence.truth);
    return {
      kind: 'truefalse',
      sentence,
      masked: sentence.text,
      options: ['True', 'False'],
      answer: claim.isTrue ? 'True' : 'False',
      claim: claim.claim
    };
  }

  return {
    kind: 'cloze',
    sentence,
    masked: maskKey(sentence),
    gapRead: readWithGap(sentence),
    options: shuffle([sentence.key, ...sample(sentence.decoys, 2)]),
    answer: sentence.key
  };
}

const STONE_LABELS = ['🌿', '🪨', '🌴', '🦜', '⛰️', '🏝️'];

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const step = api.ctx.roundIndex;
  const total = api.ctx.totalRounds;

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (round.kind === 'truefalse') {
        pronunciation.speakSequence([
          { text: round.sentence.text },
          { text: 'Is this true?' },
          { text: round.claim ?? '' }
        ]);
      } else {
        pronunciation.speakText('Read the sentence and choose the missing word.');
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [round]);

  const choose = (option: string) => {
    if (api.locked || solved) return;

    if (option === round.answer) {
      setSolved(true);
      pronunciation.speakSentence(round.sentence.text);
      api.win({ delay: 2400 });
    } else {
      setWrong(option);
      window.setTimeout(() => setWrong(null), 600);
      api.miss({
        hint:
          round.kind === 'truefalse'
            ? [
                { text: 'Read the sentence once more.' },
                { text: round.sentence.text },
                { text: 'Now check the claim word by word.' }
              ]
            : [{ text: 'Try the sentence with' }, { word: option }, { text: 'in the gap. Does it sound right?' }]
      });
    }
  };

  return (
    <div className="game-surface treasure">
      <div className="treasure-path" aria-label={`Stone ${step + 1} of ${total}`}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`stone ${i < step ? 'passed' : ''} ${i === step ? 'current' : ''}`}>
            <span className="stone-face">{STONE_LABELS[i % STONE_LABELS.length]}</span>
            {i === step && <span className={`walker ${solved ? 'is-hopping' : ''}`}>🦉</span>}
          </span>
        ))}
        <span className={`chest ${solved && step === total - 1 ? 'is-open' : ''}`}>
          {solved && step === total - 1 ? '💎' : '🧰'}
        </span>
      </div>

      <div className="treasure-scroll">
        <span className="scroll-emoji">{round.sentence.emoji}</span>

        {round.kind === 'truefalse' ? (
          <>
            <p className="scroll-sentence">{round.sentence.text}</p>
            <p className="scroll-claim">“{round.claim}”</p>
          </>
        ) : (
          <p className="scroll-sentence">
            {round.masked.split(GAP).map((chunk, i, arr) => (
              <React.Fragment key={i}>
                {chunk}
                {i < arr.length - 1 && (
                  <span className={`gap ${solved ? 'is-filled' : ''}`}>{solved ? round.answer : '?'}</span>
                )}
              </React.Fragment>
            ))}
          </p>
        )}

        <button
          className="speak-chip"
          onClick={() =>
            // until the gap is filled, reading the whole sentence would say the answer
            round.gapRead && !solved
              ? pronunciation.speakSequence(round.gapRead)
              : pronunciation.speakSentence(round.sentence.text)
          }
        >
          🔊 Read it to me
        </button>
      </div>

      <div className={`treasure-options ${round.kind === 'truefalse' ? 'is-binary' : ''}`}>
        {round.options.map(option => (
          <button
            key={option}
            className={`treasure-option ${wrong === option ? 'is-wrong' : ''} ${
              solved && option === round.answer ? 'is-right' : ''
            }`}
            onClick={() => choose(option)}
          >
            {round.kind === 'truefalse' && <span className="tf-icon">{option === 'True' ? '✅' : '❌'}</span>}
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export const treasureRead: GameDef<Round> = {
  id: 'treasure-read',
  title: 'Treasure Path',
  emoji: '🗺️',
  tagline: 'Read each stone to step closer to the chest.',
  objective: 'Sentence comprehension — choose the missing word and judge true or false.',
  skill: 'reading',
  mission: 'Read every stone carefully or we will never reach the treasure!',
  roundsPerPlay: 5,
  shape: 'map',
  sticker: 'chest',
  makeRounds: ({ grade, difficulty, count }) => {
    const tier = tierFor(grade, difficulty);
    const rounds: Round[] = [];
    const used = new Set<string>();
    let guard = 0;
    while (rounds.length < count && guard < 40) {
      guard++;
      const r = buildRound(tier);
      const key = `${r.sentence.text}-${r.kind}`;
      if (used.has(key)) continue;
      used.add(key);
      rounds.push(r);
    }
    while (rounds.length < count) rounds.push(buildRound(tier));
    return rounds;
  },
  Play
};
