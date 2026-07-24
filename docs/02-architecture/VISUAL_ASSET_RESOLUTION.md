# Visual Asset Resolution

## Room assets

Room stage definitions expose stable `assetKey` values. `roomPresentation.ts`
contains the only mapping from those keys to imported files. Unknown keys throw
a descriptive error instead of silently displaying the wrong room.

## Story assets

Story definitions use typed portrait and background keys. The presentation
resolver returns the two concrete assets used by the visual-novel component.

## Extension rules

When adding a room:

1. add restoration tasks;
2. add one visual-state definition per possible completed-task count;
3. add scene files;
4. register every asset key in `roomPresentation.ts`;
5. extend resolver tests.

When adding a story scene:

1. add typed background and portrait slots when needed;
2. register them in `storyPresentation.ts`;
3. add the data record to `storyScenes.ts`;
4. keep dialogue outside the image.

This boundary prevents UI code, progression code, and saved data from depending
on production filenames.
