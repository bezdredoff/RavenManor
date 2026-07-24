export const preloadImageAssets = (assets: readonly string[]): void => {
  const uniqueAssets = Array.from(new Set(assets.filter(Boolean)));
  const load = () => {
    uniqueAssets.forEach((asset) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = asset;
    });
  };

  const idleCallback = window.requestIdleCallback;
  if (typeof idleCallback === 'function') {
    idleCallback(load, { timeout: 1200 });
  } else {
    globalThis.setTimeout(load, 250);
  }
};
