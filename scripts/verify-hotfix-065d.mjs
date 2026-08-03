import { existsSync, readFileSync } from 'node:fs';

const required = [
  'src/assets/story/portraits/adrian/portrait-neutral-v3.png',
  'src/assets/story/portraits/adrian/portrait-speaking-v3.png',
  'src/assets/story/portraits/adrian/portrait-surprised-v3.png',
  'src/ui/storyPortraitPresentation.ts',
  'tests/StoryPortraitPresentation.test.ts',
];

for (const file of required) {
  if (!existsSync(file)) throw new Error(`HOTFIX-065D missing: ${file}`);
}

const source = readFileSync('src/ui/storyPortraitPresentation.ts', 'utf8');
if (!source.includes("portrait-neutral-v3.png?url")) throw new Error('New Adrian neutral portrait is not connected.');
if (!source.includes("portrait-speaking-v3.png?url")) throw new Error('New Adrian speaking portrait is not connected.');
if (!source.includes("portrait-surprised-v3.png?url")) throw new Error('New Adrian surprised portrait is not connected.');
if (!source.includes("adrian: {\n    kind: 'single'")) throw new Error('Adrian is not using the full-body single-asset contract.');
if (source.includes("adrianFaceNeutral")) throw new Error('Old Adrian face overlays are still imported.');
if (source.includes('ADRIAN_FACE_PLACEMENTS')) throw new Error('Old Adrian face placement logic is still active.');

const test = readFileSync('tests/StoryPortraitPresentation.test.ts', 'utf8');
if (!test.includes("uses refreshed full-body single-asset expressions for Adrian")) {
  throw new Error('The Adrian test was not updated for HOTFIX-065D.');
}

console.log('HOTFIX-065D verification passed.');
