# Story Journal Visuals

FEATURE-068B treats the journal as a recognisable gothic book rather than a
vertical card feed. It has a dark plum cover, an antique-gold progress ledger,
a five-room visual chapter index, and a parchment folio for the selected room.

## Contract

- existing Chapter-One room art remains the contextual background source;
- every room tab reuses that room's existing contextual art;
- the journal does not introduce a second room-art manifest;
- letters, notes, records, and discoveries remain authored story scenes;
- opening an entry reuses the approved FEATURE-066 story canvas;
- progress, replay behavior, localization, and save data remain unchanged.

## Entry states

- **Locked** — muted folio row with the unlock condition and no action.
- **New** — wine inset, brighter status, and prominent `Смотреть` action.
- **Viewed** — quiet archive row with `Пересмотреть`.
- **Major** — antique-gold rule and badge after unlock.

## Information architecture

- the cover and ledger summarise global progress;
- five visual tabs remain visible as the table of contents;
- the unread room is selected automatically on first open;
- the selected folio contains six entries in a two-column grid;
- `320 px` uses a single-column entry fallback;
- no sticky header;
- journal continuation and entry actions remain at least 44 px;
- scrolling stays inside the application frame.

## Visual QA

Check fresh, partially unlocked, and completed journals at `320×568`, `360×640`,
`390×844`, `430×932`, and a centred desktop frame. Confirm that locked titles
remain spoiler-safe, new entries are obvious without animation, summaries do
not collide with actions, and the document itself has no horizontal overflow.
