import type { AppDefinition } from '../types/app';

export const APP_REGISTRY: AppDefinition[] = [
  {
    id: 'reading',
    name: 'Reading',
    shortName: 'Reading',
    tagline: 'Letters, Phonics, CVC Words & Stories',
    iconName: 'book',
    color: '#FF5964',
    accentColor: '#FF9F1C',
    category: 'reading',
    isReady: true,
    gradeLevels: ['Kindergarten', '1st Grade', '2nd Grade']
  },
  {
    id: 'math',
    name: 'Math Quest',
    shortName: 'Math',
    tagline: 'Numbers, Shapes, Patterns & Counting',
    iconName: 'math',
    color: '#4D96FF',
    accentColor: '#06D6A0',
    category: 'math',
    isReady: false,
    gradeLevels: ['K–2nd Grade']
  },
  {
    id: 'science',
    name: 'Science Lab',
    shortName: 'Science',
    tagline: 'Space, Animals, Weather & Plants',
    iconName: 'science',
    color: '#06D6A0',
    accentColor: '#118AB2',
    category: 'science',
    isReady: false,
    gradeLevels: ['K–2nd Grade']
  },
  {
    id: 'art',
    name: 'Art Studio',
    shortName: 'Art',
    tagline: 'Draw, Color & Express Creativity',
    iconName: 'art',
    color: '#9D4EDD',
    accentColor: '#FF70A6',
    category: 'creativity',
    isReady: false,
    gradeLevels: ['All Ages']
  }
];

export function getAppById(appId: string): AppDefinition | undefined {
  return APP_REGISTRY.find(app => app.id === appId);
}

