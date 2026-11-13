// The password page (OPS-14): what the site shows until a device has signed
// in. The Worker in front of the site (worker/gate.ts) serves it as gate.html,
// and checks the password when the form is sent to /sign-in. A wrong one comes
// back here as `?wrong`. It's for grown-ups, so Luna says nothing: there's no
// clip to play before the voice files are open.

import { ChunkyButton, Luna, PaperCard, TextField } from '@/components/kit';
import styles from './SignIn.module.scss';

export function SignIn({ wrong }: { wrong: boolean }) {
  return (
    <main className={styles.page}>
      <div className={styles.welcome}>
        <Luna mood="idle" size={120} float />
        <h1 className={styles.title}>Ms. Luna’s Learning Pad</h1>
      </div>
      <PaperCard variant="lifted" className={styles.card}>
        <form className={styles.form} method="post" action="/sign-in">
          <p className={styles.lead}>Grown-ups, type the class password.</p>
          <TextField
            label="Class password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            autoFocus
            wrong={wrong}
            note={wrong ? 'That’s not it. Try again.' : undefined}
          />
          <ChunkyButton type="submit" variant="action" size={64} icon="lock" className={styles.go}>
            Come in
          </ChunkyButton>
        </form>
      </PaperCard>
    </main>
  );
}
