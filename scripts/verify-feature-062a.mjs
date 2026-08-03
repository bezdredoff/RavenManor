import { existsSync, readFileSync } from 'node:fs';

const required = [
  'src/assets/story/portraits/raven/neutral.png',
  'src/ui/storyPortraitPresentation.ts',
  'tests/StoryPortraitPresentation.test.ts',
];
for (const file of required) {
  if (!existsSync(file)) throw new Error(`FEATURE-062A missing: ${file}`);
}

const presentation = readFileSync('src/ui/storyPortraitPresentation.ts', 'utf8');
if (!presentation.includes("import ravenNeutral from '../assets/story/portraits/raven/neutral.png?url'")) {
  throw new Error('Neutral Raven import is missing.');
}
if (presentation.includes('ravenSpeaking') || presentation.includes('ravenSurprised')) {
  throw new Error('Non-neutral Raven assets are still imported.');
}
if (!presentation.includes("function inferRavenExpression(): StoryPortraitExpression")) {
  throw new Error('Neutral-only Raven resolver is missing.');
}
if (!presentation.includes("return 'neutral';")) {
  throw new Error('Raven is not forced to neutral.');
}
console.log('FEATURE-062A static verification passed.');
