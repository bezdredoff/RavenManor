import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const app = read('src/ui/GameApp.ts');
const styles = read('src/style.css');
const version = read('src/appVersion.ts');

const manorStart = app.indexOf('private showManor');
const levelsStart = app.indexOf('private getLevelMapFocusTarget', manorStart);
const manorSource = app.slice(manorStart, levelsStart);

const checks = [
  ['Home Hall hero', app.includes('home-manor-hero') && app.includes("this.renderRoomCardArt('hall'")],
  ['Home progress ribbon', app.includes('home-progress-ribbon')],
  ['Manor route', app.includes('manor-room-map') && app.includes('manor-room-node')],
  ['Level continuation', app.includes('level-continuation-card')],
  ['three-column level journey', styles.includes('grid-template-columns: repeat(3, minmax(0,1fr))')],
  ['art-first room detail', app.indexOf('${roomVisual}') < app.indexOf('room-detail-summary')],
  ['Settings ledger', app.includes('settings-ledger') && app.includes('settings-danger-zone')],
  ['reset removed from Manor', !manorSource.includes('data-action="reset"')],
  ['FEATURE-069 tokens preserved', styles.includes(".journal-room-tab[aria-selected='true']")],
  ['version', version.includes('0.10.5-playtest.070-meta-screens-refresh')],
];

let failed = false;
for (const [label, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'}: ${label}`);
  failed ||= !passed;
}

if (failed) process.exit(1);
