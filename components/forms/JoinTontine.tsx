'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload, FileText, AlertCircle, CheckCircle, Coins, Users, Info } from 'lucide-react';
import { GlassButton } from '@/components/GlassButton';
import { GlassCard } from '@/components/GlassCard';
import { Tontine } from '@/types/tontines';
import { useAdhesions } from '@/hooks/useAdhesions'; // Import du hook
import { CreateAdhesionData } from '@/types/adhesions';
import { toast } from 'sonner';

// Types et interfaces
interface JoinTontineFormData {
  tontine: string; // UUID de la tontine
  montant_mise: string; // Montant avec pattern décimal
  document_identite: File | null; // Fichier document d'identité
}

interface ValidationErrors {
  [key: string]: string;
}

interface ValidationStatus {
  [key: string]: {
    isValid: boolean;
    message: string;
  };
}

interface JoinTontineModalProps {
  isOpen: boolean;
  onClose: () => void;
  tontine: Tontine | null;
  onSuccess: () => void;
}

const JoinTontineModal: React.FC<JoinTontineModalProps> = ({
  isOpen,
  onClose,
  tontine,
  onSuccess
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Utilisation du hook useAdhesions
  const { createAdhesion, loading: isSubmitting } = useAdhesions();
  const router = useRouter();

  const [formData, setFormData] = useState<JoinTontineFormData>({
    tontine: tontine?.id || '',
    montant_mise: '',
    document_identite: null
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>({});

  // Pattern de validation pour le montant décimal
  const DECIMAL_PATTERN = /^-?\d{0,10}(?:\.\d{0,2})?$/;

  // Types de fichiers acceptés
  const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Mise à jour du tontine ID quand la prop change
  React.useEffect(() => {
    if (tontine?.id) {
      setFormData(prev => ({ ...prev, tontine: tontine.id }));
    }
  }, [tontine]);

  const validateField = (field: keyof JoinTontineFormData, value: string | File | null): void => {
    let isValid = true;
    let message = '';

    switch (field) {
      case 'montant_mise':
        const strValue = value as string;
        if (!strValue) {
          isValid = false;
          message = 'Le montant de mise est requis';
        } else if (!DECIMAL_PATTERN.test(strValue)) {
          isValid = false;
          message = 'Format invalide (ex: 1000.50)';
        } else {
          const numValue = parseFloat(strValue);
          if (tontine) {
            const minAmount = parseFloat(tontine.montantMinMise);
            const maxAmount = parseFloat(tontine.montantMaxMise);

            if (numValue < minAmount) {
              isValid = false;
              message = `Minimum: ${minAmount.toLocaleString('fr-FR')} FCFA`;
            } else if (numValue > maxAmount) {
              isValid = false;
              message = `Maximum: ${maxAmount.toLocaleString('fr-FR')} FCFA`;
            } else {
              isValid = true;
              message = 'Montant valide';
            }
          }
        }
        break;

      case 'document_identite':
        const file = value as File;
        if (!file) {
          isValid = false;
          message = 'Document d\'identité requis';
        } else if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          isValid = false;
          message = 'Format non supporté (PDF, JPG, PNG seulement)';
        } else if (file.size > MAX_FILE_SIZE) {
          isValid = false;
          message = 'Fichier trop volumineux (max 5MB)';
        } else {
          isValid = true;
          message = 'Document valide';
        }
        break;
    }

    setValidationStatus(prev => ({
      ...prev,
      [field]: { isValid, message }
    }));

    // Clear error when field becomes valid
    if (isValid && errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateField = <K extends keyof JoinTontineFormData>(
    field: K,
    value: JoinTontineFormData[K]
  ): void => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Real-time validation
    validateField(field, value);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validation tontine
    if (!formData.tontine) {
      newErrors.tontine = 'Tontine non sélectionnée';
    }

    // Validation montant_mise
    if (!formData.montant_mise) {
      newErrors.montant_mise = 'Le montant de mise est requis';
    } else if (!DECIMAL_PATTERN.test(formData.montant_mise)) {
      newErrors.montant_mise = 'Format de montant invalide';
    } else if (tontine) {
      const amount = parseFloat(formData.montant_mise);
      const minAmount = parseFloat(tontine.montantMinMise);
      const maxAmount = parseFloat(tontine.montantMaxMise);

      if (amount < minAmount || amount > maxAmount) {
        newErrors.montant_mise = `Le montant doit être entre ${minAmount.toLocaleString('fr-FR')} et ${maxAmount.toLocaleString('fr-FR')} FCFA`;
      }
    }

    // Validation document_identite
    if (!formData.document_identite) {
      newErrors.document_identite = 'Document d\'identité requis';
    } else {
      const file = formData.document_identite;
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        newErrors.document_identite = 'Format de fichier non supporté';
      } else if (file.size > MAX_FILE_SIZE) {
        newErrors.document_identite = 'Fichier trop volumineux';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    updateField('document_identite', file);
  };

  const handleFileRemove = (): void => {
    updateField('document_identite', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Préparation des données pour l'API
      const submitData: CreateAdhesionData = {
        tontine: formData.tontine,
        montant_mise: formData.montant_mise,
        document_identite: formData.document_identite || undefined
      };

      // Appel de la fonction createAdhesion du hook
      console.log('🚀 Envoi de la demande d\'adhésion...', submitData);
      const newAdhesion = await createAdhesion(submitData);
      toast.success("Votre demande d'adhésion a bien été prise en compte. Vous serez notifié(e) par email de la décision.");
      
      // Fermer la modale et réinitialiser le formulaire
      onSuccess();
      
      // Rediriger vers la page des adhésions après un court délai
      setTimeout(() => {
        router.push('/dashboards/dashboard-client/');
      }, 1500);

      setFormData({
        tontine: '',
        montant_mise: '',
        document_identite: null
      });
      setErrors({});
      setValidationStatus({});

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error("Une erreur est survenue lors de l'envoi de votre demande d'adhésion.");
      if (error instanceof Error) {
        setErrors({ submit: error.message });
      }
    }
  };

  const handleClose = (): void => {
    if (!isSubmitting) {
      onClose();

      setTimeout(() => {
        setFormData({
          tontine: '',
          montant_mise: '',
          document_identite: null
        });
        setErrors({});
        setValidationStatus({});

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 300);
    }
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('fr-FR');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Users className="text-emerald-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Rejoindre une Tontine</h2>
              <p className="text-sm text-gray-600">Remplissez les informations ci-dessous</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Informations de la tontine */}
        {tontine && (
          <div className="p-6 bg-emerald-50 border-b border-emerald-100">
            <h3 className="font-semibold text-emerald-900 mb-2">{tontine.nom}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Coins className="text-emerald-600" size={16} />
                <span className="text-gray-600">Contribution:</span>
                <span className="font-medium">
                  {formatCurrency(parseFloat(tontine.montantMinMise))} - {formatCurrency(parseFloat(tontine.montantMaxMise))} FCFA
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="text-emerald-600" size={16} />
                <span className="text-gray-600">Frais d'adhésion:</span>
                <span className="font-medium">{formatCurrency(parseFloat(tontine.fraisAdhesion))} FCFA</span>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Montant de mise */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Montant de mise souhaité (FCFA) *
            </label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.montant_mise}
                onChange={(e) => updateField('montant_mise', e.target.value)}
                placeholder="1000.00"
                className={`w-full pl-10 pr-10 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.montant_mise ? 'border-red-300' :
                    validationStatus.montant_mise?.isValid === false ? 'border-red-300' :
                      validationStatus.montant_mise?.isValid ? 'border-green-300' : 'border-gray-200'
                  }`}
                disabled={isSubmitting}
              />
              {validationStatus.montant_mise?.isValid !== undefined && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validationStatus.montant_mise.isValid ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {errors.montant_mise && (
              <p className="text-xs text-red-600">{errors.montant_mise}</p>
            )}
            {validationStatus.montant_mise?.message && !errors.montant_mise && (
              <p className={`text-xs ${validationStatus.montant_mise.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {validationStatus.montant_mise.message}
              </p>
            )}
            {tontine && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="text-blue-600" size={14} />
                  <span className="text-xs font-medium text-blue-800">Fourchette autorisée</span>
                </div>
                <p className="text-xs text-blue-700">
                  Entre {formatCurrency(parseFloat(tontine.montantMinMise))} et {formatCurrency(parseFloat(tontine.montantMaxMise))} FCFA
                </p>
              </div>
            )}
          </div>

          {/* Document d'identité */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Document d'identité * (CNI, CIP)
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {formData.document_identite ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <FileText className="text-emerald-600" size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formData.document_identite.name}</p>
                    <p className="text-xs text-gray-500">
                      {(formData.document_identite.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <GlassButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                    >
                      Changer
                    </GlassButton>
                    <GlassButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleFileRemove}
                      disabled={isSubmitting}
                    >
                      Supprimer
                    </GlassButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <Upload className="text-gray-400" size={32} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cliquez pour sélectionner un fichier</p>
                    <p className="text-xs text-gray-500">PDF, JPG ou PNG - Max 5MB</p>
                  </div>
                  <GlassButton
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    <Upload className="mr-2" size={16} />
                    Sélectionner un fichier
                  </GlassButton>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isSubmitting}
            />

            {errors.document_identite && (
              <p className="text-xs text-red-600">{errors.document_identite}</p>
            )}
            {validationStatus.document_identite?.message && !errors.document_identite && (
              <p className={`text-xs ${validationStatus.document_identite.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {validationStatus.document_identite.message}
              </p>
            )}
          </div>

          {/* Erreur générale */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-600" size={16} />
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <GlassButton
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuler
            </GlassButton>
            <GlassButton
              type="submit"
              disabled={isSubmitting || !formData.montant_mise || !formData.document_identite}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Users className="mr-2" size={16} />
                  Envoyer la demande
                </>
              )}
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinTontineModal;