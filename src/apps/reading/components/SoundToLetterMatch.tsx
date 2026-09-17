import React, { useState, useEffect } from 'react';
import type { SoundToLetterQuestion } from '../../../types/reading';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { Button } from '../../../components/ui/Button';
import { SpeakerIcon, CheckIcon, SparklesIcon, LightbulbIcon } from '../../../components/ui/Icons';
import './SoundToLetterMatch.scss';

interface SoundToLetterMatchProps {
  question: SoundToLetterQuestion;
  onCorrectAnswer: () => void;
}

export const SoundToLetterMatch: React.FC<SoundToLetterMatchProps> = ({
  question,
  onCorrectAnswer
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (question.speechPrompt) {
      soundManager.speak(question.speechPrompt);
    } else {
      pronunciation.speakSequence([
        { text: 'What letter makes the sound' },
        { sound: question.targetLetter }
      ]);
    }
  }, [question.speechPrompt, question.targetLetter]);

  const playTargetSound = () => {
    soundManager.playLetterTap();
    pronunciation.speakLetterSound(question.targetLetter);
  };

  const handleSelectOption = (optionId: string, letter: string, isOptCorrect: boolean) => {
    if (isCorrect) return;
    setSelectedOptionId(optionId);
    pronunciation.speakSequence([{ text: 'Letter' }, { name: letter }]);

    if (isOptCorrect) {
      setIsCorrect(true);
      soundManager.playCorrect();
    } else {
      soundManager.playTryAgain();
    }
  };

  return (
    <div className="sound-match-container">
      <div className="sound-cue-card">
        <button
          onClick={playTargetSound}
          className="big-sound-circle-btn"
          title="Tap to hear sound"
        >
          <span className="sound-speaker-icon">
            <SpeakerIcon size={44} color="#FFFFFF" />
          </span>
          <span className="sound-phoneme-text">{question.targetSoundName}</span>
          <span className="sound-tap-hint">Tap to listen</span>
        </button>

        <button
          onClick={() => soundManager.speak(question.prompt)}
          className="prompt-pill-btn"
        >
          <SpeakerIcon size={16} />
          <span>{question.prompt}</span>
        </button>
      </div>

      <div className="letter-options-grid">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isOptionSuccess = isSelected && option.isCorrect;
          const isOptionWrong = isSelected && !option.isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id, option.letter, option.isCorrect)}
              disabled={isCorrect}
              className={`letter-card-btn ${isOptionSuccess ? 'correct' : ''} ${isOptionWrong ? 'wrong' : ''}`}
            >
              <span className="letter-char">{option.letter}</span>
              {isOptionSuccess && (
                <span className="match-pill">Correct! ✨</span>
              )}
            </button>
          );
        })}
      </div>

      {isCorrect && (
        <div className="sound-match-success-banner">
          <div className="success-content">
            <SparklesIcon size={24} color="#059669" />
            <span>Awesome ears! Letter {question.targetLetter} makes {question.targetSoundName}!</span>
          </div>
          <Button
            variant="success"
            size="lg"
            onClick={onCorrectAnswer}
            style={{ minWidth: '180px' }}
          >
            <span>Next Question</span>
            <CheckIcon size={20} />
          </Button>
        </div>
      )}

      {!isCorrect && question.hint && (
        <div className="sound-match-hint-area">
          {!showHint ? (
            <button
              onClick={() => {
                soundManager.playPop();
                setShowHint(true);
                soundManager.speak(question.hint || '');
              }}
              className="hint-btn"
            >
              <LightbulbIcon size={14} color="#059669" />
              <span>Need a hint?</span>
            </button>
          ) : (
            <div className="hint-pill">
              💡 Hint: {question.hint}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
