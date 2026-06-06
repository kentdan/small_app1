import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { convertToMarkdown } from '@/converters';
import { useHistory } from '@/hooks/useHistory';
import { useDailyLimit } from '@/hooks/useDailyLimit';
import { countTokens } from '@/components/TokenCounter';

// This screen is shown when a file is opened via "Open with" / share sheet.
// It auto-starts conversion and navigates to preview on success.
export default function ConvertingScreen() {
  const { uri, fileName, mimeType } = useLocalSearchParams<{
    uri: string;
    fileName: string;
    mimeType: string;
  }>();
  const router = useRouter();
  const { save: saveHistory } = useHistory();
  const { canConvert, recordConversion } = useDailyLimit();

  useEffect(() => {
    if (!uri || !mimeType) { router.replace('/'); return; }

    if (!canConvert) {
      // Route back home so the paywall can fire from there
      router.replace({ pathname: '/', params: { showPaywall: '1' } });
      return;
    }

    (async () => {
      try {
        const markdown = await convertToMarkdown(uri, mimeType);
        await recordConversion();
        await saveHistory({
          fileName: fileName ?? 'file',
          fileType: mimeType,
          markdown,
          tokenCount: countTokens(markdown),
          convertedAt: Date.now(),
        });
        router.replace({
          pathname: '/preview',
          params: { fileName: fileName ?? 'file', markdown },
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Conversion failed';
        router.replace({ pathname: '/', params: { errorMsg: msg } });
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#7c3aed" />
      <Text style={styles.name} numberOfLines={2}>{fileName}</Text>
      <Text style={styles.sub}>Converting to Markdown…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  name: {
    color: '#f7fafc',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sub: {
    color: '#718096',
    fontSize: 14,
  },
});
