# Global settings navigation

The top-right header action contains a settings gear beside the star wallet on
Home, Levels, Manor, Room, Match-3, and Journal.

Opening Settings records an in-memory return action for the current screen.
The Back action restores that caller rather than always returning Home.

## Match-3 preservation

Opening Settings from an active level does not recreate the engine. Returning
calls `renderGame()` using the existing:

- board and obstacles;
- remaining moves;
- objective progress;
- selected/active booster;
- current level and analytics attempt.

The return action is session-only and is intentionally not written to the save.
Settings itself does not show another settings gear; its Back control is the
return path.

## Future screens

Every new primary screen must:

1. use the shared `topbar()`;
2. declare a `ScreenMode`;
3. add its return action to `getCurrentScreenReturnAction()`;
4. be covered by `SettingsNavigation.test.ts`.
