import React, { useEffect, useState } from 'react';
import type { GradeLevel } from '@/types/reading';
import type { UserProgress } from '@/types/user';
import type { AnyGameDef } from '../../engine/types';
import { GAMES } from '../../games';
import { ChunkyButton, Icon, LessonCard, Luna, PaperCard, ProgressBar, Squishy, Tile } from '@/components/kit';
import { greeting, lunaSay, type LunaLine, type LunaMood } from '../../engine/luna';
import { SQUISHY_KINDS, kindDef, kindsFound, parseSquishy } from '../../engine/squishies';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { minutesOf, storageService } from '@/utils/storage';
import { estimateMinutes } from '../../engine/times';
import { warmReadingVoice } from '../../engine/warmup';
import { FINISH_FIRST, lessonStates } from '../../engine/lessons';
import { GAME_TINTS, GamePicture } from '../../games/shared/GamePicture/GamePicture';
import styles from './Hub.module.scss';

interface HubProps {
  grade: GradeLevel;
  progress: UserProgress;
  /** this grade's guided lessons, in teaching order (engine/lessons.ts) */
  lessons: AnyGameDef[];
  /** the lesson that just opened, back from finishing the one before: it pops in (DES-13) */
  opened?: string | null;
  /** say her greeting as the library opens: only when it opens from home (DES-21) */
  greet: boolean;
  onPlayGame: (game: AnyGameDef) => void;
  onSurprise: () => void;
  /** the Squishy Shelf card opens the shelf (PRG-5a) */
  onOpenShelf: () => void;
}

/** How many of the latest squishies stand on the Squishy Shelf card's plank. */
const ON_THE_PLANK = 3;

/**
 * Luna's library (DES-21), as on the round 2 Library board: the welcome row
 * (Luna, who says her greeting with no bubble; the Squishy Shelf card, PRG-5a;
 * Luna's Pick), the lessons in order on one
 * bar (DES-13: done, up next or locked, PRG-7) and the Play Shelf, all from
 * the kit.
 */
