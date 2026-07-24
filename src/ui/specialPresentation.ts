import bombAsset from '../assets/specials/bomb.svg?url';
import prismAsset from '../assets/specials/prism.svg?url';
import ravenAsset from '../assets/specials/raven.svg?url';
import rocketAsset from '../assets/specials/rocket.svg?url';
import type { SpecialTile } from '../engine/SpecialTileTypes';

export type SpecialPresentation = Readonly<{
  name: string;
  assetPath: string;
  cssClass: string;
}>;

export const specialAssets = [rocketAsset, bombAsset, ravenAsset, prismAsset] as const;

export function getSpecialPresentation(special: SpecialTile): SpecialPresentation {
  switch (special.kind) {
    case 'rocket':
      return {
        name: special.direction === 'row' ? 'горизонтальная ракета' : 'вертикальная ракета',
        assetPath: rocketAsset,
        cssClass: `special--rocket special--rocket-${special.direction}`,
      };
    case 'bomb':
      return { name: 'взрывная руна', assetPath: bombAsset, cssClass: 'special--bomb' };
    case 'raven':
      return { name: 'призрачный ворон', assetPath: ravenAsset, cssClass: 'special--raven' };
    case 'prism':
      return { name: 'лунная призма', assetPath: prismAsset, cssClass: 'special--prism' };
  }
}
