import { existsSync, readFileSync } from 'node:fs';

const required = [
  'src/assets/story/portraits/adrian/base-neutral.png',
  'src/assets/story/portraits/adrian/face-smile.png',
  'src/assets/story/portraits/adrian/face-speaking.png',
  'src/assets/story/portraits/adrian/face-surprised.png',
  'src/assets/story/portraits/adrian/face-stern.png',
  'src/ui/storyPortraitPresentation.ts',
  'src/appVersion.ts',
];
for (const file of required) {
  if (!existsSync(file)) throw new Error(`FEATURE-059A missing: ${file}`);
}
const presentation = readFileSync('src/ui/storyPortraitPresentation.ts', 'utf8');
if (!presentation.includes(`adrian: {
    kind: 'layered'`)) throw new Error('Adrian is not registered as layered.');
if (!presentation.includes('ADRIAN_FACE_PLACEMENTS')) throw new Error('Adrian placements are missing.');
if (!presentation.includes("neutral: []")) throw new Error('Adrian neutral base contract is missing.');
if (!presentation.includes("transition: 'crossfade'")) throw new Error('Crossfade layers are missing.');
const version = readFileSync('src/appVersion.ts', 'utf8');
if (!version.includes('0.9.5-playtest.059a')) throw new Error('FEATURE-059A version was not applied.');
console.log('FEATURE-059A static verification passed.');
