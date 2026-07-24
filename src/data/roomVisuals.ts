export type RoomVisualStageDefinition = {
  completedTasks: number;
  assetKey: string;
  title: string;
  description: string;
};

export type RoomVisualDefinition = {
  roomId: string;
  stages: RoomVisualStageDefinition[];
};

export const roomVisuals: RoomVisualDefinition[] = [
  {
    roomId: 'hall',
    stages: [
      {
        completedTasks: 0,
        assetKey: 'rooms/hall/stage-0-ruined',
        title: 'Заброшенный вход',
        description: 'Обломки закрывают проход, а парадный зал тонет во тьме.',
      },
      {
        completedTasks: 1,
        assetKey: 'rooms/hall/stage-1-cleared',
        title: 'Проход расчищен',
        description: 'Теперь можно войти внутрь и осмотреть стены вестибюля.',
      },
      {
        completedTasks: 2,
        assetKey: 'rooms/hall/stage-2-lit',
        title: 'Люстра снова горит',
        description: 'Тёплый свет проявляет гербы и следы старого пожара.',
      },
      {
        completedTasks: 3,
        assetKey: 'rooms/hall/stage-3-restored',
        title: 'Вестибюль восстановлен',
        description: 'Семейный портрет снова смотрит на каждого, кто входит в дом.',
      },
    ],
  },
  {
    roomId: 'library',
    stages: [
      {
        completedTasks: 0,
        assetKey: 'rooms/library/stage-0-sealed',
        title: 'Запечатанные архивы',
        description: 'Ставни закрыты, а книжные шкафы скрыты под паутиной.',
      },
      {
        completedTasks: 1,
        assetKey: 'rooms/library/stage-1-moonlit',
        title: 'Лунный свет',
        description: 'Открытые ставни освещают пыльные проходы между книгами.',
      },
      {
        completedTasks: 2,
        assetKey: 'rooms/library/stage-2-shelves',
        title: 'Архивы собраны',
        description: 'Укреплённые полки снова удерживают семейную хронику.',
      },
      {
        completedTasks: 3,
        assetKey: 'rooms/library/stage-3-desk',
        title: 'Тайник открыт',
        description: 'В письменном столе обнаружено письмо с сорванной печатью.',
      },
    ],
  },
  {
    roomId: 'garden',
    stages: [
      {
        completedTasks: 0,
        assetKey: 'rooms/garden/stage-0-overgrown',
        title: 'Заросший зимний сад',
        description: 'Колючие лозы поглотили дорожки и разбитую оранжерею.',
      },
      {
        completedTasks: 1,
        assetKey: 'rooms/garden/stage-1-cleared',
        title: 'Дорожки открыты',
        description: 'Среди расчищенных лоз проступает узор старой мозаики.',
      },
      {
        completedTasks: 2,
        assetKey: 'rooms/garden/stage-2-fountain',
        title: 'Фонтан ожил',
        description: 'Вода снова течёт по мрамору, пробуждая спящие растения.',
      },
      {
        completedTasks: 3,
        assetKey: 'rooms/garden/stage-3-roses',
        title: 'Розарий цветёт',
        description: 'Тёмные розы раскрылись под холодным светом стеклянного купола.',
      },
    ],
  },
  {
    roomId: 'crypt',
    stages: [
      {
        completedTasks: 0,
        assetKey: 'rooms/crypt/stage-0-buried',
        title: 'Заваленный спуск',
        description: 'Камни скрывают лестницу, ведущую под фундамент поместья.',
      },
      {
        completedTasks: 1,
        assetKey: 'rooms/crypt/stage-1-stairs',
        title: 'Путь в крипту',
        description: 'Очищенная лестница открывает зал древних захоронений.',
      },
      {
        completedTasks: 2,
        assetKey: 'rooms/crypt/stage-2-seals',
        title: 'Гербы собраны',
        description: 'Восстановленные печати складываются в карту тайного договора.',
      },
      {
        completedTasks: 3,
        assetKey: 'rooms/crypt/stage-3-braziers',
        title: 'Крипта освещена',
        description: 'Жаровни вспыхнули, и над саркофагом появилась древняя надпись.',
      },
    ],
  },
  {
    roomId: 'tower',
    stages: [
      {
        completedTasks: 0,
        assetKey: 'rooms/tower/stage-0-broken',
        title: 'Разрушенная башня',
        description: 'Сломанные ступени обрываются под куполом во время грозы.',
      },
      {
        completedTasks: 1,
        assetKey: 'rooms/tower/stage-1-steps',
        title: 'Подъём восстановлен',
        description: 'Теперь можно добраться до запертой обсерватории.',
      },
      {
        completedTasks: 2,
        assetKey: 'rooms/tower/stage-2-observatory',
        title: 'Купол открыт',
        description: 'Обсерватория снова видит звёзды над Raven Manor.',
      },
      {
        completedTasks: 3,
        assetKey: 'rooms/tower/stage-3-clock',
        title: 'Часы ворона идут',
        description: 'Механизм отсчитывает время до возвращения неизвестного силуэта.',
      },
    ],
  },
];
