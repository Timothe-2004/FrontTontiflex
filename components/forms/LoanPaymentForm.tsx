'use client';
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useKKiaPay } from '@/hooks/useKKiaPay';
import { Loader2, CreditCard, AlertCircle, DollarSign, Calendar, X } from 'lucide-react';
import { toast } from 'sonner';

interface LoanPaymentFormProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  selectedInstallment: any;
  loanDetails: any;
  loading: boolean;
  onSubmit: (repaymentData: any) => Promise<any>;
  onPaymentSuccess?: (paymentData: any, repaymentData: any) => void;
  onPaymentError?: (error: any) => void;
}

interface PaymentFormData {
  numero_telephone: string;
  description: string;
}

const LoanPaymentForm: React.FC<LoanPaymentFormProps> = ({
  id,
  isOpen,
  onClose,
  selectedInstallment,
  loanDetails,
  loading,
  onSubmit,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    numero_telephone: '',
    description: ''
  });

  const [repaymentResponse, setRepaymentResponse] = useState<any>(null);
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
          console.log('✅ Paiement d\'échéance réussi:', kkiapayResponse);
          setStep('processing');
          
          try {
            // Notifier le backend du succès via webhook simulation
            await notifyBackendSuccess(kkiapayResponse, repaymentResponse, paymentForm);
            
            // Callback de succès
            if (onPaymentSuccess) {
              onPaymentSuccess(kkiapayResponse, paymentForm);
            }
            
            // 🎉 TOAST DE SUCCÈS PERSONNALISÉ
            toast.success('🎉 Remboursement réussi !', {
              duration: 6000
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
          console.log('❌ Paiement d\'échéance échoué:', error);
          setStep('form');
          
          if (onPaymentError) {
            onPaymentError(error);
          }
          
          toast.error(`❌ Paiement échoué: ${error.message || 'Erreur inconnue'}`);
        }
      );
    }
  }, [isSDKLoaded, repaymentResponse, paymentForm, onPaymentSuccess, onPaymentError, selectedInstallment]);

  // Fonction pour notifier le backend du succès (simule le webhook)
  const notifyBackendSuccess = async (kkiapayResponse: any, repaymentResp: any, formData: any) => {
    const baseUrl = 'https://tontiflexapp.onrender.com/api';
    
    const webhookData = {
      transactionId: kkiapayResponse.transactionId,
      isPaymentSucces: true,
      event: 'payment.success',
      timestamp: new Date().toISOString(),
      amount: repaymentResp.transaction_kkiapay.montant,
      status: 'SUCCESS',
      data: {
        transaction_id: repaymentResp.transaction_kkiapay.id,
        reference: repaymentResp.transaction_kkiapay.reference,
        type: 'loan_repayment',
        form_data: formData,
        echeance_id: repaymentResp.echeance_details?.id
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

  // Fonction pour formater la devise
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(numAmount);
  };

  // Gérer les changements du formulaire
  const handleFormChange = (field: string, value: string) => {
    setPaymentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation basique
    if (!paymentForm.numero_telephone || !paymentForm.description) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setStep('payment');

    try {
      // 1. Créer le remboursement via l'API
      console.log('📡 Création du remboursement...');
      const response = await onSubmit(paymentForm);
      setRepaymentResponse(response);

      console.log('✅ Remboursement créé:', response);

      // 2. Calculer le montant de l'échéance
      const montantTotal = parseFloat(selectedInstallment?.montant_total_du || '0');

      // 3. Configurer et ouvrir KKiaPay
      const kkiapayConfig = {
        amount: montantTotal,
        phone: paymentForm.numero_telephone,
        description: `TontiFlex - Remboursement échéance ${selectedInstallment?.date_echeance} - ${formatCurrency(montantTotal)}`,
        key:'d1297c10527a11f0a266e50dce82524c',
        sandbox: true,
        callback: `http://localhost:3000/dashboards/dashboard-client/loans/${id}`,
        position: 'center' as const,
        theme: '#2196f3'
      };

      console.log('💳 Ouverture du widget KKiaPay pour remboursement...', kkiapayConfig);
      await openPayment(kkiapayConfig);

    } catch (error) {
      console.error('❌ Erreur lors de la création du remboursement:', error);
      toast.error('Erreur lors de la création du remboursement');
      setStep('form');
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setPaymentForm({
      numero_telephone: '',
      description: ''
    });
    setRepaymentResponse(null);
    setStep('form');
  };

  // Fermer et réinitialiser
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Initialiser les données par défaut
  useEffect(() => {
    if (selectedInstallment && isOpen) {
      setPaymentForm({
        numero_telephone: '',
        description: `Remboursement échéance du ${selectedInstallment?.date_echeance || 'N/A'}`
      });
    }
  }, [selectedInstallment, isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign size={20} />
            {step === 'form' && 'Paiement de l\'échéance'}
            {step === 'payment' && 'Paiement en cours'}
            {step === 'processing' && 'Traitement...'}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' && `Échéance du ${selectedInstallment && new Date(selectedInstallment.date_echeance).toLocaleDateString('fr-FR')}`}
            {step === 'payment' && 'Procédez au paiement dans la fenêtre KKiaPay'}
            {step === 'processing' && 'Confirmation du paiement en cours...'}
          </DialogDescription>
        </DialogHeader>

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="numero_telephone mb-2">Numéro de téléphone *</Label>
              <Input
                id="numero_telephone"
                type="text"
                value={paymentForm.numero_telephone}
                onChange={(e) => handleFormChange('numero_telephone', e.target.value)}
                placeholder="97000000"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Pour test: utilisez 97000000
              </p>
            </div>

            <div>
              <Label htmlFor="description mb-2">Description</Label>
              <Textarea
                id="description"
                value={paymentForm.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Commentaires additionnels..."
                rows={3}
              />
            </div>

            {/* Récapitulatif du paiement */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Récapitulatif du paiement
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Date d'échéance :</span>
                  <span className="font-medium">
                    {selectedInstallment && new Date(selectedInstallment.date_echeance).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Capital :</span>
                  <span>{selectedInstallment && formatCurrency(selectedInstallment.montant_capital)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Intérêts :</span>
                  <span>{selectedInstallment && formatCurrency(selectedInstallment.montant_interet)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Total échéance :</span>
                  <span>{selectedInstallment && formatCurrency(selectedInstallment.montant_total_du)}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose} 
                disabled={loading || kkiapayLoading}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={
                  loading || 
                  kkiapayLoading || 
                  !isSDKLoaded || 
                  !paymentForm.numero_telephone
                }
              >
                {loading || kkiapayLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payer
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* État de paiement */}
        {step === 'payment' && (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <p className="text-gray-600 mb-2">
              Widget de paiement KKiaPay ouvert
            </p>
            <p className="text-sm text-gray-500">
              Complétez le paiement dans la fenêtre qui s'est ouverte
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => setStep('form')}
                className="mr-2"
              >
                Annuler le paiement
              </Button>
            </div>
          </div>
        )}

        {/* État de traitement */}
        {step === 'processing' && (
          <div className="text-center py-8">
            <Loader2 className="animate-spin mx-auto h-12 w-12 text-green-600 mb-4" />
            <p className="text-gray-600 mb-2">
              Confirmation du paiement en cours...
            </p>
            <p className="text-sm text-gray-500">
              Veuillez patienter pendant que nous traitons votre remboursement
            </p>
          </div>
        )}

        {/* Message d'information KKiaPay */}
        {step === 'form' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 text-blue-600 mr-2" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">
                  Paiement sécurisé avec KKiaPay
                </p>
                <p className="text-blue-600">
                  Payez votre échéance via Mobile Money (MTN, Moov, etc.)
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoanPaymentForm;