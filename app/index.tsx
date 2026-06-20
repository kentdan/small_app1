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
  const [convertingName, setConvertingName] = useState('');

  useEffect(() => {
    if (errorMsg) Alert.alert('Error', decodeURIComponent(errorMsg));
  }, [errorMsg]);

  const handlePick = async () => {
    if (!limit.loaded || converting) return;
    if (!limit.canConvert) {
      Alert.alert(
        'Daily limit reached',
        `You've used all ${limit.dailyLimit} free conversions today. Try again tomorrow.`,
        [{ text: 'OK' }],
      );
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: SUPPORTED_MIME_TYPES,
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    setConvertingName(asset.name);
    setConverting(true);
    try {
      const markdown = await convertToMarkdown(asset.uri, asset.mimeType ?? '');
      await limit.recordConversion();
      router.push({ pathname: '/preview', params: { fileName: asset.name, markdown } });
    } catch (e: unknown) {
      Alert.alert('Conversion failed', e instanceof Error ? e.message : 'Please try another file.');
    } finally {
      setConverting(false);
      setConvertingName('');
    }
  };

  const atLimit = limit.loaded && !limit.isPremium && !limit.canConvert;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>

        {/* Logo */}
        <View style={s.logoArea}>
          <View style={s.iconWrap}>
            <Text style={s.iconLabel}>M↓</Text>
          </View>
          <Text style={s.appName}>MDConverter</Text>
          <Text style={s.tagline}>Convert any file to Markdown — on device</Text>
        </View>

        {/* Primary action */}
        <TouchableOpacity
          style={[s.btn, (converting || atLimit) && s.btnDim]}
          onPress={handlePick}
          activeOpacity={0.75}
          disabled={converting}
        >
          {converting ? (
            <View style={s.row}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={s.btnSubLabel} numberOfLines={1}>
                {convertingName || 'Converting…'}
              </Text>
            </View>
          ) : (
            <Text style={s.btnLabel}>
              {atLimit ? `Limit reached · resets tomorrow` : 'Choose File'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Format chips */}
        <View style={s.chips}>
          {FORMATS.map(f => (
            <View key={f} style={s.chip}>
              <Text style={s.chipText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={s.footer}>
          {limit.loaded && !limit.isPremium && (
            <Text style={s.counter}>{limit.usedToday} of {limit.dailyLimit} free today</Text>
          )}
          <Text style={s.privacy}>On-device · nothing leaves your phone</Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const PURPLE = '#5E5CE6';

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, paddingHorizontal: 24 },

  logoArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 10,
  },
  iconLabel: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  appName: { color: '#fff', fontSize: 30, fontWeight: '700', letterSpacing: -0.5 },
  tagline: { color: 'rgba(255,255,255,0.35)', fontSize: 15, textAlign: 'center' },

  btn: {
    backgroundColor: PURPLE,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  btnDim: { backgroundColor: '#2D2B6B', shadowOpacity: 0 },
  btnLabel: { color: '#fff', fontSize: 18, fontWeight: '600', letterSpacing: -0.2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnSubLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 16, maxWidth: 220 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 28 },
  chip: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '500' },

  footer: { alignItems: 'center', gap: 5, paddingBottom: 16 },
  counter: { color: 'rgba(255,255,255,0.38)', fontSize: 13 },
  privacy: { color: 'rgba(255,255,255,0.18)', fontSize: 12 },
});
