import React, { useState, useEffect } from 'react';
import type { SightWordReaderQuestion } from '../../../types/reading';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { Button } from '../../../components/ui/Button';
import { SpeakerIcon, CheckIcon, SparklesIcon, LightbulbIcon } from '../../../components/ui/Icons';
import './SightWordReader.scss';

interface SightWordReaderProps {
  question: SightWordReaderQuestion;
  onCorrectAnswer: () => void;
}

export const SightWordReader: React.FC<SightWordReaderProps> = ({
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
      pronunciation.speakSequence([{ text: 'Read the sight word' }, { word: question.word }]);
    }
  }, [question.speechPrompt, question.word]);

  const playWord = () => {
    soundManager.playPop();
    pronunciation.speakWord(question.word);
  };

  const playSentence = () => {
    soundManager.playPop();
    pronunciation.speakSentence(question.exampleSentence);
  };

  const handleSelectOption = (optionId: string, word: string, isOptCorrect: boolean) => {
    if (isCorrect) return;
    setSelectedOptionId(optionId);
    pronunciation.speakWord(word);

    if (isOptCorrect) {
      setIsCorrect(true);
      soundManager.playCorrect();
    } else {
      soundManager.playTryAgain();
    }
  };

  const renderSentenceWithHighlight = () => {
    const parts = question.exampleSentence.split(new RegExp(`(${question.word})`, 'gi'));
    return parts.map((part, i) => {
      if (part.toLowerCase() === question.word.toLowerCase()) {
        return <span key={i} className="sentence-word-highlight">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="sight-word-container">
      <div className="flashcard-section">
        <button
          onClick={playWord}
          className="sight-flashcard"
          title="Tap to hear sight word"
        >
          <span className="flashcard-badge">👀 Sight Word</span>
          <span className="flashcard-word">{question.word.toUpperCase()}</span>
          <span className="flashcard-tap-hint">Tap to listen</span>
        </button>

        {question.exampleSentence && (
          <button
            onClick={playSentence}
            className="example-sentence-card"
            title="Tap to hear sentence"
          >
            <SpeakerIcon size={18} color="#D97706" />
            <div className="sentence-text">
              {renderSentenceWithHighlight()}
            </div>
          </button>
        )}

        <button
          onClick={() => soundManager.speak(question.prompt)}
          className="prompt-pill-btn"
        >
          <SpeakerIcon size={16} />
          <span>{question.prompt}</span>
        </button>
      </div>

      <div className="sight-options-grid">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isOptionSuccess = isSelected && option.isCorrect;
          const isOptionWrong = isSelected && !option.isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id, option.word, option.isCorrect)}
              disabled={isCorrect}
              className={`sight-option-btn ${isOptionSuccess ? 'correct' : ''} ${isOptionWrong ? 'wrong' : ''}`}
            >
              <span className="sight-opt-word">{option.word}</span>
              {isOptionSuccess && (
                <span className="matched-pill">You Got It! ✨</span>
              )}
            </button>
          );
        })}
      </div>

      {isCorrect && (
        <div className="sight-success-banner">
          <div className="success-content">
            <SparklesIcon size={24} color="#059669" />
            <span>Super reader! You recognized the sight word "${question.word.toUpperCase()}"! 🚀</span>
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
        <div className="sight-hint-area">
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
