import { existsSync, readFileSync } from 'node:fs';

const required = [
  'src/ui/GameApp.ts',
  'src/ui/storyUiPresentation.ts',
  'src/style.css',
  'src/localization/uiTranslations.ts',
  'src/appVersion.ts',
  'tests/StoryUiPresentation.test.ts',
  'tests/Feature066Localization.test.ts',
];

for (const file of required) {
  if (!existsSync(file)) throw new Error(`FEATURE-066 missing: ${file}`);
}

const gameApp = readFileSync('src/ui/GameApp.ts', 'utf8');
const ui = readFileSync('src/ui/storyUiPresentation.ts', 'utf8');
const css = readFileSync('src/style.css', 'utf8');
const translations = readFileSync('src/localization/uiTranslations.ts', 'utf8');
const version = readFileSync('src/appVersion.ts', 'utf8');

const expectations = [
  [gameApp, "from './storyUiPresentation'", 'GameApp story UI import'],
  [gameApp, "this.bindModal('story-skip', finishScene)", 'functional skip binding'],
  [gameApp, 'data-story-dialogue-shell', 'story dialogue shell'],
  [ui, 'data-action="continue"', 'continue control'],
  [ui, 'data-action="story-skip"', 'skip control'],
  [ui, 'story-tool-button', 'utility controls'],
  [css, 'FEATURE-066: cinematic gothic story UI refresh', 'FEATURE-066 CSS block'],
  [css, '.story-nameplate', 'nameplate styling'],
  [css, '.story-dialogue-controls', 'story controls styling'],
  [translations, "ru: 'История'", 'History translation'],
  [translations, "ru: 'Авто'", 'Auto translation'],
  [version, '0.10.1-playtest.066-story-ui-refresh', 'FEATURE-066 version'],
];

for (const [source, snippet, label] of expectations) {
  if (!source.includes(snippet)) throw new Error(`FEATURE-066 missing ${label}: ${snippet}`);
}

console.log('FEATURE-066 static verification passed.');
