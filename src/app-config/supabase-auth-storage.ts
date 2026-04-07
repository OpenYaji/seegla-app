import { safeStorage } from '@/src/shared/storage/safe-storage';

export const supabaseAuthStorage = {
  async getItem(key: string): Promise<string | null> {
    return safeStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    await safeStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    await safeStorage.removeItem(key);
  },
};
