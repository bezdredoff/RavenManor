import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const requireText = (path, needle) => {
  const source = read(path);
  if (!source.includes(needle)) {
    throw new Error(`${path} does not contain required text: ${needle}`);
  }
};

requireText('src/appVersion.ts', "0.9.2-playtest.057");
requireText('src/ui/storyPresentation.ts', 'getRoomVisualState(');
requireText('src/ui/storyPresentation.ts', 'getRoomSceneAsset(visualState.stage.assetKey)');
requireText('src/ui/GameApp.ts', 'this.progress.state.completedRestorationTasks');
requireText('src/ui/GameApp.ts', 'journalBackgroundAsset');
requireText('src/style.css', '--screen-context-background');
requireText('index.html', '<script type="module" src="/src/main.ts"></script>');

const index = read('index.html');
if (index.includes('feature057AutoMount')) {
  throw new Error('Legacy feature057AutoMount script is still connected in index.html.');
}

for (const room of ['hall', 'library', 'garden', 'crypt', 'tower']) {
  for (let stage = 0; stage <= 3; stage += 1) {
    const path = `src/assets/rooms/${room}/stage-${stage}.png`;
    if (!existsSync(resolve(root, path))) throw new Error(`Missing ${path}`);
  }
}

console.log('FEATURE-057 static verification passed.');
