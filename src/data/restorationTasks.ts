export type RestorationTaskDefinition = {
  id: string;
  roomId: string;
  title: string;
  description: string;
  starCost: number;
  order: number;
};

export const restorationTasks: RestorationTaskDefinition[] = [
  {
    id: 'hall-clear-debris',
    roomId: 'hall',
    title: 'Убрать обломки',
    description: 'Освободить проход и вынести прогнившие доски.',
    starCost: 1,
    order: 1,
  },
  {
    id: 'hall-light-chandelier',
    roomId: 'hall',
    title: 'Зажечь люстру',
    description: 'Вернуть свет в парадный вестибюль.',
    starCost: 1,
    order: 2,
  },
  {
    id: 'hall-restore-portrait',
    roomId: 'hall',
    title: 'Восстановить портрет',
    description: 'Очистить семейный портрет от пыли и копоти.',
    starCost: 1,
    order: 3,
  },
  {
    id: 'library-open-shutters',
    roomId: 'library',
    title: 'Открыть ставни',
    description: 'Впустить лунный свет между книжных шкафов.',
    starCost: 1,
    order: 1,
  },
  {
    id: 'library-repair-shelves',
    roomId: 'library',
    title: 'Починить стеллажи',
    description: 'Укрепить полки с редкими семейными архивами.',
    starCost: 1,
    order: 2,
  },
  {
    id: 'library-unlock-desk',
    roomId: 'library',
    title: 'Открыть письменный стол',
    description: 'Восстановить замок стола прежнего владельца.',
    starCost: 2,
    order: 3,
  },
  {
    id: 'garden-clear-vines',
    roomId: 'garden',
    title: 'Расчистить лозы',
    description: 'Освободить дорожки от колючих зарослей.',
    starCost: 1,
    order: 1,
  },
  {
    id: 'garden-repair-fountain',
    roomId: 'garden',
    title: 'Починить фонтан',
    description: 'Вернуть воду в мраморную чашу.',
    starCost: 2,
    order: 2,
  },
  {
    id: 'garden-revive-roses',
    roomId: 'garden',
    title: 'Оживить розарий',
    description: 'Высадить новые тёмные розы под стеклянным куполом.',
    starCost: 2,
    order: 3,
  },
  {
    id: 'crypt-clear-stairs',
    roomId: 'crypt',
    title: 'Очистить лестницу',
    description: 'Убрать камни, закрывающие спуск в крипту.',
    starCost: 1,
    order: 1,
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
  },
  {
    id: 'tower-repair-steps',
    roomId: 'tower',
    title: 'Починить ступени',
    description: 'Сделать подъём в башню безопасным.',
    starCost: 1,
    order: 1,
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
  },
];
