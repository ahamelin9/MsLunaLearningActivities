import React, { useEffect, useState } from 'react';
import type { GradeLevel } from '@/types/reading';
import type { UserProgress } from '@/types/user';
import type { AnyGameDef, GameShape } from '../../engine/types';
import { GAMES } from '../../games';
import { ChunkyButton, Luna, PaperCard, Tile } from '@/components/kit';
import { greeting, lunaSay, type LunaLine, type LunaMood } from '../../engine/luna';
import { STICKERS, stickerById } from '../../engine/stickers';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { storageService } from '@/utils/storage';
import { warmReadingVoice } from '../../engine/warmup';
import { FINISH_FIRST, lessonStates } from '../../engine/lessons';
import { LessonPath } from './LessonPath';
import { ShelfPicture } from './ShelfPicture';
import styles from './Hub.module.scss';

interface HubProps {
  grade: GradeLevel;
  gradeTitle: string;
  progress: UserProgress;
  /** this grade's guided lessons, in teaching order (engine/lessons.ts) */
  lessons: AnyGameDef[];
  /** say her greeting as the library opens: only when it opens from home (DES-21) */
  greet: boolean;
  onPlayGame: (game: AnyGameDef) => void;
  onSurprise: () => void;
  /** the Sticker Tin leads to the Trophy room (DES-9b; the squishy shelf, PRG-5) */
  onOpenTrophies: () => void;
}

/** How many of the latest stickers stand on the Sticker Tin's plank. */
const ON_THE_PLANK = 3;

/** Each game's picture tint on its Play Shelf Tile, as on the board. */
const SHELF_TINTS: Record<GameShape, 1 | 2 | 3 | 4 | 5> = {
  jar: 1,
  bubbles: 2,
  plate: 3,
  cards: 4,
  page: 5,
  desk: 2,
  map: 1,
  book: 3,
  lesson: 1
};

/**
 * Luna's library (DES-21), as on the round 2 Library board: the welcome row
 * (Luna, who says her greeting with no bubble; the Sticker Tin, standing in
 * for the Squishy Shelf until PRG-5; Luna's Pick), the lessons (LessonPath,
 * DES-13's) and the Play Shelf, all from the kit.
 */
export const Hub: React.FC<HubProps> = ({
  grade,
  gradeTitle,
  progress,
  lessons,
  greet,
  onPlayGame,
  onSurprise,
  onOpenTrophies
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

  const voiceOn = progress.settings.speechEnabled;
  const owned = STICKERS.filter(s => progress.stickers.includes(s.id));
  // the latest ones won, newest last, as they were peeled
  const latest = progress.stickers
    .slice(-ON_THE_PLANK)
    .map(id => stickerById(id))
    .filter(s => s !== undefined);

  return (
    <div className={styles.page} data-shot="hub">
      {/* ---- welcome: Luna, the Sticker Tin and Luna's Pick ---- */}
      <div className={styles.welcome}>
        <span className={styles.luna}>
          <Luna mood={mood} size={108} float onClick={hearAgain} label={`Hear Ms. Luna: ${hello.text}`} />
          {/* she talks with no bubble; beside her, her voice switches off and on
              (Alex, 2026-10-12): the same setting as Settings' "Ms. Luna's voice" */}
          <ChunkyButton
            variant="icon"
            icon={voiceOn ? 'speaker' : 'mute'}
            aria-label={voiceOn ? 'Mute Ms. Luna' : 'Unmute Ms. Luna'}
            data-shot="luna-mute"
            onClick={() => {
              soundManager.playPop();
              storageService.updateSettings({ speechEnabled: !voiceOn });
            }}
          />
        </span>

        <PaperCard className={styles.tin} data-shot="hub-tin">
          <div className={styles.tinInside}>
            <span className={styles.tinName}>
              <span className={styles.tinTitle}>Sticker Tin</span>
              <span className={styles.tinCount}>
                <strong>
                  {owned.length} of {STICKERS.length}
                </strong>{' '}
                found
              </span>
            </span>

            <span className={styles.shelf}>
              <span className={styles.stickers}>
                {latest.map(sticker => (
                  <ChunkyButton
                    key={sticker.id}
                    variant="icon"
                    aria-label={sticker.name}
                    onClick={() => {
                      soundManager.playLetterTap();
                      say({ text: sticker.line, mood: 'happy' });
                    }}
                  >
                    <span className={styles.sticker}>{sticker.emoji}</span>
                  </ChunkyButton>
                ))}
                {Array.from({ length: ON_THE_PLANK - latest.length }, (_, i) => (
                  <span key={i} className={styles.slot} aria-hidden="true" />
                ))}
              </span>
              <span className={styles.plank} aria-hidden="true" />
            </span>

            <ChunkyButton icon="trophy" onClick={onOpenTrophies} data-shot="open-trophies">
              My trophies
            </ChunkyButton>
          </div>
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

      {/* ---- the lessons come first: the structured teaching, in order (DES-13) ---- */}
      {lessons.length > 0 && (
        <LessonPath lessons={lessons} states={states} gradeTitle={gradeTitle} onStart={startGame} onLocked={finishFirst} />
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
              tint={SHELF_TINTS[game.shape]}
              picture={<ShelfPicture shape={game.shape} />}
              data-shot="game-tile"
              onClick={() => startGame(game)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
