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
import { useHistory } from '@/hooks/useHistory';
import { countTokens } from '@/components/TokenCounter';
import { DailyLimitBar } from '@/components/DailyLimitBar';
import { PaywallModal } from '@/components/PaywallModal';

const SUPPORTED_FORMATS = Platform.OS === 'android'
  ? ['PDF', 'DOCX', 'PPTX', 'XLSX', 'Images', 'HTML', 'CSV', 'JSON', 'XML', 'EPUB']
  : ['XLSX', 'HTML', 'CSV', 'JSON', 'XML'];

export default function HomeScreen() {
  const router = useRouter();
  const limit = useDailyLimit();
  const { state, pickAndConvert, reset } = useConverter();
  const { save: saveHistory } = useHistory();
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
      const { fileName, fileType, markdown } = state.result;
      // Save to history in background
      saveHistory({
        fileName,
        fileType,
        markdown,
        tokenCount: countTokens(markdown),
        convertedAt: Date.now(),
      });
      router.push({
        pathname: '/preview',
        params: { fileName, markdown },
      });
      reset();
    }
  }, [state.status]);

  const isConverting = state.status === 'converting' || state.status === 'picking';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

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
                  {state.status === 'picking' ? 'Picking file…' : `Converting…`}
                </Text>
                {state.status === 'converting' && (
                  <Text style={styles.convertButtonFileName} numberOfLines={1}>
                    {state.fileName}
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={styles.convertIcon}>📄  →  #️⃣</Text>
                <Text style={styles.convertButtonText}>Convert to Markdown</Text>
                <Text style={styles.convertButtonSub}>Tap to pick any file</Text>
              </>
            )}
          </TouchableOpacity>

          {state.status === 'error' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{state.message}</Text>
              <TouchableOpacity onPress={reset}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Supported formats */}
        <View style={styles.formatsSection}>
          <Text style={styles.formatsTitle}>
            {Platform.OS === 'android' ? 'Supported formats (via MarkItDown)' : 'Supported on iOS'}
          </Text>
          <View style={styles.formatsBadges}>
            {SUPPORTED_FORMATS.map(fmt => (
              <View key={fmt} style={styles.badge}>
                <Text style={styles.badgeText}>{fmt}</Text>
              </View>
            ))}
          </View>
          {Platform.OS === 'ios' && (
            <Text style={styles.iosNote}>Full format support (PDF, DOCX, PPTX…) available on Android via MarkItDown.</Text>
          )}
        </View>

        {/* On-device badge */}
        <View style={styles.privacyBadge}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyText}>
            All processing happens on your device — no uploads, no internet needed.
            {'\n'}Perfect for sensitive documents.
          </Text>
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
    paddingTop: 12,
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
    borderRadius: 24,
    paddingVertical: 36,
    alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  convertButtonDisabled: {
    opacity: 0.7,
  },
  convertIcon: {
    fontSize: 32,
    marginBottom: 14,
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
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    marginTop: 6,
  },
  convertButtonFileName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 6,
    maxWidth: 260,
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
    paddingBottom: 14,
  },
  formatsTitle: {
    color: '#4a5568',
    fontSize: 11,
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
    color: '#718096',
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
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  privacyIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  privacyText: {
    flex: 1,
    color: '#4a5568',
    fontSize: 12,
    lineHeight: 19,
  },
});
