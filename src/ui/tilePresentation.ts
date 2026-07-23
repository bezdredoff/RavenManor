import { getTileDefinition } from '../data/tileTypes';

export type TileVisualState = Readonly<{
  selected?: boolean;
  hinted?: boolean;
  invalid?: boolean;
  matched?: boolean;
  settling?: boolean;
}>;

export function getTileClassName(tileType: number, state: TileVisualState = {}): string {
  const definition = getTileDefinition(tileType);
  const classes = ['tile'];
  if (definition) classes.push(definition.cssClass);
  if (state.selected) classes.push('selected');
  if (state.hinted) classes.push('hint');
  if (state.invalid) classes.push('invalid');
  if (state.matched) classes.push('matched');
  if (state.settling) classes.push('settling');
  return classes.join(' ');
}

export function getTileKey(row: number, col: number): string {
  return `${row},${col}`;
}
