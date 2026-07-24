export type StoryPortraitKey = 'evelyn' | 'raven' | 'adrian' | 'silhouette';
export type StoryBackgroundKey = 'gates' | 'raven-window' | 'hall' | 'tower';

export type StorySceneDefinition = Readonly<{
  id: string;
  chapter: string;
  speaker: string;
  text: string;
  portraitKey: StoryPortraitKey;
  backgroundKey: StoryBackgroundKey;
  portraitSide: 'left' | 'right';
}>;

export const storyScenes: readonly StorySceneDefinition[] = [
  {
    id: 'return-to-the-gates',
    chapter: 'Глава I · Возвращение',
    speaker: 'Эвелин',
    text: 'После многих лет отсутствия я снова стою перед воротами Raven Manor. Письмо не было подписано.',
    portraitKey: 'evelyn',
    backgroundKey: 'gates',
    portraitSide: 'left',
  },
  {
    id: 'the-house-remembers',
    chapter: 'Глава I · Голос дома',
    speaker: 'Ворон',
    text: 'Кар-р… Дом узнаёт свою наследницу, даже если она сама ещё ничего не помнит.',
    portraitKey: 'raven',
    backgroundKey: 'raven-window',
    portraitSide: 'right',
  },
  {
    id: 'the-ancient-contract',
    chapter: 'Глава I · Древний договор',
    speaker: 'Лорд Адриан',
    text: 'Восстановите комнаты, Эвелин. Каждая из них хранит часть древнего договора.',
    portraitKey: 'adrian',
    backgroundKey: 'hall',
    portraitSide: 'right',
  },
  {
    id: 'the-stolen-night',
    chapter: 'Глава I · Утраченная ночь',
    speaker: 'Неизвестный силуэт',
    text: 'Ты уже была здесь. В башне. В ту ночь, которую у тебя отняли.',
    portraitKey: 'silhouette',
    backgroundKey: 'tower',
    portraitSide: 'left',
  },
];
