# Layered Character Portraits

## Purpose

The story renderer supports both legacy single-image portraits and scalable layered portraits.
Each character is resolved through one registry and rendered through one stable DOM contract.

## Layer slots

The current contract supports these slots:

- `base` — shared body, hair, clothing, and default silhouette;
- `face` — a complete face-expression patch;
- `eyes`;
- `mouth`;
- `brows`;
- `accessory`;
- `fx`.

A character may use any subset. Evelyn initially uses `base + face`, because independent AI-generated eyes and mouth produced visible skin seams. Future characters may use separate eyes, mouth, and brows when their source art is authored against one fixed master canvas.

## Data flow

```text
StoryDialogueBeat
  -> portraitKey + optional portraitExpression
  -> resolveStoryPortrait()
  -> ResolvedStoryPortrait
  -> renderStoryPortraitMarkup() / transitionStoryPortrait()
```

Legacy characters are represented as one `base` layer and therefore use the same renderer.

## Transition contract

Layers are keyed by semantic slot. When the next beat changes only one slot, the renderer leaves all other layers mounted and crossfades only the changed slot. When the character changes, the complete portrait canvas crossfades.

The transition enum currently supports:

- `instant`;
- `fade`;
- `crossfade`.

New animation types can be added without changing story data. Reduced-motion mode replaces layers immediately.

## Adding a layered character

1. Add one shared base image and expression layers under `src/assets/story/portraits/<character>/`.
2. Add a layered definition to `portraitDefinitions` in `storyPortraitPresentation.ts`.
3. Reuse existing semantic slots. Add a new slot only when the layer has a genuinely different lifetime or transition.
4. Add expressions to `StoryPortraitExpression` only when they are authored and tested.
5. Add explicit `portraitExpression` values to story beats where automatic fallback is not sufficient.
