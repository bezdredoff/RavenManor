import { existsSync, readFileSync } from 'node:fs';

const portraitPath = 'src/assets/story/portraits/silhouette/portrait-neutral-v1.png';
const required = [
  portraitPath,
  'src/assets/story/portraits/silhouette/README_RU.md',
  'src/ui/storyPortraitPresentation.ts',
  'tests/StoryPortraitPresentation.test.ts',
  'src/appVersion.ts',
];

for (const file of required) {
  if (!existsSync(file)) throw new Error(`FEATURE-067 missing: ${file}`);
}

const portrait = readFileSync(portraitPath);
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
if (!portrait.subarray(0, 8).equals(pngSignature)) {
  throw new Error('FEATURE-067 portrait is not a valid PNG file.');
}

const width = portrait.readUInt32BE(16);
const height = portrait.readUInt32BE(20);
const colorType = portrait.readUInt8(25);
if (width !== 1024 || height !== 1536) {
  throw new Error(`FEATURE-067 portrait must be 1024x1536, received ${width}x${height}.`);
}
if (colorType !== 6) {
  throw new Error(`FEATURE-067 portrait must be RGBA PNG (color type 6), received ${colorType}.`);
}

const source = readFileSync('src/ui/storyPortraitPresentation.ts', 'utf8');
if (!source.includes("silhouette/portrait-neutral-v1.png?url")) {
  throw new Error('FEATURE-067 portrait is not connected to the runtime registry.');
}
if (source.includes("portraits/silhouette.svg?url")) {
  throw new Error('Legacy Silhouette SVG is still imported by runtime code.');
}
if (!source.includes("silhouette: { kind: 'single', aspectRatio: 2 / 3")) {
  throw new Error('Silhouette must remain on the 2:3 single-asset contract.');
}

const test = readFileSync('tests/StoryPortraitPresentation.test.ts', 'utf8');
if (!test.includes('uses the refreshed neutral Silhouette portrait on the single-layer contract')) {
  throw new Error('FEATURE-067 portrait regression test is missing.');
}

const version = readFileSync('src/appVersion.ts', 'utf8');
if (!version.includes('0.10.2-playtest.067-silhouette-portrait')) {
  throw new Error('FEATURE-067 version marker is missing.');
}

console.log('FEATURE-067 verification passed. Silhouette uses one 1024x1536 RGBA PNG.');
