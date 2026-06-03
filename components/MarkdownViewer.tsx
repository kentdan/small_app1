import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface Props {
  markdown: string;
}

export function MarkdownViewer({ markdown }: Props) {
  const [mode, setMode] = useState<'rendered' | 'raw'>('rendered');

  return (
    <View style={styles.container}>
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'rendered' && styles.toggleActive]}
          onPress={() => setMode('rendered')}
        >
          <Text style={[styles.toggleText, mode === 'rendered' && styles.toggleTextActive]}>Preview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'raw' && styles.toggleActive]}
          onPress={() => setMode('raw')}
        >
          <Text style={[styles.toggleText, mode === 'raw' && styles.toggleTextActive]}>Raw</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {mode === 'rendered' ? (
          <Markdown style={markdownStyles}>{markdown}</Markdown>
        ) : (
          <Text style={styles.raw} selectable>{markdown}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  toggle: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: '#7c3aed',
  },
  toggleText: {
    color: '#718096',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  raw: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#a0aec0',
    lineHeight: 20,
  },
});

const markdownStyles = {
  body: { color: '#e2e8f0', fontSize: 15, lineHeight: 24 },
  heading1: { color: '#f7fafc', fontSize: 24, fontWeight: '700' as const, marginBottom: 8 },
  heading2: { color: '#f7fafc', fontSize: 20, fontWeight: '700' as const, marginBottom: 6 },
  heading3: { color: '#e2e8f0', fontSize: 17, fontWeight: '600' as const, marginBottom: 4 },
  code_block: { backgroundColor: '#16213e', borderRadius: 8, padding: 12, fontFamily: 'monospace' },
  code_inline: { backgroundColor: '#16213e', borderRadius: 4, color: '#a78bfa' },
  blockquote: { borderLeftColor: '#7c3aed', borderLeftWidth: 3, paddingLeft: 12, color: '#a0aec0' },
  table: { borderWidth: 1, borderColor: '#2d3748' },
  th: { backgroundColor: '#16213e', color: '#f7fafc', fontWeight: '700' as const, padding: 8 },
  td: { color: '#e2e8f0', padding: 8 },
  link: { color: '#a78bfa' },
  hr: { backgroundColor: '#2d3748' },
};
