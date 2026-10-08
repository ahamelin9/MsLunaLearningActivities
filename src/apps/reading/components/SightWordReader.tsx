import React, { useState, useEffect, useMemo } from 'react';
import type { SightWordReaderQuestion } from '../../../types/reading';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { Button } from '../../../components/ui/Button';
import { SpeakerIcon, CheckIcon, SparklesIcon, LightbulbIcon } from '../../../components/ui/Icons';
import { shuffle } from '../engine/content';
import './SightWordReader.scss';

interface SightWordReaderProps {
  question: SightWordReaderQuestion;
  onCorrectAnswer: () => void;
}

export const SightWordReader: React.FC<SightWordReaderProps> = ({
  question,
  onCorrectAnswer
}) => {
  // The written order always put the answer first, which a child learns fast.
  const options = useMemo(() => shuffle(question.options), [question.options]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    sayPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.speechPrompt, question.word]);

  // The written prompt never names the word; only the spoken one does.
  function sayPrompt() {
    if (question.speechPrompt) {
      soundManager.speak(question.speechPrompt);
    } else {
      pronunciation.speakSequence([{ text: 'Find the word' }, { word: question.word }]);
    }
  }

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
          <span className="flashcard-badge">👂 Sight Word</span>
          {/* heard, never shown, until it is found: the options are words, so
              showing it would turn reading into matching letters */}
          <span className="flashcard-word">{isCorrect ? question.word.toUpperCase() : '?'}</span>
          <span className="flashcard-tap-hint">Tap to listen</span>
        </button>

        {/* the sentence highlights the word, so it is the reward, not the clue */}
        {isCorrect && question.exampleSentence && (
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
          onClick={sayPrompt}
          className="prompt-pill-btn"
        >
          <SpeakerIcon size={16} />
          <span>{question.prompt}</span>
        </button>
      </div>

      <div className="sight-options-grid">
        {options.map((option) => {
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
            <span>Super reader! You recognized the sight word “{question.word.toUpperCase()}”! 🚀</span>
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
