import evelynBase from '../assets/story/portraits/evelyn/base-neutral.png?url';
import evelynFaceSmile from '../assets/story/portraits/evelyn/face-smile.png?url';
import evelynFaceSpeaking from '../assets/story/portraits/evelyn/face-speaking.png?url';
import evelynFaceSurprised from '../assets/story/portraits/evelyn/face-surprised.png?url';
import ravenNeutral from '../assets/story/portraits/raven/neutral.png?url';
import adrianNeutral from '../assets/story/portraits/adrian/portrait-neutral-v3.png?url';
import adrianSpeaking from '../assets/story/portraits/adrian/portrait-speaking-v3.png?url';
import adrianSurprised from '../assets/story/portraits/adrian/portrait-surprised-v3.png?url';
import silhouettePortrait from '../assets/story/portraits/silhouette/portrait-neutral-v1.png?url';
import lucianNeutral from '../assets/story/portraits/lucian/portrait-neutral-v2.png?url';
import lucianSpeaking from '../assets/story/portraits/lucian/portrait-speaking-v2.png?url';
import lucianSurprised from '../assets/story/portraits/lucian/portrait-surprised-v2.png?url';
import type {
  StoryDialogueBeat,
  StoryPortraitExpression,
  StoryPortraitKey,
} from '../data/storyScenes';

export type StoryPortraitLayerSlot =
  | 'base'
  | 'face'
  | 'eyes'
  | 'mouth'
  | 'brows'
  | 'accessory'
  | 'fx';

export type StoryPortraitLayerTransition = 'instant' | 'fade' | 'crossfade';

export type StoryPortraitLayerPlacement = Readonly<{
  left: number;
  top: number;
  width: number;
}>;

export type ResolvedStoryPortraitLayer = Readonly<{
  slot: StoryPortraitLayerSlot;
  asset: string;
  placement?: StoryPortraitLayerPlacement;
  transition: StoryPortraitLayerTransition;
}>;

export type ResolvedStoryPortrait = Readonly<{
  characterKey: StoryPortraitKey;
  expression: StoryPortraitExpression;
  aspectRatio: number;
  layers: readonly ResolvedStoryPortraitLayer[];
}>;

type LayeredPortraitDefinition = Readonly<{
  kind: 'layered';
  aspectRatio: number;
  base: string;
  expressions: Readonly<Partial<Record<StoryPortraitExpression, readonly ResolvedStoryPortraitLayer[]>>>;
}>;

type SinglePortraitDefinition = Readonly<{
  kind: 'single';
  aspectRatio: number;
  asset: string;
  expressions?: Readonly<Partial<Record<StoryPortraitExpression, string>>>;
}>;

type PortraitDefinition = LayeredPortraitDefinition | SinglePortraitDefinition;

const EVELYN_FACE_PLACEMENT: StoryPortraitLayerPlacement = {
  left: 30.371,
  top: 17.383,
  width: 39.941,
};

const portraitDefinitions: Readonly<Record<StoryPortraitKey, PortraitDefinition>> = {
  evelyn: {
    kind: 'layered',
    aspectRatio: 2 / 3,
    base: evelynBase,
    expressions: {
      neutral: [],
      smile: [{
        slot: 'face',
        asset: evelynFaceSmile,
        placement: EVELYN_FACE_PLACEMENT,
        transition: 'crossfade',
      }],
      speaking: [{
        slot: 'face',
        asset: evelynFaceSpeaking,
        placement: EVELYN_FACE_PLACEMENT,
        transition: 'crossfade',
      }],
      surprised: [{
        slot: 'face',
        asset: evelynFaceSurprised,
        placement: EVELYN_FACE_PLACEMENT,
        transition: 'crossfade',
      }],
    },
  },
  raven: { kind: 'single', aspectRatio: 2 / 3, asset: ravenNeutral },
  adrian: {
    kind: 'single',
    aspectRatio: 2 / 3,
    asset: adrianNeutral,
    expressions: {
      neutral: adrianNeutral,
      smile: adrianNeutral,
      speaking: adrianSpeaking,
      stern: adrianNeutral,
      surprised: adrianSurprised,
    },
  },
  silhouette: { kind: 'single', aspectRatio: 2 / 3, asset: silhouettePortrait },
  lucian: {
    kind: 'single',
    aspectRatio: 2 / 3,
    asset: lucianNeutral,
    expressions: {
      neutral: lucianNeutral,
      smile: lucianNeutral,
      speaking: lucianSpeaking,
      stern: lucianNeutral,
      surprised: lucianSurprised,
    },
  },
};

