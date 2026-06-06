import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Text } from 'react-native';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { guessTypeFromUri } from '@/converters/uri';

function HistoryButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push('/history')} style={{ marginRight: 16 }}>
      <Text style={{ fontSize: 22 }}>🗂️</Text>
    </TouchableOpacity>
  );
}

// Handle files opened via "Open with" / iOS share sheet → app
function useIncomingFiles() {
  const router = useRouter();

  function handleUrl(url: string) {
    // file:// or content:// URIs from "Open with"
    if (!url.startsWith('file://') && !url.startsWith('content://')) return;
    const fileName = decodeURIComponent(url.split('/').pop() ?? 'file');
    const mimeType = guessTypeFromUri(url);
    router.push({
      pathname: '/converting',
      params: { uri: url, fileName, mimeType },
    });
  }

  useEffect(() => {
    // File opened while app was closed
    Linking.getInitialURL().then(url => { if (url) handleUrl(url); });

    // File opened while app is already running
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
          headerStyle: { backgroundColor: '#0f0f1a' },
          headerTintColor: '#f7fafc',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#0f0f1a' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'MDConverter',
            headerRight: () => <HistoryButton />,
          }}
        />
        <Stack.Screen name="converting" options={{ title: 'Converting…', headerBackVisible: false }} />
        <Stack.Screen name="preview" options={{ title: 'Converted', headerBackTitle: 'Back' }} />
        <Stack.Screen name="history" options={{ title: 'History', headerBackTitle: 'Back' }} />
      </Stack>
    </>
  );
}
