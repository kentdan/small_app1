import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { convertToMarkdown } from '@/converters';
import { useDailyLimit } from '@/hooks/useDailyLimit';

export default function ConvertingScreen() {
  const { uri, fileName, mimeType } = useLocalSearchParams<{
    uri: string; fileName: string; mimeType: string;
  }>();
  const router = useRouter();
  const { loaded, canConvert, recordConversion } = useDailyLimit();

  useEffect(() => {
    if (!uri || !mimeType) { router.replace('/'); return; }
    if (!loaded) return;

    if (!canConvert) {
      router.replace({ pathname: '/', params: { errorMsg: encodeURIComponent('Daily limit reached. Come back tomorrow!') } });
      return;
    }

    (async () => {
      try {
        const markdown = await convertToMarkdown(uri, mimeType);
        await recordConversion();
        router.replace({ pathname: '/preview', params: { fileName: fileName ?? 'file', markdown } });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Conversion failed';
        router.replace({ pathname: '/', params: { errorMsg: encodeURIComponent(msg) } });
      }
    })();
  }, [loaded]);

  return (
    <View style={s.container}>
      <ActivityIndicator size="large" color="#7c3aed" />
      <Text style={s.name} numberOfLines={2}>{fileName}</Text>
      <Text style={s.sub}>Converting…</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  name: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  sub: { color: '#666', fontSize: 14 },
});
