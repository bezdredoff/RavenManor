# Meta Game

Match-3 progression and manor restoration are related through stars but are not
hard-wired to the same content structure.

## Two Progression Tracks

### Gameplay progression

```text
win levels
-> unlock the next level group
-> choose any available level inside that group
```

The first group exposes three levels immediately. Later groups require two
victories in the previous group. Replaying a completed level never counts as an
additional victory, but it can improve the star reward.

### Manor progression

```text
earn stars
-> spend available stars on restoration tasks
-> advance a room visual state
-> open the next room after the configured restoration milestone
```

Rooms are not containers for a fixed number of match-3 levels. This allows the
campaign to grow to hundreds or thousands of levels without creating an equal
number of rooms or restoration tasks.

## Prototype Rules

- 10 match-3 levels are a vertical slice, not a product-size cap;
- levels 1-3 are available at the start;
- any two victories unlock the next group;
- each level has independent 2-star and 3-star thresholds;
- one-star wins are enough for gameplay progression;
- stars remain the currency for manor restoration;
- the next room opens from restoration progress, not from raw earned stars;
- onboarding is optional and belongs to FEATURE-037.

## Player Loop

```text
choose one of several available levels
-> complete it and earn 1-3 stars
-> unlock another group after enough distinct victories
-> spend stars on a chosen restoration task
-> see the room improve and eventually open the next room
-> return to any open level group
```
