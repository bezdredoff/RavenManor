import hammerAsset from '../assets/boosters/hammer.svg?url';
import shuffleAsset from '../assets/boosters/shuffle.svg?url';
import type { BoosterKind } from '../boosters/BoosterTypes';

export type BoosterPresentation = Readonly<{
  name: string;
  shortName: string;
  description: string;
  assetPath: string;
  cssClass: string;
}>;

const PRESENTATIONS: Readonly<Record<BoosterKind, BoosterPresentation>> = {
  hammer: {
    name: 'Серебряный молот',
    shortName: 'Молот',
    description: 'Удаляет одну фишку или снимает один слой препятствия без траты хода.',
    assetPath: hammerAsset,
    cssClass: 'booster-hammer',
  },
  shuffle: {
    name: 'Перемешивание',
    shortName: 'Микс',
    description: 'Перестраивает доступные фишки, сохраняя усиления и препятствия.',
    assetPath: shuffleAsset,
    cssClass: 'booster-shuffle',
  },
};

export const boosterAssets = Object.values(PRESENTATIONS).map((item) => item.assetPath);

export function getBoosterPresentation(kind: BoosterKind): BoosterPresentation {
  return PRESENTATIONS[kind];
}
