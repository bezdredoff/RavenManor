export type RocketDirection = 'row' | 'column';

export type SpecialTile = Readonly<
  | { kind: 'rocket'; direction: RocketDirection; baseTile: number }
  | { kind: 'bomb'; baseTile: number }
  | { kind: 'raven'; baseTile: number }
  | { kind: 'prism'; baseTile: number }
>;

export type DirectSpecialCombo =
  | 'rocket-rocket'
  | 'rocket-bomb'
  | 'bomb-bomb'
  | 'prism-normal';

export function isRocket(special: SpecialTile | null | undefined): special is Extract<SpecialTile, { kind: 'rocket' }> {
  return special?.kind === 'rocket';
}

export function getDirectSpecialCombo(
  first: SpecialTile | null | undefined,
  second: SpecialTile | null | undefined,
): DirectSpecialCombo | null {
  if (first?.kind === 'prism' && !second) return 'prism-normal';
  if (second?.kind === 'prism' && !first) return 'prism-normal';
  if (isRocket(first) && isRocket(second)) return 'rocket-rocket';
  if (
    (isRocket(first) && second?.kind === 'bomb')
    || (first?.kind === 'bomb' && isRocket(second))
  ) return 'rocket-bomb';
  if (first?.kind === 'bomb' && second?.kind === 'bomb') return 'bomb-bomb';
  return null;
}

export function getSpecialPower(special: SpecialTile): number {
  switch (special.kind) {
    case 'rocket': return 2;
    case 'raven': return 3;
    case 'bomb': return 4;
    case 'prism': return 6;
  }
}

export function getSpecialLabel(special: SpecialTile): string {
  switch (special.kind) {
    case 'rocket': return special.direction === 'row' ? 'горизонтальная ракета' : 'вертикальная ракета';
    case 'bomb': return 'взрывная руна';
    case 'raven': return 'призрачный ворон';
    case 'prism': return 'лунная призма';
  }
}
