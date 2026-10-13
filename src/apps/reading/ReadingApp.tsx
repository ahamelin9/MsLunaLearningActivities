import React, { useMemo, useRef, useState } from 'react';
import type { GradeLevel } from '../../types/reading';
import type { UserProgress } from '../../types/user';
import type { AnyGameDef } from './engine/types';
import type { Difficulty } from './engine/content';
import { storageService } from '../../utils/storage';
import { AppHeader } from '@/components/os/AppHeader/AppHeader';
import { Chip, ChunkyButton } from '@/components/kit';
import { GRADES } from '@/data/readingCurriculum';
import { GradeSelect } from './pages/GradeSelect/GradeSelect';
import { Hub } from './pages/Hub/Hub';
import { GameShell } from './engine/GameShell/GameShell';
import { lessonsFor, lessonStates, type LessonState } from './engine/lessons';
import { surprisePick } from './games';

interface ReadingAppProps {
  progress: UserProgress;
  onReturnToHome: () => void;
  /** the header's gear; the grown-up gate comes with SET-1 */
  onOpenSettings: () => void;
  /** the Sticker Tin's way into the Trophy room (DES-9b, DES-21) */
  onOpenTrophies: () => void;
  onGradeChange?: (grade: GradeLevel) => void;
}

interface ActiveGame {
  game: AnyGameDef;
  autoStart: boolean;
  difficulty: Difficulty;
}

export const ReadingApp: React.FC<ReadingAppProps> = ({ progress, onReturnToHome, onOpenSettings, onOpenTrophies, onGradeChange }) => {
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [isChangingGrade, setIsChangingGrade] = useState(false);
  // Luna greets the child only when the library opens from the home screen
  // (DES-21): after Grade Select she has just said "Let's start …!", and back
  // from a game she has been talking all along
  const [greet, setGreet] = useState(true);
  // the lesson that just opened, so its card pops in back on the library
  // (DES-13): the lesson states as a game starts, compared as it ends
  const statesBefore = useRef<LessonState[]>([]);
  const [opened, setOpened] = useState<string | null>(null);

  const currentGrade = progress.selectedGrade;
  const lessons = useMemo(() => (currentGrade ? lessonsFor(currentGrade) : []), [currentGrade]);

  const handleSelectGrade = (grade: GradeLevel) => {
    storageService.setGrade(grade);
    onGradeChange?.(grade);
    setGreet(false);
    setIsChangingGrade(false);
  };

  const begin = (active: ActiveGame) => {
    statesBefore.current = lessonStates(lessons, progress.completedLessons);
    setOpened(null);
    setActiveGame(active);
  };

  const handleSurprise = (excludeId?: string) => {
    const game = surprisePick(progress.gamePlays || {}, excludeId);
    const roll = Math.random();
    const difficulty: Difficulty = roll < 0.25 ? 1 : roll > 0.85 ? 3 : 2;

    begin({ game, autoStart: true, difficulty });
  };

  const play = (game: AnyGameDef) => begin({ game, autoStart: false, difficulty: 2 });

  // View 1: a lesson or a mini-game, both run by the same shell, which has its own header
  if (activeGame && currentGrade) {
    const { game } = activeGame;
    // a finished lesson leads on to the next one, if it's open (PRG-7); a
    // game to one Luna picks
    const next = lessons.findIndex(l => l.id === game.id) + 1;
    const nextOpen = lessonStates(lessons, progress.completedLessons)[next] !== 'locked';
    const nextLesson = game.lesson && nextOpen ? lessons[next] : undefined;
    return (
      <GameShell
        key={`${game.id}-${activeGame.autoStart}-${activeGame.difficulty}`}
        game={game}
        grade={currentGrade}
        progress={progress}
        autoStart={activeGame.autoStart}
        startDifficulty={activeGame.difficulty}
        // the next one's index is this lesson's number on the path
        lessonNumber={game.lesson ? next : undefined}
        onExit={() => {
          const now = lessonStates(lessons, progress.completedLessons);
          const i = now.findIndex((state, n) => state !== 'locked' && statesBefore.current[n] === 'locked');
          setOpened(i >= 0 ? lessons[i].id : null);
          setGreet(false);
          setActiveGame(null);
        }}
        onPlayAnother={
          game.lesson ? (nextLesson ? () => play(nextLesson) : undefined) : () => handleSurprise(game.id)
        }
        playAnotherLabel={game.lesson ? 'Next lesson' : 'Another game'}
      />
    );
  }

  // the one header (DES-8): home, where you are, stars, the grown-ups' gear.
  // In the library the grade sits by the title, and tapping it changes it
  // (DES-21): the teacher swaps grades as her groups come and go
  const gradeButton = (grade: string) => (
    <ChunkyButton aria-label={`Change grade: ${grade}`} data-shot="change-grade" onClick={() => setIsChangingGrade(true)}>
      {grade}
    </ChunkyButton>
  );
  const header = (grade?: string) => (
    <AppHeader back="home" onBack={onReturnToHome} title="Luna’s Library" beside={grade && gradeButton(grade)}>
      <Chip variant="count" icon="star">
        {progress.totalStars}
      </Chip>
      <ChunkyButton variant="icon" icon="gear" aria-label="Grown-ups: settings" data-shot="open-settings" onClick={onOpenSettings} />
    </AppHeader>
  );

  // View 2: pick a grade: the first time, and from the library's grade button
  if (!currentGrade || isChangingGrade) {
    return (
      <>
        {header()}
        <GradeSelect currentGrade={currentGrade} onSelectGrade={handleSelectGrade} />
      </>
    );
  }

  // View 3: Luna's library
  const gradeTitle = (GRADES.find(g => g.id === currentGrade) ?? GRADES[0]).title;
  return (
    <>
      {header(gradeTitle)}
      <Hub
        grade={currentGrade}
        opened={opened}
        progress={progress}
        lessons={lessons}
        greet={greet}
        onPlayGame={play}
        onSurprise={() => handleSurprise()}
        onOpenTrophies={onOpenTrophies}
      />
    </>
  );
};
