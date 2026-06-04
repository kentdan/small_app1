import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

const MAX_HISTORY = 30;
const HISTORY_KEY = 'mdconverter_history';

export interface HistoryEntry {
  id: string;
  fileName: string;
  fileType: string;
  markdown: string;
  tokenCount: number;
  convertedAt: number;
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        if (raw) setEntries(JSON.parse(raw));
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const save = useCallback(async (entry: Omit<HistoryEntry, 'id'>) => {
    const next: HistoryEntry[] = [
      { ...entry, id: Date.now().toString() },
      ...entries,
    ].slice(0, MAX_HISTORY);
    setEntries(next);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }, [entries]);

  const remove = useCallback(async (id: string) => {
    const next = entries.filter(e => e.id !== id);
    setEntries(next);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }, [entries]);

  const clear = useCallback(async () => {
    setEntries([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  }, []);

  return { entries, loaded, save, remove, clear };
}
