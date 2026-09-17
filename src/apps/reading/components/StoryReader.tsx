import React, { useState } from 'react';
import type { StoryReadQuestion } from '../../../types/reading';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { Button } from '../../../components/ui/Button';
import { SpeakerIcon, CheckIcon, SparklesIcon } from '../../../components/ui/Icons';
import './StoryReader.scss';

interface StoryReaderProps {
  question: StoryReadQuestion;
  onCorrectAnswer: () => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  question,
  onCorrectAnswer
}) => {
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(-1);
  const [activeWordKey, setActiveWordKey] = useState<string | null>(null);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);

  const handleReadSentence = (text: string, index: number) => {
    setActiveSentenceIndex(index);
    soundManager.playLetterTap();
    pronunciation.speakSentence(text, {
      rate: 0.9,
      onEnd: () => {
        setActiveSentenceIndex(-1);
      }
    });
  };

  const handleTapIndividualWord = (word: string, sIdx: number, wIdx: number) => {
    const key = `${sIdx}-${wIdx}`;
    setActiveWordKey(key);
    soundManager.playPop();
    const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
    pronunciation.speakWord(cleanWord, {
      rate: 0.85,
      onEnd: () => setActiveWordKey(null)
    });
  };

  const handleReadAll = () => {
    soundManager.playPop();
    const fullStory = question.sentences.map(s => s.text).join(' ');
    pronunciation.speakSentence(fullStory);
  };

  const handleSelectAnswer = (index: number) => {
    if (isAnswerCorrect) return;
    setSelectedAnswerIndex(index);

    const isCorrect = index === question.comprehensionQuestion.correctIndex;
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      soundManager.playCorrect();
      setTimeout(() => {
        pronunciation.speakSentence(question.comprehensionQuestion.explanation);
      }, 300);
    } else {
      soundManager.playTryAgain();
    }
  };

  return (
    <div className="story-reader-container">
      {/* Story Book Card */}
      <div className="story-card">
        <div className="story-card-header">
          <div className="story-title-group">
            <span className="story-emoji">{question.imageEmoji}</span>
            <h3 className="story-title">
              {question.title}
            </h3>
          </div>
          <Button
            variant="purple"
            size="sm"
            onClick={handleReadAll}
          >
            <SpeakerIcon size={16} />
            <span>Read Whole Story</span>
          </Button>
        </div>

        <div className="tap-word-cue-banner">
          <SparklesIcon size={14} color="#7E22CE" />
          <span>Tap any word to hear it read aloud!</span>
        </div>

        {/* Story Sentences List with Interactive Word Tapping */}
        <div className="story-sentences-list">
          {question.sentences.map((sentence, sIdx) => {
            const isSentenceActive = activeSentenceIndex === sIdx;
            const words = sentence.text.split(' ');

            return (
              <div
                key={sentence.id}
                className={`story-sentence-item ${isSentenceActive ? 'active-sentence' : ''}`}
              >
                <button
                  onClick={() => handleReadSentence(sentence.text, sIdx)}
                  className="sentence-speaker-btn"
                  title="Read this sentence"
                >
                  <SpeakerIcon size={16} />
                </button>

                <div className="sentence-words-flow">
                  {words.map((word, wIdx) => {
                    const key = `${sIdx}-${wIdx}`;
                    const isWordActive = activeWordKey === key;
                    return (
                      <span
                        key={wIdx}
                        onClick={() => handleTapIndividualWord(word, sIdx, wIdx)}
                        className={`story-word-span ${isWordActive ? 'word-highlighted' : ''}`}
                        title="Tap word to hear sound"
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehension Question Section */}
      <div className="comprehension-card">
        <div className="comprehension-header">
          <span className="comp-emoji">🧠</span>
          <h4 className="comp-question">
            {question.comprehensionQuestion.question}
          </h4>
        </div>

        <div className="comprehension-options-list">
          {question.comprehensionQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswerIndex === idx;
            const isCorrectOption = isSelected && idx === question.comprehensionQuestion.correctIndex;
            const isWrongOption = isSelected && idx !== question.comprehensionQuestion.correctIndex;

            return (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(idx)}
                disabled={isAnswerCorrect}
                className={`comp-option-btn ${isCorrectOption ? 'correct' : ''} ${isWrongOption ? 'wrong' : ''}`}
              >
                <span>{option}</span>
                {isCorrectOption && <CheckIcon size={20} color="#FFFFFF" />}
              </button>
            );
          })}
        </div>

        {/* Success Banner */}
        {isAnswerCorrect && (
          <div className="comprehension-success-box">
            <div className="comp-success-text">
              <SparklesIcon size={20} color="#059669" />
              <span>{question.comprehensionQuestion.explanation}</span>
            </div>
            <Button
              variant="success"
              size="md"
              onClick={onCorrectAnswer}
            >
              <span>Finish Lesson</span>
              <CheckIcon size={18} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
