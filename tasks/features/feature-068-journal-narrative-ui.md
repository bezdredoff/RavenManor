# FEATURE-068B — Journal Book UI Redesign

## Revision note

The first FEATURE-068 pass was rejected because it preserved the old vertical
stack closely enough to read as a cosmetic reskin. FEATURE-068B replaces that
information architecture while retaining the same data and replay contracts.

## Goal

Turn the story journal into a recognisable Raven Manor book: a cover, a visual
five-room chapter index, and a separate folio for the selected room, without
changing narrative data or the story canvas.

## User Value

The journal is immediately distinguishable from the old card stack and lets the
player browse one room at a time while remaining compact on portrait phones.

## Scope

- replace the five-room vertical stack with a cover, ledger, five visual room
  tabs, selected-room banner, and two-column folio grid;
- select the room containing the earliest unread scene on first open, otherwise
  the latest unlocked room, and preserve the selected room during the session;
- retain distinct `new`, `viewed`, `locked`, and `major` entry states;
- expose semantic `data-journal-*` hooks for deterministic visual QA;
- retain current room-stage contextual backgrounds and FEATURE-066 replay UI;
- update documentation, version markers, tests, and a feature verifier.

## Out of Scope

- story text, order, unlocks, progress, analytics, or save-format changes;
- a new letter/document content model or a separate journal-detail screen;
- room art, portraits, story transitions, or HOTFIX-066A sizing changes;
- global button/modal restyling reserved for FEATURE-069.

## Acceptance Criteria

- all five rooms render simultaneously as the chapter index;
- only the selected room's six entries render in the folio;
- changing room tabs updates the folio and contextual background immediately;
- the first view selects the earliest unread room when one exists;
- new, viewed, locked, and major entries remain distinct without relying only
  on colour;
- locked entries reveal only the existing spoiler-safe unlock copy;
- journal continuation and entry actions retain a 44 px minimum target;
- the current room background resolver and story replay flow remain unchanged;
- there is no document-level horizontal or vertical scroll;
- `320×568`, `360×640`, `390×844`, `430×932`, and centred desktop QA pass;
- TypeScript, all tests, production build, and the FEATURE-068 verifier pass.

## Manual Test

1. Open a fresh journal and verify all entries are locked.
2. Open a partial save with viewed and unread scenes.
3. Confirm the earliest unread continuation action opens the correct scene.
4. Replay a viewed entry and return to the journal.
5. Inspect a major entry and a locked entry in every room group.
6. Repeat at the required mobile viewports and desktop frame.

## Risks

- one folio contains six entries; the archive remains a contained scroll;
- very long localized titles can increase row height but must not overlap the
  entry action;
- future document-specific layouts should extend the story data contract in a
  separate feature rather than infer content type from prose.
