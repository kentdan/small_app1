import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Share, Alert, Platform,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Inline span parser: **bold**, *italic*, _italic_, `code`
function renderInline(text: string, baseKey: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const rx = /(\*\*([^*]+)\*\*|_([^_]+)_|\*([^*]+)\*|`([^`]+)`)/g;
  let last = 0, k = 0, m: RegExpExecArray | null;
  while ((m = rx.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2]) parts.push(<Text key={baseKey + k++} style={il.bold}>{m[2]}</Text>);
    else if (m[3] || m[4]) parts.push(<Text key={baseKey + k++} style={il.italic}>{m[3] ?? m[4]}</Text>);
    else if (m[5]) parts.push(<Text key={baseKey + k++} style={il.code}>{m[5]}</Text>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : [text];
}

function MarkdownView({ text }: { text: string }) {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  for (const line of lines) {
    const key = String(i++);
    const h1 = line.match(/^# (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    const h4 = line.match(/^#### (.+)/);
    const bq = line.match(/^> (.+)/);
    const li = line.match(/^[-*] (.+)/);
    const hr = /^---+$/.test(line.trim());
    const empty = line.trim() === '';

    if (empty) { nodes.push(<View key={key} style={{ height: 10 }} />); continue; }
    if (hr) { nodes.push(<View key={key} style={md.hr} />); continue; }
    if (h1) { nodes.push(<Text key={key} style={md.h1} selectable>{renderInline(h1[1], key)}</Text>); continue; }
    if (h2) { nodes.push(<Text key={key} style={md.h2} selectable>{renderInline(h2[1], key)}</Text>); continue; }
    if (h3) { nodes.push(<Text key={key} style={md.h3} selectable>{renderInline(h3[1], key)}</Text>); continue; }
    if (h4) { nodes.push(<Text key={key} style={md.h4} selectable>{renderInline(h4[1], key)}</Text>); continue; }
    if (bq) {
      nodes.push(
        <View key={key} style={md.bqWrap}>
          <Text style={md.bq} selectable>{renderInline(bq[1], key)}</Text>
        </View>
      ); continue;
    }
    if (li) {
      nodes.push(<Text key={key} style={md.li} selectable>{'•  '}{renderInline(li[1], key)}</Text>);
      continue;
    }
    nodes.push(<Text key={key} style={md.para} selectable>{renderInline(line, key)}</Text>);
  }
  return <>{nodes}</>;
}

export default function PreviewScreen() {
  const { fileName, markdown } = useLocalSearchParams<{ fileName: string; markdown: string }>();
  const navigation = useNavigation();
  const [raw, setRaw] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: fileName ?? 'Result',
      headerRight: () => (
        <TouchableOpacity onPress={() => setRaw(r => !r)} style={{ paddingRight: 4 }}>
          <Text style={{ color: raw ? '#5E5CE6' : 'rgba(255,255,255,0.35)', fontSize: 14, fontWeight: '500' }}>
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
      a.href = url; a.download = base + '.md'; a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const path = FileSystem.cacheDirectory + base + '.md';
    await FileSystem.writeAsStringAsync(path, markdown, { encoding: FileSystem.EncodingType.UTF8 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, { mimeType: 'text/markdown' });
    } else {
      await Share.share({ message: markdown });
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {raw ? (
          <Text style={s.rawText} selectable>{markdown ?? ''}</Text>
        ) : (
          <MarkdownView text={markdown ?? ''} />
        )}
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
  content: { padding: 20, paddingBottom: 40 },
  rawText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  bar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 28,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  barBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 14,
    alignItems: 'center', backgroundColor: '#1C1C1E',
  },
  primary: { flex: 1.4, backgroundColor: '#5E5CE6' },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryText: { color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: '500' },
});

// Inline span styles
const il = StyleSheet.create({
  bold: { fontWeight: '700', color: '#fff' },
  italic: { fontStyle: 'italic' },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#A8D8A8',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
});

// Block-level markdown styles
const md = StyleSheet.create({
  h1: { color: '#fff', fontSize: 26, fontWeight: '700', letterSpacing: -0.5, marginBottom: 6, marginTop: 12 },
  h2: { color: '#fff', fontSize: 21, fontWeight: '700', letterSpacing: -0.3, marginBottom: 4, marginTop: 10 },
  h3: { color: '#E8E8F0', fontSize: 18, fontWeight: '600', marginBottom: 4, marginTop: 8 },
  h4: { color: '#C0C0D0', fontSize: 16, fontWeight: '600', marginBottom: 2, marginTop: 6 },
  para: { color: '#D1D1D6', fontSize: 16, lineHeight: 27, marginBottom: 4 },
  li: { color: '#D1D1D6', fontSize: 16, lineHeight: 27, marginLeft: 4, marginBottom: 2 },
  bqWrap: {
    borderLeftWidth: 3,
    borderLeftColor: '#5E5CE6',
    paddingLeft: 12,
    marginVertical: 6,
  },
  bq: { color: 'rgba(255,255,255,0.45)', fontSize: 16, lineHeight: 25, fontStyle: 'italic' },
  hr: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: 16,
  },
});
