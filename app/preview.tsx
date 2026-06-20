import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Share, Alert, Platform,
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
    navigation.setOptions({
      title: fileName ?? 'Result',
      headerRight: () => (
        <TouchableOpacity onPress={() => setRaw(r => !r)} style={{ paddingRight: 4 }}>
          <Text style={{ color: raw ? '#5E5CE6' : 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '500' }}>
            Raw
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [fileName, raw]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(markdown ?? '');
    Alert.alert('Copied', 'Paste into Claude, ChatGPT, or any AI tool.');
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
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text
          style={raw ? s.rawText : s.mdText}
          selectable
        >
          {markdown ?? ''}
        </Text>
      </ScrollView>

      <View style={s.bar}>
        <TouchableOpacity style={[s.barBtn, s.primary]} onPress={handleCopy} activeOpacity={0.75}>
          <Text style={s.primaryText}>Copy for AI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.barBtn} onPress={handleShare} activeOpacity={0.75}>
          <Text style={s.secondaryText}>Share .md</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },

  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  mdText: { color: '#F2F2F7', fontSize: 16, lineHeight: 28 },
  rawText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  bar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 24,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  barBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
  },
  primary: { flex: 1.4, backgroundColor: '#5E5CE6' },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryText: { color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: '500' },
});
