# FEATURE-055 — Layered Library Art Integration

## Objective

Apply the production-style layered room pipeline to the Library while retaining
the current progression, asset keys, reveal animation and saves.

## Restoration mapping

1. `library-open-shutters` → moonlit window layer;
2. `library-repair-shelves` → restored shelves and ladder layer;
3. `library-unlock-desk` → writing desk/letter layer and final ambience.

## Acceptance

- Library card and room hero use layered rendering;
- each completed Library task visibly adds its authored change;
- Hall remains layered and unchanged;
- Garden, Crypt and Tower continue using their existing stage images;
- flat Library stage images resolve through the existing room asset keys;
- no save or progression migration is introduced.
