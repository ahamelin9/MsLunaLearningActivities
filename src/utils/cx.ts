/**
 * Joins CSS-module class names, skipping the ones switched off:
 * `cx(styles.card, isWide && styles.wide)`. States don't go through here;
 * they go in `data-state` (docs/design-system/screens.md).
 */
export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/**
 * A `data-state` value from the states that are on:
 * `data-state={dataState(isOpen && 'open', isMatched && 'matched')}`.
 * Several at once come out space-separated and are matched with
 * `[data-state~="open"]`; none leaves the attribute off.
 */
export function dataState(...states: (string | false | null | undefined)[]): string | undefined {
  return cx(...states) || undefined;
}
