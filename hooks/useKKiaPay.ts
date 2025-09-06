import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Types pour KKiaPay
interface KKiaPayConfig {
  amount: number;
  key: string;
  sandbox: boolean;
  phone?: string;
  callback?: string;
  description?: string;
  position?: 'center' | 'left' | 'right';
  theme?: string;
}

export interface KKiaPayResponse {
  transactionId: string;
  phone?: string;
  amount?: number;
  status?: string;
}

interface KKiaPayError {
  transactionId?: string;
  code?: string;
  message?: string;
}

// Déclaration des fonctions globales KKiaPay
declare global {
  interface Window {
    openKkiapayWidget: (config: KKiaPayConfig) => void;
    addSuccessListener: (callback: (response: KKiaPayResponse) => void) => void;
    addFailedListener: (callback: (error: KKiaPayError) => void) => void;
  }
}

interface UseKKiaPayReturn {
  isSDKLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  openPayment: (config: KKiaPayConfig) => Promise<void>;
  initializeSDK: () => Promise<void>;
  setupPaymentListeners: (
    onSuccess: (response: KKiaPayResponse) => void,
    onError: (error: KKiaPayError) => void
  ) => void;
}

export function useKKiaPay(): UseKKiaPayReturn {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration par défaut
  const DEFAULT_CONFIG = {
    key: 'd1297c10527a11f0a266e50dce82524c', // Clé publique sandbox
    sandbox: true,
    position: 'center' as const,
    theme: '#2196f3',
    callback: 'https://tontiflexapp.onrender.com/api/payments/webhook/'
  };

  // Initialiser le SDK KKiaPay
  const initializeSDK = useCallback(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Vérifier si le script est déjà chargé
      if (typeof window.openKkiapayWidget === 'function') {
        setIsSDKLoaded(true);
        resolve();
        return;
      }

      // Créer et charger le script KKiaPay
      const script = document.createElement('script');
      script.src = 'https://cdn.kkiapay.me/k.js';
      script.async = true;

      script.onload = () => {
        // Attendre un peu que le SDK soit complètement initialisé
        setTimeout(() => {
          if (typeof window.openKkiapayWidget === 'function') {
            setIsSDKLoaded(true);
            setError(null);
            console.log('✅ SDK KKiaPay chargé avec succès');
            resolve();
          } else {
            const errorMsg = 'SDK KKiaPay chargé mais fonctions non disponibles';
            setError(errorMsg);
            reject(new Error(errorMsg));
          }
        }, 500);
      };

      script.onerror = () => {
        const errorMsg = 'Erreur lors du chargement du SDK KKiaPay';
        setError(errorMsg);
        reject(new Error(errorMsg));
      };

      // Ajouter le script au document
      document.head.appendChild(script);
    });
  }, []);

  // Ouvrir le widget de paiement
  const openPayment = useCallback(async (config: KKiaPayConfig): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // S'assurer que le SDK est chargé
      if (!isSDKLoaded) {
        await initializeSDK();
      }

      // Vérifier que les fonctions KKiaPay sont disponibles
      if (!window.openKkiapayWidget) {
        throw new Error('SDK KKiaPay non disponible');
      }

      // Fusionner avec la configuration par défaut
      const finalConfig: KKiaPayConfig = {
        ...DEFAULT_CONFIG,
        ...config
      };

      console.log('🎯 Configuration KKiaPay:', finalConfig);

      // Ouvrir le widget
      window.openKkiapayWidget(finalConfig);
      
      toast.info('💳 Widget KKiaPay ouvert. Procédez au paiement...');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      toast.error(`Erreur KKiaPay: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isSDKLoaded, initializeSDK]);

  // Configurer les listeners de paiement
  const setupPaymentListeners = useCallback((
    onSuccess: (response: KKiaPayResponse) => void,
    onError: (error: KKiaPayError) => void
  ) => {
    if (!window.addSuccessListener || !window.addFailedListener) {
      console.warn('⚠️ Listeners KKiaPay non disponibles');
      return;
    }

    // Listener de succès
    window.addSuccessListener((response: KKiaPayResponse) => {
      console.log('✅ Paiement KKiaPay réussi:', response);
      toast.success(`🎉 Paiement réussi! Transaction: ${response.transactionId}`);
      onSuccess(response);
    });

    // Listener d'échec
    window.addFailedListener((error: KKiaPayError) => {
      console.log('❌ Paiement KKiaPay échoué:', error);
      toast.error(`❌ Paiement échoué: ${error.message || 'Erreur inconnue'}`);
      onError(error);
    });
  }, []);

  // Initialiser automatiquement le SDK au montage
  useEffect(() => {
    initializeSDK().catch(console.error);
  }, [initializeSDK]);

  return {
    isSDKLoaded,
    isLoading,
    error,
    openPayment,
    initializeSDK,
    setupPaymentListeners
  } as UseKKiaPayReturn & {
    setupPaymentListeners: (
      onSuccess: (response: KKiaPayResponse) => void,
      onError: (error: KKiaPayError) => void
    ) => void;
  };
}