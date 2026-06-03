import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDailyLimit } from '@/hooks/useDailyLimit';
import { useConverter } from '@/hooks/useConverter';
import { usePurchase } from '@/hooks/usePurchase';
import { DailyLimitBar } from '@/components/DailyLimitBar';
import { PaywallModal } from '@/components/PaywallModal';

const SUPPORTED_FORMATS = Platform.OS === 'android'
  ? ['PDF', 'DOCX', 'PPTX', 'XLSX', 'Images', 'HTML', 'CSV', 'JSON', 'XML', 'EPUB']
  : ['HTML', 'CSV', 'JSON', 'XML', 'DOCX*'];

export default function HomeScreen() {
  const router = useRouter();
  const limit = useDailyLimit();
  const { state, pickAndConvert, reset } = useConverter();
  const [paywallVisible, setPaywallVisible] = useState(false);

  const { status: purchaseStatus, purchase, restore, localizedPrice, error: purchaseError } = usePurchase(
    async () => {
      await limit.unlockPremium();
      setPaywallVisible(false);
    }
  );

  const handlePick = () => {
    pickAndConvert(
      () => setPaywallVisible(true),
      limit.recordConversion,
      limit.canConvert,
    );
  };

  React.useEffect(() => {
    if (state.status === 'done') {
      router.push({
        pathname: '/preview',
        params: {
          fileName: state.result.fileName,
          markdown: state.result.markdown,
        },
      });
      reset();
    }
  }, [state.status]);

  const isConverting = state.status === 'converting' || state.status === 'picking';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>MDConverter</Text>
          <Text style={styles.appSubtitle}>Convert any file to Markdown</Text>
        </View>

        {/* Daily limit bar */}
        {limit.loaded && (
          <DailyLimitBar
            used={limit.usedToday}
            limit={limit.dailyLimit}
            isPremium={limit.isPremium}
            onUpgrade={() => setPaywallVisible(true)}
          />
        )}

        {/* Main convert button */}
        <View style={styles.hero}>
          <TouchableOpacity
            style={[styles.convertButton, isConverting && styles.convertButtonDisabled]}
            onPress={handlePick}
            disabled={isConverting}
            activeOpacity={0.8}
          >
            {isConverting ? (
              <>
                <ActivityIndicator color="#fff" size="large" style={styles.spinner} />
                <Text style={styles.convertButtonText}>
                  {state.status === 'picking' ? 'Picking file…' : `Converting ${state.status === 'converting' ? state.fileName : ''}…`}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.convertIcon}>📄</Text>
                <Text style={styles.convertButtonText}>Pick a File</Text>
                <Text style={styles.convertButtonSub}>Tap to select a file to convert</Text>
              </>
            )}
          </TouchableOpacity>

          {state.status === 'error' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>Error: {state.message}</Text>
              <TouchableOpacity onPress={reset}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Supported formats */}
        <View style={styles.formatsSection}>
          <Text style={styles.formatsTitle}>Supported formats</Text>
          <View style={styles.formatsBadges}>
            {SUPPORTED_FORMATS.map(fmt => (
              <View key={fmt} style={styles.badge}>
                <Text style={styles.badgeText}>{fmt}</Text>
              </View>
            ))}
          </View>
          {Platform.OS === 'ios' && (
            <Text style={styles.iosNote}>* DOCX support limited on iOS. Android has full MarkItDown support.</Text>
          )}
        </View>

        {/* On-device badge */}
        <View style={styles.privacyBadge}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyText}>All conversion happens on your device — no uploads, no internet required.</Text>
        </View>
      </View>

      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onPurchase={purchase}
        onRestore={restore}
        purchaseStatus={purchaseStatus}
        localizedPrice={localizedPrice}
        error={purchaseError}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  container: {
    flex: 1,
    paddingTop: 24,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f7fafc',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 15,
    color: '#718096',
    marginTop: 4,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  convertButton: {
    width: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 20,
    paddingVertical: 32,
    alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  convertButtonDisabled: {
    opacity: 0.7,
  },
  convertIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  spinner: {
    marginBottom: 12,
  },
  convertButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  convertButtonSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 6,
  },
  errorBox: {
    marginTop: 16,
    backgroundColor: '#2d1515',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  errorText: {
    color: '#fc8181',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  retryText: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '600',
  },
  formatsSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  formatsTitle: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  formatsBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#2d3748',
  },
  badgeText: {
    color: '#a0aec0',
    fontSize: 13,
    fontWeight: '500',
  },
  iosNote: {
    color: '#4a5568',
    fontSize: 11,
    marginTop: 8,
    fontStyle: 'italic',
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  privacyIcon: {
    fontSize: 18,
  },
  privacyText: {
    flex: 1,
    color: '#4a5568',
    fontSize: 12,
    lineHeight: 18,
  },
});
