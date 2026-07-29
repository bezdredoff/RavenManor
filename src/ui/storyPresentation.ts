import gatesBackground from '../assets/story/backgrounds/gates.svg?url';
import ravenWindowBackground from '../assets/story/backgrounds/raven-window.svg?url';
import hallBackground from '../assets/story/backgrounds/hall.svg?url';
import towerBackground from '../assets/story/backgrounds/tower.svg?url';
import libraryBackground from '../assets/rooms/library/stage-2.svg?url';
import gardenBackground from '../assets/rooms/garden/stage-2.svg?url';
import cryptBackground from '../assets/rooms/crypt/stage-2.svg?url';
import { restorationTasks } from '../data/restorationTasks';
import { roomVisuals } from '../data/roomVisuals';
import type {
  StoryBackgroundKey,
  StoryDialogueBeat,
  StorySceneDefinition,
} from '../data/storyScenes';
import type { CompletedRestorationTasks } from '../meta/RoomRestoration';
import { getRoomVisualState } from '../meta/RoomVisualState';
import { getRoomSceneAsset } from './roomPresentation';
import {
  resolveStoryPortrait,
  storyPortraitAssets,
  type ResolvedStoryPortrait,
} from './storyPortraitPresentation';

const fallbackBackgroundAssets: Record<StoryBackgroundKey, string> = {
  gates: gatesBackground,
  'raven-window': ravenWindowBackground,
  hall: hallBackground,
  library: libraryBackground,
  garden: gardenBackground,
  crypt: cryptBackground,
  tower: towerBackground,
};

const roomBackgroundPositions: Readonly<Record<string, string>> = {
  hall: '50% 40%',
  library: '50% 38%',
  garden: '50% 42%',
  crypt: '50% 43%',
  tower: '50% 38%',
};

export const storyAssets = [
  ...storyPortraitAssets,
  ...Object.values(fallbackBackgroundAssets),
];

export type StoryScenePresentation = {
  portraitAsset: string;
  portrait: ResolvedStoryPortrait;
  backgroundAsset: string;
  backgroundPosition: string;
};

export function getStoryBackgroundAsset(
  scene: StorySceneDefinition,
  completedRestorationTasks: CompletedRestorationTasks = {},
): string {
  const hasRoomVisual = roomVisuals.some((definition) => definition.roomId === scene.roomId);
  if (!hasRoomVisual) {
    const fallback = fallbackBackgroundAssets[scene.backgroundKey];
    if (!fallback) throw new Error(`Missing story background: ${scene.backgroundKey}`);
    return fallback;
  }

  const visualState = getRoomVisualState(
    scene.roomId,
    roomVisuals,
    restorationTasks,
    completedRestorationTasks,
  );
  return getRoomSceneAsset(visualState.stage.assetKey);
}

export function getStoryScenePresentation(
  scene: StorySceneDefinition,
  beat: StoryDialogueBeat,
  completedRestorationTasks: CompletedRestorationTasks = {},
): StoryScenePresentation {
  const portrait = resolveStoryPortrait(beat);
  const backgroundAsset = getStoryBackgroundAsset(scene, completedRestorationTasks);

  return {
    portraitAsset: portrait.layers[0]?.asset ?? '',
    portrait,
    backgroundAsset,
    backgroundPosition: roomBackgroundPositions[scene.roomId] ?? '50% 40%',
  };
}
