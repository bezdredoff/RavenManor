# Optional Onboarding

## Design intent

Raven Manor targets a familiar match-3 audience. The first session must not
force experienced players through a long tutorial or a dedicated tutorial
level.

## First-level flow

When a new player starts any available level for the first time, the game asks:

- **Show tips** — enable two contextual cards above the live board;
- **Play without tutorial** — skip immediately and start playing normally.

The choice is persisted.

## Contextual steps

1. Swap adjacent tiles to make a line of three or more.
2. Watch the objective and remaining moves; cascades and larger matches count.

The board remains interactive while either card is visible. A valid first move
also advances the first card automatically.

## Player control

The player can:

- skip from the initial choice;
- dismiss either contextual card;
- disable guidance from the card;
- restart the tutorial from Settings.

## Future mechanics

New blockers, objectives, special tiles, and boosters should use the same
pattern: one short contextual explanation at the moment the mechanic first
appears, with a persistent opt-out. Do not create a long linear onboarding
sequence unless user testing proves it is necessary.
