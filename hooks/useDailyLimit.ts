import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

const FREE_DAILY_LIMIT = 5;
const KEY = 'mdconverter_usage';

interface Usage { date: string; count: number; isPremium: boolean }

const today = () => new Date().toISOString().split('T')[0];

export function useDailyLimit() {
  const [usage, setUsage] = useState<Usage>({ date: today(), count: 0, isPremium: false });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const stored: Usage = JSON.parse(raw);
          if (stored.date !== today()) {
            const reset = { date: today(), count: 0, isPremium: stored.isPremium };
            await AsyncStorage.setItem(KEY, JSON.stringify(reset));
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

  const recordConversion = useCallback(async () => {
    const next = { ...usage, count: usage.count + 1 };
    setUsage(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  }, [usage]);

  const unlockPremium = useCallback(async () => {
    const next = { ...usage, isPremium: true };
    setUsage(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  }, [usage]);

  return {
    loaded,
    canConvert: usage.isPremium || usage.count < FREE_DAILY_LIMIT,
    usedToday: usage.count,
    dailyLimit: FREE_DAILY_LIMIT,
    isPremium: usage.isPremium,
    recordConversion,
    unlockPremium,
  };
}
