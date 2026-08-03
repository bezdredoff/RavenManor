import { readFileSync } from 'node:fs';

const source = readFileSync('src/ui/storyPortraitPresentation.ts', 'utf8');

const required = [
  "if (!currentCanvas) {\n    root.replaceChildren(createCanvasElement(next));",
  "if (currentCanvas.dataset.characterKey !== next.characterKey) {",
  "root.replaceChildren(createCanvasElement(next));",
];

for (const snippet of required) {
  if (!source.includes(snippet)) {
    throw new Error(`FEATURE-063 verification failed: missing ${snippet}`);
  }
}

const characterSwitchStart = source.indexOf(
  "if (currentCanvas.dataset.characterKey !== next.characterKey) {",
);
const characterSwitchEnd = source.indexOf('\n  }', characterSwitchStart);
const characterSwitchBlock = source.slice(characterSwitchStart, characterSwitchEnd);

if (characterSwitchBlock.includes('requestAnimationFrame')) {
  throw new Error('FEATURE-063 verification failed: character switch still animates the outgoing portrait.');
}
if (characterSwitchBlock.includes('finishTransition')) {
  throw new Error('FEATURE-063 verification failed: character switch still delays removal.');
}

console.log('FEATURE-063 static verification passed.');
