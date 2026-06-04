import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { TokenCounter, countTokens } from '@/components/TokenCounter';

// Trim: collapse 3+ blank lines → 1, remove long dividers
function trimForAI(md: string): string {
  return md
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^[-=]{4,}$/gm, '')
    .replace(/[ \t]+$/gm, '')
    .trim();
}

export default function PreviewScreen() {
  const { fileName, markdown: rawMarkdown } = useLocalSearchParams<{ fileName: string; markdown: string }>();
  const navigation = useNavigation();
  const [markdown, setMarkdown] = useState(rawMarkdown ?? '');
  const [trimmed, setTrimmed] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: fileName ?? 'Converted' });
  }, [fileName]);

  const tokenCount = useMemo(() => countTokens(markdown), [markdown]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(markdown);
    Alert.alert('Copied', 'Markdown copied — paste into Claude, ChatGPT, or any AI tool.');
  };

  // Copy just enough to fit GPT-4o (128k tokens ≈ 512k chars)
  const handleCopyFirst = async (maxTokens: number) => {
    const maxChars = maxTokens * 4;
    const chunk = markdown.slice(0, maxChars);
    await Clipboard.setStringAsync(chunk);
    const pct = Math.round((chunk.length / markdown.length) * 100);
    Alert.alert('Copied', `Copied first ~${(maxTokens / 1000).toFixed(0)}k tokens (${pct}% of document).`);
  };

  const handleShare = async () => {
    if (!markdown) return;
    const baseName = (fileName ?? 'converted').replace(/\.[^.]+$/, '');
    const path = FileSystem.cacheDirectory + baseName + '.md';
    await FileSystem.writeAsStringAsync(path, markdown, { encoding: FileSystem.EncodingType.UTF8 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, { mimeType: 'text/markdown', dialogTitle: 'Share Markdown' });
    } else {
      await Share.share({ message: markdown, title: baseName + '.md' });
    }
  };

  const handleTrim = () => {
    const result = trimForAI(markdown);
    const saved = markdown.length - result.length;
    const savedTokens = Math.ceil(saved / 4);
    setMarkdown(result);
    setTrimmed(true);
    Alert.alert('Trimmed', `Removed ~${savedTokens} tokens of extra whitespace.`);
  };

  const showChunkOptions = tokenCount > 128_000;

  return (
    <View style={styles.container}>
      <TokenCounter
        tokens={tokenCount}
        onTrim={!trimmed && tokenCount > 8_000 ? handleTrim : undefined}
      />

      <MarkdownViewer markdown={markdown} />

      {/* Primary: Copy for AI */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={handleCopy} activeOpacity={0.8}>
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={[styles.actionText, styles.actionTextPrimary]}>Copy for AI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.8}>
          <Text style={styles.actionIcon}>↗</Text>
          <Text style={styles.actionText}>Share .md</Text>
        </TouchableOpacity>
      </View>

      {/* Chunk options for very large documents */}
      {showChunkOptions && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chunkRow} contentContainerStyle={styles.chunkContent}>
          <Text style={styles.chunkLabel}>Too large? Copy first:</Text>
          {[16, 32, 128].map(k => (
            <TouchableOpacity key={k} style={styles.chunkBtn} onPress={() => handleCopyFirst(k * 1000)}>
              <Text style={styles.chunkBtnText}>{k}k tokens</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#16213e',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#16213e',
    gap: 8,
  },
  actionBtnPrimary: {
    backgroundColor: '#7c3aed',
    flex: 1.5,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionText: {
    color: '#a0aec0',
    fontSize: 15,
    fontWeight: '600',
  },
  actionTextPrimary: {
    color: '#fff',
  },
  chunkRow: {
    borderTopWidth: 1,
    borderTopColor: '#16213e',
    maxHeight: 52,
  },
  chunkContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  chunkLabel: {
    color: '#4a5568',
    fontSize: 13,
    marginRight: 4,
  },
  chunkBtn: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2d3748',
  },
  chunkBtnText: {
    color: '#a0aec0',
    fontSize: 13,
    fontWeight: '500',
  },
});
