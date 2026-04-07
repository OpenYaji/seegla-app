import { useEffect, useState } from 'react';
import { safeStorage } from '@/src/shared/storage/safe-storage';

export const AUTH_GATE_KEY = 'SEEGLA_AUTHENTICATED';

export function useAuthGate() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const value = await safeStorage.getItem(AUTH_GATE_KEY);
        if (!active) return;
        setIsAuthenticated(value === '1');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return { loading, isAuthenticated };
}

export async function setAuthenticated(value: boolean): Promise<void> {
  if (value) {
    await safeStorage.setItem(AUTH_GATE_KEY, '1');
  } else {
    await safeStorage.removeItem(AUTH_GATE_KEY);
  }
}
