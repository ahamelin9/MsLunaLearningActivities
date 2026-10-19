import { useState, useEffect } from 'react';
import type { AppDefinition } from './types/app';
import type { UserProgress } from './types/user';
import type { GradeLevel } from './types/reading';
import { APP_REGISTRY } from './apps/registry';
import { storageService } from './utils/storage';
import { soundManager } from './utils/audio';
import { pronunciation } from './utils/pronunciation';
import { useReducedMotion } from './utils/motion';
import { useTheme } from './utils/theme';
import { StatusBar } from './components/os/StatusBar/StatusBar';
import { HomeScreen } from './components/os/HomeScreen/HomeScreen';
import { AppWindow } from './components/os/AppWindow/AppWindow';
import { SettingsModal } from './components/os/SettingsModal/SettingsModal';
import { TrophyModal } from './components/os/TrophyModal/TrophyModal';
import { ReadingApp } from './apps/reading/ReadingApp';
import styles from './App.module.scss';

export function App() {
  const [progress, setProgress] = useState<UserProgress>(storageService.getProgress());
  const [activeApp, setActiveApp] = useState<AppDefinition | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTrophyOpen, setIsTrophyOpen] = useState(false);

  // less motion: the Settings switch or the iPad's own setting (DES-6)
  useReducedMotion(progress.settings.reducedMotion);

  // light or dark: the saved choice, or the iPad's own setting (DES-16)
  const theme = useTheme(progress.settings.theme);

  // Ms. Luna's voice is a set of pre-rendered clips, so it can be loaded
  // immediately rather than waiting for a tap: decoding audio works on a
  // suspended AudioContext, and only playback needs a gesture. By the time a
  // child touches a letter, every phoneme is already decoded and waiting.
  useEffect(() => {
    void pronunciation.init().then(ready => {
      if (ready) void pronunciation.prewarmPhonics();
    });
  }, []);

  // Subscribe to persistent storage updates
  useEffect(() => {
    const unsubscribe = storageService.subscribe(newProgress => {
      setProgress(newProgress);
    });
    return () => unsubscribe();
  }, []);

  // the one launch sound and the one close sound (BUG-11)
  const handleLaunchApp = (app: AppDefinition) => {
    soundManager.playAppLaunch();
    setActiveApp(app);
  };

  const handleCloseApp = () => {
    soundManager.playPop();
    setActiveApp(null);
  };

  const handleOpenSettings = () => {
    soundManager.playPop();
    setIsSettingsOpen(true);
  };

  // the home screen's day/night button saves the same choice as Settings (DES-16)
  const handleToggleTheme = () => {
    soundManager.playPop();
    storageService.updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' });
  };

  const handleGradeChange = (grade: GradeLevel) => {
    storageService.setGrade(grade);
  };

  return (
    <div className={styles.tabletOsRoot}>
      {/* the home screen's status bar, as on the round 2 Home board: the time and
          the gear (DES-9a); inside an app, the app's own header takes its place (DES-8) */}
      {!activeApp && <StatusBar onOpenSettings={handleOpenSettings} theme={theme} onToggleTheme={handleToggleTheme} />}

      {/* Main OS View: Either Home Screen or Active App Window */}
      <div className={styles.osViewport}>
        {!activeApp ? (
          <HomeScreen
            apps={APP_REGISTRY}
            onLaunchApp={handleLaunchApp}
          />
        ) : (
          <AppWindow>
            <ReadingApp
              progress={progress}
              onReturnToHome={handleCloseApp}
              onOpenSettings={handleOpenSettings}
              onOpenTrophies={() => {
                soundManager.playPop();
                setIsTrophyOpen(true);
              }}
              onGradeChange={handleGradeChange}
            />
          </AppWindow>
        )}
      </div>

      {/* Settings Dialog Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        progress={progress}
        onClose={() => setIsSettingsOpen(false)}
        onGradeChange={handleGradeChange}
      />

      {/* the Trophy room opens from the library's sticker tin (DES-9b); PRG-5's
          squishy shelf takes that over */}
      <TrophyModal
        isOpen={isTrophyOpen}
        progress={progress}
        onClose={() => setIsTrophyOpen(false)}
      />
    </div>
  );
}

export default App;
