import hallBase from '../assets/rooms/hall/layered/base.png?url';
import hallDebris from '../assets/rooms/hall/layered/task1-debris.png?url';
import hallChandelierOn from '../assets/rooms/hall/layered/task2-chandelier-on.png?url';
import hallDecorOn from '../assets/rooms/hall/layered/task3-decor-on.png?url';
import hallRestoredGlow from '../assets/rooms/hall/layered/ambient-restored-glow.png?url';
import libraryBase from '../assets/rooms/library/layered/base.png?url';
import libraryShuttersOpen from '../assets/rooms/library/layered/task1-shutters-open.png?url';
import libraryShelvesRestored from '../assets/rooms/library/layered/task2-shelves-restored.png?url';
import libraryDeskOpen from '../assets/rooms/library/layered/task3-desk-open.png?url';
import libraryRestoredGlow from '../assets/rooms/library/layered/ambient-restored-glow.png?url';
import gardenBase from '../assets/rooms/garden/layered/base.png?url';
import gardenVinesOvergrown from '../assets/rooms/garden/layered/task1-vines-overgrown.png?url';
import gardenFountainOn from '../assets/rooms/garden/layered/task2-fountain-on.png?url';
import gardenRosesBloom from '../assets/rooms/garden/layered/task3-roses-bloom.png?url';
import gardenRestoredGlow from '../assets/rooms/garden/layered/ambient-restored-glow.png?url';
import cryptBase from '../assets/rooms/crypt/layered/base.png?url';
import cryptStairRubble from '../assets/rooms/crypt/layered/task1-stair-rubble.png?url';
import cryptSealsRestored from '../assets/rooms/crypt/layered/task2-seals-restored.png?url';
import cryptBraziersOn from '../assets/rooms/crypt/layered/task3-braziers-on.png?url';
import cryptRestoredGlow from '../assets/rooms/crypt/layered/ambient-restored-glow.png?url';
import towerBase from '../assets/rooms/tower/layered/base.png?url';
import towerBrokenSteps from '../assets/rooms/tower/layered/task1-broken-steps.png?url';
import towerObservatoryOpen from '../assets/rooms/tower/layered/task2-observatory-open.png?url';
import towerRavenClockOn from '../assets/rooms/tower/layered/task3-raven-clock-on.png?url';
import towerRestoredGlow from '../assets/rooms/tower/layered/ambient-restored-glow.png?url';

export const layeredRoomAssets = [
  hallBase,
  hallDebris,
  hallChandelierOn,
  hallDecorOn,
  hallRestoredGlow,
  libraryBase,
  libraryShuttersOpen,
  libraryShelvesRestored,
  libraryDeskOpen,
  libraryRestoredGlow,
  gardenBase,
  gardenVinesOvergrown,
  gardenFountainOn,
  gardenRosesBloom,
  gardenRestoredGlow,
  cryptBase,
  cryptStairRubble,
  cryptSealsRestored,
  cryptBraziersOn,
  cryptRestoredGlow,
  towerBase,
  towerBrokenSteps,
  towerObservatoryOpen,
  towerRavenClockOn,
  towerRestoredGlow,
] as const;

export type LayeredRoomId = 'hall' | 'library' | 'garden' | 'crypt' | 'tower';
export type LayeredRoomVariant = 'card' | 'detail';

type LayerMarkup = Readonly<{
  className: string;
  asset: string;
}>;

export function isLayeredRoom(roomId: string): roomId is LayeredRoomId {
  return roomId === 'hall'
    || roomId === 'library'
    || roomId === 'garden'
    || roomId === 'crypt'
    || roomId === 'tower';
}

function getCompletedTaskCount(taskCount: number): number {
  return Math.max(0, Math.min(3, Math.trunc(taskCount)));
}

function getHallLayers(stage: number): readonly LayerMarkup[] {
  return [
    { className: 'base', asset: hallBase },
    ...(stage === 0 ? [{ className: 'debris', asset: hallDebris }] : []),
    ...(stage >= 2 ? [{ className: 'chandelier', asset: hallChandelierOn }] : []),
    ...(stage >= 3 ? [
      { className: 'decor', asset: hallDecorOn },
      { className: 'glow', asset: hallRestoredGlow },
    ] : []),
  ];
}

function getLibraryLayers(stage: number): readonly LayerMarkup[] {
  return [
    { className: 'base', asset: libraryBase },
    ...(stage >= 1 ? [{ className: 'shutters', asset: libraryShuttersOpen }] : []),
    ...(stage >= 2 ? [{ className: 'shelves', asset: libraryShelvesRestored }] : []),
    ...(stage >= 3 ? [
      { className: 'desk', asset: libraryDeskOpen },
      { className: 'glow', asset: libraryRestoredGlow },
    ] : []),
  ];
}

function getGardenLayers(stage: number): readonly LayerMarkup[] {
  return [
    { className: 'base', asset: gardenBase },
    ...(stage === 0 ? [{ className: 'vines', asset: gardenVinesOvergrown }] : []),
    ...(stage >= 2 ? [{ className: 'fountain', asset: gardenFountainOn }] : []),
    ...(stage >= 3 ? [
      { className: 'roses', asset: gardenRosesBloom },
      { className: 'glow', asset: gardenRestoredGlow },
    ] : []),
  ];
}

function getCryptLayers(stage: number): readonly LayerMarkup[] {
  return [
    { className: 'base', asset: cryptBase },
    ...(stage === 0 ? [{ className: 'rubble', asset: cryptStairRubble }] : []),
    ...(stage >= 2 ? [{ className: 'seals', asset: cryptSealsRestored }] : []),
    ...(stage >= 3 ? [
      { className: 'braziers', asset: cryptBraziersOn },
      { className: 'glow', asset: cryptRestoredGlow },
    ] : []),
  ];
}

function getTowerLayers(stage: number): readonly LayerMarkup[] {
  return [
    { className: 'base', asset: towerBase },
    ...(stage === 0 ? [{ className: 'steps', asset: towerBrokenSteps }] : []),
    ...(stage >= 2 ? [{ className: 'observatory', asset: towerObservatoryOpen }] : []),
    ...(stage >= 3 ? [
      { className: 'clock', asset: towerRavenClockOn },
      { className: 'glow', asset: towerRestoredGlow },
    ] : []),
  ];
}

function getRoomLayers(roomId: LayeredRoomId, stage: number): readonly LayerMarkup[] {
  switch (roomId) {
    case 'hall': return getHallLayers(stage);
    case 'library': return getLibraryLayers(stage);
    case 'garden': return getGardenLayers(stage);
    case 'crypt': return getCryptLayers(stage);
    case 'tower': return getTowerLayers(stage);
  }
}

export function getLayeredRoomSceneMarkup(
  roomId: LayeredRoomId,
  completedTaskCount: number,
  variant: LayeredRoomVariant,
): string {
  const stage = getCompletedTaskCount(completedTaskCount);
  const layers = getRoomLayers(roomId, stage)
    .map(({ className, asset }) => (
      `<img class="layered-room-layer layered-room-layer--${className}" src="${asset}" alt="" draggable="false" />`
    ))
    .join('');

  return `
    <div class="layered-room-scene layered-room-scene--${variant} layered-room-scene--${roomId} stage-${stage}" aria-hidden="true">
      ${layers}
    </div>
  `;
}
