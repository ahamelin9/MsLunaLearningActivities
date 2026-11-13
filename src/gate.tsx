// The password page's own entry (OPS-14), built beside the app as gate.html.
// It loads only the styles and the kit, so it opens before the device has
// signed in; the Worker (worker/gate.ts) lets its files through.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.scss';
import { SignIn } from './components/os/SignIn/SignIn';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SignIn wrong={new URLSearchParams(location.search).has('wrong')} />
  </StrictMode>
);
