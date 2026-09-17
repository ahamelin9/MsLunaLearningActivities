import React, { useState } from 'react';
import type { Lesson, LessonQuestion } from '../../../types/reading';
import type { UserProgress } from '../../../types/user';
import { storageService } from '../../../utils/storage';
import { soundManager } from '../../../utils/audio';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { StarBadge } from '../../../components/ui/StarBadge';
import { ArrowLeftIcon } from '../../../components/ui/Icons';
import { SoundToLetterMatch } from '../components/SoundToLetterMatch';
import { LetterHunter } from '../components/LetterHunter';
import { BlendAndRead } from '../components/BlendAndRead';
import { ReadAndMatch } from '../components/ReadAndMatch';
import { SentenceReader } from '../components/SentenceReader';
import { SightWordReader } from '../components/SightWordReader';
import { PhonicsCard } from '../components/PhonicsCard';
import { RhymeMatch } from '../components/RhymeMatch';
import { StoryReader } from '../components/StoryReader';
import { WordBuilder } from '../components/WordBuilder';
import { SentenceBuilder } from '../components/SentenceBuilder';
import { LessonCelebration } from '../components/LessonCelebration';
import './GamePlay.scss';

interface GamePlayProps {
  lesson: Lesson;
  progress: UserProgress;
  onExit: () => void;
  onNextLesson?: () => void;
}

export const GamePlay: React.FC<GamePlayProps> = ({
  lesson,
  progress,
  onExit,
  onNextLesson
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionResult, setCompletionResult] = useState<{
    starsEarned: number;
    pointsEarned: number;
    newAchievements: string[];
  }>({ starsEarned: 0, pointsEarned: 0, newAchievements: [] });

  const totalQuestions = lesson.questions.length;
  const currentQuestion: LessonQuestion = lesson.questions[currentQuestionIndex];

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Complete lesson!
      const pointsEarned = totalQuestions * 20;
      const starsEarned = lesson.starsToEarn;

      const { newAchievements } = storageService.recordLessonCompletion(
        lesson.id,
        starsEarned,
        pointsEarned,
        lesson.skillId
      );

      setCompletionResult({
        starsEarned,
        pointsEarned,
        newAchievements
      });

      setIsCompleted(true);
    }
  };

  const handleBackClick = () => {
    soundManager.playPop();
    onExit();
  };

  if (isCompleted) {
    return (
      <LessonCelebration
        lesson={lesson}
        starsEarned={completionResult.starsEarned}
        pointsEarned={completionResult.pointsEarned}
        streakDays={progress.streakDays}
        newAchievements={completionResult.newAchievements}
        onNextLesson={onNextLesson}
        onReturnToDashboard={onExit}
      />
    );
  }

  return (
    <div className="gameplay-container">
      {/* Lesson Game Top Navigation */}
      <div className="gameplay-header">
        <button
          onClick={handleBackClick}
          className="exit-btn"
        >
          <ArrowLeftIcon size={14} />
          <span>Exit Activity</span>
        </button>

        <div className="progress-bar-slot">
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={totalQuestions}
          />
        </div>

        <StarBadge
          stars={progress.totalStars}
          size="sm"
        />
      </div>

      {/* Dynamic Reading Activity Engine with state isolation per question */}
      <div className="gameplay-question-body">
        {currentQuestion.type === 'sound-to-letter' && (
          <SoundToLetterMatch
            key={currentQuestion.id}
            question={currentQuestion}
            onCorrectAnswer={handleNextQuestion}
          />
        )}

        {currentQuestion.type === 'find-letter' && (
          <LetterHunter
            key={currentQuestion.id}
            question={currentQuestion}
            onCorrectAnswer={handleNextQuestion}
          />
        )}

        {currentQuestion.type === 'blend-and-read' && (
          <BlendAndRead
            key={currentQuestion.id}
            question={currentQuestion}
            onCorrectAnswer={handleNextQuestion}
          />
        )}

        {currentQuestion.type === 'read-and-match' && (
          <ReadAndMatch
            key={currentQuestion.id}
            question={currentQuestion}
            onCorrectAnswer={handleNextQuestion}
          />
        )}

        {currentQuestion.type === 'sentence-comprehension' && (
          <SentenceReader
            key={currentQuestion.id}
            question={currentQuestion}
            onCorrectAnswer={handleNextQuestion}
          />
        )}

        {currentQuestion.type === 'sight-word-reader' && (
          <SightWordReader
            key={currentQuestion.id}
            question={currentQuestion}
            onCorrectAnswer={handleNextQuestion}
          />
        )}

        {currentQuestion.type === 'letter-sound' && (
          <PhonicsCard
            key={currentQuestion.id}
            question={currentQuestion}
            onCorrectAnswer={handleNextQuestion}
          />
        )}

        {currentQuestion.type === 'rhyme-match' && (
          <RhymeMatch
            key={currentQuestion.id}
            question={currentQuestion}
            onCorrectAnswer={handleNextQuestion}
          />
        )}

        {currentQuestion.type === 'story-read' && (
          <StoryReader
            key={currentQuestion.id}
            question={currentQuestion}
            onCorrectAnswer={handleNextQuestion}
          />
        )}

        {currentQuestion.type === 'build-word' && (
          <WordBuilder
            key={currentQuestion.id}
            question={currentQuestion}
            onCorrectAnswer={handleNextQuestion}
          />
        )}

        {currentQuestion.type === 'sentence-build' && (
          <SentenceBuilder
            key={currentQuestion.id}
            question={currentQuestion}
            onCorrectAnswer={handleNextQuestion}
          />
        )}
      </div>
    </div>
  );
};
