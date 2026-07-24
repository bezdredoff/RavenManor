import { describe, expect, it } from 'vitest';
import { isRemoteBuildDifferent } from '../src/pwa/PwaManager';

describe('PWA update version policy', () => {
  it('reports the same deployed app version as current', () => {
    expect(isRemoteBuildDifferent('0.2.2-playtest.047b', {
      appVersion: '0.2.2-playtest.047b',
    })).toBe(false);
  });

  it('reports a different deployed app version as an update', () => {
    expect(isRemoteBuildDifferent('0.2.1-playtest.047a', {
      appVersion: '0.2.2-playtest.047b',
    })).toBe(true);
  });
});
