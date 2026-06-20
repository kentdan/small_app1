import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { convertToMarkdown, SUPPORTED_MIME_TYPES } from '@/converters';
import { useDailyLimit } from '@/hooks/useDailyLimit';

const FORMATS = ['PDF', 'DOCX', 'PPTX', 'XLSX', 'HTML', 'CSV', 'JSON', 'XML', 'TXT', 'EPUB'];

export default function HomeScreen() {
  const router = useRouter();
  const { errorMsg } = useLocalSearchParams<{ errorMsg?: string }>();
  const limit = useDailyLimit();
  const [converting, setConverting] = useState(false);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (errorMsg) Alert.alert('Conversion error', decodeURIComponent(errorMsg));
  }, [errorMsg]);

  const handlePick = async () => {
    if (!limit.loaded) return;
    if (!limit.canConvert) {
      Alert.alert(
        'Daily limit reached',
        `You've used all ${limit.dailyLimit} free conversions today. Come back tomorrow!`,
      );
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: SUPPORTED_MIME_TYPES,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    setFileName(asset.name);
    setConverting(true);

    try {
      const markdown = await convertToMarkdown(asset.uri, asset.mimeType ?? '');
      await limit.recordConversion();
      router.push({ pathname: '/preview', params: { fileName: asset.name, markdown } });
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Conversion failed');
    } finally {
      setConverting(false);
      setFileName('');
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>

        {/* Limit counter */}
        {limit.loaded && !limit.isPremium && (
          <Text style={s.counter}>
            {limit.usedToday}/{limit.dailyLimit} free conversions today
          </Text>
        )}

        {/* Main button */}
        <View style={s.hero}>
          <TouchableOpacity style={s.btn} onPress={handlePick} disabled={converting} activeOpacity={0.8}>
            {converting ? (
              <>
                <ActivityIndicator color="#fff" size="large" />
                <Text style={s.btnLabel} numberOfLines={1}>{fileName || 'Converting…'}</Text>
              </>
            ) : (
              <>
                <Text style={s.btnIcon}>📄 → #️⃣</Text>
                <Text style={s.btnLabel}>Convert to Markdown</Text>
                <Text style={s.btnSub}>PDF · DOCX · XLSX · and more</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Supported formats */}
        <View style={s.formats}>
          {FORMATS.map(f => (
            <View key={f} style={s.badge}>
              <Text style={s.badgeText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Privacy note */}
        <Text style={s.privacy}>🔒 Converted on-device · no uploads · no internet</Text>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  counter: { textAlign: 'center', color: '#666', fontSize: 13, marginBottom: 8 },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btn: {
    width: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 20,
    paddingVertical: 40,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  btnIcon: { fontSize: 36 },
  btnLabel: { color: '#fff', fontSize: 20, fontWeight: '700' },
  btnSub: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  formats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  badge: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#333',
  },
  badgeText: { color: '#666', fontSize: 12 },
  privacy: { textAlign: 'center', color: '#444', fontSize: 12, marginBottom: 24 },
});
