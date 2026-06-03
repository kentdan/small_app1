import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

const FREE_DAILY_LIMIT = 5;
const STORAGE_KEY = 'mdconverter_usage';

interface UsageData {
  date: string;
  count: number;
  isPremium: boolean;
}

function todayString() {
  return new Date().toISOString().split('T')[0];
}

export function useDailyLimit() {
  const [usage, setUsage] = useState<UsageData>({
    date: todayString(),
    count: 0,
    isPremium: false,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const stored: UsageData = JSON.parse(raw);
          if (stored.date !== todayString()) {
            // New day — reset count, keep premium status
            const reset: UsageData = { date: todayString(), count: 0, isPremium: stored.isPremium };
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
            setUsage(reset);
          } else {
            setUsage(stored);
          }
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const canConvert = usage.isPremium || usage.count < FREE_DAILY_LIMIT;
  const remaining = usage.isPremium ? Infinity : Math.max(0, FREE_DAILY_LIMIT - usage.count);

  const recordConversion = useCallback(async () => {
    const next: UsageData = { ...usage, count: usage.count + 1 };
    setUsage(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, [usage]);

  const unlockPremium = useCallback(async () => {
    const next: UsageData = { ...usage, isPremium: true };
    setUsage(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, [usage]);

  return {
    loaded,
    canConvert,
    remaining,
    usedToday: usage.count,
    isPremium: usage.isPremium,
    dailyLimit: FREE_DAILY_LIMIT,
    recordConversion,
    unlockPremium,
  };
}
