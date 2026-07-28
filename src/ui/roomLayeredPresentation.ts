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
] as const;

export type LayeredRoomId = 'hall' | 'library';
export type LayeredRoomVariant = 'card' | 'detail';

type LayerMarkup = Readonly<{
  className: string;
  asset: string;
}>;

export function isLayeredRoom(roomId: string): roomId is LayeredRoomId {
  return roomId === 'hall' || roomId === 'library';
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

function getRoomLayers(roomId: LayeredRoomId, stage: number): readonly LayerMarkup[] {
  switch (roomId) {
    case 'hall': return getHallLayers(stage);
    case 'library': return getLibraryLayers(stage);
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
