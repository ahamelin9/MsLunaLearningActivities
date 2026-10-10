# OPS — Housekeeping (anytime)

### OPS-1 · Delete dead code
Task · P2 · S
- `src/App.css` (534 lines, never imported)
- `components/os/AppDock.tsx`
- `useUserProgress`
- `getAppById`
- `AppDefinition.component`
- `WindowState`
- Luna's unused `intro` lines, unless FB-2 uses them
- **Complete when:** every listed item is deleted, and build and lint stay clean.

### OPS-2 · README and stale copy
Task · P2 · S
- The README says ~0.8 MB of audio; it's 21 MB.
- Grade Select mentions a "dashboard" that doesn't exist.
- **Complete when:** the README's audio size and layout match the repo, and no screen mentions a dashboard.

### OPS-3 · Decide the "Coming Soon" apps
Task · P2 · S
- **Why:** Math, Science and Art are registered, but the home screen only shows Reading, so `ComingSoonApp` can't be reached.
- **Decided (Alex, 2026-10-08):** remove them. This is an ESL teacher's app and reading is the core. Other subjects will never be added. Later apps will only surround ESL reading (activities that support a child's English as a whole), so the home screen leaves room for those, not for school subjects.
- **How:** delete the Math, Science and Art entries from `apps/registry.ts`, `apps/preview/ComingSoonApp.*`, and the unused icons that only they use.
- **Complete when:** the registry holds only Reading, `ComingSoonApp` is gone, and build and lint pass.