export const storyPortraitAssets = [
  evelynBase,
  evelynFaceSmile,
  evelynFaceSpeaking,
  evelynFaceSurprised,
  ravenNeutral,
  adrianNeutral,
  adrianSpeaking,
  adrianSurprised,
  silhouettePortrait,
  lucianNeutral,
  lucianSpeaking,
  lucianSurprised,
];

function inferEvelynExpression(beat: StoryDialogueBeat): StoryPortraitExpression {
  if (beat.portraitExpression) return beat.portraitExpression;
  const text = beat.text.toLowerCase();
  if (/[?!]/.test(beat.text)) return 'surprised';
  if (
    text.includes('спасибо')
    || text.includes('успоко')
    || text.includes('восстановлю')
    || text.includes('я почти помню')
  ) return 'smile';
  if (
    text.includes('не помнила')
    || text.includes('не могла')
    || text.includes('никогда прежде')
    || text.includes('страшно')
  ) return 'neutral';
  return 'speaking';
}

function inferRavenExpression(): StoryPortraitExpression {
  return 'neutral';
}

function inferAdrianExpression(beat: StoryDialogueBeat): StoryPortraitExpression {
  if (beat.portraitExpression) return beat.portraitExpression;
  const text = beat.text.toLowerCase();
  if (text.includes('невозможно') || /\?!|!\?/.test(beat.text)) return 'surprised';
  if (
    text.includes('не открывайте')
    || text.includes('опас')
    || text.includes('контракт')
    || text.includes('печать')
    || text.includes('наблюдал')
    || text.includes('защищал')
    || text.includes('признаюсь')
    || text.includes('башн')
  ) return 'stern';
  if (
    text.includes('утро здесь редко')
    || text.includes('разумеется')
    || text.includes('любопыт')
    || text.includes('рад')
    || text.includes('полагаю')
  ) return 'smile';
  return 'speaking';
}

function inferLucianExpression(beat: StoryDialogueBeat): StoryPortraitExpression {
  if (beat.portraitExpression) return beat.portraitExpression;
  const text = beat.text.toLowerCase();
  if (/[?!]/.test(beat.text)) return 'surprised';
  if (
    text.includes('улыб')
    || text.includes('помнишь')
    || text.includes('рад')
    || text.includes('вспомнила')
  ) return 'smile';
  if (
    text.includes('одиноч')
    || text.includes('ждал')
    || text.includes('молч')
    || text.includes('тень')
  ) return 'stern';
  return 'speaking';
}

export function resolveStoryPortrait(beat: StoryDialogueBeat): ResolvedStoryPortrait {
  const definition = portraitDefinitions[beat.portraitKey];
  const expression = beat.portraitKey === 'evelyn'
    ? inferEvelynExpression(beat)
    : beat.portraitKey === 'adrian'
      ? inferAdrianExpression(beat)
      : beat.portraitKey === 'raven'
        ? inferRavenExpression()
        : beat.portraitKey === 'lucian'
          ? inferLucianExpression(beat)
          : beat.portraitExpression ?? 'neutral';

  if (definition.kind === 'single') {
    const asset = definition.expressions?.[expression] ?? definition.asset;
    return {
      characterKey: beat.portraitKey,
      expression,
      aspectRatio: definition.aspectRatio,
      layers: [{
        slot: 'base',
        asset,
        transition: 'crossfade',
      }],
    };
  }

  return {
    characterKey: beat.portraitKey,
    expression,
    aspectRatio: definition.aspectRatio,
    layers: [
      { slot: 'base', asset: definition.base, transition: 'instant' },
      ...(definition.expressions[expression] ?? definition.expressions.neutral ?? []),
    ],
  };
}

