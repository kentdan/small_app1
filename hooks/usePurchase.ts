import { useState, useEffect, useCallback } from 'react';
import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  getAvailablePurchases,
  type ProductPurchase,
  type PurchaseError,
  type Product,
} from 'react-native-iap';

// Must match exactly what you create in App Store Connect + Google Play Console
const PRO_SKU = 'com.mdconverter.pro';

export type PurchaseStatus = 'idle' | 'loading' | 'purchasing' | 'restoring' | 'success' | 'error';

export function usePurchase(onSuccess: () => Promise<void>) {
  const [status, setStatus] = useState<PurchaseStatus>('idle');
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialise IAP connection and fetch product info on mount
  useEffect(() => {
    let purchaseUpdateSub: ReturnType<typeof purchaseUpdatedListener>;
    let purchaseErrorSub: ReturnType<typeof purchaseErrorListener>;

    (async () => {
      try {
        setStatus('loading');
        await initConnection();

        // Fetch product details so we can show the real price from the store
        const products = await getProducts({ skus: [PRO_SKU] });
        if (products.length > 0) setProduct(products[0]);
        setStatus('idle');
      } catch {
        setStatus('idle'); // Non-fatal — fall back to hardcoded price display
      }
    })();

    // Listen for successful purchases (fires for new purchases AND restored ones)
    purchaseUpdateSub = purchaseUpdatedListener(async (purchase: ProductPurchase) => {
      if (purchase.productId === PRO_SKU) {
        // Acknowledge the transaction with the store
        await finishTransaction({ purchase, isConsumable: false });
        await onSuccess();
        setStatus('success');
      }
    });

    purchaseErrorSub = purchaseErrorListener((err: PurchaseError) => {
      // E_USER_CANCELLED is not a real error — user just closed the sheet
      if (err.code !== 'E_USER_CANCELLED') {
        setError(err.message ?? 'Purchase failed');
      }
      setStatus('idle');
    });

    return () => {
      purchaseUpdateSub?.remove();
      purchaseErrorSub?.remove();
      endConnection();
    };
  }, []);

  const purchase = useCallback(async () => {
    try {
      setError(null);
      setStatus('purchasing');
      await requestPurchase({ sku: PRO_SKU });
      // Result arrives via purchaseUpdatedListener above
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Purchase failed';
      if (!msg.includes('cancelled')) setError(msg);
      setStatus('idle');
    }
  }, []);

  const restore = useCallback(async () => {
    try {
      setError(null);
      setStatus('restoring');
      const purchases = await getAvailablePurchases();
      const hasPro = purchases.some(p => p.productId === PRO_SKU);
      if (hasPro) {
        await onSuccess();
        setStatus('success');
      } else {
        setError('No previous purchase found for this account.');
        setStatus('idle');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Restore failed');
      setStatus('idle');
    }
  }, []);

  const localizedPrice = product?.localizedPrice ?? '$2.99';

  return { status, purchase, restore, localizedPrice, error };
}
