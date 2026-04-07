type StorageValue = string | null;

const memoryFallback = new Map<string, string>();

type AsyncStorageLike = {
  getItem: (key: string) => Promise<StorageValue>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

function getAsyncStorage(): AsyncStorageLike | null {
  try {
    const mod = require('@react-native-async-storage/async-storage');
    const storage = mod?.default ?? mod;
    if (
      storage &&
      typeof storage.getItem === 'function' &&
      typeof storage.setItem === 'function' &&
      typeof storage.removeItem === 'function'
    ) {
      return storage as AsyncStorageLike;
    }
    return null;
  } catch {
    return null;
  }
}

async function withRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= retries; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < retries) {
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
    }
  }
  throw lastError;
}

function getWebStorage(): Storage | null {
  if (typeof globalThis === 'undefined') return null;
  if (!('localStorage' in globalThis)) return null;
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export const safeStorage = {
  async getItem(key: string): Promise<StorageValue> {
    const webStorage = getWebStorage();
    if (webStorage) {
      try {
        const value = webStorage.getItem(key);
        if (value !== null) memoryFallback.set(key, value);
        return value;
      } catch {
        return memoryFallback.get(key) ?? null;
      }
    }

    const asyncStorage = getAsyncStorage();
    if (!asyncStorage) return memoryFallback.get(key) ?? null;

    try {
      const value = await withRetry(() => asyncStorage.getItem(key), 1);
      if (value !== null) memoryFallback.set(key, value);
      return value;
    } catch {
      return memoryFallback.get(key) ?? null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    memoryFallback.set(key, value);

    const webStorage = getWebStorage();
    if (webStorage) {
      try {
        webStorage.setItem(key, value);
      } catch {
        // no-op, memory fallback is already set
      }
      return;
    }

    const asyncStorage = getAsyncStorage();
    if (!asyncStorage) return;

    try {
      await withRetry(() => asyncStorage.setItem(key, value), 1);
    } catch {
      // no-op, memory fallback is already set
    }
  },

  async removeItem(key: string): Promise<void> {
    memoryFallback.delete(key);

    const webStorage = getWebStorage();
    if (webStorage) {
      try {
        webStorage.removeItem(key);
      } catch {
        // no-op
      }
      return;
    }

    const asyncStorage = getAsyncStorage();
    if (!asyncStorage) return;

    try {
      await withRetry(() => asyncStorage.removeItem(key), 1);
    } catch {
      // no-op
    }
  },
};

