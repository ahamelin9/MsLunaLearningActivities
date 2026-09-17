import type { ReactNode } from 'react';

export type AppCategory = 'reading' | 'math' | 'science' | 'creativity' | 'tools';

export interface AppDefinition {
  id: string;
  name: string;
  shortName?: string;
  tagline: string;
  iconName: string;
  color: string;
  accentColor: string;
  category: AppCategory;
  isReady: boolean;
  gradeLevels?: string[];
  component?: () => ReactNode;
}

export type WindowState = 'closed' | 'opening' | 'open' | 'closing';

