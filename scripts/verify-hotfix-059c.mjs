import { readFileSync } from 'node:fs';
const presentation = readFileSync('src/ui/storyPortraitPresentation.ts', 'utf8');
const required = [
  "smile: { left: 34.18, top: 22.135, width: 28.809 }",
  "speaking: { left: 33.984, top: 21.615, width: 29.785 }",
  "surprised: { left: 31.348, top: 20.573, width: 37.109 }",
  "stern: { left: 29.492, top: 21.875, width: 40.43 }",
];
for (const snippet of required) {
  if (!presentation.includes(snippet)) throw new Error(`Missing Adrian placement update: ${snippet}`);
}
console.log('HOTFIX-059C static verification passed.');
