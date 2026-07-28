# FEATURE-054 — Layered Vestibule Art Integration

## Objective

Replace the flat first-room scene with a layered Romantic Gothic restoration kit
and wire it into the current Manor/Room presentation without breaking the
existing room-stage progression contract.

## Scope

- integrate the new foyer-based vestibule art as layered PNG assets;
- preserve the existing four hall stage keys for reveal and compatibility;
- render layered hall art on the Manor room card and room-detail screen;
- keep the existing room reveal animation functional by using composite stage
  previews;
- introduce the minimal reusable code path for future layered rooms.

## Deliverables

- `src/assets/rooms/hall/stage-0.png` … `stage-3.png`
- `src/assets/rooms/hall/layered/*.png`
- `src/ui/roomLayeredPresentation.ts`
- updated `src/ui/GameApp.ts`
- updated `src/ui/roomPresentation.ts`
- updated `src/style.css`
- feature tests and art documentation

## Acceptance

- the hall room card visually changes as restoration tasks are completed;
- the hall room-detail hero shows layered restoration progress;
- existing hall `assetKey` lookups still resolve correctly;
- other rooms behave exactly as before;
- reveal animation can still display a previous single-image state.
