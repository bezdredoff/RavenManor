import evelynPortrait from '../assets/story/portraits/evelyn.svg?url';
import ravenPortrait from '../assets/story/portraits/raven.svg?url';
import adrianPortrait from '../assets/story/portraits/adrian.svg?url';
import silhouettePortrait from '../assets/story/portraits/silhouette.svg?url';
import lucianPortrait from '../assets/story/portraits/lucian.svg?url';
import gatesBackground from '../assets/story/backgrounds/gates.svg?url';
import ravenWindowBackground from '../assets/story/backgrounds/raven-window.svg?url';
import hallBackground from '../assets/story/backgrounds/hall.svg?url';
import towerBackground from '../assets/story/backgrounds/tower.svg?url';
import libraryBackground from '../assets/rooms/library/stage-2.svg?url';
import gardenBackground from '../assets/rooms/garden/stage-2.svg?url';
import cryptBackground from '../assets/rooms/crypt/stage-2.svg?url';
import type {
  StoryBackgroundKey,
  StoryDialogueBeat,
  StoryPortraitKey,
  StorySceneDefinition,
} from '../data/storyScenes';

const portraitAssets: Record<StoryPortraitKey, string> = {
  evelyn: evelynPortrait,
  raven: ravenPortrait,
  adrian: adrianPortrait,
  silhouette: silhouettePortrait,
  lucian: lucianPortrait,
};

const backgroundAssets: Record<StoryBackgroundKey, string> = {
  gates: gatesBackground,
  'raven-window': ravenWindowBackground,
  hall: hallBackground,
  library: libraryBackground,
  garden: gardenBackground,
  crypt: cryptBackground,
  tower: towerBackground,
};


export const storyAssets = [
  ...Object.values(portraitAssets),
  ...Object.values(backgroundAssets),
];

export type StoryScenePresentation = {
  portraitAsset: string;
  backgroundAsset: string;
};

export function getStoryScenePresentation(
  scene: StorySceneDefinition,
  beat: StoryDialogueBeat,
): StoryScenePresentation {
  const portraitAsset = portraitAssets[beat.portraitKey];
  const backgroundAsset = backgroundAssets[scene.backgroundKey];

  if (!portraitAsset) throw new Error(`Missing story portrait: ${beat.portraitKey}`);
  if (!backgroundAsset) throw new Error(`Missing story background: ${scene.backgroundKey}`);

  return { portraitAsset, backgroundAsset };
}
