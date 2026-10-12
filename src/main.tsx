import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.scss'
import './index.css'
import App from './App.tsx'

// The Kit page, `/?kit` (DES-20): dev only, so the production build drops it
const KitPage =
  import.meta.env.DEV && new URLSearchParams(location.search).has('kit')
    ? lazy(() => import('./dev/KitPage/KitPage'))
    : null

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {KitPage ? (
      <Suspense fallback={null}>
        <KitPage />
      </Suspense>
    ) : (
      <App />
    )}
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
