import evelynPortrait from '../assets/story/portraits/evelyn.svg?url';
import ravenPortrait from '../assets/story/portraits/raven.svg?url';
import adrianPortrait from '../assets/story/portraits/adrian.svg?url';
import silhouettePortrait from '../assets/story/portraits/silhouette.svg?url';
import gatesBackground from '../assets/story/backgrounds/gates.svg?url';
import ravenWindowBackground from '../assets/story/backgrounds/raven-window.svg?url';
import hallBackground from '../assets/story/backgrounds/hall.svg?url';
import towerBackground from '../assets/story/backgrounds/tower.svg?url';
import type {
  StoryBackgroundKey,
  StoryPortraitKey,
  StorySceneDefinition,
} from '../data/storyScenes';

const portraitAssets: Record<StoryPortraitKey, string> = {
  evelyn: evelynPortrait,
  raven: ravenPortrait,
  adrian: adrianPortrait,
  silhouette: silhouettePortrait,
};

const backgroundAssets: Record<StoryBackgroundKey, string> = {
  gates: gatesBackground,
  'raven-window': ravenWindowBackground,
  hall: hallBackground,
  tower: towerBackground,
};

export type StoryScenePresentation = {
  portraitAsset: string;
  backgroundAsset: string;
};

export function getStoryScenePresentation(
  scene: StorySceneDefinition,
): StoryScenePresentation {
  const portraitAsset = portraitAssets[scene.portraitKey];
  const backgroundAsset = backgroundAssets[scene.backgroundKey];

  if (!portraitAsset) throw new Error(`Missing story portrait: ${scene.portraitKey}`);
  if (!backgroundAsset) throw new Error(`Missing story background: ${scene.backgroundKey}`);

  return { portraitAsset, backgroundAsset };
}