export const Hub: React.FC<HubProps> = ({
  grade,
  progress,
  lessons,
  opened = null,
  greet,
  onPlayGame,
  onSurprise,
  onOpenShelf
}) => {
  // her greeting for this visit: said as the library opens from home, and
  // again whenever she's tapped
  const [hello] = useState<LunaLine>(() => greeting());
  const [mood, setMood] = useState<LunaMood>(greet ? hello.mood : 'happy');

  // Get Luna's voice ready for this grade while the child is still choosing.
  useEffect(() => warmReadingVoice(grade), [grade]);

  /** Luna says a line; her beak follows the clip by itself (the kit's Luna, DES-15). */
  const speak = (line: LunaLine) => soundManager.speak(line.text.replace(/[…]/g, '...'));
  const say = (line: LunaLine) => {
    setMood(line.mood);
    speak(line);
  };

  // as the library opens (her mood already matches the line)
  useEffect(() => {
    if (greet) speak(hello);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hearAgain = () => {
    soundManager.playPop();
    say(hello);
  };

  const startGame = (game: AnyGameDef) => {
    soundManager.playPop();
    onPlayGame(game);
  };

  // lessons open in order (PRG-7): a locked one stays shut, and Luna names
  // the one up next
  const states = lessonStates(lessons, progress.completedLessons);
  const finishFirst = () => {
    const line = FINISH_FIRST[states.indexOf('next') + 1];
    if (!line) return;
    setMood('happy');
    pronunciation.speakSequence([line]);
  };

  // times (PRG-6): "took N min" on a lesson done (its last play), "about N
  // min" on the rest and on every game; a lesson done before times were
  // kept shows none
  const timeOf = (game: AnyGameDef, done: boolean) => {
    const times = progress.times?.[game.id];
    if (done) return times ? minutesOf(times.last) : undefined;
    return estimateMinutes(game, times);
  };
  const lessonsDone = states.filter(s => s === 'done').length;

  const voiceOn = progress.settings.speechEnabled;
  // the latest ones won, newest first: where the card is narrow, the plank
  // shows only as many as fit, and the newest stays
  const latest = progress.stickers
    .slice(-ON_THE_PLANK)
    .reverse()
    .map(parseSquishy)
    .filter(s => s !== null);

  return (
    <div className={styles.page} data-shot="hub">
      {/* ---- welcome: Luna, the Squishy Shelf and Luna's Pick ---- */}
      <div className={styles.welcome}>
        <span className={styles.luna}>
          <Luna mood={mood} size={108} float onClick={hearAgain} label={`Hear Ms. Luna: ${hello.text}`} />
          {/* she talks with no bubble; beside her, her voice switches off and on
              (Alex, 2026-10-12): the same setting as Settings' "Ms. Luna's voice".
              The games need her voice, so muting her is a grown-up's 1.5s press
              and hold (SET-2, the gate from SET-1); giving it back is one tap */}
          {voiceOn ? (
            <ChunkyButton
              variant="icon"
              icon="speaker"
              aria-label="Grown-ups: mute Ms. Luna"
              data-shot="luna-mute"
              holdNoteAt="start"
              onHold={() => {
                soundManager.playPop();
                storageService.updateSettings({ speechEnabled: false });
              }}
            />
          ) : (
            <ChunkyButton
              variant="icon"
              icon="mute"
              aria-label="Unmute Ms. Luna"
              data-shot="luna-mute"
              onClick={() => {
                soundManager.playPop();
                storageService.updateSettings({ speechEnabled: true });
              }}
            />
          )}
        </span>

        {/* the Squishy Shelf, as on the Library board (PRG-5a): the count, the
            latest three on a plank, and the way to the shelf. The Trophy room
            opens from the stars in the header */}
        <PaperCard className={styles.tin} data-shot="hub-tin">
          <div className={styles.tinInside}>
            <span className={styles.tinName}>
              <span className={styles.tinTitle}>Squishy Shelf</span>
              <span className={styles.tinCount}>
                <strong>
                  {kindsFound(progress.stickers)} of {SQUISHY_KINDS.length}
                </strong>{' '}
                found
              </span>
            </span>

            <span className={styles.shelf}>
              <span className={styles.squishies}>
                {latest.map(({ kind, colour }) => (
                  <Squishy
                    key={`${kind}:${colour}`}
                    kind={kind}
                    colour={colour}
                    size={64}
                    onClick={() => say({ text: kindDef(kind).line, mood: 'happy' })}
                  />
                ))}
                {Array.from({ length: ON_THE_PLANK - latest.length }, (_, i) => (
                  <span key={i} className={styles.slot} aria-hidden="true" />
                ))}
              </span>
              <span className={styles.plank} aria-hidden="true" />
            </span>

            <ChunkyButton variant="icon" icon="chevron-right" aria-label="Open my squishy shelf" onClick={onOpenShelf} data-shot="open-shelf" />
          </div>
        </PaperCard>

        {/* today's reading, as on the Library board (PRG-6) */}
        <PaperCard className={styles.today} data-shot="hub-today">
          <span className={styles.todayLabel}>Today</span>
          <span className={styles.todayMinutes}>
            <Icon name="clock" size={24} />
            <strong>{storageService.todayMinutes()}</strong> min reading
          </span>
          {lessons.length > 0 && (
            <span className={styles.todayLessons}>
              {lessonsDone} of {lessons.length} lessons done
            </span>
          )}
        </PaperCard>

        <ChunkyButton
          variant="accent"
          size={64}
          icon="dice"
          className={styles.pick}
          onClick={() => {
            soundManager.playStarChime();
            say(lunaSay('surprisePick'));
            window.setTimeout(onSurprise, 500);
          }}
        >
          <span className={styles.pickWords}>
            <span>Luna’s Pick</span>
            <span className={styles.pickSub}>she chooses, you play</span>
          </span>
        </ChunkyButton>
      </div>

      {/* ---- the lessons come first, in order on one bar (DES-13) ---- */}
      {lessons.length > 0 && (
        <section className={styles.lessons}>
          <div className={styles.lessonsHead}>
            <h2 className={styles.heading}>Luna’s Lessons</h2>
            <ProgressBar done={lessonsDone} total={lessons.length} className={styles.lessonsBar} />
          </div>
          <div className={styles.lessonCards}>
            {lessons.map((lesson, i) => (
              <LessonCard
                key={lesson.id}
                number={i + 1}
                title={lesson.title}
                state={states[i]}
                minutes={timeOf(lesson, states[i] === 'done')}
                // up next and started: the thin rounds bar (PRG-8)
                rounds={
                  states[i] === 'next' && progress.partway?.[lesson.id]
                    ? { done: progress.partway[lesson.id].won, total: lesson.roundsPerPlay }
                    : undefined
                }
                opened={lesson.id === opened}
                data-shot="lesson-tile"
                onClick={() => (states[i] === 'locked' ? finishFirst() : startGame(lesson))}
              />
            ))}
          </div>
        </section>
      )}

      {/* ---- the Play Shelf: every game the same size, each picture gently alive ---- */}
      <section className={styles.playShelf} data-shot="hub-rug">
        <h2 className={styles.heading}>
          The Play Shelf <span className={styles.count}>{GAMES.length} games</span>
        </h2>
        <div className={styles.games}>
          {GAMES.map(game => (
            <Tile
              key={game.id}
              name={game.title}
              tint={GAME_TINTS[game.shape]}
              picture={<GamePicture shape={game.shape} />}
              minutes={timeOf(game, false)}
              data-shot="game-tile"
              onClick={() => startGame(game)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
