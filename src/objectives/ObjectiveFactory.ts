import type { LevelObjectiveDefinition } from '../data/levelTypes';
import { ClearObstacleObjective } from './ClearObstacleObjective';
import { CollectObjective } from './CollectObjective';
import type { LevelObjective } from './LevelObjective';

export function createLevelObjectives(
  levelId: number,
  definitions: readonly LevelObjectiveDefinition[],
): LevelObjective[] {
  return definitions.map((definition) => {
    const id = `level-${levelId}-${definition.id}`;
    if (definition.type === 'collect') {
      return new CollectObjective({
        id,
        tileType: definition.tileType,
        target: definition.target,
      });
    }
    return new ClearObstacleObjective({
      id,
      obstacleKind: definition.obstacleKind,
      target: definition.target,
    });
  });
}
