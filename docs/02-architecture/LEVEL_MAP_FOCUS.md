# Level map focus from room screens

The `К уровням` action at the end of every room screen now opens the level map
at the most relevant campaign section instead of always leaving the player at
the top.

Selection rule:

1. consider only unlocked level groups;
2. choose the last unlocked group with at least one unfinished level;
3. when every unlocked group is complete, choose the last unlocked group;
4. when none is unlocked, retain the normal top-of-map behaviour.

The rule is implemented as a pure helper in `src/ui/levelMapFocus.ts`. Only the
room-screen CTA requests this focus. Normal navigation to the level map still
opens at the top.
