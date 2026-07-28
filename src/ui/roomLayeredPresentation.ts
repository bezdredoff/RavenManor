import hallBase from '../assets/rooms/hall/layered/base.png?url';
import hallDebris from '../assets/rooms/hall/layered/task1-debris.png?url';
import hallChandelierOn from '../assets/rooms/hall/layered/task2-chandelier-on.png?url';
import hallDecorOn from '../assets/rooms/hall/layered/task3-decor-on.png?url';
import hallRestoredGlow from '../assets/rooms/hall/layered/ambient-restored-glow.png?url';

export const layeredRoomAssets = [
  hallBase,
  hallDebris,
  hallChandelierOn,
  hallDecorOn,
  hallRestoredGlow,
] as const;

export type LayeredRoomId = 'hall';
export type LayeredRoomVariant = 'card' | 'detail';

export function isLayeredRoom(roomId: string): roomId is LayeredRoomId {
  return roomId === 'hall';
}

function getCompletedTaskCount(taskCount: number): number {
  return Math.max(0, Math.min(3, Math.trunc(taskCount)));
}

export function getLayeredRoomSceneMarkup(
  roomId: LayeredRoomId,
  completedTaskCount: number,
  variant: LayeredRoomVariant,
): string {
  const stage = getCompletedTaskCount(completedTaskCount);
  if (roomId !== 'hall') throw new Error(`Unsupported layered room: ${roomId}`);

  const showDebris = stage === 0;
  const showChandelier = stage >= 2;
  const showDecor = stage >= 3;
  const showGlow = stage >= 3;

  return `
    <div class="layered-room-scene layered-room-scene--${variant} layered-room-scene--${roomId} stage-${stage}" aria-hidden="true">
      <img class="layered-room-layer layered-room-layer--base" src="${hallBase}" alt="" draggable="false" />
      ${showDebris ? `<img class="layered-room-layer layered-room-layer--debris" src="${hallDebris}" alt="" draggable="false" />` : ''}
      ${showChandelier ? `<img class="layered-room-layer layered-room-layer--chandelier" src="${hallChandelierOn}" alt="" draggable="false" />` : ''}
      ${showDecor ? `<img class="layered-room-layer layered-room-layer--decor" src="${hallDecorOn}" alt="" draggable="false" />` : ''}
      ${showGlow ? `<img class="layered-room-layer layered-room-layer--glow" src="${hallRestoredGlow}" alt="" draggable="false" />` : ''}
    </div>
  `;
}
