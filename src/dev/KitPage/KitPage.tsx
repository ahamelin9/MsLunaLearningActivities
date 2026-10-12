// The Kit page (DES-20): every token and every kit component, in light and in
// dark, so a restyle can be judged at a glance. Dev only: main.tsx opens it for
// `/?kit` when import.meta.env.DEV, as a lazy chunk the production build drops.
//
// URL: ?kit&tab=tokens|components&mode=light|dark|both (both is side by side).
// Tokens are read from the page's own stylesheets (tokens.ts), and components
// from every src/components/kit/<Name>/<Name>.kit.tsx, whose default export
// renders all its states. Nothing here needs editing when either grows.

import { useLayoutEffect, useRef, useState, type ComponentType } from 'react';
import rolesScss from '@/styles/tokens/_roles.scss?raw';
import { GROUPS, contrast, parseColour, textPairs, tokenNames } from './tokens';
import styles from './KitPage.module.scss';

type Mode = 'light' | 'dark' | 'both';
type Tab = 'tokens' | 'components';

const kits = Object.entries(
  import.meta.glob<{ default: ComponentType }>('../../components/kit/*/*.kit.tsx', { eager: true })
)
  .map(([path, mod]) => ({ name: path.split('/').at(-2) ?? path, Demo: mod.default }))
  .sort((a, b) => a.name.localeCompare(b.name));

const PAIRS = textPairs(rolesScss);

function readParam<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  const v = new URLSearchParams(location.search).get(key);
  return allowed.includes(v as T) ? (v as T) : fallback;
}

export default function KitPage() {
  const [tab, setTab] = useState<Tab>(() => readParam('tab', ['tokens', 'components'] as const, 'tokens'));
  const [mode, setMode] = useState<Mode>(() => readParam('mode', ['light', 'dark', 'both'] as const, 'both'));

  const choose = (next: { tab?: Tab; mode?: Mode }) => {
    const url = new URL(location.href);
    if (next.tab) { setTab(next.tab); url.searchParams.set('tab', next.tab); }
    if (next.mode) { setMode(next.mode); url.searchParams.set('mode', next.mode); }
    history.replaceState(null, '', url);
  };

  const modes: ('light' | 'dark')[] = mode === 'both' ? ['light', 'dark'] : [mode];

  return (
    <div className={styles.page} data-shot="kit-page">
      <header className={styles.bar}>
        <h1 className={styles.title}>Kit page</h1>
        <div className={styles.switches} role="group" aria-label="What to show">
          {(['tokens', 'components'] as const).map(t => (
            <button key={t} className={styles.switch} data-state={tab === t ? 'on' : 'off'} onClick={() => choose({ tab: t })}>
              {t === 'tokens' ? 'Tokens' : 'Components'}
            </button>
          ))}
        </div>
        <div className={styles.switches} role="group" aria-label="Light or dark">
          {(['light', 'dark', 'both'] as const).map(m => (
            <button key={m} className={styles.switch} data-state={mode === m ? 'on' : 'off'} onClick={() => choose({ mode: m })}>
              {m === 'light' ? 'Light' : m === 'dark' ? 'Dark' : 'Side by side'}
            </button>
          ))}
        </div>
      </header>
      <div className={styles.panels} data-state={mode === 'both' ? 'both' : 'one'}>
        {modes.map(m => (
          <section key={m} className={styles.panel} data-theme={m} aria-label={m === 'light' ? 'Light' : 'Dark'}>
            <h2 className={styles.mode}>{m === 'light' ? 'Light' : 'Dark'}</h2>
            {tab === 'tokens' ? <Tokens /> : <Components />}
          </section>
        ))}
      </div>
    </div>
  );
}

