import React, { useState } from 'react';
import type { UserProgress, UserSettings } from '@/types/user';
import type { GradeLevel } from '@/types/reading';
import { storageService } from '@/utils/storage';
import { soundManager } from '@/utils/audio';
import { XIcon, RefreshIcon, CheckIcon } from '@/components/ui/Icons/Icons';
import { VoicePicker } from '../VoicePicker/VoicePicker';
import { Button } from '@/components/ui/Button/Button';
import styles from './SettingsModal.module.scss';

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
    <div className={styles.modalBackdropBlur} onClick={onClose}>
      <div
        className={styles.modalCard}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label="Settings and Preferences"
        data-shot="settings"
      >
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <span className={styles.settingsAvatar}>⚙️</span>
            <div>
              <h3 className={styles.modalTitle}>
                LunaPad Settings
              </h3>
              <p className={styles.modalSubtitle}>
                Audio, speed, and learning controls
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className={styles.modalCloseBtn}
            data-shot="modal-close"
            aria-label="Close Settings"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Audio & Voice Settings */}
        <div className={styles.settingsGroup}>
          <span className={styles.groupLabel}>
            Audio & Speech
          </span>

          {/* Sound Effects */}
          <div className={styles.settingItemRow}>
            <div className={styles.itemLeft}>
              <span className={styles.itemEmoji}>🔔</span>
              <div className={styles.itemText}>
                <span className={styles.itemTitle}>Sound Effects</span>
                <span className={styles.itemDesc}>Chimes, pops, and cheer fanfares</span>
              </div>
            </div>
            <button
              onClick={() => handleUpdateSetting({ soundEnabled: !progress.settings.soundEnabled })}
              className={styles.toggleSwitchBtn}
              data-state={progress.settings.soundEnabled ? 'on' : 'off'}
            >
              <div className={styles.toggleSwitchHandle} />
            </button>
          </div>

          {/* Voice Narration */}
          <div className={styles.settingItemRow}>
            <div className={styles.itemLeft}>
              <span className={styles.itemEmoji}>🗣️</span>
              <div className={styles.itemText}>
                <span className={styles.itemTitle}>Ms. Luna Voice Narration</span>
                <span className={styles.itemDesc}>Read words, phonemes, and hints aloud</span>
              </div>
            </div>
            <button
              onClick={() => handleUpdateSetting({ speechEnabled: !progress.settings.speechEnabled })}
              className={styles.toggleSwitchBtn}
              data-state={progress.settings.speechEnabled ? 'on' : 'off'}
            >
              <div className={styles.toggleSwitchHandle} />
            </button>
          </div>

          {/* Less Motion (DES-6): also on when the iPad's own Reduce Motion is */}
          <div className={styles.settingItemRow}>
            <div className={styles.itemLeft}>
              <span className={styles.itemEmoji}>🍃</span>
              <div className={styles.itemText}>
                <span className={styles.itemTitle}>Less Motion</span>
                <span className={styles.itemDesc}>Stops bouncing and moving pictures; bubbles rise slower</span>
              </div>
            </div>
            <button
              onClick={() => handleUpdateSetting({ reducedMotion: !progress.settings.reducedMotion })}
              className={styles.toggleSwitchBtn}
              data-state={progress.settings.reducedMotion ? 'on' : 'off'}
              aria-pressed={progress.settings.reducedMotion}
              aria-label="Less motion"
              data-shot="less-motion"
            >
              <div className={styles.toggleSwitchHandle} />
            </button>
          </div>

          {/* Voice Speed */}
          <div className={styles.settingItemRow}>
            <div className={styles.itemLeft}>
              <span className={styles.itemEmoji}>🐢</span>
              <div className={styles.itemText}>
                <span className={styles.itemTitle}>Voice Speed</span>
                <span className={styles.itemDesc}>Beginners often need the slower setting</span>
              </div>
            </div>
            <div className={styles.speedControl} role="group" aria-label="Voice speed">
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
                    className={styles.speedBtn}
                    data-state={isActive ? 'active' : undefined}
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
        <div className={styles.settingsGroup}>
          <span className={styles.groupLabel}>Ms. Luna’s Voice</span>

          <VoicePicker
            settings={progress.settings}
            onChange={partial => storageService.updateSettings(partial)}
          />

        </div>

        {/* Grade Level Selector */}
        <div className={styles.settingsGroup}>
          <span className={styles.groupLabel}>
            Current Grade Level
          </span>
          <div className={styles.gradeSelectorGrid}>
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
                className={styles.gradeSelectBtn}
                data-state={progress.selectedGrade === g.id ? 'active' : undefined}
              >
                <span className={styles.gradeBtnEmoji}>{g.emoji}</span>
                <span className={styles.gradeBtnLabel}>{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reset Progress Area */}
        <div className={styles.resetArea}>
          {!showResetConfirm ? (
            <button
              onClick={() => {
                soundManager.playPop();
                setShowResetConfirm(true);
              }}
              className={styles.resetTriggerBtn}
            >
              <RefreshIcon size={16} />
              <span>Reset All Learning Progress</span>
            </button>
          ) : (
            <div className={styles.resetConfirmBox}>
              <div className={styles.confirmWarning}>
                <span>⚠️</span>
                <span>Are you sure? This resets all stars, points, and lessons!</span>
              </div>
              {resetSuccess ? (
                <div className={styles.resetSuccessAlert}>
                  <CheckIcon size={18} /> Progress Reset Successfully!
                </div>
              ) : (
                <div className={styles.confirmActions}>
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

