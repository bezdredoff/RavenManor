export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const memoryFallback = new MemoryStorage();

export const getSafeStorage = (): StorageLike => {
  try {
    const storage = globalThis.localStorage;
    const probe = '__raven_manor_storage_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return memoryFallback;
  }
};