/** Values as this panel's mode resolves them. */
function useValues(names: string[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  useLayoutEffect(() => {
    if (!ref.current) return;
    const style = getComputedStyle(ref.current);
    setValues(Object.fromEntries(names.map(n => [n, style.getPropertyValue(n).trim()])));
  }, [names]);
  return { ref, values };
}

const ALL = tokenNames();

function Tokens() {
  const { ref, values } = useValues(ALL);
  const grouped = new Set(ALL.filter(n => GROUPS.some(g => g.test(n))));
  const roles = ALL.filter(n => !grouped.has(n) && parseColour(values[n] ?? ''));
  const pairsFor = (role: string) => PAIRS.filter(([text]) => text === role);

  return (
    <div ref={ref} className={styles.tokens}>
      <h3 className={styles.heading}>Colour roles</h3>
      <ul className={styles.swatches}>
        {roles.map(n => (
          <li key={n} className={styles.role}>
            <span className={styles.swatch} style={{ background: `var(${n})` }} />
            <code className={styles.name}>{n}</code>
            <span className={styles.value}>{values[n]}</span>
            {pairsFor(n.slice(2)).map(([text, ground]) => {
              const r = contrast(values[`--${text}`], values[`--${ground}`], values['--ground']);
              return (
                <span key={ground} className={styles.pair} data-state={r !== null && r < 4.5 ? 'low' : 'ok'}
                  style={{ color: `var(--${text})`, background: `var(--${ground})` }}>
                  on {ground} {r?.toFixed(2)}
                </span>
              );
            })}
          </li>
        ))}
      </ul>

      {GROUPS.map(({ title, test }) => {
        const names = ALL.filter(test);
        return (
          <div key={title}>
            <h3 className={styles.heading}>{title}</h3>
            {names.length === 0 ? (
              <p className={styles.later}>{title === 'Type' ? 'The type roles come with DES-4.' : title === 'Motion' ? 'The motion roles come with DES-5.' : 'None yet.'}</p>
            ) : (
              <ul className={title === 'Illustration palette' ? styles.swatches : styles.demos}>
                {names.map(n => <Demo key={n} name={n} value={values[n] ?? ''} group={title} />)}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Demo({ name, value, group }: { name: string; value: string; group: string }) {
  const sample = (() => {
    switch (group) {
      case 'Illustration palette': return <span className={styles.swatch} style={{ background: `var(${name})` }} />;
      case 'Space': return <span className={styles.space} style={{ width: `var(${name})` }} />;
      case 'Corners': return <span className={styles.corner} style={{ borderRadius: `var(${name})` }} />;
      case 'Elevation':
        if (name.startsWith('--ledge-')) return <span className={styles.lift} style={{ boxShadow: `0 var(${name}) 0 var(--action-edge)`, background: 'var(--action)' }} />;
        if (name === '--press-depth') return <span className={styles.lift} style={{ transform: `translateY(var(${name}))`, boxShadow: '0 var(--border-hair) 0 var(--action-edge)', background: 'var(--action)' }} />;
        return <span className={styles.lift} style={{ boxShadow: `var(${name})` }} />;
      case 'Borders': return <span className={styles.border} style={name === '--focus-offset' ? { outline: 'var(--border-thick) solid var(--focus)', outlineOffset: `var(${name})` } : { borderTopWidth: `var(${name})` }} />;
      case 'Type':
        if (name.startsWith('--font-')) return name === '--font-display-axes' ? null : <span style={{ fontFamily: `var(${name})` }}>I l 1 · a g</span>;
        if (name === '--tracking-tag') return null;
        return (
          <span style={{ font: `var(${name})`, ...(name === '--text-tag' && { textTransform: 'uppercase', letterSpacing: 'var(--tracking-tag)' }) }}>
            I l 1 · a g
          </span>
        );
      case 'Motion': return name.startsWith('--motion-') ? <span className={styles.lift} style={{ animation: `var(${name})` }} /> : null;
      case 'Touch targets': return <span className={styles.target} style={{ width: `var(${name})`, height: `var(${name})` }} />;
      default: return null;
    }
  })();
  return (
    <li className={group === 'Illustration palette' ? styles.role : styles.demo}>
      {sample}
      <code className={styles.name}>{name}</code>
      <span className={styles.value}>{value}</span>
    </li>
  );
}

function Components() {
  if (!kits.length) {
    return (
      <p className={styles.later}>
        No kit components yet; DES-7a adds the first. Each <code>src/components/kit/&lt;Name&gt;/&lt;Name&gt;.kit.tsx</code> shows up here by itself.
      </p>
    );
  }
  return (
    <div className={styles.tokens}>
      {kits.map(({ name, Demo: KitDemo }) => (
        <div key={name}>
          <h3 className={styles.heading}>{name}</h3>
          <KitDemo />
        </div>
      ))}
    </div>
  );
}
