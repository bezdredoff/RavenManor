# Localization architecture

FEATURE-053 introduces runtime localization for Russian, English, and
Belarusian without duplicating gameplay data or changing the gameplay save.

## Locale storage

The selected locale is stored separately under:

```text
ravenManorLocaleV1
```

Russian is the fallback when the stored value is absent or invalid. Language
selection does not modify `ravenManorStateV4`, audio settings, analytics, or
PWA caches.

## Translation sources

- `uiTranslations.ts` — navigation, HUD, settings, modals, PWA, errors;
- `contentTranslations.ts` — rooms, levels, restoration, tiles, obstacles;
- `storyTranslations.ts` — all 30 titles, summaries, and 110 dialogue beats.

Russian remains the authored source language. Screens and modals are rendered
from existing data, then translated by `LocalizationManager`. Dynamic messages
use longest-fragment replacement when an exact entry is not available.

## Adding content

When adding a new visible Russian string:

1. add an English and Belarusian entry to the appropriate translation file;
2. keep character and place names consistent with the chapter glossary;
3. extend `Localization.test.ts` when the new content belongs to a complete
   catalog such as levels or story scenes;
4. verify Russian, English, and Belarusian on a narrow phone viewport.

Do not store localized copies of progression identifiers. IDs, level numbers,
objective types, save keys, and analytics event names remain language-neutral.
