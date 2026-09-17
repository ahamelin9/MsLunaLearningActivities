import React, { useState, useEffect } from 'react';
import type { SentenceComprehensionQuestion } from '../../../types/reading';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { Button } from '../../../components/ui/Button';
import { SpeakerIcon, CheckIcon, SparklesIcon, LightbulbIcon } from '../../../components/ui/Icons';
import './SentenceReader.scss';

interface SentenceReaderProps {
  question: SentenceComprehensionQuestion;
  onCorrectAnswer: () => void;
}

export const SentenceReader: React.FC<SentenceReaderProps> = ({
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
      pronunciation.speakSentence(question.sentence);
    }
  }, [question.speechPrompt, question.sentence]);

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

  const handleReadFullSentence = () => {
    soundManager.playPop();
    pronunciation.speakSentence(question.sentence);
  };

  const handleReadWord = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playPop();
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '');
    pronunciation.speakWord(cleanWord);
  };

  const words = question.sentence.split(' ');

  return (
    <div className="sentence-reader-container">
      <div className="sentence-display-card">
        <div className="sentence-prompt-header">
          <button
            onClick={() => soundManager.speak(question.prompt)}
            className="prompt-pill-btn"
          >
            <SpeakerIcon size={16} />
            <span>{question.prompt}</span>
          </button>
        </div>

        <div className="sentence-box">
          <div className="words-flow">
            {words.map((word, idx) => {
              const clean = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '').toLowerCase();
              const isHighlighted = question.highlightWords?.some(
                hw => hw.toLowerCase() === clean
              );

              return (
                <button
                  key={`${word}-${idx}`}
                  onClick={(e) => handleReadWord(word, e)}
                  className={`word-chip ${isHighlighted ? 'highlighted' : ''}`}
                  title="Tap to hear word"
                >
                  {word}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleReadFullSentence}
            className="read-sentence-btn"
            title="Read whole sentence"
          >
            <SpeakerIcon size={20} />
            <span>Hear Sentence</span>
          </button>
        </div>
      </div>

      <div className="sentence-options-grid">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isOptionSuccess = isSelected && option.isCorrect;
          const isOptionWrong = isSelected && !option.isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id, option.isCorrect, option.text)}
              disabled={isCorrect}
              className={`sentence-option-card ${isOptionSuccess ? 'correct' : ''} ${isOptionWrong ? 'wrong' : ''}`}
            >
              {option.imageEmoji && (
                <span className="option-emoji">{option.imageEmoji}</span>
              )}
              <span className="option-label">{option.text}</span>
              {isOptionSuccess && (
                <span className="success-badge">Matches! ✨</span>
              )}
            </button>
          );
        })}
      </div>

      {isCorrect && (
        <div className="sentence-success-banner">
          <div className="success-content">
            <SparklesIcon size={22} color="#059669" />
            <span>Great reading! You understood the sentence! 🎉</span>
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
        <div className="sentence-hint-area">
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
