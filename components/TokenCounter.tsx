import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Rough approximation: 1 token ≈ 4 chars for English text
export function countTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Common model context limits (input tokens)
const MODELS = [
  { name: 'GPT-3.5', limit: 16_000 },
  { name: 'GPT-4o', limit: 128_000 },
  { name: 'Claude', limit: 200_000 },
  { name: 'Gemini', limit: 1_000_000 },
];

function fitsIn(tokens: number) {
  return MODELS.filter(m => tokens <= m.limit).map(m => m.name);
}

function formatTokens(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

interface Props {
  tokens: number;
  onTrim?: () => void;
}

export function TokenCounter({ tokens, onTrim }: Props) {
  const fits = fitsIn(tokens);
  const fitsAll = fits.length === MODELS.length;
  const fitsNone = fits.length === 0;

  const color = fitsAll ? '#48bb78' : fitsNone ? '#fc8181' : '#f6ad55';

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={[styles.count, { color }]}>~{formatTokens(tokens)} tokens</Text>
        <Text style={styles.fits}>
          {fitsNone
            ? 'Too large for most models'
            : `Fits: ${fits.join(', ')}`}
        </Text>
      </View>
      {!fitsAll && onTrim && (
        <TouchableOpacity style={styles.trimBtn} onPress={onTrim}>
          <Text style={styles.trimText}>Trim</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#16213e',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  left: {
    flex: 1,
  },
  count: {
    fontSize: 15,
    fontWeight: '700',
  },
  fits: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  trimBtn: {
    backgroundColor: '#2d3748',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 12,
  },
  trimText: {
    color: '#a0aec0',
    fontSize: 13,
    fontWeight: '600',
  },
});
