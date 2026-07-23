import batAsset from '../assets/tiles/bat.svg?url';
import candleAsset from '../assets/tiles/candle.svg?url';
import crystalAsset from '../assets/tiles/crystal.svg?url';
import keyAsset from '../assets/tiles/key.svg?url';
import roseAsset from '../assets/tiles/rose.svg?url';
import scrollAsset from '../assets/tiles/scroll.svg?url';

export type TileDefinition = Readonly<{
  id: 'rose' | 'candle' | 'key' | 'crystal' | 'bat' | 'scroll';
  name: string;
  assetPath: string;
  cssClass: string;
}>;

export const tileTypes: readonly TileDefinition[] = [
  { id: 'rose', name: 'роза', assetPath: roseAsset, cssClass: 'tile--rose' },
  { id: 'candle', name: 'свеча', assetPath: candleAsset, cssClass: 'tile--candle' },
  { id: 'key', name: 'ключ', assetPath: keyAsset, cssClass: 'tile--key' },
  { id: 'crystal', name: 'кристалл', assetPath: crystalAsset, cssClass: 'tile--crystal' },
  { id: 'bat', name: 'летучая мышь', assetPath: batAsset, cssClass: 'tile--bat' },
  { id: 'scroll', name: 'свиток', assetPath: scrollAsset, cssClass: 'tile--scroll' },
] as const;

export function getTileDefinition(tileType: number): TileDefinition | null {
  return tileTypes[tileType] ?? null;
}
