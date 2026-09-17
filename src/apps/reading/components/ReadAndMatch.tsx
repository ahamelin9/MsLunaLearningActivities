import React, { useState, useEffect } from 'react';
import type { ReadAndMatchQuestion } from '../../../types/reading';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { Button } from '../../../components/ui/Button';
import { SpeakerIcon, CheckIcon, SparklesIcon, LightbulbIcon } from '../../../components/ui/Icons';
import './ReadAndMatch.scss';

interface ReadAndMatchProps {
  question: ReadAndMatchQuestion;
  onCorrectAnswer: () => void;
}

export const ReadAndMatch: React.FC<ReadAndMatchProps> = ({
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
      pronunciation.speakSequence([{ text: 'Read the word' }, { word: question.word }]);
    }
  }, [question.speechPrompt, question.word]);

  const playWord = () => {
    soundManager.playPop();
    pronunciation.speakWord(question.word);
  };

  const handleSelectOption = (optionId: string, isOptCorrect: boolean, text: string) => {
    if (isCorrect) return;
    setSelectedOptionId(optionId);
    soundManager.speak(text);

    if (isOptCorrect) {
      setIsCorrect(true);
      soundManager.playCorrect();
    } else {
      soundManager.playTryAgain();
    }
  };

  return (
    <div className="read-match-container">
      <div className="target-word-hero">
        <button
          onClick={playWord}
          className="word-hero-box"
          title="Tap to hear word"
        >
          <span className="big-word-text">{question.word.toUpperCase()}</span>
          {question.phonemes && question.phonemes.length > 0 && (
            <div className="phonemes-list">
              {question.phonemes.map((ph, idx) => (
                <span key={idx} className="phoneme-tag">{ph}</span>
              ))}
            </div>
          )}
          <span className="tap-hint">Tap to listen</span>
        </button>

        <button
          onClick={() => soundManager.speak(question.prompt)}
          className="prompt-pill-btn"
        >
          <SpeakerIcon size={16} />
          <span>{question.prompt}</span>
        </button>
      </div>

      <div className="match-options-grid">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isOptionSuccess = isSelected && option.isCorrect;
          const isOptionWrong = isSelected && !option.isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id, option.isCorrect, option.text)}
              disabled={isCorrect}
              className={`match-option-card ${isOptionSuccess ? 'correct' : ''} ${isOptionWrong ? 'wrong' : ''}`}
            >
              <span className="opt-emoji">{option.imageEmoji}</span>
              <span className="opt-label">{option.text}</span>
              {isOptionSuccess && (
                <span className="matched-tag">Matches! ✨</span>
              )}
            </button>
          );
        })}
      </div>

      {isCorrect && (
        <div className="read-match-success-banner">
          <div className="success-content">
            <SparklesIcon size={24} color="#059669" />
            <span>Spot on! That's the matching picture for "${question.word.toUpperCase()}"! 🎉</span>
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
        <div className="read-match-hint-area">
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
