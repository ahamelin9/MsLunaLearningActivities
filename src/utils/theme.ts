// Light and dark (DES-16): `data-theme` on <html> picks the role set
// (src/styles/tokens/_roles.scss). The saved choice is "match" (follow the
// iPad), "light" or "dark"; Settings and the home screen's sun/moon button both
// change it. index.html's inline script resolves it the same way before the
// first paint, so there's no flash: keep the two in step.

import { useEffect, useState } from 'react';
import type { ThemeChoice } from '@/types/user';

export type Theme = 'light' | 'dark';

const ipadDark = () => window.matchMedia('(prefers-color-scheme: dark)');

/** The mode a choice means right now. */
export function resolveTheme(choice: ThemeChoice): Theme {
  if (choice === 'light' || choice === 'dark') return choice;
  return ipadDark().matches ? 'dark' : 'light';
}

/**
 * Keeps `data-theme` on <html> in step with the choice and, for "match", with
 * the iPad's own setting as it changes (no reload). Returns the mode showing.
 */
export function useTheme(choice: ThemeChoice): Theme {
  const [theme, setTheme] = useState<Theme>(() => resolveTheme(choice));

  useEffect(() => {
    const device = ipadDark();
    const apply = () => {
      const next = resolveTheme(choice);
      document.documentElement.setAttribute('data-theme', next);
      setTheme(next);
    };
    apply();
    device.addEventListener('change', apply);
    return () => device.removeEventListener('change', apply);
  }, [choice]);

  return theme;
}
