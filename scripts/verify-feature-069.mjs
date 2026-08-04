import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const design = read('src/ui/design-system.css');
const styles = read('src/style.css');
const version = read('src/appVersion.ts');
const app = read('src/ui/GameApp.ts');

const checks = [
  ['shared control tokens', design.includes('--control-surface:') && design.includes('--control-selected:')],
  ['44px touch token', design.includes('--touch-target: 44px')],
  ['compact controls use touch token', /\.compact\s*\{[^}]*min-height:\s*var\(--touch-target\)/s.test(design)],
  ['selected state contract', design.includes("button[aria-selected='true']")],
  ['disabled state contract', design.includes('button:disabled') && design.includes('--control-disabled:')],
  ['modal ornament', styles.includes('.modal-card:not(.modal-card--story)::before')],
  ['toast ornament', styles.includes('.toast::after')],
  ['tab and locked states', styles.includes(".journal-room-tab[aria-selected='true']") && styles.includes('.booster-button.locked')],
  ['accessible tab semantics', app.includes('role="tablist"') && app.includes('aria-selected="${isSelected}"')],
  ['version', version.includes('0.10.4-playtest.069-unified-ui-kit')],
];

let failed = false;
for (const [label, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'}: ${label}`);
  failed ||= !passed;
}

if (failed) process.exit(1);
