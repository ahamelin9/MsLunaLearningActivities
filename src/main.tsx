import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.scss'
import App from './App.tsx'

// The Kit page, `/?kit` (DES-20): dev only, so the production build drops it
const KitPage =
  import.meta.env.DEV && new URLSearchParams(location.search).has('kit')
    ? lazy(() => import('./dev/KitPage/KitPage'))
    : null
// The recording page, `/?record` (VOX-7): dev only too, and it saves through
// the dev server (scripts/voice/takes-server.mjs)
const RecordPage =
  import.meta.env.DEV && new URLSearchParams(location.search).has('record')
    ? lazy(() => import('./dev/RecordPage/RecordPage'))
    : null
const DevPage = KitPage ?? RecordPage

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {DevPage ? (
      <Suspense fallback={null}>
        <DevPage />
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
