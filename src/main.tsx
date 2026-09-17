import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Dev-only handle so the voice can be exercised from the console or a test run.
if (import.meta.env.DEV) {
  void (async () => {
    const [speech, phonics] = await Promise.all([
      import('./utils/pronunciation'),
      import('./utils/phonics')
    ]);
    (window as unknown as { __luna?: unknown }).__luna = {
      pronunciation: speech.pronunciation,
      splitPhonics: speech.splitPhonics,
      phonics
    };
  })();
}
