import React, { useState, useEffect } from 'react';
import type { RhymeMatchQuestion } from '../../../types/reading';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { Button } from '../../../components/ui/Button';
import { SpeakerIcon, CheckIcon, SparklesIcon, LightbulbIcon } from '../../../components/ui/Icons';
import './RhymeMatch.scss';

interface RhymeMatchProps {
  question: RhymeMatchQuestion;
  onCorrectAnswer: () => void;
}

export const RhymeMatch: React.FC<RhymeMatchProps> = ({
  question,
  onCorrectAnswer
}) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (question.speechPrompt) {
      soundManager.speak(question.speechPrompt);
    }
  }, [question.speechPrompt]);

  const handleSelectOption = (word: string, isRhyme: boolean) => {
    if (isCorrect) return;
    setSelectedWord(word);
    pronunciation.speakWord(word);

    if (isRhyme) {
      setIsCorrect(true);
      soundManager.playCorrect();
    } else {
      soundManager.playTryAgain();
    }
  };

  return (
    <div className="rhyme-match-container">
      {/* Target Rhyme Word Card */}
      <div className="target-rhyme-card">
        <button
          onClick={() => pronunciation.speakWord(question.targetWord)}
          className="big-rhyme-box"
          title="Tap to hear word"
        >
          <span className="rhyme-emoji">
            {question.targetEmoji}
          </span>
          <span className="rhyme-word">
            {question.targetWord}
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

      {/* Rhyme Options Grid */}
      <div className="rhyme-options-grid">
        {question.options.map(option => {
          const isSelected = selectedWord === option.word;
          const isOptionSuccess = isSelected && option.isRhyme;
          const isOptionWrong = isSelected && !option.isRhyme;

          return (
            <button
              key={option.word}
              onClick={() => handleSelectOption(option.word, option.isRhyme)}
              disabled={isCorrect}
              className={`rhyme-card-btn ${isOptionSuccess ? 'correct' : ''} ${isOptionWrong ? 'wrong' : ''}`}
            >
              <span className="opt-emoji">
                {option.emoji}
              </span>
              <span className="opt-word">
                {option.word}
              </span>
              {isOptionSuccess && (
                <span className="opt-rhyme-pill">
                  Rhymes! 🎵
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Success Banner */}
      {isCorrect && (
        <div className="rhyme-success-banner">
          <div className="success-text">
            <SparklesIcon size={22} color="#059669" />
            <span>Music to my ears! {question.targetWord} rhymes with {selectedWord}!</span>
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
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <LightbulbIcon size={14} color="#059669" />
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

