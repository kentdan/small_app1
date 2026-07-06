import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { convertToMarkdown, SUPPORTED_MIME_TYPES } from '@/converters';
import { useDailyLimit } from '@/hooks/useDailyLimit';
import { useLibrary } from '@/hooks/useLibrary';
import { saveConversion, LibraryEntry } from '@/lib/library';
import { notify, confirmDelete } from '@/lib/notify';

function formatSize(chars: number): string {
  if (chars < 1024) return `${chars} B`;
  if (chars < 1024 * 1024) return `${(chars / 1024).toFixed(0)} KB`;
  return `${(chars / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function HomeScreen() {
  const router = useRouter();
  const { errorMsg } = useLocalSearchParams<{ errorMsg?: string }>();
  const limit = useDailyLimit();
  const library = useLibrary();
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (errorMsg) notify('Error', decodeURIComponent(errorMsg));
  }, [errorMsg]);

  const handlePick = async () => {
    if (!limit.loaded || converting) return;
    if (!limit.canConvert) {
      notify(
        'Daily limit reached',
        `You've used all ${limit.dailyLimit} free conversions today. Try again tomorrow.`,
      );
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: SUPPORTED_MIME_TYPES,
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    setConverting(true);
    try {
      const markdown = await convertToMarkdown(asset.uri, asset.mimeType ?? '');
      await limit.recordConversion();
      const id = await saveConversion(asset.name, markdown);
      router.push({ pathname: '/preview', params: { id, fileName: asset.name } });
    } catch (e: unknown) {
      notify('Conversion failed', e instanceof Error ? e.message : 'Please try another file.');
    } finally {
      setConverting(false);
    }
  };

  const handleDelete = (entry: LibraryEntry) => {
    confirmDelete(
      'Delete conversion?',
      `"${entry.fileName}" will be removed from this device.`,
      () => library.remove(entry.id),
    );
  };

  const mdName = (fileName: string) => fileName.replace(/\.[^.]+$/, '') + '.md';

  const renderRow = ({ item }: { item: LibraryEntry }) => (
    <TouchableOpacity
      style={s.row}
      activeOpacity={0.65}
      onPress={() => router.push({ pathname: '/preview', params: { id: item.id, fileName: item.fileName } })}
      onLongPress={() => handleDelete(item)}
    >
      <View style={s.rowIcon}>
        <Text style={s.rowIconText}>M↓</Text>
      </View>
      <View style={s.rowBody}>
        <Text style={s.rowTitle} numberOfLines={1}>{mdName(item.fileName)}</Text>
        {!!item.snippet && <Text style={s.rowSnippet} numberOfLines={1}>{item.snippet}</Text>}
      </View>
      <View style={s.rowMeta}>
        <Text style={s.rowMetaText}>{formatDate(item.createdAt)}</Text>
        <Text style={s.rowMetaText}>{formatSize(item.size)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>MDConverter</Text>
          {limit.loaded && !limit.isPremium && (
            <Text style={s.counter}>{limit.usedToday} of {limit.dailyLimit} free today</Text>
          )}
        </View>

        {/* Primary action */}
        <TouchableOpacity
          style={[s.btn, converting && s.btnDim]}
          onPress={handlePick}
          activeOpacity={0.75}
          disabled={converting}
        >
          {converting ? (
            <View style={s.btnRow}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={s.btnLabel}>Converting…</Text>
            </View>
          ) : (
            <Text style={s.btnLabel}>Convert to Markdown</Text>
          )}
        </TouchableOpacity>

        {/* Library */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Converted files</Text>
          {library.entries.length > 0 && (
            <Text style={s.sectionHint}>Tap to open · hold to delete</Text>
          )}
        </View>

        <FlatList
          data={library.entries}
          keyExtractor={e => e.id}
          renderItem={renderRow}
          contentContainerStyle={library.entries.length === 0 ? s.emptyWrap : s.listContent}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          ListEmptyComponent={
            library.loaded ? (
              <View style={s.empty}>
                <Text style={s.emptyIcon}>M↓</Text>
                <Text style={s.emptyTitle}>No conversions yet</Text>
                <Text style={s.emptyText}>
                  Files you convert are saved here.{'\n'}Everything stays on this device.
                </Text>
              </View>
            ) : null
          }
        />

        <Text style={s.privacy}>On-device · nothing leaves your phone</Text>

      </View>
    </SafeAreaView>
  );
}

const PURPLE = '#5E5CE6';

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, paddingHorizontal: 20 },

  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: 18,
    paddingBottom: 16,
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  counter: { color: 'rgba(255,255,255,0.35)', fontSize: 13 },

  btn: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  btnDim: { backgroundColor: '#2D2B6B', shadowOpacity: 0 },
  btnLabel: { color: '#fff', fontSize: 17, fontWeight: '600', letterSpacing: -0.2 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  sectionHint: { color: 'rgba(255,255,255,0.22)', fontSize: 12 },

  listContent: { paddingBottom: 12 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.07)', marginLeft: 52 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconText: { color: PURPLE, fontSize: 14, fontWeight: '800', letterSpacing: -0.5 },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { color: '#F2F2F7', fontSize: 15, fontWeight: '600' },
  rowSnippet: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },
  rowMeta: { alignItems: 'flex-end', gap: 2 },
  rowMetaText: { color: 'rgba(255,255,255,0.25)', fontSize: 12 },

  emptyWrap: { flexGrow: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', gap: 8, paddingBottom: 40 },
  emptyIcon: { color: 'rgba(255,255,255,0.12)', fontSize: 40, fontWeight: '800', marginBottom: 4 },
  emptyTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: '600' },
  emptyText: { color: 'rgba(255,255,255,0.25)', fontSize: 13, textAlign: 'center', lineHeight: 19 },

  privacy: { textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: 12, paddingVertical: 12 },
});
