'use client';
import React, { useState, useEffect } from 'react';
import { GlassButton } from '@/components/GlassButton';
import { CreditCard, AlertCircle, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useKKiaPay } from '@/hooks/useKKiaPay';
import { useAuth } from '@/contexts/AuthContext';

interface DepositFormProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  details: any;
  loading?: boolean;
  onSubmit: (depositData: any) => Promise<any>;
  onPaymentSuccess?: (paymentData: any, depositData: any) => void;
  onPaymentError?: (error: any) => void;
}

const DepositForm: React.FC<DepositFormProps> = ({
  id,
  isOpen,
  onClose,
  details,
  loading = false,
  onSubmit,
  onPaymentSuccess,
  onPaymentError
}) => {
  // État pour le formulaire de dépôt
  const [depositData, setDepositData] = useState({
    montant: '',
    numero_telephone: '',
    commentaire: ''
  });

  const { user } = useAuth();
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [depositResponse, setDepositResponse] = useState<any>(null);
  const [step, setStep] = useState<'form' | 'payment' | 'processing'>('form');

  // Hook KKiaPay
  const { 
    isSDKLoaded, 
    isLoading: kkiapayLoading, 
    error: kkiapayError, 
    openPayment,
    setupPaymentListeners 
  } = useKKiaPay();

  // Configurer les listeners de paiement KKiaPay
  useEffect(() => {
    if (isSDKLoaded) {
      setupPaymentListeners(
        // Succès du paiement
        async (kkiapayResponse) => {
          console.log('✅ Paiement de dépôt réussi:', kkiapayResponse);
          setStep('processing');
          
          // 🎉 TOAST DE SUCCÈS IMMÉDIAT
          toast.success('💰 Paiement Mobile Money réussi !', {
            description: `Dépôt de ${parseFloat(depositData.montant).toLocaleString()} FCFA confirmé`,
            duration: 5000,
          });
          
          try {
            // Notifier le backend du succès via webhook simulation
            await notifyBackendSuccess(kkiapayResponse, depositResponse, depositData);
            
            // Callback de succès
            if (onPaymentSuccess) {
              onPaymentSuccess(kkiapayResponse, depositData);
            }
            
            // 🎊 TOAST DE CONFIRMATION FINALE
            toast.success('🎊 Dépôt confirmé et crédité !', {
              description: `Votre compte épargne a été crédité de ${parseFloat(depositData.montant).toLocaleString()} FCFA`,
              duration: 6000,
            });
            
            resetForm();
            onClose();
            
          } catch (error) {
            console.error('Erreur notification backend:', error);
          } finally {
            setStep('form');
          }
        },
        // Échec du paiement
        (error) => {
          console.log('❌ Paiement de dépôt échoué:', error);
          setStep('form');
          
          if (onPaymentError) {
            onPaymentError(error);
          }
          
          toast.error(`❌ Échec du dépôt: ${error.message || 'Erreur inconnue'}`, {
            description: 'Veuillez réessayer ou contacter le support',
            duration: 6000,
          });
        }
      );
    }
  }, [isSDKLoaded, depositResponse, depositData, onPaymentSuccess, onPaymentError]);

  // Fonction pour notifier le backend du succès (simule le webhook)
  const notifyBackendSuccess = async (kkiapayResponse: any, depositResp: any, formData: any) => {
    const baseUrl = 'https://tontiflexapp.onrender.com/api';
    
    const webhookData = {
      transactionId: kkiapayResponse.transactionId,
      event: 'payment.success',
      timestamp: new Date().toISOString(),
      amount: parseFloat(formData.montant),
      status: 'SUCCESS',
      data: {
        transaction_id:depositResp.transaction_kkiapay.id,
        reference: depositResp.transaction_kkiapay.reference,
        user_id: user?.id,
        type: 'depot_epargne',
        form_data: formData,
        deposit_ids: depositResp.deposits.map((d: any) => d.id),
      }
    };

    const response = await fetch(`${baseUrl}/payments/webhook/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });

    if (!response.ok) {
      throw new Error(`Erreur webhook: ${response.status}`);
    }

    return await response.json();
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!depositData.montant || parseFloat(depositData.montant) <= 0) {
      newErrors.montant = 'Le montant doit être supérieur à 0';
    }
    
    if (parseFloat(depositData.montant) < 100) {
      newErrors.montant = 'Le montant minimum est de 100 FCFA';
    }
    
    if (!depositData.numero_telephone.trim()) {
      newErrors.numero_telephone = 'Le numéro de téléphone est requis';
    }
    
    if (depositData.numero_telephone && !/^(\+229|229)?[0-9]{8}$/.test(depositData.numero_telephone.replace(/\s/g, ''))) {
      newErrors.numero_telephone = 'Format de numéro invalide (+229xxxxxxxx)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async () => {
    if (!validateForm()) {
      Object.values(errors).forEach(error => {
        if (error) toast.error(error);
      });
      return;
    }

    setStep('payment');

    try {
      // 1. Créer la transaction de dépôt via l'API
      console.log('📡 Création de la transaction de dépôt...');
      const response = await onSubmit({
        montant: parseFloat(depositData.montant).toString(),
        numero_telephone: depositData.numero_telephone,
        commentaires: depositData.commentaire
      });
      setDepositResponse(response);

      console.log('✅ Transaction de dépôt créée:', response);

      // 2. Configurer et ouvrir KKiaPay
      const kkiapayConfig = {
        key: 'd1297c10527a11f0a266e50dce82524c',
        sandbox: true,
        amount: parseFloat(depositData.montant),
        phone: depositData.numero_telephone,
        description: `TontiFlex Épargne - Dépôt ${parseFloat(depositData.montant).toLocaleString()} FCFA`,
        callback: `http://localhost:3000/dashboards/dashboard-client/saving-accounts/${id}`,
        position: 'center' as const,
        theme: '#2196f3'
      };

      console.log('💳 Ouverture du widget KKiaPay pour dépôt...', kkiapayConfig);
      await openPayment(kkiapayConfig);

    } catch (error) {
      console.error('❌ Erreur lors de la création du dépôt:', error);
      toast.error('Erreur lors de la préparation du dépôt');
      setStep('form');
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setDepositData({
      montant: '',
      numero_telephone: '',
      commentaire: ''
    });
    setErrors({});
    setDepositResponse(null);
    setStep('form');
  };

  // Fermer et réinitialiser
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleMontantChange = (value: string) => {
    // Permettre seulement les nombres et les décimales
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    setDepositData(prev => ({ ...prev, montant: sanitizedValue }));
    
    // Effacer l'erreur si elle existe
    if (errors.montant) {
      setErrors(prev => ({ ...prev, montant: '' }));
    }
  };

  const handlePhoneChange = (value: string) => {
    setDepositData(prev => ({ ...prev, numero_telephone: value }));
    
    // Effacer l'erreur si elle existe
    if (errors.numero_telephone) {
      setErrors(prev => ({ ...prev, numero_telephone: '' }));
    }
  };

  if (!isOpen) return null;

  const montantSaisi = parseFloat(depositData.montant) || 0;
  const nouveauSolde = (details?.solde || 0) + montantSaisi;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full relative max-w-xl">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-black hover:text-gray-800 cursor-pointer"
          disabled={step === 'processing'}
        >
          ✕
        </button>

        <div className="space-y-6 h-[70vh] overflow-y-auto">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 'form' && 'Effectuer un dépôt'}
              {step === 'payment' && 'Paiement en cours'}
              {step === 'processing' && 'Traitement...'}
            </h2>
            <p className="text-gray-600">
              {step === 'form' && 'Créditez votre compte épargne via Mobile Money'}
              {step === 'payment' && 'Procédez au paiement dans la fenêtre KKiaPay'}
              {step === 'processing' && 'Confirmation du dépôt en cours...'}
            </p>
          </div>

          {/* Indicateur de chargement du SDK */}
          {!isSDKLoaded && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Loader2 className="animate-spin h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Chargement du système de paiement...
                  </p>
                  <p className="text-xs text-blue-600">
                    Initialisation de KKiaPay en cours
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Erreur KKiaPay */}
          {kkiapayError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Erreur système de paiement
                  </p>
                  <p className="text-xs text-red-600">{kkiapayError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire */}
          {step === 'form' && (
            <div className="space-y-4">
              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant à déposer <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={depositData.montant}
                    onChange={(e) => handleMontantChange(e.target.value)}
                    placeholder="0"
                    className={`w-full px-4 py-3 border rounded-lg text-lg font-medium pr-16 ${
                      errors.montant ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    FCFA
                  </span>
                </div>
                {errors.montant && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle size={16} />
                    {errors.montant}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Montant minimum: 100 FCFA
                </p>
              </div>

              {/* Numéro de téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone Mobile Money <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={depositData.numero_telephone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="xxxxxxxx"
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.numero_telephone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.numero_telephone && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle size={16} />
                    {errors.numero_telephone}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Pour test: utilisez 97000000
                </p>
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif du dépôt (optionnel)
                </label>
                <textarea
                  value={depositData.commentaire}
                  onChange={(e) => setDepositData(prev => ({ ...prev, commentaire: e.target.value }))}
                  placeholder="Précisez le motif de votre dépôt..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>

              {/* Récapitulatif */}
              {montantSaisi > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h6 className="font-medium text-green-800 mb-3">💰 Récapitulatif du dépôt :</h6>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Solde actuel :</span>
                      <span className="font-medium">{(details?.solde || 0).toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Montant à déposer :</span>
                      <span className="font-medium text-green-600">+{montantSaisi.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Téléphone de débit :</span>
                      <span className="font-medium">{depositData.numero_telephone || 'Non renseigné'}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 border-green-300">
                      <span className="text-green-700 font-medium">Nouveau solde :</span>
                      <span className="font-bold text-green-600">
                        {nouveauSolde.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* État de paiement */}
          {step === 'payment' && (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <p className="text-gray-600 mb-2">
                Widget de paiement KKiaPay ouvert
              </p>
              <p className="text-sm text-gray-500">
                Confirmez le débit de {montantSaisi.toLocaleString()} FCFA depuis votre Mobile Money
              </p>
            </div>
          )}

          {/* État de traitement */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="animate-spin mx-auto h-12 w-12 text-green-600 mb-4" />
              <p className="text-gray-600 mb-2">
                Confirmation du dépôt en cours...
              </p>
              <p className="text-sm text-gray-500">
                Votre compte épargne va être crédité dans quelques instants
              </p>
            </div>
          )}

          {/* Boutons d'action */}
          {step === 'form' && (
            <div className="flex gap-3 pt-4">
              <GlassButton
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Annuler
              </GlassButton>
              <GlassButton
                onClick={handleSubmit}
                disabled={
                  loading || 
                  kkiapayLoading || 
                  !isSDKLoaded || 
                  !depositData.montant || 
                  !depositData.numero_telephone ||
                  montantSaisi < 100
                }
                className="flex-1"
              >
                {loading || kkiapayLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Déposer {montantSaisi.toLocaleString()} FCFA
                  </>
                )}
              </GlassButton>
            </div>
          )}

          {step === 'payment' && (
            <div className="flex gap-3">
              <GlassButton
                variant="outline"
                onClick={() => setStep('form')}
                className="flex-1"
              >
                Annuler le paiement
              </GlassButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositForm;

