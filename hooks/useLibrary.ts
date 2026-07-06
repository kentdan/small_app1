import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { listConversions, deleteConversion, LibraryEntry } from '@/lib/library';

export function useLibrary() {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setEntries(await listConversions());
    setLoaded(true);
  }, []);

  // Refresh whenever the screen gains focus (e.g. returning from preview).
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteConversion(id);
      await refresh();
    },
    [refresh]
  );

  return { entries, loaded, refresh, remove };
}
