import React, { type ReactNode } from 'react';
import styles from './AppWindow.module.scss';

interface AppWindowProps {
  children: ReactNode;
}

/**
 * The window an app opens in: the frame only. The app puts its own header in
 * it (AppHeader, DES-8), so there is one header inside an app and no status
 * bar or home-indicator strip.
 */
export const AppWindow: React.FC<AppWindowProps> = ({ children }) => (
  <div className={styles.appWindowOverlay}>
    <main className={styles.appWindowContent}>{children}</main>
  </div>
);
