import { existsSync, readFileSync } from 'node:fs';

const required = [
  'src/ui/storyPortraitPresentation.ts',
  'src/assets/story/portraits/adrian/base-neutral.png',
  'src/assets/story/portraits/adrian/face-neutral.png',
  'src/assets/story/portraits/adrian/face-smile.png',
  'src/assets/story/portraits/adrian/face-speaking.png',
  'src/assets/story/portraits/adrian/face-stern.png',
  'src/assets/story/portraits/adrian/face-surprised.png',
];

for (const file of required) {
  if (!existsSync(file)) {
    throw new Error(`HOTFIX-059C refresh missing file: ${file}`);
  }
}

const presentation = readFileSync('src/ui/storyPortraitPresentation.ts', 'utf8');
if (!presentation.includes('ADRIAN_FACE_PLACEMENTS')) {
  throw new Error('Adrian placements table is missing.');
}
if (!presentation.includes("stern: [{ slot: 'face', asset: adrianFaceStern")) {
  throw new Error('Adrian stern face layer is missing.');
}
if (!presentation.includes("surprised: [{ slot: 'face', asset: adrianFaceSurprised")) {
  throw new Error('Adrian surprised face layer is missing.');
}
if (!presentation.includes("neutral: { left: 29.297, top: 15.625, width: 28.613 }")) {
  throw new Error('Updated Adrian neutral placement not found.');
}
if (!presentation.includes("surprised: { left: 31.250, top: 14.323, width: 39.648 }")) {
  throw new Error('Updated Adrian surprised placement not found.');
}

console.log('HOTFIX-059C refresh verification passed.');
