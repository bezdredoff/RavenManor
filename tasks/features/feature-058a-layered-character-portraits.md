# FEATURE-058A — Layered Character Portrait Foundation

**Status:** Ready for StackBlitz verification  
**Base:** FEATURE-057 / compatible overlay for FEATURE-058  
**Version:** `0.9.3-playtest.058a`

## Scope

- replace Evelyn's precomposed expression images with a shared base plus small expression layers;
- introduce a generic portrait registry for all current and future characters;
- keep Raven, Adrian, Silhouette, and Lucian compatible as one-layer portraits;
- preserve the story and journal flows;
- crossfade only the changed portrait layer when possible;
- honor reduced motion;
- allow future `eyes`, `mouth`, `brows`, `accessory`, and `fx` layers.

## Acceptance criteria

- Evelyn's eyes and mouth are anatomically aligned in every current expression;
- neutral, smile, speaking, and surprised variants appear in early story scenes;
- changing Evelyn expression does not recreate the background or whole modal;
- changing characters crossfades the portrait canvas;
- journal replay uses the same layered renderer;
- other characters remain visible;
- TypeScript build passes;
- no save migration is required.
