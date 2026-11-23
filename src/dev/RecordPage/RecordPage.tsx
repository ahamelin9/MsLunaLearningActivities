// The recording page (VOX-7, VOX-8): Alex records every phonics sound, three
// takes and the word each, a group at a time, and the dev server saves every
// take as a WAV in scripts/voice/takes/ (git ignores it:
// scripts/voice/takes-server.mjs).
// Dev only: main.tsx opens it for `/?record` when import.meta.env.DEV, as a
// lazy chunk the production build drops, like the Kit page.
//
// A take is heard back at once and can be recorded again; the newest one is
// the one kept. The convert script turns the takes into Luna's voice
// (.claude/skills/know-how/voice-audit/convert-takes.py).

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChunkyButton, PaperCard, ProgressBar } from '@/components/kit';
import { GROUPS, RECORD_SOUNDS, slotsOf, takeName, type GroupId, type RecordSound, type Slot } from './sounds';
import { recording, startTake, stopTake } from './recorder';
import styles from './RecordPage.module.scss';

type Note = { seconds: number; peak?: number };
const TOO_LOUD = 0.98;
const TOO_QUIET = 0.05;

const GROUP_KEY = 'luna-record-group';

const slotLabel = (sound: RecordSound, slot: Slot) =>
  slot === 'word' ? `The word: "${sound.word}"` : `Take ${slot.slice(-1)}`;

