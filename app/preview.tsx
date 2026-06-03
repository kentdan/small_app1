import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { MarkdownViewer } from '@/components/MarkdownViewer';

export default function PreviewScreen() {
  const { fileName, markdown } = useLocalSearchParams<{ fileName: string; markdown: string }>();
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: fileName ?? 'Converted' });
  }, [fileName]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(markdown ?? '');
    Alert.alert('Copied', 'Markdown copied to clipboard.');
  };

  const handleShare = async () => {
    if (!markdown) return;
    const baseName = (fileName ?? 'converted').replace(/\.[^.]+$/, '');
    const path = FileSystem.cacheDirectory + baseName + '.md';
    await FileSystem.writeAsStringAsync(path, markdown, { encoding: FileSystem.EncodingType.UTF8 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, { mimeType: 'text/markdown', dialogTitle: 'Share Markdown file' });
    } else {
      await Share.share({ message: markdown, title: baseName + '.md' });
    }
  };

  return (
    <View style={styles.container}>
      <MarkdownViewer markdown={markdown ?? ''} />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleCopy} activeOpacity={0.8}>
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={handleShare} activeOpacity={0.8}>
          <Text style={styles.actionIcon}>↗</Text>
          <Text style={[styles.actionText, styles.actionTextPrimary]}>Share .md</Text>
        </TouchableOpacity>
      </View>
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
});
