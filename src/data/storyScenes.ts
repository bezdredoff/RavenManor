export type StoryPortraitKey = 'evelyn' | 'raven' | 'adrian' | 'silhouette';
export type StoryBackgroundKey =
  | 'gates'
  | 'raven-window'
  | 'hall'
  | 'library'
  | 'garden'
  | 'crypt'
  | 'tower';

export type StoryDialogueBeat = Readonly<{
  speaker: string;
  text: string;
  portraitKey: StoryPortraitKey;
  portraitSide: 'left' | 'right';
}>;

export type StorySceneDefinition = Readonly<{
  id: string;
  afterLevelId: number;
  chapter: string;
  title: string;
  backgroundKey: StoryBackgroundKey;
  beats: readonly StoryDialogueBeat[];
}>;

export const storyScenes: readonly StorySceneDefinition[] = [
  {
    id: 'return-to-the-gates',
    afterLevelId: 1,
    chapter: 'Глава I · Возвращение',
    title: 'Письмо без подписи',
    backgroundKey: 'gates',
    beats: [
      {
        speaker: 'Эвелин',
        text: 'В письме было всего семь слов: «Вернись, прежде чем дом забудет тебя». Ни подписи, ни обратного адреса — только засохший лепесток чёрной розы.',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
      {
        speaker: 'Ворон',
        text: 'Кар-р… Ты опоздала на двенадцать лет, наследница. Но ворота всё ещё помнят запах твоей крови.',
        portraitKey: 'raven',
        portraitSide: 'right',
      },
      {
        speaker: 'Эвелин',
        text: 'Я никогда прежде здесь не была. По крайней мере, именно это я повторяла себе, пока замок не открылся от одного прикосновения.',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
      {
        speaker: 'Ворон',
        text: 'Люди забывают, чтобы выжить. Дома запоминают, чтобы однажды потребовать долг.',
        portraitKey: 'raven',
        portraitSide: 'right',
      },
    ],
  },
  {
    id: 'the-man-in-the-hall',
    afterLevelId: 3,
    chapter: 'Глава I · Возвращение',
    title: 'Хозяин без приглашения',
    backgroundKey: 'hall',
    beats: [
      {
        speaker: 'Эвелин',
        text: 'Вестибюль встретил меня пылью и запахом воска. Однако на столе стояли две чашки горячего чая — словно кто-то точно знал минуту моего приезда.',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
      {
        speaker: 'Лорд Адриан',
        text: 'Одну чашку я приготовил для вас. Вторую — для той девушки, которая должна была вернуться сюда двенадцать лет назад.',
        portraitKey: 'adrian',
        portraitSide: 'right',
      },
      {
        speaker: 'Эвелин',
        text: 'Он назвал меня по имени, но сам не представился. В старом зеркале за его спиной отражалась только пустая комната.',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
      {
        speaker: 'Лорд Адриан',
        text: 'Не бойтесь отсутствующего отражения, Эвелин. Опасаться следует того, что уже начинает возвращаться в ваше собственное.',
        portraitKey: 'adrian',
        portraitSide: 'right',
      },
    ],
  },
  {
    id: 'the-erased-portrait',
    afterLevelId: 6,
    chapter: 'Глава I · Возвращение',
    title: 'Лицо под краской',
    backgroundKey: 'hall',
    beats: [
      {
        speaker: 'Эвелин',
        text: 'Под слоем копоти обнаружился семейный портрет. Рядом с моей матерью стояла девочка в белом платье, но её лицо было старательно соскоблено ножом.',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
      {
        speaker: 'Ворон',
        text: 'Кар-р… Художник не виноват. Твоё лицо исчезло с полотна в ту же ночь, когда исчезло из твоей памяти.',
        portraitKey: 'raven',
        portraitSide: 'right',
      },
      {
        speaker: 'Лорд Адриан',
        text: 'Роза в руке девочки — печать рода Блэквуд. Пока дом разрушен, печать слабеет. Когда она погаснет, запертая башня откроется сама.',
        portraitKey: 'adrian',
        portraitSide: 'right',
      },
      {
        speaker: 'Эвелин',
        text: 'За высохшей краской проступили две буквы, вырезанные детской рукой: «Э» и «Л». Второе имя я не могла вспомнить.',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
    ],
  },
  {
    id: 'the-missing-pages',
    afterLevelId: 9,
    chapter: 'Глава II · Память дома',
    title: 'Дневник моей матери',
    backgroundKey: 'library',
    beats: [
      {
        speaker: 'Эвелин',
        text: 'В библиотеке я нашла дневник матери. Каждая запись после моего десятого дня рождения была вырвана, но на корешке сохранилась надпись: «Договор с Ночным кругом».',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
      {
        speaker: 'Лорд Адриан',
        text: 'Ваш род охранял границу между людьми и теми, кто переживает века. Договор удерживал обе стороны от войны.',
        portraitKey: 'adrian',
        portraitSide: 'right',
      },
      {
        speaker: 'Эвелин',
        text: 'На последней сохранившейся странице мать написала: «Адриан выполнит приказ, даже если возненавидит меня». Что именно вы сделали?',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
      {
        speaker: 'Лорд Адриан',
        text: 'То, о чём вы сами меня попросили. Но прежде чем осудить меня, найдите страницу, спрятанную среди лунных роз.',
        portraitKey: 'adrian',
        portraitSide: 'right',
      },
    ],
  },
  {
    id: 'moon-rose-memory',
    afterLevelId: 15,
    chapter: 'Глава II · Память дома',
    title: 'Имя среди шипов',
    backgroundKey: 'garden',
    beats: [
      {
        speaker: 'Эвелин',
        text: 'В зимнем саду мёртвые лозы расцвели, когда моя ладонь коснулась земли. Среди лепестков лежала половина серебряного медальона.',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
      {
        speaker: 'Неизвестный силуэт',
        text: 'Ты всегда выбирала самые колючие розы. Говорила, что красивым вещам нельзя доверять, пока они не научатся защищаться.',
        portraitKey: 'silhouette',
        portraitSide: 'right',
      },
      {
        speaker: 'Эвелин',
        text: 'Голос прозвучал внутри моей головы. На секунду я увидела мальчика с серебряными глазами и услышала имя: Люциан.',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
      {
        speaker: 'Ворон',
        text: 'Кар-р… Наконец-то. Но не произноси это имя слишком громко. Некоторые узники слышат даже сквозь камень.',
        portraitKey: 'raven',
        portraitSide: 'right',
      },
    ],
  },
  {
    id: 'the-empty-sarcophagus',
    afterLevelId: 21,
    chapter: 'Глава II · Память дома',
    title: 'Могила без тела',
    backgroundKey: 'crypt',
    beats: [
      {
        speaker: 'Эвелин',
        text: 'В семейной крипте стоял саркофаг с моим именем и датой смерти двенадцатилетней давности. Каменная крышка была сдвинута изнутри.',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
      {
        speaker: 'Лорд Адриан',
        text: 'В ту ночь дом должен был получить одну жизнь в уплату за нарушение договора. Мы позволили ему поверить, что он получил вашу.',
        portraitKey: 'adrian',
        portraitSide: 'right',
      },
      {
        speaker: 'Эвелин',
        text: '«Мы»? На внутренней стороне крышки кто-то выцарапал: «Я занял твоё место. Не возвращайся». Подпись была стёрта, но я уже знала имя.',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
      {
        speaker: 'Лорд Адриан',
        text: 'Люциан спас вас, но цена изменила его. Я запечатал башню не ради договора — я исполнил последнюю просьбу вашего друга.',
        portraitKey: 'adrian',
        portraitSide: 'right',
      },
    ],
  },
  {
    id: 'the-guardian-confesses',
    afterLevelId: 24,
    chapter: 'Глава II · Память дома',
    title: 'Клятва Адриана',
    backgroundKey: 'raven-window',
    beats: [
      {
        speaker: 'Эвелин',
        text: 'Я потребовала правду. Адриан долго молчал у окна, пока лунный свет не сделал его лицо почти человеческим.',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
      {
        speaker: 'Лорд Адриан',
        text: 'Я был послан Ночным кругом наблюдать за вашим родом. Затем ваша мать доверила мне вас — и впервые за три столетия приказ перестал быть важнее человека.',
        portraitKey: 'adrian',
        portraitSide: 'right',
      },
      {
        speaker: 'Эвелин',
        text: 'Значит, вы спасли меня, стерли память и двенадцать лет ждали возвращения. Какую часть этой истории вы всё ещё скрываете?',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
      {
        speaker: 'Лорд Адриан',
        text: 'Ту, в которой открыть башню можете только вы. И ту, в которой я не уверен, кого выберу, если оттуда выйдет не тот Люциан, которого вы помните.',
        portraitKey: 'adrian',
        portraitSide: 'right',
      },
    ],
  },
  {
    id: 'the-letter-to-adrian',
    afterLevelId: 12,
    chapter: 'Глава III · Утраченное имя',
    title: 'Приказ, написанный мной',
    backgroundKey: 'library',
    beats: [
      {
        speaker: 'Эвелин',
        text: 'За фальшивой стенкой библиотеки нашлось письмо моим почерком. Я написала его в ночь исчезновения, хотя не помнила ни единого слова.',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
      {
        speaker: 'Эвелин',
        text: '«Адриан, забери мои воспоминания. Если я узнаю Люциана, печать узнает меня. Не позволяй мне вернуться, пока дом не сможет выдержать пробуждение».',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
      {
        speaker: 'Ворон',
        text: 'Кар-р… Теперь дом достаточно силён. Но письмо заканчивается не там. Переверни лист.',
        portraitKey: 'raven',
        portraitSide: 'right',
      },
      {
        speaker: 'Эвелин',
        text: 'На обороте была одна строка: «Если я снова полюблю одного из них, договор будет разрушен окончательно». Адриан отвёл взгляд.',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
    ],
  },
  {
    id: 'the-stolen-night',
    afterLevelId: 27,
    chapter: 'Глава III · Утраченное имя',
    title: 'Ночь, которую у меня отняли',
    backgroundKey: 'tower',
    beats: [
      {
        speaker: 'Неизвестный силуэт',
        text: 'Ты пришла к башне в ту ночь добровольно. Мы собирались бежать до рассвета, но печать потребовала кровь наследницы.',
        portraitKey: 'silhouette',
        portraitSide: 'right',
      },
      {
        speaker: 'Эвелин',
        text: 'Воспоминание вернулось обрывками: его рука в моей, разбитое окно, Адриан у двери и чёрные розы, прорастающие сквозь камень.',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
      {
        speaker: 'Неизвестный силуэт',
        text: 'Я принял проклятие вместо тебя. Но дом не умеет хранить жертвы бережно. С каждым годом он оставлял во мне всё меньше человека.',
        portraitKey: 'silhouette',
        portraitSide: 'right',
      },
      {
        speaker: 'Эвелин',
        text: 'Я не могла разглядеть его лицо, но знала: если открою последнюю дверь, назад уже не вернётся никто из нас троих.',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
    ],
  },
  {
    id: 'the-raven-tower-opens',
    afterLevelId: 30,
    chapter: 'Глава III · Утраченное имя',
    title: 'Пробуждение башни',
    backgroundKey: 'tower',
    beats: [
      {
        speaker: 'Лорд Адриан',
        text: 'Последняя печать разрушена. Пока дверь закрыта, я ещё могу увезти вас отсюда. Дом восстановлен достаточно, чтобы пережить наш побег.',
        portraitKey: 'adrian',
        portraitSide: 'right',
      },
      {
        speaker: 'Эвелин',
        text: 'Но Люциан заплатил за мой побег двенадцатью годами одиночества. Я не могла оставить его второй раз — даже если открывала дверь чудовищу.',
        portraitKey: 'evelyn',
        portraitSide: 'left',
      },
      {
        speaker: 'Люциан',
        text: 'Дверь отворилась прежде, чем ключ коснулся замка. Из темноты вышел мужчина с теми же серебряными глазами. «Ты всё-таки вспомнила меня».',
        portraitKey: 'silhouette',
        portraitSide: 'right',
      },
      {
        speaker: 'Ворон',
        text: 'Где-то под поместьем ударил второй колокол — тот, которого не было на планах дома. Кар-р… Первая глава закончилась. Договор только проснулся.',
        portraitKey: 'raven',
        portraitSide: 'right',
      },
    ],
  },
];
