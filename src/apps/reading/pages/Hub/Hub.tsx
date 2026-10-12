import React, { useEffect, useMemo, useState } from 'react';
import type { GradeLevel } from '@/types/reading';
import type { UserProgress } from '@/types/user';
import type { AnyGameDef, GameShape } from '../../engine/types';
import { GRADES } from '@/data/readingCurriculum';
import { GAMES } from '../../games';
import { Luna } from '@/components/kit';
import { greeting, lunaSay, maybeQuirk, type LunaMood } from '../../engine/luna';
import { STICKERS, stickerById } from '../../engine/stickers';
import { pick, tierFor, wordsUpTo } from '../../engine/content';
import { soundManager } from '@/utils/audio';
import { pronunciation, type SpeechPart } from '@/utils/pronunciation';
import { warmReadingVoice } from '../../engine/warmup';
import { cx } from '@/utils/cx';
import styles from './Hub.module.scss';

interface HubProps {
  grade: GradeLevel;
  progress: UserProgress;
  /** this grade's guided lessons, in teaching order (engine/lessons.ts) */
  lessons: AnyGameDef[];
  onPlayGame: (game: AnyGameDef) => void;
  onSurprise: () => void;
  onChangeGrade: () => void;
}

/** Painted spines for the lesson books, cycled so no two neighbours match. */
const SPINE_COLORS = ['#E4572E', '#4AA05A', '#4FA8D8', '#7C3AED', '#C97B12', '#B2566E'];

/** Each shape gets its own little piece of scenery inside the tile. */
const Scenery: React.FC<{ shape: GameShape; emoji: string }> = ({ shape, emoji }) => {
  switch (shape) {
    case 'jar':
      return (
        <span className={cx(styles.scenery, styles.jarScenery)} aria-hidden="true">
          <span className={styles.jarLid} />
          <span className={styles.jarBody}>
            <i>B</i>
            <i>m</i>
            <i>S</i>
            <i>t</i>
          </span>
        </span>
      );
    case 'bubbles':
      return (
        <span className={cx(styles.scenery, styles.bubbleScenery)} aria-hidden="true">
          <i style={{ left: '10%', animationDelay: '0s' }}>a</i>
          <i style={{ left: '42%', animationDelay: '0.6s' }}>s</i>
          <i style={{ left: '70%', animationDelay: '1.2s' }}>m</i>
        </span>
      );
    case 'cards':
      return (
        <span className={cx(styles.scenery, styles.cardScenery)} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      );
    case 'plate':
      return (
        <span className={cx(styles.scenery, styles.plateScenery)} aria-hidden="true">
          <i>b</i>
          <i>D</i>
        </span>
      );
    case 'map':
      return (
        <span className={cx(styles.scenery, styles.mapScenery)} aria-hidden="true">
          <span className={styles.mapPath} />
          <span className={styles.mapX}>✕</span>
        </span>
      );
    case 'desk':
      return (
        <span className={cx(styles.scenery, styles.deskScenery)} aria-hidden="true">
          <i>🧦</i>
          <i>🔑</i>
          <i>🍎</i>
        </span>
      );
    case 'book':
      return (
        <span className={cx(styles.scenery, styles.bookScenery)} aria-hidden="true">
          <span className={styles.bookLeft}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.bookRight}>
            <i />
            <i />
            <i />
          </span>
        </span>
      );
    case 'page':
      return (
        <span className={cx(styles.scenery, styles.pageScenery)} aria-hidden="true">
          <i>The</i>
          <i>cat</i>
          <i>is</i>
          <i>big</i>
        </span>
      );
    case 'lesson':
      // an exercise book: a painted spine and ruled lines, the lesson's picture faint on the page
      return (
        <span className={cx(styles.scenery, styles.lessonScenery)} aria-hidden="true">
          <span className={styles.lessonSpine} />
          <span className={styles.lessonLines} />
          <span className={styles.lessonMark}>{emoji}</span>
        </span>
      );
  }
};

