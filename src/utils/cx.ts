/**
 * Joins CSS-module class names, skipping the ones switched off:
 * `cx(styles.card, isWide && styles.wide)`. States don't go through here;
 * they go in `data-state` (docs/design-system/screens.md).
 */
export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}
