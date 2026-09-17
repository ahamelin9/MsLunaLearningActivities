import React, { useEffect, useMemo, useState } from 'react';
import type { GradeLevel, Lesson } from '../../../types/reading';
import type { UserProgress } from '../../../types/user';
import type { AnyGameDef, GameShape } from '../engine/types';
import { GRADES, READING_CURRICULUM } from '../../../data/readingCurriculum';
import { GAMES } from '../games';
import { LunaOwl } from '../engine/LunaOwl';
import { greeting, lunaSay, maybeQuirk, type LunaMood } from '../engine/luna';
import { STICKERS, stickerById } from '../engine/stickers';
import { pick, tierFor, wordsUpTo } from '../engine/content';
import { soundManager } from '../../../utils/audio';
import { warmReadingVoice } from '../engine/warmup';
import './ReadingHub.scss';

interface ReadingHubProps {
  grade: GradeLevel;
  progress: UserProgress;
  onPlayGame: (game: AnyGameDef) => void;
  onSurprise: () => void;
  onChangeGrade: () => void;
  onOpenLesson: (lesson: Lesson) => void;
}

/** Painted spines for the reading shelf, cycled so no two neighbours match. */
const SPINE_COLORS = ['#E4572E', '#4AA05A', '#4FA8D8', '#7C3AED', '#C97B12', '#B2566E'];

/** Each shape gets its own little piece of scenery inside the tile. */
const Scenery: React.FC<{ shape: GameShape; emoji: string }> = ({ shape, emoji }) => {
  switch (shape) {
    case 'jar':
      return (
        <span className="scenery jar-scenery" aria-hidden="true">
          <span className="jar-lid" />
          <span className="jar-body">
            <i>B</i>
            <i>m</i>
            <i>S</i>
            <i>t</i>
          </span>
        </span>
      );
    case 'bubbles':
      return (
        <span className="scenery bubble-scenery" aria-hidden="true">
          <i style={{ left: '10%', animationDelay: '0s' }}>a</i>
          <i style={{ left: '42%', animationDelay: '0.6s' }}>s</i>
          <i style={{ left: '70%', animationDelay: '1.2s' }}>m</i>
        </span>
      );
    case 'cards':
      return (
        <span className="scenery card-scenery" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      );
    case 'plate':
      return (
        <span className="scenery plate-scenery" aria-hidden="true">
          <i>b</i>
          <i>D</i>
        </span>
      );
    case 'map':
      return (
        <span className="scenery map-scenery" aria-hidden="true">
          <span className="map-path" />
          <span className="map-x">✕</span>
        </span>
      );
    case 'baskets':
      return (
        <span className="scenery basket-scenery" aria-hidden="true">
          <i>🧺</i>
          <i>🪣</i>
        </span>
      );
    case 'desk':
      return (
        <span className="scenery desk-scenery" aria-hidden="true">
          <i>🧦</i>
          <i>🔑</i>
          <i>🍎</i>
        </span>
      );
    case 'radio':
      return (
        <span className="scenery radio-scenery" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      );
    case 'book':
      return (
        <span className="scenery book-scenery" aria-hidden="true">
          <span className="book-left">
            <i />
            <i />
            <i />
          </span>
          <span className="book-right">
            <i />
            <i />
            <i />
          </span>
        </span>
      );
    case 'page':
      return (
        <span className="scenery page-scenery" aria-hidden="true">
          <i>The</i>
          <i>cat</i>
          <i>is</i>
          <i>big</i>
        </span>
      );
    default:
      return (
        <span className="scenery scene-scenery" aria-hidden="true">
          <span className="scene-lamp">{emoji}</span>
          <span className="scene-rug" />
        </span>
      );
  }
};

