import React, { useState, useEffect, useMemo } from 'react';
import type { FindLetterQuestion } from '../../../types/reading';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { Button } from '../../../components/ui/Button';
import { SpeakerIcon, CheckIcon, SparklesIcon, LightbulbIcon } from '../../../components/ui/Icons';
import { shuffle } from '../engine/content';
import './LetterHunter.scss';

interface LetterHunterProps {
  question: FindLetterQuestion;
  onCorrectAnswer: () => void;
}

export const LetterHunter: React.FC<LetterHunterProps> = ({
  question,
  onCorrectAnswer
}) => {
  // The written order always put the answer first, which a child learns fast.
  const options = useMemo(() => shuffle(question.options), [question.options]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // The written prompt never names the letter; only the spoken one does.
  const sayPrompt = () => {
    if (question.speechPrompt) {
      soundManager.speak(question.speechPrompt);
    } else {
      pronunciation.speakSequence([{ text: 'Find the letter' }, { name: question.targetLetter }]);
    }
  };

  useEffect(() => {
    sayPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.speechPrompt, question.targetLetter]);

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

  const playTargetLetter = () => {
    soundManager.playLetterTap();
    pronunciation.speakSequence([{ text: 'Letter' }, { name: question.targetLetter }]);
  };

  return (
    <div className="letter-hunter-container">
      <div className="hunter-target-card">
        <button
          onClick={playTargetLetter}
          className="target-spotlight-box"
          title="Tap to hear target letter"
        >
          <span className="hunter-badge">🔊 Spot the letter you hear</span>
          {/* heard, never shown, until it is found: otherwise this is shape-matching */}
          <span className="target-char">{isCorrect ? question.targetLetter : '?'}</span>
        </button>

        <button
          onClick={sayPrompt}
          className="prompt-pill-btn"
        >
          <SpeakerIcon size={16} />
          <span>{question.prompt}</span>
        </button>
      </div>

      <div className="hunter-options-grid">
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isOptionSuccess = isSelected && option.isCorrect;
          const isOptionWrong = isSelected && !option.isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id, option.letter, option.isCorrect)}
              disabled={isCorrect}
              className={`hunter-bubble-btn ${isOptionSuccess ? 'correct' : ''} ${isOptionWrong ? 'wrong' : ''}`}
            >
              <span className="bubble-letter">{option.letter}</span>
              {isOptionSuccess && (
                <span className="spotted-tag">Found It! 🌟</span>
              )}
            </button>
          );
        })}
      </div>

      {isCorrect && (
        <div className="hunter-success-banner">
          <div className="success-content">
            <SparklesIcon size={24} color="#059669" />
            <span>Eagle eyes! You spotted the letter {question.targetLetter}! 🎯</span>
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
        <div className="hunter-hint-area">
          {/* hints are spoken, never written: on screen they would name the answer */}
          <button
            onClick={() => {
              soundManager.playPop();
              setShowHint(true);
              soundManager.speak(question.hint || '');
            }}
            className="hint-btn"
          >
            <LightbulbIcon size={14} color="#059669" />
            <span>{showHint ? 'Hear the hint again' : 'Need a hint?'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
