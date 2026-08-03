# FEATURE-067 — Silhouette Portrait

## Goal

Replace the legacy placeholder SVG with a polished transparent portrait while
preserving the unknown character's identity through level 29.

## User Value

The final outdated character slot now matches Raven Manor's refreshed gothic
story presentation without spoiling Lucian's reveal.

## Context Pack

- `docs/01-design/CHAPTER_ONE_STORY.md`
- `docs/03-art/STORY_SCENE_SYSTEM.md`
- `docs/03-art/ASSET_MANIFEST.json`
- `src/ui/storyPortraitPresentation.ts`

## Scope

- add one `1024×1536` transparent neutral/full-body PNG;
- connect Silhouette to the new asset on the existing single-layer contract;
- align the portrait canvas aspect ratio with the 2:3 source asset;
- document and verify the replacement.

## Out of Scope

- expression variants;
- story, progression, rewards, or save-format changes;
- changes to Evelyn, Adrian, Lucian, or Raven;
- portrait CSS or story-modal layout changes;
- crossfade behavior changes;
- removal of inactive legacy files from a drag-and-drop installation.

## Requirements

- the face, eyes, hair, and identity remain unreadable;
- the asset remains visually compatible with the current semi-realistic gothic
  character set;
- Silhouette continues to resolve to exactly one `base` layer;
- no runtime import may point to `silhouette.svg`.

## Acceptance Criteria

- `portrait-neutral-v1.png` exists as a `1024×1536` RGBA PNG;
- all Silhouette beats resolve to the same single asset;
- the canvas uses the correct `2 / 3` aspect ratio;
- Lucian remains hidden until the authored level-30 reveal;
- the no-cross-character-crossfade fix remains untouched;
- tests, build, and the FEATURE-067 verifier pass.

## Likely Files

- `src/assets/story/portraits/silhouette/portrait-neutral-v1.png`
- `src/ui/storyPortraitPresentation.ts`
- `tests/StoryPortraitPresentation.test.ts`
- `src/appVersion.ts`
- supporting art documentation and verifier.

## Dependencies

- FEATURE-058A layered portrait foundation;
- FEATURE-063 instant canvas replacement between characters;
- FEATURE-066 story UI;
- visually approved HOTFIX-066A portrait sizing.

## Manual Test

1. Open a pre-level-30 story or journal replay with Silhouette.
2. Confirm the new hooded figure appears as one clean transparent cutout.
3. Confirm no face, eyes, hair, or identity clues are visible.
4. Move to and from another character; the previous character must not flash.
5. Check `320×568`, `390×844`, `430×932`, and desktop preview.
6. Complete/replay the level-30 scene and confirm revealed Lucian is unchanged.

## Risks

- dark clothing may lose detail on the darkest room backgrounds;
- browser image compression/scaling still requires final StackBlitz visual QA;
- the inactive legacy SVG remains in drag-and-drop installations but is not
  referenced by runtime code.
