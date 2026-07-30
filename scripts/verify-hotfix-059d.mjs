import { existsSync, readFileSync } from 'node:fs';

const required = [
  'src/ui/storyPortraitPresentation.ts',
  'tests/StoryPortraitPresentation.test.ts',
  'src/assets/story/portraits/adrian/base-neutral.png',
  'src/assets/story/portraits/adrian/face-neutral.png',
  'src/assets/story/portraits/adrian/face-smile.png',
  'src/assets/story/portraits/adrian/face-speaking.png',
  'src/assets/story/portraits/adrian/face-stern.png',
  'src/assets/story/portraits/adrian/face-surprised.png',
  'src/appVersion.ts',
];

for (const file of required) {
  if (!existsSync(file)) throw new Error(`HOTFIX-059D missing: ${file}`);
}

const presentation = readFileSync('src/ui/storyPortraitPresentation.ts', 'utf8');
const expectedPlacements = [
  "neutral: { left: 32.158, top: 17.988, width: 22.890 }",
  "smile: { left: 32.256, top: 17.754, width: 23.672 }",
  "speaking: { left: 32.627, top: 18.268, width: 26.641 }",
  "stern: { left: 32.549, top: 18.249, width: 26.016 }",
  "surprised: { left: 38.500, top: 20.000, width: 23.000 }",
];
for (const placement of expectedPlacements) {
  if (!presentation.includes(placement)) {
    throw new Error(`Updated Adrian placement is missing: ${placement}`);
  }
}

const test = readFileSync('tests/StoryPortraitPresentation.test.ts', 'utf8');
if (!test.includes("expect(neutral.layers.map((layer) => layer.slot)).toEqual(['base', 'face']);")) {
  throw new Error('Adrian neutral-layer test was not updated.');
}

const version = readFileSync('src/appVersion.ts', 'utf8');
if (!version.includes('0.9.7-playtest.061d-adrian-scale-fix')) {
  throw new Error('HOTFIX-059D version was not applied.');
}

console.log('HOTFIX-059D static verification passed.');
