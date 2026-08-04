import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const app = read('src/ui/GameApp.ts');
const styles = read('src/style.css');
const translations = read('src/localization/uiTranslations.ts');
const version = read('src/appVersion.ts');

const checks = [
  ['room-stage result scene', app.includes('private renderResultScene') && app.includes('this.renderRoomSceneArt(room.id, sceneAsset')],
  ['cinematic win and loss', app.includes('result-screen--win') && app.includes('result-screen--loss')],
  ['story-first continuation', app.includes('const primaryAction: ResultAction = storyPending')],
  ['restoration route retained', app.includes("action: 'repair-now'") && app.includes("this.bindModal('repair-now'")],
  ['next-level route retained', app.includes("action: 'next-level'") && app.includes("this.bindModal('next-level'")],
  ['loss objective summary', app.includes('private renderResultObjectiveRows') && app.includes('result-objective-summary')],
  ['contained result sheet', styles.includes('grid-template-rows: minmax(190px, 38dvh) minmax(0, 1fr)') && styles.includes('.result-sheet')],
  ['reduced motion', styles.includes('@media (prefers-reduced-motion: reduce)')],
  ['localized new states', translations.includes("ru: 'Сюжет ждёт'") && translations.includes("ru: 'Осталось выполнить'")],
  ['FEATURE-071 version', version.includes('0.10.6-playtest.071-result-transitions')],
];

let failed = false;
for (const [label, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'}: ${label}`);
  failed ||= !passed;
}

if (failed) process.exit(1);