function getLayerStyle(layer: ResolvedStoryPortraitLayer): string {
  if (!layer.placement) return '';
  return [
    `--portrait-layer-left:${layer.placement.left}%`,
    `--portrait-layer-top:${layer.placement.top}%`,
    `--portrait-layer-width:${layer.placement.width}%`,
  ].join(';');
}

function renderLayer(layer: ResolvedStoryPortraitLayer): string {
  const placementClass = layer.placement ? ' story-portrait-layer--placed' : '';
  return `<img
    class="story-portrait-layer story-portrait-layer--${layer.slot}${placementClass}"
    data-portrait-layer="${layer.slot}"
    data-portrait-asset="${layer.asset}"
    data-portrait-transition="${layer.transition}"
    src="${layer.asset}"
    style="${getLayerStyle(layer)}"
    alt=""
    draggable="false"
  />`;
}

function renderCanvas(portrait: ResolvedStoryPortrait): string {
  return `<div
    class="story-portrait-canvas"
    data-portrait-canvas
    data-character-key="${portrait.characterKey}"
    data-expression="${portrait.expression}"
    style="--story-portrait-aspect:${portrait.aspectRatio}"
  >${portrait.layers.map(renderLayer).join('')}</div>`;
}

export function renderStoryPortraitMarkup(portrait: ResolvedStoryPortrait): string {
  return `<div class="story-portrait" data-story-portrait>${renderCanvas(portrait)}</div>`;
}

function createCanvasElement(portrait: ResolvedStoryPortrait): HTMLElement {
  const template = document.createElement('template');
  template.innerHTML = renderCanvas(portrait).trim();
  const canvas = template.content.firstElementChild;
  if (!(canvas instanceof HTMLElement)) throw new Error('Failed to create story portrait canvas.');
  return canvas;
}

function createLayerElement(layer: ResolvedStoryPortraitLayer): HTMLImageElement {
  const template = document.createElement('template');
  template.innerHTML = renderLayer(layer).trim();
  const image = template.content.firstElementChild;
  if (!(image instanceof HTMLImageElement)) throw new Error('Failed to create story portrait layer.');
  return image;
}

function finishTransition(element: Element, duration: number, remove: boolean): void {
  window.setTimeout(() => {
    if (remove) element.remove();
    else element.classList.remove('is-entering', 'is-visible');
  }, duration);
}

export function transitionStoryPortrait(
  root: HTMLElement,
  next: ResolvedStoryPortrait,
  reducedMotion: boolean,
): void {
  const currentCanvas = root.querySelector<HTMLElement>('[data-portrait-canvas]');
  const duration = 190;

  if (reducedMotion) {
    root.innerHTML = renderCanvas(next);
    return;
  }

  if (!currentCanvas) {
    root.replaceChildren(createCanvasElement(next));
    return;
  }

  if (currentCanvas.dataset.characterKey !== next.characterKey) {
    // Never crossfade different characters: the outgoing portrait would remain
    // visible for a fraction of a second and look like the wrong speaker.
    root.replaceChildren(createCanvasElement(next));
    return;
  }

  currentCanvas.dataset.expression = next.expression;
  const nextBySlot = new Map(next.layers.map((layer) => [layer.slot, layer]));
  currentCanvas.querySelectorAll<HTMLImageElement>('[data-portrait-layer]').forEach((current) => {
    const slot = current.dataset.portraitLayer as StoryPortraitLayerSlot | undefined;
    if (!slot) return;
    const replacement = nextBySlot.get(slot);
    if (replacement && current.dataset.portraitAsset === replacement.asset) {
      nextBySlot.delete(slot);
      return;
    }
    current.classList.add('is-leaving');
    finishTransition(current, duration, true);
  });

  nextBySlot.forEach((layer) => {
    const incoming = createLayerElement(layer);
    incoming.classList.add('is-entering');
    currentCanvas.append(incoming);
    requestAnimationFrame(() => incoming.classList.add('is-visible'));
    finishTransition(incoming, duration, false);
  });
}
