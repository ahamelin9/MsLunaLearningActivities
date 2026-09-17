import React, { useState, useEffect } from 'react';
import type { LetterSoundQuestion } from '../../../types/reading';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { Button } from '../../../components/ui/Button';
import { SpeakerIcon, CheckIcon, LightbulbIcon, SparklesIcon } from '../../../components/ui/Icons';
import './PhonicsCard.scss';

interface PhonicsCardProps {
  question: LetterSoundQuestion;
  onCorrectAnswer: () => void;
}

export const PhonicsCard: React.FC<PhonicsCardProps> = ({
  question,
  onCorrectAnswer
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (question.speechPrompt) {
      soundManager.speak(question.speechPrompt);
    }
  }, [question.speechPrompt]);

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

  const playLetterSound = () => {
    soundManager.playLetterTap();
    pronunciation.speakSequence([
      { text: 'Letter' },
      { name: question.letter },
      { text: 'makes the' },
      { sound: question.letter },
      { text: 'sound.' }
    ]);
  };

  return (
    <div className="phonics-card-container">
      {/* Prominent Letter & Sound Badge */}
      <div className="letter-cue-card">
        <button
          onClick={playLetterSound}
          className="big-letter-box"
          title="Tap to hear letter sound"
        >
          <span className="big-letter-char">
            {question.letter}
          </span>
          <span className="sound-tag">
            Sound: {question.soundName}
          </span>
        </button>

        <button
          onClick={() => soundManager.speak(question.prompt)}
          className="prompt-button"
        >
          <SpeakerIcon size={18} />
          <span>{question.prompt}</span>
        </button>
      </div>

      {/* Options Grid */}
      <div className="phonics-options-grid">
        {question.options.map(option => {
          const isSelected = selectedOptionId === option.id;
          const isOptionSuccess = isSelected && option.isCorrect;
          const isOptionWrong = isSelected && !option.isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id, option.isCorrect, option.text)}
              disabled={isCorrect}
              className={`option-card-btn ${isOptionSuccess ? 'correct' : ''} ${isOptionWrong ? 'wrong' : ''}`}
            >
              {option.imageEmoji && (
                <span className="opt-emoji">
                  {option.imageEmoji}
                </span>
              )}
              <span className="opt-text">
                {option.text}
              </span>
              {isOptionSuccess && (
                <span className="opt-success-pill">
                  Correct! ✨
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Success Celebration and Next Button */}
      {isCorrect && (
        <div className="phonics-success-banner">
          <div className="success-text">
            <SparklesIcon size={22} color="#059669" />
            <span>That’s right! {question.targetWord} starts with {question.letter}!</span>
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

      {/* Hint Area */}
      {!isCorrect && question.hint && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          {!showHint ? (
            <button
              onClick={() => {
                soundManager.playPop();
                setShowHint(true);
                soundManager.speak(question.hint || '');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: '#FAF5FF',
                border: '1px solid #E9D5FF',
                color: '#7E22CE',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <LightbulbIcon size={14} color="#9333EA" />
              <span>Need a hint?</span>
            </button>
          ) : (
            <div style={{ background: '#FEF9C3', border: '1.5px solid #FDE047', borderRadius: '14px', padding: '8px 14px', fontSize: '13px', fontWeight: 700, color: '#854D0E' }}>
              💡 Hint: {question.hint}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