export default function RecordPage() {
  const [saved, setSaved] = useState<Record<string, Note>>({});
  const [live, setLive] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const playing = useRef<HTMLAudioElement | null>(null);
  const [group, setGroup] = useState<GroupId>(() => {
    try {
      const g = localStorage.getItem(GROUP_KEY);
      if (GROUPS.some(x => x.id === g)) return g as GroupId;
    } catch {
      // no storage (a private window): start at the first group
    }
    return GROUPS[0].id;
  });
  const pick = (id: GroupId) => {
    setGroup(id);
    try {
      localStorage.setItem(GROUP_KEY, id);
    } catch {
      // no storage: the group just isn't remembered
    }
  };

  useEffect(() => {
    void fetch('/__takes')
      .then(r => r.json() as Promise<string[]>)
      .then(names => setSaved(Object.fromEntries(names.map(n => [n, { seconds: 0 }]))))
      .catch(() => setProblem('The dev server has no save: run npm run dev.'));
  }, []);

  const play = (name: string) => {
    playing.current?.pause();
    playing.current = new Audio(`/__takes/${name}?t=${Date.now()}`);
    void playing.current.play();
  };

  const toggle = useCallback(
    async (name: string) => {
      setProblem(null);
      if (recording()) {
        const take = stopTake();
        const was = live;
        setLive(null);
        if (!take || !was) return;
        const r = await fetch(`/__takes/${was}`, { method: 'PUT', body: take.wav });
        if (!r.ok) return setProblem(`Not saved: ${await r.text()}`);
        setSaved(s => ({ ...s, [was]: { seconds: take.seconds, peak: take.peak } }));
        play(was);
        return;
      }
      try {
        playing.current?.pause();
        await startTake();
        setLive(name);
      } catch {
        setProblem('The microphone was refused: allow it for localhost in the browser, then try again.');
      }
    },
    [live]
  );

  // the space bar starts and stops the take being recorded, so no click is in it
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || !live) return;
      e.preventDefault();
      void toggle(live);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [live, toggle]);

  const countSaved = (sounds: RecordSound[]) => sounds.reduce((n, s) => n + slotsOf(s).filter(slot => saved[takeName(s, slot)]).length, 0);
  const countSlots = (sounds: RecordSound[]) => sounds.reduce((n, s) => n + slotsOf(s).length, 0);
  const all = countSlots(RECORD_SOUNDS);
  const done = countSaved(RECORD_SOUNDS);
  const shown = RECORD_SOUNDS.filter(s => s.group === group);

  return (
    <div className={styles.page} data-shot="record-page">
      <header className={styles.bar}>
        <h1 className={styles.title}>Record the phonics sounds</h1>
        <ProgressBar size="rounds" done={done} total={all} label={`${done} of ${all} takes saved`} className={styles.progress} />
        <span className={styles.count}>
          {done} of {all} saved
        </span>
      </header>

      <div className={styles.intro}>
        <p>
          A quiet room, no fan or fridge hum. The microphone 15 to 20 cm from your mouth, a little to the side. One group
          at a time: tell Claude when a group is done, and its takes go on the Sound Check page in Luna's voice. For each
          sound: three takes of the sound alone, then the word once. Press a take's button, say it, then press the
          button or the space bar to stop. It plays back; record it again if you like, and the newest take is kept.
        </p>
        <p>The takes stay on this Mac (scripts/voice/takes/, which git ignores). Only Luna's version of them goes on.</p>
        {problem && (
          <p className={styles.problem} role="alert">
            {problem}
          </p>
        )}
      </div>

      <nav className={styles.groups} aria-label="Groups of sounds">
        {GROUPS.map(g => {
          const sounds = RECORD_SOUNDS.filter(s => s.group === g.id);
          const got = countSaved(sounds);
          const of = countSlots(sounds);
          return (
            <div key={g.id} className={styles.group} data-shot="record-group">
              <ChunkyButton
                variant="secondary"
                aria-pressed={g.id === group}
                disabled={live !== null}
                onClick={() => pick(g.id)}
              >
                {g.label}
              </ChunkyButton>
              <ProgressBar size="rounds" done={got} total={of} label={`${g.label}: ${got} of ${of} takes saved`} />
            </div>
          );
        })}
      </nav>

      <div className={styles.cards}>
        {shown.map(sound => (
          <PaperCard key={`${sound.kind}-${sound.file}`} variant="card" className={styles.card} data-shot="record-card">
            <div className={styles.head}>
              <h2 className={styles.sound}>{sound.label}</h2>
              <span className={styles.kind}>{sound.kind === 'name' ? 'its name' : sound.held ? 'held, about a second' : 'quick'}</span>
            </div>
            <p className={styles.how}>
              {sound.kind === 'name' ? 'Say' : 'As in'} <strong>{sound.kind === 'name' ? `“${sound.word}”` : sound.word}</strong>. {sound.how}
            </p>
            <ul className={styles.slots}>
              {slotsOf(sound).map(slot => {
                const name = takeName(sound, slot);
                const note = saved[name];
                const isLive = live === name;
                return (
                  <li key={slot} className={styles.slot} data-state={isLive ? 'recording' : note ? 'saved' : undefined}>
                    <span className={styles.slotName}>{slotLabel(sound, slot)}</span>
                    <ChunkyButton
                      variant={isLive ? 'accent' : 'secondary'}
                      icon={isLive ? 'close' : 'ear'}
                      disabled={live !== null && !isLive}
                      onClick={() => void toggle(name)}
                      data-shot="record-take"
                      data-take={name}
                    >
                      {isLive ? 'Stop' : note ? 'Again' : 'Record'}
                    </ChunkyButton>
                    {note && !isLive && (
                      <ChunkyButton variant="quiet" icon="speaker" onClick={() => play(name)} aria-label={`Hear ${slotLabel(sound, slot)}`}>
                        Hear
                      </ChunkyButton>
                    )}
                    <span className={styles.note}>
                      {isLive
                        ? 'Recording…'
                        : note?.peak === undefined
                          ? note
                            ? 'Saved'
                            : ''
                          : note.peak >= TOO_LOUD
                            ? 'Too loud: move back a little and record it again'
                            : note.peak < TOO_QUIET
                              ? 'Very quiet: come a little closer and record it again'
                              : `Saved, ${note.seconds.toFixed(1)} s`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </PaperCard>
        ))}
      </div>
    </div>
  );
}
