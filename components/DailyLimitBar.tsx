import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  used: number;
  limit: number;
  isPremium: boolean;
  onUpgrade: () => void;
}

export function DailyLimitBar({ used, limit, isPremium, onUpgrade }: Props) {
  if (isPremium) {
    return (
      <View style={styles.premiumBadge}>
        <Text style={styles.premiumText}>PRO — Unlimited conversions</Text>
      </View>
    );
  }

  const fraction = Math.min(used / limit, 1);
  const exhausted = used >= limit;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>
          {used}/{limit} free conversions today
        </Text>
        <TouchableOpacity onPress={onUpgrade}>
          <Text style={styles.upgradeLink}>Go Pro</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fraction * 100}%` }, exhausted && styles.fillExhausted]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#16213e',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: '#a0aec0',
    fontSize: 13,
  },
  upgradeLink: {
    color: '#7c3aed',
    fontSize: 13,
    fontWeight: '600',
  },
  track: {
    height: 4,
    backgroundColor: '#2d3748',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 2,
  },
  fillExhausted: {
    backgroundColor: '#ef4444',
  },
  premiumBadge: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7c3aed',
    alignItems: 'center',
  },
  premiumText: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '600',
  },
});
