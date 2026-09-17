import { useState, useEffect } from 'react';
import type { AppDefinition } from './types/app';
import type { UserProgress } from './types/user';
import type { GradeLevel } from './types/reading';
import { APP_REGISTRY } from './apps/registry';
import { storageService } from './utils/storage';
import { soundManager } from './utils/audio';
import { pronunciation } from './utils/pronunciation';
import { StatusBar } from './components/os/StatusBar';
import { HomeScreen } from './components/os/HomeScreen';
import { AppWindow } from './components/os/AppWindow';
import { SettingsModal } from './components/os/SettingsModal';
import { TrophyModal } from './components/os/TrophyModal';
import { ReadingApp } from './apps/reading/ReadingApp';
import { ComingSoonApp } from './apps/preview/ComingSoonApp';
import './App.scss';

export function App() {
  const [progress, setProgress] = useState<UserProgress>(storageService.getProgress());
  const [activeApp, setActiveApp] = useState<AppDefinition | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTrophyOpen, setIsTrophyOpen] = useState(false);

  // Ms. Luna's neural voice is fetched once, on the first tap: browsers block
  // audio before a gesture, and this keeps the first paint fast.
  useEffect(() => {
    const start = () => {
      void pronunciation.init().then(ready => {
        if (ready) void pronunciation.prewarmPhonics();
      });
    };
    window.addEventListener('pointerdown', start, { once: true });
    window.addEventListener('keydown', start, { once: true });
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, []);

  // Subscribe to persistent storage updates
  useEffect(() => {
    const unsubscribe = storageService.subscribe(newProgress => {
      setProgress(newProgress);
    });
    return () => unsubscribe();
  }, []);

  const handleLaunchApp = (app: AppDefinition) => {
    soundManager.playAppLaunch();
    setActiveApp(app);
  };

  const handleCloseApp = () => {
    soundManager.playPop();
    setActiveApp(null);
  };

  const handleGradeChange = (grade: GradeLevel) => {
    storageService.setGrade(grade);
  };

  return (
    <div className={`tablet-os-root theme-${progress.settings.theme || 'sunset'}`}>
      {/* Tablet Top Status Bar */}
      <StatusBar
        progress={progress}
        onOpenSettings={() => {
          soundManager.playPop();
          setIsSettingsOpen(true);
        }}
        onOpenTrophies={() => {
          soundManager.playPop();
          setIsTrophyOpen(true);
        }}
        appName={activeApp ? activeApp.name : undefined}
        onHomeClick={handleCloseApp}
      />

      {/* Main OS View: Either Home Screen or Active App Window */}
      <div className="os-viewport">
        {!activeApp ? (
          <HomeScreen
            apps={APP_REGISTRY}
            onLaunchApp={handleLaunchApp}
          />
        ) : (
          <AppWindow
            app={activeApp}
            progress={progress}
            onClose={handleCloseApp}
          >
            {activeApp.id === 'reading' ? (
              <ReadingApp
                progress={progress}
                onReturnToHome={handleCloseApp}
                onGradeChange={handleGradeChange}
              />
            ) : (
              <ComingSoonApp
                app={activeApp}
                onReturnHome={handleCloseApp}
              />
            )}
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

      {/* Trophy & Badges Modal */}
      <TrophyModal
        isOpen={isTrophyOpen}
        progress={progress}
        onClose={() => setIsTrophyOpen(false)}
      />
    </div>
  );
}

export default App;
