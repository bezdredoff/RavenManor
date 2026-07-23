import levelDefinitionsJson from './levels/levels.json';
import levelGroupsJson from './progression/level-groups.json';
import { validateLevelCatalog } from './levelValidation';
import { validateLevelGroups } from './levelGroupValidation';
import { tileTypes } from './tileTypes';

export type RoomUnlockRule =
  | Readonly<{ type: 'always' }>
  | Readonly<{
      type: 'room-restoration';
      roomId: string;
      completedTasks: number;
    }>;

export type RoomDefinition = Readonly<{
  id: string;
  icon: string;
  title: string;
  description: string;
  unlock: RoomUnlockRule;
}>;

export type {
  CollectObjectiveDefinition,
  LevelDefinition,
  LevelDifficulty,
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

export const levelGroups = validateLevelGroups(levelGroupsJson, levels);

export const rooms: readonly RoomDefinition[] = [
  {
    id: 'hall',
    icon: '🏚️',
    title: 'Вестибюль',
    description: 'Парадный вход, скрывающий первую семейную тайну.',
    unlock: { type: 'always' },
  },
  {
    id: 'library',
    icon: '📚',
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
    icon: '🥀',
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
    icon: '⚰️',
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
    icon: '🌙',
    title: 'Воронья башня',
    description: 'Финальная мета-сцена вертикального среза.',
    unlock: {
      type: 'room-restoration',
      roomId: 'crypt',
      completedTasks: 1,
    },
  },
];
