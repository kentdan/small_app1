import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHistory, type HistoryEntry } from '@/hooks/useHistory';
import { countTokens } from '@/components/TokenCounter';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function fileIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('docx')) return '📝';
  if (mimeType.includes('presentation') || mimeType.includes('pptx')) return '📊';
  if (mimeType.includes('sheet') || mimeType.includes('xlsx')) return '📈';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('html')) return '🌐';
  if (mimeType.includes('csv')) return '📋';
  return '📁';
}

function formatTokens(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

interface ItemProps {
  entry: HistoryEntry;
  onOpen: () => void;
  onDelete: () => void;
}

function HistoryItem({ entry, onOpen, onDelete }: ItemProps) {
  const tokens = entry.tokenCount || countTokens(entry.markdown);
  return (
    <TouchableOpacity style={styles.item} onPress={onOpen} activeOpacity={0.75}>
      <Text style={styles.itemIcon}>{fileIcon(entry.fileType)}</Text>
      <View style={styles.itemBody}>
        <Text style={styles.itemName} numberOfLines={1}>{entry.fileName}</Text>
        <Text style={styles.itemMeta}>
          ~{formatTokens(tokens)} tokens · {formatDate(entry.convertedAt)}
        </Text>
      </View>
      <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const { entries, loaded, remove, clear } = useHistory();

  const handleOpen = (entry: HistoryEntry) => {
    router.push({
      pathname: '/preview',
      params: { fileName: entry.fileName, markdown: entry.markdown },
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove', 'Remove this conversion from history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  const handleClear = () => {
    Alert.alert('Clear history', 'Remove all conversions?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear all', style: 'destructive', onPress: clear },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {loaded && entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🗂️</Text>
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptySubtitle}>Converted files will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={e => e.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            entries.length > 0 ? (
              <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                <Text style={styles.clearText}>Clear all</Text>
              </TouchableOpacity>
            ) : null
          }
          renderItem={({ item }) => (
            <HistoryItem
              entry={item}
              onOpen={() => handleOpen(item)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  list: {
    paddingVertical: 8,
  },
  clearBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 4,
  },
  clearText: {
    color: '#4a5568',
    fontSize: 13,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  itemIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  itemBody: {
    flex: 1,
  },
  itemName: {
    color: '#f7fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  itemMeta: {
    color: '#718096',
    fontSize: 13,
    marginTop: 3,
  },
  deleteIcon: {
    color: '#4a5568',
    fontSize: 15,
    paddingLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#16213e',
    marginHorizontal: 20,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#f7fafc',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#4a5568',
    fontSize: 15,
  },
});
