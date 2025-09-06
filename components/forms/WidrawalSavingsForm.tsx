'use client';
import React, { useState } from 'react';
import { GlassButton } from '@/components/GlassButton';
import { CreditCard, AlertCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@heroui/react';

interface WidrawalSavingsFormProps {
  isOpen: boolean;
  onClose: () => void;
  details: any;
  loading?: boolean;
  onSubmit: (retraitData: any) => Promise<void>;
}

const WidrawalSavingsForm: React.FC<WidrawalSavingsFormProps> = ({
  isOpen,
  onClose,
  details,
  loading = false,
  onSubmit
}) => {
  // État pour le formulaire de retrait
  const [retraitData, setRetraitData] = useState({
    montant: '',
    numero_telephone: '',
    commentaire: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!retraitData.montant || parseFloat(retraitData.montant) <= 0) {
      newErrors.montant = 'Le montant doit être supérieur à 0';
      toast.error('Le montant doit être supérieur à 0');
    }

    if (parseFloat(retraitData.montant) > parseFloat(details.solde_disponible)) {
      newErrors.montant = 'Le montant ne peut pas dépasser le solde disponible';
      toast.error('Le montant ne peut pas dépasser le solde disponible');
    }

    if (!retraitData.numero_telephone.trim()) {
      newErrors.numero_telephone = 'Le numéro de téléphone est requis';
      toast.error('Le numéro de téléphone est requis');
    }

    if (retraitData.numero_telephone && !/^[0-9]{8,}$/.test(retraitData.numero_telephone)) {
      newErrors.numero_telephone = 'Format de numéro invalide (+229xxxxxxxx)';
      toast.error('Format de numéro invalide (+229xxxxxxxx)');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSubmit({
        ...retraitData,
        montant: parseFloat(retraitData.montant)
      });

      // Réinitialiser le formulaire après soumission réussie
      setRetraitData({
        montant: '',
        numero_telephone: '',
        commentaire: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Erreur lors du retrait:', error);
    }
  };

  const handleMontantChange = (value: string) => {
    // Permettre seulement les nombres et les décimales
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    setRetraitData(prev => ({ ...prev, montant: sanitizedValue }));

    // Effacer l'erreur si elle existe
    if (errors.montant) {
      setErrors(prev => ({ ...prev, montant: '' }));
    }
  };

  const handlePhoneChange = (value: string) => {
    // Ne conserver que les chiffres
    const numbersOnly = value.replace(/\D/g, '');
    setRetraitData(prev => ({ ...prev, numero_telephone: numbersOnly }));

    // Effacer l'erreur si elle existe
    if (errors.numero_telephone) {
      setErrors(prev => ({ ...prev, numero_telephone: '' }));
    }
  };

  if (!isOpen) return null;

  const soldeDisponible = parseFloat(details.solde_disponible);
  const montantSaisi = parseFloat(retraitData.montant) || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full relative max-w-xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-black hover:text-gray-800 cursor-pointer"
        >
          ✕
        </button>

        <div className="space-y-6 h-[70vh] overflow-y-auto">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Effectuer un retrait</h2>
          </div>

          <div className="space-y-4">
            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant à retirer <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={retraitData.montant}
                  onChange={(e) => handleMontantChange(e.target.value)}
                  placeholder="0"
                  className={`w-full px-4 py-3 border rounded-lg text-lg font-medium pr-16 ${errors.montant ? 'border-red-500' : 'border-gray-300'
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
            </div>

            {/* Numéro de téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone Mobile Money <span className="text-red-500">*</span>
              </label>
              <Input
                id="phone"
                type="tel"
                name="phone"
                placeholder="Ex: +22997000000"
                value={retraitData.numero_telephone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                required
                className={`bg-white/50 border-primary/20 ${errors.numero_telephone ? 'border-red-500' : ''}`}
                disabled={loading}
              />
              {errors.numero_telephone && <p className="text-red-500 text-xs">{errors.numero_telephone}</p>}
            </div>
            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif du retrait (optionnel)
              </label>
              <textarea
                value={retraitData.commentaire}
                onChange={(e) => setRetraitData(prev => ({ ...prev, commentaire: e.target.value }))}
                placeholder="Précisez le motif de votre retrait..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>

            {/* Récapitulatif */}
            {montantSaisi > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-medium text-gray-800 mb-3">📋 Récapitulatif du retrait :</h6>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant demandé :</span>
                    <span className="font-medium">{montantSaisi.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Numéro de destination :</span>
                    <span className="font-medium">{retraitData.numero_telephone || 'Non renseigné'}</span>
                  </div>
                  {/* <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Nouveau solde :</span>
                    <span className={`font-bold ${(soldeDisponible - montantSaisi) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {(soldeDisponible - montantSaisi).toLocaleString()} FCFA
                    </span>
                  </div> */}
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4">
              <GlassButton
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Annuler
              </GlassButton>
              <GlassButton
                onClick={handleSubmit}
                disabled={loading || !retraitData.montant || !retraitData.numero_telephone || montantSaisi > soldeDisponible}
                className="flex-1"
              >
                {loading ? 'Traitement...' : `Retirer ${montantSaisi.toLocaleString()} FCFA`}
              </GlassButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidrawalSavingsForm;