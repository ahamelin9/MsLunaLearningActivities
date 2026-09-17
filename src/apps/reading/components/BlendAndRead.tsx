import React, { useState, useEffect } from 'react';
import type { BlendAndReadQuestion } from '../../../types/reading';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { Button } from '../../../components/ui/Button';
import { SpeakerIcon, CheckIcon, SparklesIcon, LightbulbIcon } from '../../../components/ui/Icons';
import './BlendAndRead.scss';

interface BlendAndReadProps {
  question: BlendAndReadQuestion;
  onCorrectAnswer: () => void;
}

export const BlendAndRead: React.FC<BlendAndReadProps> = ({
  question,
  onCorrectAnswer
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [activePhonemeIndex, setActivePhonemeIndex] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (question.speechPrompt) {
      soundManager.speak(question.speechPrompt);
    } else {
      soundManager.speak(`Blend the sounds to read the word!`);
    }
  }, [question.speechPrompt]);

  const handleTapPhoneme = (index: number, spokenSound: string) => {
    soundManager.playLetterTap();
    setActivePhonemeIndex(index);
    pronunciation.speakLetterSound(spokenSound);
    setTimeout(() => {
      setActivePhonemeIndex(null);
    }, 600);
  };

  const handleBlendAll = () => {
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
    <div className="blend-read-container">
      <div className="blending-stage-card">
        <button
          onClick={() => soundManager.speak(question.prompt)}
          className="prompt-pill-btn"
        >
          <SpeakerIcon size={16} />
          <span>{question.prompt}</span>
        </button>

        <div className="phonemes-track">
          {question.phonemes.map((phoneme, idx) => {
            const isActive = activePhonemeIndex === idx;

            return (
              <button
                key={`${phoneme.text}-${idx}`}
                onClick={() => handleTapPhoneme(idx, phoneme.spokenSound)}
                className={`phoneme-block ${isActive ? 'active' : ''}`}
                title="Tap to hear phoneme"
              >
                <span className="phoneme-char">{phoneme.text}</span>
                {phoneme.soundLabel && (
                  <span className="phoneme-sound-label">{phoneme.soundLabel}</span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleBlendAll}
          className="blend-word-btn"
          title="Blend and hear word"
        >
          <SpeakerIcon size={20} />
          <span>Blend & Read: "${question.word.toUpperCase()}"</span>
        </button>
      </div>

      <div className="blend-options-grid">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isOptionSuccess = isSelected && option.isCorrect;
          const isOptionWrong = isSelected && !option.isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id, option.isCorrect, option.text)}
              disabled={isCorrect}
              className={`blend-option-card ${isOptionSuccess ? 'correct' : ''} ${isOptionWrong ? 'wrong' : ''}`}
            >
              <span className="option-emoji">{option.imageEmoji}</span>
              <span className="option-text">{option.text}</span>
              {isOptionSuccess && (
                <span className="matched-badge">Matches! ✨</span>
              )}
            </button>
          );
        })}
      </div>

      {isCorrect && (
        <div className="blend-success-banner">
          <div className="success-content">
            <SparklesIcon size={24} color="#059669" />
            <span>Bravo! You blended the sounds into "${question.word.toUpperCase()}"! 🌟</span>
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
        <div className="blend-hint-area">
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
