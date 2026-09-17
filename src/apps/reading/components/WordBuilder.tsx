import React, { useState, useEffect } from 'react';
import type { BuildWordQuestion } from '../../../types/reading';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { Button } from '../../../components/ui/Button';
import { SpeakerIcon, SparklesIcon, CheckIcon, LightbulbIcon, RefreshIcon } from '../../../components/ui/Icons';
import './WordBuilder.scss';

interface WordBuilderProps {
  question: BuildWordQuestion;
  onCorrectAnswer: () => void;
}

const POSITIVE_MESSAGES = [
  'Super Star! 🌟',
  'Awesome Job! 🎉',
  'You Got It! 🚀',
  'Fantastic! 🦉',
  'Great Speller! 👑'
];

const ENCOURAGING_MESSAGES = [
  'Almost! Let’s sound it out together. ✨',
  'Good try! Tap a letter to swap it. 💡',
  'You’re doing great! Keep going! 🎈'
];

export const WordBuilder: React.FC<WordBuilderProps> = ({
  question,
  onCorrectAnswer
}) => {
  const wordLength = question.word.length;

  // Initialize slots and letter bank directly from props (reset handled by key on parent)
  const [slots, setSlots] = useState<string[]>(() => Array(wordLength).fill(''));
  const [bankTiles, setBankTiles] = useState<{ id: string; letter: string; isUsed: boolean }[]>(() => {
    const allLetters = [...question.letters, ...question.distractors];
    return allLetters
      .map((letter, idx) => ({ id: `${letter}-${idx}-${idx * 7}`, letter: letter.toUpperCase(), isUsed: false }))
      .sort((a, b) => a.id.localeCompare(b.id));
  });

  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [activePhonemeIndex, setActivePhonemeIndex] = useState<number>(-1);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [isSoundingOut, setIsSoundingOut] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Speak target word prompt on mount (without spelling it out)
  useEffect(() => {
    const promptToSpeak = question.speechPrompt || `Spell the word: ${question.word}`;
    soundManager.speak(promptToSpeak);
  }, [question.speechPrompt, question.word]);

  // Handle letter tile tap from bank
  const handleBankTileClick = (tileId: string, letter: string) => {
    if (isCorrect || isSoundingOut) return;

    // Find the first empty slot
    const firstEmptyIndex = slots.findIndex(s => s === '');
    if (firstEmptyIndex === -1) return;

    soundManager.playLetterSnap();
    pronunciation.speakLetterSound(letter);

    const newSlots = [...slots];
    newSlots[firstEmptyIndex] = letter;
    setSlots(newSlots);

    // Mark tile as used in bank
    setBankTiles(prev =>
      prev.map(t => (t.id === tileId ? { ...t, isUsed: true } : t))
    );

    // Check if slots are now full
    if (!newSlots.includes('')) {
      checkCompletedWord(newSlots);
    }
  };

  // Handle slot tap: return letter back to bank
  const handleSlotClick = (slotIndex: number) => {
    if (isCorrect || isSoundingOut) return;
    const letter = slots[slotIndex];
    if (!letter) return;

    soundManager.playPop();

    // Clear slot
    const newSlots = [...slots];
    newSlots[slotIndex] = '';
    setSlots(newSlots);

    // Unmark matching used tile in the bank
    let unflagged = false;
    setBankTiles(prev =>
      prev.map(t => {
        if (!unflagged && t.letter === letter && t.isUsed) {
          unflagged = true;
          return { ...t, isUsed: false };
        }
        return t;
      })
    );

    setIsAnswerChecked(false);
    setFeedbackMessage('');
  };

  const checkCompletedWord = (filledSlots: string[]) => {
    const builtWord = filledSlots.join('').toLowerCase();
    const targetWord = question.word.toLowerCase();

    setIsAnswerChecked(true);

    if (builtWord === targetWord) {
      setIsCorrect(true);
      const msgIndex = (question.word.length + targetWord.charCodeAt(0)) % POSITIVE_MESSAGES.length;
      const msg = POSITIVE_MESSAGES[msgIndex];
      setFeedbackMessage(msg);
      soundManager.playCorrect();

      // Trigger interactive sound-out blending
      triggerSoundOut(targetWord);
    } else {
      setIsCorrect(false);
      const msg = ENCOURAGING_MESSAGES[0];
      setFeedbackMessage(msg);
      soundManager.playTryAgain();
    }
  };

  const triggerSoundOut = (targetWord: string) => {
    setIsSoundingOut(true);
    const letters = targetWord.split('');

    soundManager.soundOutSequence(
      letters,
      targetWord,
      idx => {
        setActivePhonemeIndex(idx);
      },
      () => {
        setIsSoundingOut(false);
        setActivePhonemeIndex(-1);
      }
    );
  };

  const handleResetSlots = () => {
    soundManager.playPop();
    setSlots(Array(wordLength).fill(''));
    setBankTiles(prev => prev.map(t => ({ ...t, isUsed: false })));
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setFeedbackMessage('');
  };

  return (
    <div className="word-builder-container">
      {/* Target Word Picture & Audio Prompt */}
      <div className="cue-area">
        <div className="target-emoji-card">
          {question.imageEmoji}
        </div>
        <button
          onClick={() => {
            soundManager.playPop();
            soundManager.speak(question.speechPrompt || `Spell the word: ${question.word}`);
          }}
          className="prompt-speak-btn"
        >
          <SpeakerIcon size={18} />
          <span>{isCorrect ? `Word: ${question.word.toUpperCase()}` : 'Tap to hear word'}</span>
        </button>
      </div>

      {/* Target Word Slots */}
      <div className="slots-row">
        {slots.map((letter, index) => {
          const isActiveHighlight = activePhonemeIndex === index;
          const slotClass = letter
            ? isCorrect
              ? 'correct'
              : 'filled'
            : 'empty';

          return (
            <button
              key={index}
              onClick={() => handleSlotClick(index)}
              disabled={isCorrect}
              className={`letter-slot-box ${slotClass} ${isActiveHighlight ? 'highlight' : ''}`}
              title={letter ? 'Tap to remove letter' : 'Letter slot'}
            >
              <span>{letter || ''}</span>
              {letter && !isCorrect && (
                <span className="slot-remove-text">tap to remove</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Interactive Sound-Out Bar (When Correct) */}
      {isCorrect && (
        <div className="sound-out-banner">
          <div className="feedback-title">
            <SparklesIcon size={22} color="#059669" />
            <span>{feedbackMessage}</span>
          </div>

          <div className="banner-buttons-row">
            <Button
              variant="purple"
              size="md"
              onClick={() => triggerSoundOut(question.word)}
              disabled={isSoundingOut}
            >
              <SpeakerIcon size={18} />
              <span>Sound it out again!</span>
            </Button>

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
        </div>
      )}

      {/* Encouraging Feedback Banner (When Incorrect) */}
      {!isCorrect && isAnswerChecked && (
        <div className="try-again-banner">
          <span className="try-text">
            {feedbackMessage}
          </span>
          <button
            onClick={handleResetSlots}
            className="clear-btn"
          >
            <RefreshIcon size={14} /> Clear Slots
          </button>
        </div>
      )}

      {/* Available Letters Bank */}
      {!isCorrect && (
        <div className="letter-bank-section">
          <span className="bank-label">
            Choose Letters
          </span>

          <div className="letters-grid">
            {bankTiles.map(tile => (
              <button
                key={tile.id}
                onClick={() => handleBankTileClick(tile.id, tile.letter)}
                disabled={tile.isUsed}
                className={`letter-tile-btn ${tile.isUsed ? 'used' : ''}`}
                title={`Letter ${tile.letter}`}
              >
                {tile.letter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hint Area */}
      {!isCorrect && question.hint && (
        <div className="hint-area">
          {!showHint ? (
            <button
              onClick={() => {
                soundManager.playPop();
                setShowHint(true);
                soundManager.speak(question.hint || '');
              }}
              className="hint-trigger-btn"
            >
              <LightbulbIcon size={14} color="#9333EA" />
              <span>Need a hint?</span>
            </button>
          ) : (
            <div className="hint-box">
              <span>💡 Hint: {question.hint}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
