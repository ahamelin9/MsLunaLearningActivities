import React, { useState, useEffect } from 'react';
import type { SentenceBuildQuestion } from '../../../types/reading';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { Button } from '../../../components/ui/Button';
import { SpeakerIcon, CheckIcon, SparklesIcon, LightbulbIcon, RefreshIcon } from '../../../components/ui/Icons';
import './SentenceBuilder.scss';

interface SentenceBuilderProps {
  question: SentenceBuildQuestion;
  onCorrectAnswer: () => void;
}

export const SentenceBuilder: React.FC<SentenceBuilderProps> = ({
  question,
  onCorrectAnswer
}) => {
  const [placedWords, setPlacedWords] = useState<string[]>([]);
  const [bankWords, setBankWords] = useState<{ id: string; word: string; isUsed: boolean }[]>(() => {
    const allWords = [...question.scrambledWords, ...(question.distractorWords || [])];
    return allWords
      .map((word, idx) => ({ id: `${word}-${idx}-${idx * 13}`, word, isUsed: false }))
      .sort((a, b) => a.id.localeCompare(b.id));
  });
  const [isCorrect, setIsCorrect] = useState(false);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (question.speechPrompt) {
      soundManager.speak(question.speechPrompt);
    }
  }, [question.speechPrompt]);

  const handleBankWordClick = (tileId: string, word: string) => {
    if (isCorrect) return;
    soundManager.playLetterSnap();
    pronunciation.speakWord(word);

    const nextPlaced = [...placedWords, word];
    setPlacedWords(nextPlaced);

    setBankWords(prev =>
      prev.map(t => (t.id === tileId ? { ...t, isUsed: true } : t))
    );

    // If placed words match the length of target sentence words
    const targetWords = question.targetSentence.trim().split(/\s+/);
    if (nextPlaced.length === targetWords.length) {
      checkSentence(nextPlaced.join(' '));
    }
  };

  const handlePlacedWordClick = (index: number) => {
    if (isCorrect) return;
    const word = placedWords[index];
    soundManager.playPop();

    const nextPlaced = placedWords.filter((_, i) => i !== index);
    setPlacedWords(nextPlaced);

    // Unflag matching bank word
    let unflagged = false;
    setBankWords(prev =>
      prev.map(t => {
        if (!unflagged && t.word === word && t.isUsed) {
          unflagged = true;
          return { ...t, isUsed: false };
        }
        return t;
      })
    );

    setIsAnswerChecked(false);
  };

  const checkSentence = (sentence: string) => {
    setIsAnswerChecked(true);
    if (sentence === question.targetSentence) {
      setIsCorrect(true);
      soundManager.playCorrect();
      setTimeout(() => {
        pronunciation.speakSentence(question.targetSentence);
      }, 300);
    } else {
      setIsCorrect(false);
      soundManager.playTryAgain();
    }
  };

  const handleReset = () => {
    soundManager.playPop();
    setPlacedWords([]);
    setBankWords(prev => prev.map(t => ({ ...t, isUsed: false })));
    setIsAnswerChecked(false);
  };

  return (
    <div className="sentence-builder-container">
      {/* Visual illustration and prompt */}
      <div className="sentence-cue-area">
        <div className="cue-emoji-box">
          {question.imageEmoji}
        </div>

        <button
          onClick={() => soundManager.speak(question.prompt)}
          className="prompt-button"
        >
          <SpeakerIcon size={18} />
          <span>{question.prompt}</span>
        </button>
      </div>

      {/* Sentence Building Strip */}
      <div className="sentence-strip">
        {placedWords.length === 0 ? (
          <span className="empty-placeholder">
            Tap words below in order to build your sentence...
          </span>
        ) : (
          placedWords.map((word, idx) => (
            <button
              key={idx}
              onClick={() => handlePlacedWordClick(idx)}
              disabled={isCorrect}
              className={`placed-word-tile ${isCorrect ? 'correct' : 'normal'}`}
              title="Tap to remove word"
            >
              {word}
            </button>
          ))
        )}
      </div>

      {/* Feedback when complete */}
      {isCorrect ? (
        <div className="sentence-success-banner">
          <div className="success-text">
            <SparklesIcon size={22} color="#059669" />
            <span>Wonderful reading! You made a complete sentence!</span>
          </div>
          <Button
            variant="success"
            size="lg"
            onClick={onCorrectAnswer}
            style={{ minWidth: '180px' }}
          >
            <span>Next Activity</span>
            <CheckIcon size={20} />
          </Button>
        </div>
      ) : isAnswerChecked ? (
        <div style={{ width: '100%', background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '18px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, color: '#92400E', fontSize: '14px' }}>
            Almost! Check the word order or try again.
          </span>
          <button
            onClick={handleReset}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '9999px', background: '#FEF3C7', border: 'none', cursor: 'pointer', fontWeight: 850, fontSize: '12px', color: '#78350F' }}
          >
            <RefreshIcon size={14} /> Clear
          </button>
        </div>
      ) : null}

      {/* Scrambled Word Bank */}
      {!isCorrect && (
        <div className="scrambled-words-bank">
          {bankWords.map(tile => (
            <button
              key={tile.id}
              onClick={() => handleBankWordClick(tile.id, tile.word)}
              disabled={tile.isUsed}
              className={`bank-word-btn ${tile.isUsed ? 'used' : ''}`}
            >
              {tile.word}
            </button>
          ))}
        </div>
      )}

      {/* Hint */}
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

