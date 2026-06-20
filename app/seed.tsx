import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// DEV-only screen used by Maestro E2E tests to seed AsyncStorage state.
// Opens as: mdconverter:///seed?count=5&isPremium=false
// Writes the usage record then immediately redirects to home.
export default function SeedScreen() {
  const { count, isPremium } = useLocalSearchParams<{ count: string; isPremium: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!__DEV__) {
      router.replace('/');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const usage = {
      date: today,
      count: parseInt(count ?? '0', 10),
      isPremium: isPremium === 'true',
    };
    AsyncStorage.setItem('mdconverter_usage', JSON.stringify(usage)).then(() => {
      router.replace('/');
    });
  }, []);

  return null;
}
