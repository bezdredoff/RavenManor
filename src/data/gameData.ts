export type RoomDefinition = {
  id: string;
  icon: string;
  title: string;
  requiredStars: number;
  description: string;
  levelIds: number[];
};

export type LevelDefinition = {
  id: number;
  title: string;
  targetTile: number;
  targetCount: number;
  moves: number;
  requiredStars: number;
};

export const tileTypes = [
  { icon: '🌹', name: 'роза' },
  { icon: '🕯️', name: 'свеча' },
  { icon: '🗝️', name: 'ключ' },
  { icon: '💎', name: 'кристалл' },
  { icon: '🦇', name: 'летучая мышь' },
  { icon: '📜', name: 'свиток' },
] as const;

export const rooms: RoomDefinition[] = [
  { id: 'hall', icon: '🏚️', title: 'Вестибюль', requiredStars: 0, description: 'Парадный вход, скрывающий первую семейную тайну.', levelIds: [1, 2] },
  { id: 'library', icon: '📚', title: 'Запретная библиотека', requiredStars: 3, description: 'Книги здесь помнят больше, чем живые обитатели.', levelIds: [3, 4] },
  { id: 'garden', icon: '🥀', title: 'Зимний сад', requiredStars: 7, description: 'Мёртвые розы расцветают при лунном свете.', levelIds: [5, 6] },
  { id: 'crypt', icon: '⚰️', title: 'Семейная крипта', requiredStars: 12, description: 'Под особняком спит древний договор.', levelIds: [7, 8] },
  { id: 'tower', icon: '🌙', title: 'Воронья башня', requiredStars: 18, description: 'Финал вертикального слайса и раскрытие силуэта.', levelIds: [9, 10] },
];

export const levels: LevelDefinition[] = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  title: `Уровень ${index + 1}`,
  targetTile: index % tileTypes.length,
  targetCount: 12 + index * 2,
  moves: 18 + Math.floor(index / 2),
  requiredStars: index === 0 ? 0 : Math.max(0, index * 2 - 1),
}));
