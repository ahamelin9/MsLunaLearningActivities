import React, { useState } from 'react';
import type { GradeLevel, Lesson } from '../../types/reading';
import type { UserProgress } from '../../types/user';
import type { AnyGameDef } from './engine/types';
import type { Difficulty } from './engine/content';
import { READING_CURRICULUM } from '../../data/readingCurriculum';
import { storageService } from '../../utils/storage';
import { GradeSelect } from './pages/GradeSelect';
import { ReadingHub } from './pages/ReadingHub';
import { GamePlay } from './pages/GamePlay';
import { GameShell } from './engine/GameShell';
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
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isChangingGrade, setIsChangingGrade] = useState(false);

  const currentGrade = progress.selectedGrade;

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

  const handleNextLesson = () => {
    if (!currentGrade || !activeLesson) return;
    const allLessons = (READING_CURRICULUM[currentGrade] || []).flatMap(s => s.lessons);
    const index = allLessons.findIndex(l => l.id === activeLesson.id);
    setActiveLesson(index >= 0 && index + 1 < allLessons.length ? allLessons[index + 1] : null);
  };

  // View 1: a mini-game
  if (activeGame && currentGrade) {
    return (
      <GameShell
        key={`${activeGame.game.id}-${activeGame.autoStart}-${activeGame.difficulty}`}
        game={activeGame.game}
        grade={currentGrade}
        progress={progress}
        autoStart={activeGame.autoStart}
        startDifficulty={activeGame.difficulty}
        surpriseBanner={activeGame.banner}
        onExit={() => setActiveGame(null)}
        onPlayAnother={() => handleSurprise(activeGame.game.id)}
      />
    );
  }

  // View 2: a guided lesson from the original curriculum
  if (activeLesson) {
    return (
      <GamePlay
        lesson={activeLesson}
        progress={progress}
        onExit={() => setActiveLesson(null)}
        onNextLesson={handleNextLesson}
      />
    );
  }

  // View 3: pick a grade
  if (!currentGrade || isChangingGrade) {
    return <GradeSelect currentGrade={currentGrade} onSelectGrade={handleSelectGrade} />;
  }

  // View 4: Luna's library
  return (
    <ReadingHub
      grade={currentGrade}
      progress={progress}
      onPlayGame={game => setActiveGame({ game, autoStart: false, difficulty: 2 })}
      onSurprise={() => handleSurprise()}
      onChangeGrade={() => setIsChangingGrade(true)}
      onOpenLesson={setActiveLesson}
    />
  );
};
