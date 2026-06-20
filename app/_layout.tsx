import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { guessTypeFromUri } from '@/converters/uri';

function useIncomingFiles() {
  const router = useRouter();

  function handleUrl(url: string) {
    if (!url.startsWith('file://') && !url.startsWith('content://')) return;
    const fileName = decodeURIComponent(url.split('/').pop() ?? 'file');
    const mimeType = guessTypeFromUri(url);
    router.push({ pathname: '/converting', params: { uri: url, fileName, mimeType } });
  }

  useEffect(() => {
    Linking.getInitialURL().then(url => { if (url) handleUrl(url); });
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);
}

export default function RootLayout() {
  useIncomingFiles();
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#111' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#111' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'MDConverter' }} />
        <Stack.Screen name="converting" options={{ title: 'Converting…', headerBackVisible: false }} />
        <Stack.Screen name="preview" options={{ title: 'Result', headerBackTitle: 'Back' }} />
      </Stack>
    </>
  );
}
