import type { BoosterKind, BoosterReward } from '../boosters/BoosterTypes';

export type RestorationUnlock =
  | Readonly<{
      type: 'booster';
      booster: BoosterKind;
      title: string;
      description: string;
    }>
  | Readonly<{
      type: 'level-group';
      levelGroupId: string;
      title: string;
      description: string;
    }>
  | Readonly<{
      type: 'mechanic';
      mechanicId: string;
      title: string;
      description: string;
    }>;

export type RestorationTaskDefinition = {
  id: string;
  roomId: string;
  title: string;
  description: string;
  starCost: number;
  order: number;
  rewards?: readonly BoosterReward[];
  unlocks?: readonly RestorationUnlock[];
  roomCompletionReward?: boolean;
  optional?: boolean;
};

export const restorationTasks: RestorationTaskDefinition[] = [
  {
    id: 'hall-clear-debris',
    roomId: 'hall',
    title: 'Убрать обломки',
    description: 'Освободить проход и вынести прогнившие доски.',
    starCost: 1,
    order: 1,
    rewards: [{ kind: 'hammer', amount: 2 }],
    unlocks: [{
      type: 'booster',
      booster: 'hammer',
      title: 'Открыт Серебряный молот',
      description: 'Удаляет одну фишку или снимает один слой препятствия без траты хода.',
    }],
  },
  {
    id: 'hall-light-chandelier',
    roomId: 'hall',
    title: 'Зажечь люстру',
    description: 'Вернуть свет в парадный вестибюль.',
    starCost: 1,
    order: 2,
    unlocks: [
      {
        type: 'level-group',
        levelGroupId: 'whispers',
        title: 'Открыты уровни 4–6',
        description: 'Составные цели, цепи и завалы теперь доступны на карте.',
      },
      {
        type: 'mechanic',
        mechanicId: 'mixed-objectives',
        title: 'Открыты составные цели',
        description: 'Некоторые уровни требуют выполнить несколько условий одновременно.',
      },
    ],
  },
  {
    id: 'hall-restore-portrait',
    roomId: 'hall',
    title: 'Восстановить портрет',
    description: 'Очистить семейный портрет от пыли и копоти.',
    starCost: 1,
    order: 3,
    rewards: [{ kind: 'hammer', amount: 3 }],
    roomCompletionReward: true,
    optional: true,
  },
  {
    id: 'library-open-shutters',
    roomId: 'library',
    title: 'Открыть ставни',
    description: 'Впустить лунный свет между книжных шкафов.',
    starCost: 1,
    order: 1,
    rewards: [{ kind: 'shuffle', amount: 2 }],
    unlocks: [{
      type: 'booster',
      booster: 'shuffle',
      title: 'Открыто Перемешивание',
      description: 'Перестраивает доступные фишки без траты хода и сохраняет препятствия.',
    }],
  },
  {
    id: 'library-repair-shelves',
    roomId: 'library',
    title: 'Починить стеллажи',
    description: 'Укрепить полки с редкими семейными архивами.',
    starCost: 1,
    order: 2,
    unlocks: [
      {
        type: 'level-group',
        levelGroupId: 'deepening-mystery',
        title: 'Открыты уровни 7–9',
        description: 'Туман, сложные формы поля и многослойные препятствия ждут дальше.',
      },
      {
        type: 'mechanic',
        mechanicId: 'fog-and-masks',
        title: 'Открыты туман и сложные поля',
        description: 'Новые уровни используют закрытые клетки, коридоры и туман.',
      },
    ],
  },
  {
    id: 'library-unlock-desk',
    roomId: 'library',
    title: 'Открыть письменный стол',
    description: 'Восстановить замок стола прежнего владельца.',
    starCost: 2,
    order: 3,
    rewards: [
      { kind: 'hammer', amount: 2 },
      { kind: 'shuffle', amount: 2 },
    ],
    roomCompletionReward: true,
    optional: true,
  },
  {
    id: 'garden-clear-vines',
    roomId: 'garden',
    title: 'Расчистить лозы',
    description: 'Освободить дорожки от колючих зарослей.',
    starCost: 1,
    order: 1,
    rewards: [{ kind: 'hammer', amount: 1 }],
  },
  {
    id: 'garden-repair-fountain',
    roomId: 'garden',
    title: 'Починить фонтан',
    description: 'Вернуть воду в мраморную чашу.',
    starCost: 2,
    order: 2,
    unlocks: [{
      type: 'level-group',
      levelGroupId: 'prototype-finale',
      title: 'Открыт уровень 10',
      description: 'Финальное испытание прототипа объединяет все изученные механики.',
    }],
  },
  {
    id: 'garden-revive-roses',
    roomId: 'garden',
    title: 'Оживить розарий',
    description: 'Высадить новые тёмные розы под стеклянным куполом.',
    starCost: 2,
    order: 3,
    rewards: [
      { kind: 'hammer', amount: 3 },
      { kind: 'shuffle', amount: 2 },
    ],
    roomCompletionReward: true,
    optional: true,
  },
  {
    id: 'crypt-clear-stairs',
    roomId: 'crypt',
    title: 'Очистить лестницу',
    description: 'Убрать камни, закрывающие спуск в крипту.',
    starCost: 1,
    order: 1,
    rewards: [{ kind: 'hammer', amount: 1 }],
  },
  {
    id: 'crypt-restore-seals',
    roomId: 'crypt',
    title: 'Восстановить печати',
    description: 'Собрать разбитые гербы семьи Блэквуд.',
    starCost: 2,
    order: 2,
  },
  {
    id: 'crypt-light-braziers',
    roomId: 'crypt',
    title: 'Зажечь жаровни',
    description: 'Осветить зал древнего договора.',
    starCost: 2,
    order: 3,
    rewards: [
      { kind: 'hammer', amount: 3 },
      { kind: 'shuffle', amount: 3 },
    ],
    roomCompletionReward: true,
    optional: true,
  },
  {
    id: 'tower-repair-steps',
    roomId: 'tower',
    title: 'Починить ступени',
    description: 'Сделать подъём в башню безопасным.',
    starCost: 1,
    order: 1,
    rewards: [{ kind: 'shuffle', amount: 1 }],
  },
  {
    id: 'tower-open-observatory',
    roomId: 'tower',
    title: 'Открыть обсерваторию',
    description: 'Снять ржавые засовы с купольных окон.',
    starCost: 1,
    order: 2,
  },
  {
    id: 'tower-restore-raven-clock',
    roomId: 'tower',
    title: 'Запустить часы ворона',
    description: 'Вернуть ход механизму, остановившемуся в ночь исчезновения.',
    starCost: 1,
    order: 3,
    rewards: [
      { kind: 'hammer', amount: 4 },
      { kind: 'shuffle', amount: 4 },
    ],
    roomCompletionReward: true,
    optional: true,
  },
];