export const ReadingHub: React.FC<ReadingHubProps> = ({
  grade,
  progress,
  onPlayGame,
  onSurprise,
  onChangeGrade,
  onOpenLesson
}) => {
  const gradeInfo = GRADES.find(g => g.id === grade) || GRADES[0];
  const lessons = useMemo(() => (READING_CURRICULUM[grade] || []).flatMap(s => s.lessons), [grade]);

  const [line, setLine] = useState(() => greeting());
  const wordOfTheDay = useMemo(() => pick(wordsUpTo(tierFor(grade, 2))), [grade]);
  const [mood, setMood] = useState<LunaMood>('happy');
  const [talking, setTalking] = useState(false);

  const totalPlays = Object.values(progress.gamePlays || {}).reduce((a, b) => a + b, 0);

  // Get Luna's voice ready for this grade while the child is still choosing.
  useEffect(() => warmReadingVoice(grade), [grade]);

  const say = (text: string, nextMood: LunaMood = 'happy') => {
    setLine({ text, mood: nextMood });
    setMood(nextMood);
    setTalking(true);
    soundManager.speak(text.replace(/[…]/g, '...'), { onEnd: () => setTalking(false) });
    window.setTimeout(() => setTalking(false), 3800);
  };

  const nudgeLuna = () => {
    soundManager.playPop();
    const next = maybeQuirk(0.45) ?? greeting();
    say(next.text, next.mood);
  };

  const startGame = (game: AnyGameDef) => {
    soundManager.playPop();
    onPlayGame(game);
  };

  return (
    <div className="reading-hub">
      <div className="hub-lanterns" aria-hidden="true">
        <span>🏮</span>
        <span>✨</span>
        <span>🏮</span>
        <span>⭐</span>
        <span>🏮</span>
      </div>

      {/* ---- Luna's desk ---- */}
      <header className="hub-desk">
        <div className="desk-luna">
          <LunaOwl mood={mood} size={128} talking={talking} onClick={nudgeLuna} />
          <div className="desk-books" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="desk-speech" onClick={nudgeLuna} role="button" tabIndex={0}>
          <p>{line.text}</p>
          <span className="speech-tap">tap me</span>
        </div>

        <div className="desk-controls">
          <button className="grade-sign" onClick={onChangeGrade} title="Change grade">
            <span className="sign-rope" aria-hidden="true" />
            <span className="sign-emoji">{gradeInfo.badgeEmoji}</span>
            <span className="sign-text">{gradeInfo.title}</span>
            <span className="sign-swap">swap</span>
          </button>

          <button
            className="lunas-pick"
            onClick={() => {
              soundManager.playStarChime();
              const pickLine = lunaSay('surprisePick');
              say(pickLine.text, pickLine.mood);
              window.setTimeout(onSurprise, 500);
            }}
          >
            <span className="pick-glow" aria-hidden="true" />
            <span className="pick-emoji">🎲</span>
            <span className="pick-text">Luna’s Pick!</span>
            <span className="pick-sub">she chooses, you play</span>
          </button>
        </div>
      </header>

      {/* ---- the play rug: every game is an object, not a card ---- */}
      <section className="hub-rug">
        <h2 className="rug-heading">
          <span>The Play Rug</span>
          <small>{GAMES.length} games — pick one</small>
        </h2>

        <div className="game-yard">
          {GAMES.map((game, i) => {
            const plays = progress.gamePlays?.[game.id] ?? 0;
            return (
              <button
                key={game.id}
                className={`game-thing shape-${game.shape} skill-${game.skill}`}
                style={{ '--tilt': `${((i % 3) - 1) * 0.7}deg` } as React.CSSProperties}
                onClick={() => startGame(game)}
              >
                <Scenery shape={game.shape} emoji={game.emoji} />

                <span className="thing-body">
                  <span className="thing-emoji">{game.emoji}</span>
                  <span className="thing-title">{game.title}</span>
                  <span className="thing-tagline">{game.tagline}</span>
                </span>

                {plays > 0 && (
                  <span className="thing-played" title={`played ${plays} times`}>
                    {plays > 3 ? '⭐⭐⭐' : '⭐'.repeat(plays)}
                  </span>
                )}
              </button>
            );
          })}

          {/* a small nook that fills the rug and still teaches a word */}
          <button
            className="game-thing nook"
            onClick={() => {
              soundManager.playLetterTap();
              say(`Today's word is ${wordOfTheDay.word}. ${wordOfTheDay.word}!`, 'happy');
            }}
          >
            <span className="nook-kicker">Word of the day</span>
            <span className="nook-emoji">{wordOfTheDay.emoji}</span>
            <span className="nook-word">{wordOfTheDay.word}</span>
            <span className="nook-tap">tap to hear it</span>
          </button>
        </div>
      </section>

      {/* ---- sticker tin ---- */}
      <section className="hub-tin">
        <div className="tin-head">
          <h2>Luna’s Sticker Tin</h2>
          <span className="tin-count">
            {progress.stickers.length} of {STICKERS.length}
          </span>
        </div>

        <div className="tin-slots">
          {STICKERS.map(sticker => {
            const owned = progress.stickers.includes(sticker.id);
            return (
              <span
                key={sticker.id}
                className={`tin-slot ${owned ? 'is-owned' : ''}`}
                title={owned ? sticker.name : 'Still to find'}
                onClick={() => {
                  if (!owned) return;
                  soundManager.playLetterTap();
                  const s = stickerById(sticker.id);
                  if (s) say(s.line, 'happy');
                }}
              >
                {owned ? sticker.emoji : '·'}
              </span>
            );
          })}
        </div>

        {totalPlays === 0 && <p className="tin-note">Finish any game to peel your first sticker.</p>}
      </section>

      {/* ---- the old curriculum, kept as Luna's reading shelf ---- */}
      {lessons.length > 0 && (
        <section className="hub-bookshelf">
          <h2 className="shelf-heading">Luna’s Reading Shelf</h2>
          <p className="shelf-note">Longer guided lessons for {gradeInfo.title}.</p>

          <div className="shelf-books">
            {lessons.map((lesson, i) => {
              const done = progress.completedLessons.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  className={`book-spine ${done ? 'is-read' : ''}`}
                  style={{ '--spine': SPINE_COLORS[i % SPINE_COLORS.length] } as React.CSSProperties}
                  onClick={() => {
                    soundManager.playPop();
                    onOpenLesson(lesson);
                  }}
                  title={lesson.description}
                >
                  <span className="spine-emoji">{lesson.icon}</span>
                  <span className="spine-title">{lesson.title}</span>
                  {done && <span className="spine-mark">✓</span>}
                </button>
              );
            })}
          </div>
          <div className="shelf-plank" aria-hidden="true" />
        </section>
      )}
    </div>
  );
};
