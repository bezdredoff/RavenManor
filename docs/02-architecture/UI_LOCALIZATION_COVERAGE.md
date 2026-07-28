# UI Localization Coverage

FEATURE-055B audits player-facing literals in `src/ui/GameApp.ts` against the
runtime localization catalog.

## Defects found

The victory subtitle reported by playtest was missing. The audit also found
untranslated or partially translated copy in:

- victory next-step labels and Manor return;
- loss result text;
- both contextual tutorial cards and tutorial opt-in modal;
- special-tile, obstacle, and booster guide descriptions;
- audio, reduced-motion, board, and offline-installation explanations;
- the dynamic level-card phrase `3★ при`.

Partial dictionary replacement could produce mixed strings such as
`Moves закончились` or `keyевые ремонты`. Full authored entries now take
precedence for those sentences.

## Regression policy

`tests/GameAppLocalizationCoverage.test.ts` scans static player-facing text in
`GameApp.ts` and translates it to English. Any remaining Cyrillic text fails the
test. It also explicitly verifies the most important English and Belarusian
window copy and the dynamic level-card balance line.

This source scan complements, rather than replaces, manual language checks on a
real browser or installed PWA.
