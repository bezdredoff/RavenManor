import chainAsset from '../assets/obstacles/chain.svg?url';
import fogAsset from '../assets/obstacles/fog.svg?url';
import rubbleAsset from '../assets/obstacles/rubble.svg?url';
import type { Obstacle, ObstacleKind } from '../engine/ObstacleTypes';

export const obstacleAssets = [chainAsset, rubbleAsset, fogAsset] as const;

const PRESENTATION: Record<ObstacleKind, Readonly<{ name: string; assetPath: string; cssClass: string }>> = {
  chain: { name: 'Цепи', assetPath: chainAsset, cssClass: 'obstacle-chain' },
  rubble: { name: 'Завал', assetPath: rubbleAsset, cssClass: 'obstacle-rubble' },
  fog: { name: 'Туман', assetPath: fogAsset, cssClass: 'obstacle-fog' },
};

export function getObstaclePresentation(obstacle: Obstacle) {
  return {
    ...PRESENTATION[obstacle.kind],
    layerLabel: obstacle.layers === 2 ? 'два слоя' : 'один слой',
  };
}
