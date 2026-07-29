import { existsSync, readFileSync } from 'node:fs';

const required = [
  'src/assets/story/portraits/evelyn/base-neutral.png',
  'src/assets/story/portraits/evelyn/face-smile.png',
  'src/assets/story/portraits/evelyn/face-speaking.png',
  'src/assets/story/portraits/evelyn/face-surprised.png',
  'src/ui/storyPortraitPresentation.ts',
  'src/ui/storyPresentation.ts',
  'src/ui/GameApp.ts',
  'src/style.css',
];

for (const path of required) {
  if (!existsSync(path)) throw new Error(`FEATURE-058A missing file: ${path}`);
}

const portrait = readFileSync('src/ui/storyPortraitPresentation.ts', 'utf8');
const gameApp = readFileSync('src/ui/GameApp.ts', 'utf8');
const styles = readFileSync('src/style.css', 'utf8');

for (const token of ['face-smile.png?url', 'transitionStoryPortrait', "slot: 'face'"]) {
  if (!portrait.includes(token)) throw new Error(`FEATURE-058A portrait contract missing: ${token}`);
}
if (!gameApp.includes('renderStoryPortraitMarkup')) throw new Error('GameApp does not render layered portraits.');
if (!gameApp.includes('data-story-scene-id')) throw new Error('Story beat DOM is not stable between dialogue beats.');
if (!styles.includes('.story-portrait-layer--placed')) throw new Error('Layer placement CSS is missing.');

console.log('FEATURE-058A static verification passed.');
