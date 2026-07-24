import hallStage0 from '../assets/rooms/hall/stage-0.svg?url';
import hallStage1 from '../assets/rooms/hall/stage-1.svg?url';
import hallStage2 from '../assets/rooms/hall/stage-2.svg?url';
import hallStage3 from '../assets/rooms/hall/stage-3.svg?url';
import libraryStage0 from '../assets/rooms/library/stage-0.svg?url';
import libraryStage1 from '../assets/rooms/library/stage-1.svg?url';
import libraryStage2 from '../assets/rooms/library/stage-2.svg?url';
import libraryStage3 from '../assets/rooms/library/stage-3.svg?url';
import gardenStage0 from '../assets/rooms/garden/stage-0.svg?url';
import gardenStage1 from '../assets/rooms/garden/stage-1.svg?url';
import gardenStage2 from '../assets/rooms/garden/stage-2.svg?url';
import gardenStage3 from '../assets/rooms/garden/stage-3.svg?url';
import cryptStage0 from '../assets/rooms/crypt/stage-0.svg?url';
import cryptStage1 from '../assets/rooms/crypt/stage-1.svg?url';
import cryptStage2 from '../assets/rooms/crypt/stage-2.svg?url';
import cryptStage3 from '../assets/rooms/crypt/stage-3.svg?url';
import towerStage0 from '../assets/rooms/tower/stage-0.svg?url';
import towerStage1 from '../assets/rooms/tower/stage-1.svg?url';
import towerStage2 from '../assets/rooms/tower/stage-2.svg?url';
import towerStage3 from '../assets/rooms/tower/stage-3.svg?url';

export const roomSceneAssets = {
  'rooms/hall/stage-0-ruined': hallStage0,
  'rooms/hall/stage-1-cleared': hallStage1,
  'rooms/hall/stage-2-lit': hallStage2,
  'rooms/hall/stage-3-restored': hallStage3,
  'rooms/library/stage-0-sealed': libraryStage0,
  'rooms/library/stage-1-moonlit': libraryStage1,
  'rooms/library/stage-2-shelves': libraryStage2,
  'rooms/library/stage-3-desk': libraryStage3,
  'rooms/garden/stage-0-overgrown': gardenStage0,
  'rooms/garden/stage-1-cleared': gardenStage1,
  'rooms/garden/stage-2-fountain': gardenStage2,
  'rooms/garden/stage-3-roses': gardenStage3,
  'rooms/crypt/stage-0-buried': cryptStage0,
  'rooms/crypt/stage-1-stairs': cryptStage1,
  'rooms/crypt/stage-2-seals': cryptStage2,
  'rooms/crypt/stage-3-braziers': cryptStage3,
  'rooms/tower/stage-0-broken': towerStage0,
  'rooms/tower/stage-1-steps': towerStage1,
  'rooms/tower/stage-2-observatory': towerStage2,
  'rooms/tower/stage-3-clock': towerStage3,
} as const;

export type RoomSceneAssetKey = keyof typeof roomSceneAssets;

export function getRoomSceneAsset(assetKey: string): string {
  const asset = roomSceneAssets[assetKey as RoomSceneAssetKey];
  if (!asset) throw new Error(`Missing room scene asset: ${assetKey}`);
  return asset;
}
