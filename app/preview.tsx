import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Alert, Platform,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function PreviewScreen() {
  const { fileName, markdown } = useLocalSearchParams<{ fileName: string; markdown: string }>();
  const navigation = useNavigation();
  const [raw, setRaw] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: fileName ?? 'Result' });
  }, [fileName]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(markdown ?? '');
    Alert.alert('Copied!', 'Paste into Claude, ChatGPT, or any AI tool.');
  };

  const handleShare = async () => {
    if (!markdown) return;
    const base = (fileName ?? 'converted').replace(/\.[^.]+$/, '');

    if (Platform.OS === 'web') {
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = base + '.md';
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const path = FileSystem.cacheDirectory + base + '.md';
    await FileSystem.writeAsStringAsync(path, markdown, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, { mimeType: 'text/markdown' });
    } else {
      await Share.share({ message: markdown });
    }
  };

  return (
    <View style={s.container}>
      {/* Toggle */}
      <View style={s.toggle}>
        <TouchableOpacity style={[s.tab, !raw && s.tabActive]} onPress={() => setRaw(false)}>
          <Text style={[s.tabText, !raw && s.tabTextActive]}>Preview</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, raw && s.tabActive]} onPress={() => setRaw(true)}>
          <Text style={[s.tabText, raw && s.tabTextActive]}>Raw</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <Text style={raw ? s.rawText : s.mdText} selectable>{markdown ?? ''}</Text>
      </ScrollView>

      {/* Actions */}
      <View style={s.actions}>
        <TouchableOpacity style={[s.actionBtn, s.actionPrimary]} onPress={handleCopy} activeOpacity={0.8}>
          <Text style={s.actionPrimaryText}>📋  Copy for AI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} onPress={handleShare} activeOpacity={0.8}>
          <Text style={s.actionText}>Share .md</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  toggle: {
    flexDirection: 'row',
    margin: 12,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 3,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#7c3aed' },
  tabText: { color: '#555', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  mdText: { color: '#e2e8f0', fontSize: 15, lineHeight: 26 },
  rawText: { color: '#a0aec0', fontSize: 13, lineHeight: 20, fontFamily: 'monospace' },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e1e1e',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
  },
  actionPrimary: { backgroundColor: '#7c3aed', flex: 1.4 },
  actionText: { color: '#888', fontSize: 15, fontWeight: '600' },
  actionPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
