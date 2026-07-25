# Story journal notifications

The Journal is the single story entry point on Home. The former separate Home
story-scene action is removed to avoid two buttons competing for the same
content.

When one or more unlocked scenes have not been viewed, the Journal button:

- receives a small corner badge labelled `Новое` / `New` / `Новае`;
- uses a restrained periodic lift/glow animation;
- continues to show viewed/total progress;
- stops animating as soon as no unread unlocked scenes remain.

The animation is decorative and is disabled by `prefers-reduced-motion`.
Locked future scenes never trigger the notification.
