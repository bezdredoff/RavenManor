# Local Playtest Analytics

Raven Manor does not use a remote analytics SDK in the vertical slice.
`PlaytestAnalytics` records a bounded dataset in
`ravenManorPlaytestAnalyticsV1` and exports it only after an explicit player
action.

## Recorded signals

Per level:

- attempts;
- wins and losses;
- valid and invalid moves;
- hints used;
- total active attempt duration;
- best star result;
- last outcome.

Event stream:

- session start;
- screen views;
- level start, win, loss, and abandonment;
- restoration completion or blocked restoration;
- viewed story scenes;
- save/analytics/diagnostics export;
- PWA install-prompt outcome.

The event stream is capped at 400 entries. Aggregate level statistics remain
available after older events are discarded.

## Attempt boundaries

A level attempt begins only in `startLevel`. It ends on win or loss. Navigating
away from gameplay, restarting, or starting another level records an abandoned
attempt rather than silently overwriting it.

Random board contents and every individual tile coordinate are intentionally not
stored. The current scope is balance and funnel diagnosis, not replaying exact
moves.

## Export and privacy

Settings shows a short local summary and offers `Экспорт аналитики`. The JSON
contains a random installation identifier, timestamps, event history, and level
aggregates.

No data leaves the device automatically. Testers should be told that exporting
and sending the file is voluntary.
