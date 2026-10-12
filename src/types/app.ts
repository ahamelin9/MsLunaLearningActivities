import type { ReactNode } from 'react';

// Reading now; later ESL companion apps, never school subjects (OPS-3)
export type AppCategory = 'reading';

export interface AppDefinition {
  id: string;
  name: string;
  tagline: string;
  category: AppCategory;
  gradeLevels?: string[];
  component?: () => ReactNode;
}

export type WindowState = 'closed' | 'opening' | 'open' | 'closing';
