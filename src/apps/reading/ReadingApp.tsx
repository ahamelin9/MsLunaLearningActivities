import React, { useMemo, useState } from 'react';
import type { GradeLevel } from '../../types/reading';
import type { UserProgress } from '../../types/user';
import type { AnyGameDef } from './engine/types';
import type { Difficulty } from './engine/content';
import { storageService } from '../../utils/storage';
import { GradeSelect } from './pages/GradeSelect';
import { ReadingHub } from './pages/ReadingHub';
import { GameShell } from './engine/GameShell';
import { lessonsFor } from './engine/lessons';
import { surprisePick } from './games';

interface ReadingAppProps {
  progress: UserProgress;
  onReturnToHome: () => void;
  onGradeChange?: (grade: GradeLevel) => void;
}

interface ActiveGame {
  game: AnyGameDef;
  autoStart: boolean;
  difficulty: Difficulty;
  banner?: string;
}

export const ReadingApp: React.FC<ReadingAppProps> = ({ progress, onGradeChange }) => {
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [isChangingGrade, setIsChangingGrade] = useState(false);

  const currentGrade = progress.selectedGrade;
  const lessons = useMemo(() => (currentGrade ? lessonsFor(currentGrade) : []), [currentGrade]);

  const handleSelectGrade = (grade: GradeLevel) => {
    storageService.setGrade(grade);
    onGradeChange?.(grade);
    setIsChangingGrade(false);
  };

  const handleSurprise = (excludeId?: string) => {
    const game = surprisePick(progress.gamePlays || {}, excludeId);
    const roll = Math.random();
    const difficulty: Difficulty = roll < 0.25 ? 1 : roll > 0.85 ? 3 : 2;

    setActiveGame({
      game,
      autoStart: true,
      difficulty,
      banner: '✨ Luna picked this one'
    });
  };

  const play = (game: AnyGameDef) => setActiveGame({ game, autoStart: false, difficulty: 2 });

  // View 1: a lesson or a mini-game, both run by the same shell
  if (activeGame && currentGrade) {
    const { game } = activeGame;
    // a finished lesson leads on to the next one; a game to one Luna picks
    const nextLesson = game.lesson ? lessons[lessons.findIndex(l => l.id === game.id) + 1] : undefined;
    return (
      <GameShell
        key={`${game.id}-${activeGame.autoStart}-${activeGame.difficulty}`}
        game={game}
        grade={currentGrade}
        progress={progress}
        autoStart={activeGame.autoStart}
        startDifficulty={activeGame.difficulty}
        surpriseBanner={activeGame.banner}
        onExit={() => setActiveGame(null)}
        onPlayAnother={
          game.lesson ? (nextLesson ? () => play(nextLesson) : undefined) : () => handleSurprise(game.id)
        }
        playAnotherLabel={game.lesson ? 'Next lesson' : 'Another game'}
      />
    );
  }

  // View 2: pick a grade
  if (!currentGrade || isChangingGrade) {
    return <GradeSelect currentGrade={currentGrade} onSelectGrade={handleSelectGrade} />;
  }

  // View 3: Luna's library
  return (
    <ReadingHub
      grade={currentGrade}
      progress={progress}
      lessons={lessons}
      onPlayGame={play}
      onSurprise={() => handleSurprise()}
      onChangeGrade={() => setIsChangingGrade(true)}
    />
  );
};
