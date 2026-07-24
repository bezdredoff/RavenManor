export type ObstacleKind = 'chain' | 'rubble' | 'fog';
export type ObstacleLayerCount = 1 | 2;

export type Obstacle = Readonly<{
  kind: ObstacleKind;
  layers: ObstacleLayerCount;
}>;

export type ObstaclePlacement = Readonly<{
  row: number;
  col: number;
  kind: ObstacleKind;
  layers: ObstacleLayerCount;
}>;

export function getObstacleLabel(kind: ObstacleKind): string {
  switch (kind) {
    case 'chain': return 'цепи';
    case 'rubble': return 'завалы';
    case 'fog': return 'туман';
  }
}

export function getObstacleUnitLabel(kind: ObstacleKind, count: number): string {
  switch (kind) {
    case 'chain': return count === 1 ? 'цепь' : 'цепей';
    case 'rubble': return count === 1 ? 'завал' : 'завалов';
    case 'fog': return count === 1 ? 'область тумана' : 'областей тумана';
  }
}
