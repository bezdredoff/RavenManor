# FEATURE-056 — Complete Layered Room Art

## Objective

Finish the Chapter-One room-art upgrade by converting Garden, Crypt, and Tower
to the layered restoration system already proven by Hall and Library.

## Scope

- create five-layer kits for Garden, Crypt, and Tower;
- export four flat stage composites per room;
- register all five rooms in `roomLayeredPresentation.ts`;
- replace remaining Garden/Crypt/Tower SVG resolver imports with PNG imports;
- preserve every existing room visual `assetKey`;
- add regression tests for all five room progression contracts.

## Acceptance criteria

- every chapter-one room returns `true` from `isLayeredRoom`;
- exactly 25 room-layer assets are preloaded;
- each room changes at task counts 0, 1, 2, and 3 according to its repair tasks;
- Manor cards and detail screens use identical layer progress;
- reveal animation still resolves flat previous-stage assets;
- no save migration is required.
