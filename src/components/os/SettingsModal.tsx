import React, { useState } from 'react';
import type { UserProgress, UserSettings } from '../../types/user';
import type { GradeLevel } from '../../types/reading';
import { storageService } from '../../utils/storage';
import { soundManager } from '../../utils/audio';
import { XIcon, RefreshIcon, CheckIcon } from '../ui/Icons';
import { VoicePicker } from './VoicePicker';
import { Button } from '../ui/Button';
import './SettingsModal.scss';

interface SettingsModalProps {
  isOpen: boolean;
  progress: UserProgress;
  onClose: () => void;
  onGradeChange: (grade: GradeLevel) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  progress,
  onClose,
  onGradeChange
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpdateSetting = (partial: Partial<UserSettings>) => {
    soundManager.playPop();
    storageService.updateSettings(partial);
  };

  const handleReset = () => {
    soundManager.playFanfare();
    storageService.resetProgress();
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setShowResetConfirm(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label="Settings and Preferences"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-title-group">
            <span className="settings-avatar">⚙️</span>
            <div>
              <h3 className="modal-title">
                LunaPad Settings
              </h3>
              <p className="modal-subtitle">
                Audio, speed, and learning controls
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="modal-close-btn"
            aria-label="Close Settings"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Audio & Voice Settings */}
        <div className="settings-group">
          <span className="group-label">
            Audio & Speech
          </span>

          {/* Sound Effects */}
          <div className="setting-item-row">
            <div className="item-left">
              <span className="item-emoji">🔔</span>
              <div className="item-text">
                <span className="item-title">Sound Effects</span>
                <span className="item-desc">Chimes, pops, and cheer fanfares</span>
              </div>
            </div>
            <button
              onClick={() => handleUpdateSetting({ soundEnabled: !progress.settings.soundEnabled })}
              className={`toggle-switch-btn ${progress.settings.soundEnabled ? 'toggle-on' : ''}`}
            >
              <div className="toggle-switch-handle" />
            </button>
          </div>

          {/* Voice Narration */}
          <div className="setting-item-row">
            <div className="item-left">
              <span className="item-emoji">🗣️</span>
              <div className="item-text">
                <span className="item-title">Ms. Luna Voice Narration</span>
                <span className="item-desc">Read words, phonemes, and hints aloud</span>
              </div>
            </div>
            <button
              onClick={() => handleUpdateSetting({ speechEnabled: !progress.settings.speechEnabled })}
              className={`toggle-switch-btn ${progress.settings.speechEnabled ? 'toggle-on' : ''}`}
            >
              <div className="toggle-switch-handle" />
            </button>
          </div>

          {/* Voice Speed */}
          <div className="setting-item-row">
            <div className="item-left">
              <span className="item-emoji">🐢</span>
              <div className="item-text">
                <span className="item-title">Voice Speed</span>
                <span className="item-desc">Beginners often need the slower setting</span>
              </div>
            </div>
            <div className="speed-control" role="group" aria-label="Voice speed">
              {[
                { label: 'Beginner', value: 0.75 },
                { label: 'Normal', value: 0.95 },
                { label: 'Quick', value: 1.15 }
              ].map(option => {
                const current = progress.settings.speechRate;
                const isActive =
                  option.value === 0.75 ? current < 0.85 : option.value === 0.95 ? current >= 0.85 && current <= 1.05 : current > 1.05;
                return (
                  <button
                    key={option.label}
                    className={`speed-btn ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleUpdateSetting({ speechRate: option.value })}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ms. Luna's Voice */}
        <div className="settings-group">
          <span className="group-label">Ms. Luna’s Voice</span>

          <VoicePicker
            settings={progress.settings}
            onChange={partial => storageService.updateSettings(partial)}
          />

          <div className="setting-item-row">
            <div className="item-left">
              <span className="item-emoji">💾</span>
              <div className="item-text">
                <span className="item-title">Smaller voice download</span>
                <span className="item-desc">
                  {progress.settings.voiceQuality === 'compact'
                    ? 'Using the small voice (about 92 MB). Clear, but slower to speak.'
                    : 'Using the full voice (about 325 MB). Best sound and the quickest to speak.'}
                </span>
              </div>
            </div>
            <button
              onClick={() =>
                handleUpdateSetting({
                  voiceQuality: progress.settings.voiceQuality === 'compact' ? 'best' : 'compact'
                })
              }
              className={`toggle-switch-btn ${progress.settings.voiceQuality === 'compact' ? 'toggle-on' : ''}`}
            >
              <div className="toggle-switch-handle" />
            </button>
          </div>
        </div>

        {/* Grade Level Selector */}
        <div className="settings-group">
          <span className="group-label">
            Current Grade Level
          </span>
          <div className="grade-selector-grid">
            {[
              { id: 'kindergarten', label: 'Kindergarten', emoji: '🔤' },
              { id: 'grade1', label: '1st Grade', emoji: '🚀' },
              { id: 'grade2', label: '2nd Grade', emoji: '👑' }
            ].map(g => (
              <button
                key={g.id}
                onClick={() => {
                  soundManager.playPop();
                  onGradeChange(g.id as GradeLevel);
                }}
                className={`grade-select-btn ${progress.selectedGrade === g.id ? 'active' : ''}`}
              >
                <span className="grade-btn-emoji">{g.emoji}</span>
                <span className="grade-btn-label">{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reset Progress Area */}
        <div className="reset-area">
          {!showResetConfirm ? (
            <button
              onClick={() => {
                soundManager.playPop();
                setShowResetConfirm(true);
              }}
              className="reset-trigger-btn"
            >
              <RefreshIcon size={16} />
              <span>Reset All Learning Progress</span>
            </button>
          ) : (
            <div className="reset-confirm-box">
              <div className="confirm-warning">
                <span>⚠️</span>
                <span>Are you sure? This resets all stars, points, and lessons!</span>
              </div>
              {resetSuccess ? (
                <div className="reset-success-alert">
                  <CheckIcon size={18} /> Progress Reset Successfully!
                </div>
              ) : (
                <div className="confirm-actions">
                  <Button
                    variant="warning"
                    size="sm"
                    style={{ flex: 1, background: '#DC2626' }}
                    onClick={handleReset}
                  >
                    Yes, Reset Everything
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    style={{ flex: 1 }}
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

