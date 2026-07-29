# Evelyn Layered Portrait

## Runtime composition

Evelyn uses a shared neutral base portrait and optional face-expression patches.

- `base-neutral.png` — 1024 x 1536 shared portrait;
- `face-smile.png` — 409 x 462;
- `face-speaking.png` — 409 x 462;
- `face-surprised.png` — 409 x 462.

All expression patches use the same normalized placement:

- left: 30.371%;
- top: 17.383%;
- width: 39.941%.

The neutral expression displays only the base. Other expressions crossfade the `face` slot.

## Why the first version uses a face patch

Independent AI-generated eyes and mouths did not share perfectly identical skin geometry and produced visible seams. A face-expression patch is still a layered, resource-efficient system, while remaining visually stable. The generic renderer already supports independent `eyes`, `mouth`, and `brows` slots for future source art created from a fixed master canvas.

## Expression selection

A dialogue beat can explicitly declare:

```ts
portraitExpression: 'surprised'
```

When omitted for Evelyn, the presentation resolver uses a deterministic temporary fallback based on dialogue punctuation and a small set of narrative keywords. Explicit authoring remains the preferred final approach.