export const Hub: React.FC<HubProps> = ({
  grade,
  progress,
  lessons,
  onPlayGame,
  onSurprise,
  onChangeGrade
}) => {
  const gradeInfo = GRADES.find(g => g.id === grade) || GRADES[0];

  const [line, setLine] = useState(() => greeting());
  const wordOfTheDay = useMemo(() => pick(wordsUpTo(tierFor(grade, 2))), [grade]);
  const [mood, setMood] = useState<LunaMood>('happy');

  // Get Luna's voice ready for this grade while the child is still choosing.
  useEffect(() => warmReadingVoice(grade), [grade]);

  /**
   * `parts`, when given, is what Luna says in place of `text`: a line built
   * around a word is said as clips that exist, not as a sentence per word.
   * Her beak follows the clips by itself (the kit's Luna, DES-15).
   */
  const say = (text: string, nextMood: LunaMood = 'happy', parts?: SpeechPart[]) => {
    setLine({ text, mood: nextMood });
    setMood(nextMood);
    if (parts) pronunciation.speakSequence(parts);
    else soundManager.speak(text.replace(/[…]/g, '...'));
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
    <div className={styles.readingHub} data-shot="hub">
      <div className={styles.hubLanterns} aria-hidden="true">
        <span>🏮</span>
        <span>✨</span>
        <span>🏮</span>
        <span>⭐</span>
        <span>🏮</span>
      </div>

      {/* ---- Luna's desk ---- */}
      <header className={styles.hubDesk}>
        <div className={styles.deskLuna}>
          <Luna mood={mood} size={128} float onClick={nudgeLuna} />
          <div className={styles.deskBooks} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className={styles.deskSpeech} onClick={nudgeLuna} role="button" tabIndex={0}>
          <p>{line.text}</p>
          <span className={styles.speechTap}>tap me</span>
        </div>

        <div className={styles.deskControls}>
          <button className={styles.gradeSign} onClick={onChangeGrade} title="Change grade">
            <span className={styles.signRope} aria-hidden="true" />
            <span className={styles.signEmoji}>{gradeInfo.badgeEmoji}</span>
            <span className={styles.signText}>{gradeInfo.title}</span>
            <span className={styles.signSwap}>swap</span>
          </button>

          <button
            className={styles.lunasPick}
            onClick={() => {
              soundManager.playStarChime();
              const pickLine = lunaSay('surprisePick');
              say(pickLine.text, pickLine.mood);
              window.setTimeout(onSurprise, 500);
            }}
          >
            <span className={styles.pickGlow} aria-hidden="true" />
            <span className={styles.pickEmoji}>🎲</span>
            <span className={styles.pickText}>Luna’s Pick!</span>
            <span className={styles.pickSub}>she chooses, you play</span>
          </button>
        </div>
      </header>

      {/* ---- the lessons come first: the structured teaching, in order ---- */}
      {lessons.length > 0 && (
        <section className={styles.hubLessons}>
          <h2 className={styles.rugHeading}>
            <span>Luna’s Lessons</span>
            <small>
              {lessons.length} lessons for {gradeInfo.title} — start with the first
            </small>
          </h2>

          <div className={styles.lessonYard}>
            {lessons.map((lesson, i) => {
              const done = lesson.lesson ? progress.completedLessons.includes(lesson.lesson.id) : false;
              return (
                <button
                  key={lesson.id}
                  className={styles.gameThing}
                  data-shape="lesson"
                  data-state={done ? 'done' : undefined}
                  data-shot="lesson-tile"
                  style={{ '--spine': SPINE_COLORS[i % SPINE_COLORS.length] } as React.CSSProperties}
                  onClick={() => startGame(lesson)}
                >
                  <Scenery shape={lesson.shape} emoji={lesson.emoji} />

                  <span className={styles.thingBody}>
                    <span className={styles.thingKicker}>Lesson {i + 1}</span>
                    <span className={styles.thingEmoji}>{lesson.emoji}</span>
                    <span className={styles.thingTitle}>{lesson.title}</span>
                    <span className={styles.thingTagline}>{lesson.tagline}</span>
                  </span>

                  {done && (
                    <span className={styles.lessonDone} title="Finished">
                      ✓ done
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ---- the play rug: every game is an object, not a card ---- */}
      <section className={styles.hubRug} data-shot="hub-rug">
        <h2 className={styles.rugHeading}>
          <span>The Play Rug</span>
          <small>{GAMES.length} games — pick one</small>
        </h2>

        <div className={styles.gameYard}>
          {GAMES.map((game, i) => {
            const plays = progress.gamePlays?.[game.id] ?? 0;
            return (
              <button
                key={game.id}
                className={styles.gameThing}
                data-shape={game.shape}
                data-shot="game-tile"
                style={{ '--tilt': `${((i % 3) - 1) * 0.7}deg` } as React.CSSProperties}
                onClick={() => startGame(game)}
              >
                <Scenery shape={game.shape} emoji={game.emoji} />

                <span className={styles.thingBody}>
                  <span className={styles.thingEmoji}>{game.emoji}</span>
                  <span className={styles.thingTitle} data-shot="tile-title">{game.title}</span>
                  <span className={styles.thingTagline}>{game.tagline}</span>
                </span>

                {plays > 0 && (
                  <span className={styles.thingPlayed} title={`played ${plays} times`}>
                    {plays > 3 ? '⭐⭐⭐' : '⭐'.repeat(plays)}
                  </span>
                )}
              </button>
            );
          })}

          {/* a small nook that fills the rug and still teaches a word */}
          <button
            className={cx(styles.gameThing, styles.nook)}
            onClick={() => {
              soundManager.playLetterTap();
              const word = wordOfTheDay.word;
              const shown = `Today's word is ${word}!`;
              say(shown, 'happy', [{ text: 'Today’s word is' }, { word }]);
            }}
          >
            <span className={styles.nookKicker}>Word of the day</span>
            <span className={styles.nookEmoji}>{wordOfTheDay.emoji}</span>
            <span className={styles.nookWord}>{wordOfTheDay.word}</span>
            <span className={styles.nookTap}>tap to hear it</span>
          </button>
        </div>
      </section>

      {/* ---- sticker tin ---- */}
      <section className={styles.hubTin} data-shot="hub-tin">
        <div className={styles.tinHead}>
          <h2>Luna’s Sticker Tin</h2>
          <span className={styles.tinCount}>
            {progress.stickers.length} of {STICKERS.length}
          </span>
        </div>

        <div className={styles.tinSlots}>
          {STICKERS.map(sticker => {
            const owned = progress.stickers.includes(sticker.id);
            return (
              <span
                key={sticker.id}
                className={styles.tinSlot}
                data-state={owned ? 'owned' : undefined}
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

        {progress.stickers.length === 0 && (
          <p className={styles.tinNote}>Finish any lesson or game to peel your first sticker.</p>
        )}
      </section>

    </div>
  );
};
