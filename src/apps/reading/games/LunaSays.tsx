import React, { useEffect, useState } from 'react';
import type { GameApi, GameDef } from '../engine/types';
import {
  CATEGORIES,
  distinctByEmoji,
  pick,
  sample,
  sentencesFor,
  shuffle,
  tierFor,
  wordsUpTo,
  type WordItem
} from '../engine/content';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';

type Kind = 'word' | 'sentence' | 'category' | 'trick';

interface Choice {
  id: string;
  emoji: string;
  word: string;
}

interface Round {
  kind: Kind;
  /** exactly what Luna says out loud */
  spoken: string;
  /** shown only after the round is solved */
  reveal: string;
  answerId: string;
  choices: Choice[];
  /** true when the child should press the paw instead of a picture */
  isTrap: boolean;
  rule?: string;
}

function toChoice(w: WordItem, i: number): Choice {
  return { id: `${w.word}-${i}`, emoji: w.emoji, word: w.word };
}

function buildRound(tier: 1 | 2 | 3): Round {
  const kinds: Kind[] =
    tier === 1 ? ['word', 'word', 'category'] : tier === 2 ? ['word', 'sentence', 'category'] : ['sentence', 'category', 'trick'];
  const kind = pick(kinds);
  const optionCount = tier === 1 ? 3 : 4;

  if (kind === 'sentence') {
    const sentence = pick(sentencesFor(tier));
    const others = sample(
      sentencesFor(tier).filter(s => s.emoji !== sentence.emoji),
      optionCount - 1
    );
    const choices = shuffle(
      [sentence, ...others].map((s, i) => ({ id: `s-${i}-${s.emoji}`, emoji: s.emoji, word: s.key }))
    );
    const answer = choices.find(c => c.emoji === sentence.emoji)!;
    return {
      kind,
      spoken: sentence.text,
      reveal: sentence.text,
      answerId: answer.id,
      choices,
      isTrap: false
    };
  }

  if (kind === 'category') {
    const category = pick(CATEGORIES.filter(c => wordsUpTo(tier).filter(w => w.cat === c.id).length >= 1));
    const target = pick(wordsUpTo(tier).filter(w => w.cat === category.id));
    const others = distinctByEmoji(
      wordsUpTo(tier).filter(w => w.cat !== category.id),
      optionCount - 1,
      [target.emoji]
    );
    const choices = shuffle([target, ...others].map(toChoice));
    const answer = choices.find(c => c.word === target.word)!;
    return {
      kind,
      spoken: `Luna says… tap something you would find in ${category.label.toLowerCase()}.`,
      reveal: `${target.word} — that is ${category.label.toLowerCase()}!`,
      answerId: answer.id,
      choices,
      isTrap: false
    };
  }

  // word + trick share the same picture layout
  const target = pick(wordsUpTo(tier));
  const others = distinctByEmoji(
    wordsUpTo(tier).filter(w => w.word !== target.word),
    optionCount - 1,
    [target.emoji]
  );
  const choices = shuffle([target, ...others].map(toChoice));
  const answer = choices.find(c => c.word === target.word)!;

  if (kind === 'trick') {
    const trapped = Math.random() < 0.5;
    return {
      kind,
      spoken: trapped ? `Tap the ${target.word}.` : `Luna says… tap the ${target.word}.`,
      reveal: trapped ? 'I never said “Luna says”!' : `Luna says: ${target.word}`,
      answerId: trapped ? 'paw' : answer.id,
      choices,
      isTrap: trapped,
      rule: 'Only tap a picture if you hear “Luna says”. If not — press the paw!'
    };
  }

  return {
    kind,
    spoken: `Luna says… find the ${target.word}.`,
    reveal: target.word,
    answerId: answer.id,
    choices,
    isTrap: false
  };
}

const Play: React.FC<{ round: Round; api: GameApi }> = ({ round, api }) => {
  const [solved, setSolved] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  const sayIt = () => {
    setListening(true);
    soundManager.playLetterTap();
    pronunciation.speakSentence(round.spoken, { onEnd: () => setListening(false) });
    window.setTimeout(() => setListening(false), 4200);
  };

  useEffect(() => {
    const t = window.setTimeout(sayIt, 650);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answer = (id: string) => {
    if (api.locked || solved) return;

    if (id === round.answerId) {
      setSolved(true);
      api.win({ delay: 2000 });
    } else {
      setWrongId(id);
      window.setTimeout(() => setWrongId(null), 600);
      api.miss({
        lunaLine: round.isTrap ? 'Careful! I did not say “Luna says”.' : undefined,
        hint: round.isTrap
          ? 'Listen for the magic words “Luna says” before you tap a picture.'
          : 'Press the big ear to hear me again, then look at each picture.'
      });
    }
  };

  return (
    <div className="game-surface says">
      {round.rule && <p className="says-rule">{round.rule}</p>}

      <button className={`big-ear ${listening ? 'is-listening' : ''}`} onClick={sayIt}>
        <span className="ear-icon" aria-hidden="true">🎧</span>
        <span className="ear-label">{listening ? 'Listening…' : 'Play it again'}</span>
        <span className="ear-waves" aria-hidden="true">
          <i /><i /><i />
        </span>
      </button>

      <div className="says-choices">
        {round.choices.map(choice => (
          <button
            key={choice.id}
            className={`says-choice ${wrongId === choice.id ? 'is-wrong' : ''} ${
              solved && choice.id === round.answerId ? 'is-right' : ''
            }`}
            onClick={() => answer(choice.id)}
            aria-label={choice.word}
          >
            <span className="says-emoji">{choice.emoji}</span>
            {solved && <span className="says-word">{choice.word}</span>}
          </button>
        ))}
      </div>

      {round.isTrap || round.kind === 'trick' ? (
        <button
          className={`stop-paw ${solved && round.answerId === 'paw' ? 'is-right' : ''} ${
            wrongId === 'paw' ? 'is-wrong' : ''
          }`}
          onClick={() => answer('paw')}
        >
          🐾 She didn’t say it!
        </button>
      ) : null}

      {solved && <p className="says-reveal">{round.reveal}</p>}
    </div>
  );
};

export const lunaSays: GameDef<Round> = {
  id: 'luna-says',
  title: 'Luna Says',
  emoji: '🎧',
  tagline: 'Ears only. No words on screen.',
  objective: 'Listening comprehension — match spoken words and sentences to meaning.',
  skill: 'listening',
  mission: 'Ears ready? I will only say it out loud — no peeking at words!',
  roundsPerPlay: 5,
  shape: 'radio',
  sticker: 'headphones',
  makeRounds: ({ grade, difficulty, count }) => {
    const tier = tierFor(grade, difficulty);
    return Array.from({ length: count }, () => buildRound(tier));
  },
  Play
};
