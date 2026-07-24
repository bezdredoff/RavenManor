import levelDefinitionsJson from './levels/levels.json';
import levelGroupsJson from './progression/level-groups.json';
import { validateLevelCatalog } from './levelValidation';
import { validateLevelGroups } from './levelGroupValidation';
import { tileTypes } from './tileTypes';
import { restorationTasks } from './restorationTasks';

import type { RoomDefinition } from './roomTypes';
export type { RoomDefinition, RoomUnlockRule } from './roomTypes';

export type {
  ClearObstacleObjectiveDefinition,
  CollectObjectiveDefinition,
  LevelDefinition,
  LevelBoardDefinition,
  LevelDifficulty,
  LevelObstacleDefinition,
  LevelObjectiveDefinition,
  StarThresholds,
} from './levelTypes';
export type {
  LevelGroupDefinition,
  LevelGroupUnlockRule,
} from './levelGroupTypes';

export { tileTypes } from './tileTypes';

export const levels = validateLevelCatalog(levelDefinitionsJson, {
  tileTypeCount: tileTypes.length,
});

export const levelGroups = validateLevelGroups(levelGroupsJson, levels, restorationTasks);

export const rooms: readonly RoomDefinition[] = [
  {
    id: 'hall',
    title: 'Вестибюль',
    description: 'Парадный вход, скрывающий первую семейную тайну.',
    unlock: { type: 'always' },
  },
  {
    id: 'library',
    title: 'Запретная библиотека',
    description: 'Книги здесь помнят больше, чем живые обитатели.',
    unlock: {
      type: 'room-restoration',
      roomId: 'hall',
      completedTasks: 2,
    },
  },
  {
    id: 'garden',
    title: 'Зимний сад',
    description: 'Мёртвые розы расцветают при лунном свете.',
    unlock: {
      type: 'room-restoration',
      roomId: 'library',
      completedTasks: 2,
    },
  },
  {
    id: 'crypt',
    title: 'Семейная крипта',
    description: 'Под особняком спит древний договор.',
    unlock: {
      type: 'room-restoration',
      roomId: 'garden',
      completedTasks: 2,
    },
  },
  {
    id: 'tower',
    title: 'Воронья башня',
    description: 'Финальная мета-сцена вертикального среза.',
    unlock: {
      type: 'room-restoration',
      roomId: 'crypt',
      completedTasks: 2,
    },
  },
];
