import { existsSync, readFileSync } from 'node:fs';

const required = [
  'src/data/storyScenes.ts',
  'src/ui/storyPortraitPresentation.ts',
  'src/appVersion.ts',
];

for (const file of required) {
  if (!existsSync(file)) throw new Error(`HOTFIX-059B missing: ${file}`);
}

const storyScenes = readFileSync('src/data/storyScenes.ts', 'utf8');
if (!storyScenes.includes("'surprised' | 'stern'")) {
  throw new Error('StoryPortraitExpression does not include stern.');
}

const presentation = readFileSync('src/ui/storyPortraitPresentation.ts', 'utf8');
if (!presentation.includes("stern: [")) {
  throw new Error('Adrian stern presentation is missing.');
}

const version = readFileSync('src/appVersion.ts', 'utf8');
if (!version.includes('0.9.5-playtest.059b')) {
  throw new Error('HOTFIX-059B version was not applied.');
}

console.log('HOTFIX-059B static verification passed.');
