import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

const FEATURES = [
  'Unlimited daily conversions',
  'All file formats supported',
  'Priority conversion speed',
  'No ads, ever',
];

export function PaywallModal({ visible, onClose, onPurchase }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          <View style={styles.handle} />

          <Text style={styles.emoji}>🚀</Text>
          <Text style={styles.title}>You've hit today's limit</Text>
          <Text style={styles.subtitle}>
            Free users get 5 conversions per day.{'\n'}Upgrade once, convert forever.
          </Text>

          <View style={styles.featureList}>
            {FEATURES.map(f => (
              <View key={f} style={styles.featureRow}>
                <Text style={styles.check}>✓</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.buyButton} onPress={onPurchase} activeOpacity={0.85}>
            <Text style={styles.buyButtonText}>Buy Pro — $2.99</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Maybe tomorrow</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#4a5568',
    borderRadius: 2,
    marginBottom: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f7fafc',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#a0aec0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  featureList: {
    width: '100%',
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  check: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10,
    width: 20,
  },
  featureText: {
    color: '#e2e8f0',
    fontSize: 15,
  },
  buyButton: {
    width: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelText: {
    color: '#718096',
    fontSize: 15,
  },
});
