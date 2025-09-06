'use client'
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PiggyBank, Upload, CreditCard, Phone, Building2, FileText, Image as ImageIcon, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSavingsAccounts } from "@/hooks/useSavingAccounts";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useCallback, ChangeEvent, useEffect } from "react";
import { CreateRequestData } from "@/types/saving-accounts";

interface ValidationErrors {
  [key: string]: string;
}

const SavingsAccountForm = () => {
  const router = useRouter();
  const { createRequest, loading, fetchAvailableSFDs, availableSFDs } = useSavingsAccounts();
  const { user } = useAuth(); // Récupérer l'utilisateur connecté
  
  const [formData, setFormData] = useState({
    sfd_choisie: "",
    numero_telephone_paiement: "",
  });
  const [pieceIdentite, setPieceIdentite] = useState<File | null>(null);
  const [photoIdentite, setPhotoIdentite] = useState<File | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Types de fichiers acceptés
  const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
  const ACCEPTED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    fetchAvailableSFDs();
  }, []);

  const validateField = (field: string, value: string | File | null): boolean => {
    let isValid = true;
    let message = '';

    switch (field) {
      case 'sfd_choisie':
        if (!value) {
          isValid = false;
          message = 'Veuillez sélectionner un SFD';
        }
        break;

      case 'numero_telephone_paiement':
        const phoneValue = value as string;
        if (!phoneValue) {
          isValid = false;
          message = 'Le numéro de téléphone est requis';
        } else if (phoneValue.length < 8 || phoneValue.length > 15) {
          isValid = false;
          message = 'Numéro de téléphone invalide (8-15 caractères)';
        }
        break;

      case 'piece_identite':
        const docFile = value as File;
        if (!docFile) {
          isValid = false;
          message = 'La pièce d\'identité est requise';
        } else if (!ACCEPTED_DOCUMENT_TYPES.includes(docFile.type)) {
          isValid = false;
          message = 'Format non supporté (PDF, JPG, PNG seulement)';
        } else if (docFile.size > MAX_FILE_SIZE) {
          isValid = false;
          message = 'Fichier trop volumineux (max 5MB)';
        }
        break;

      case 'photo_identite':
        const photoFile = value as File;
        if (!photoFile) {
          isValid = false;
          message = 'La photo d\'identité est requise';
        } else if (!ACCEPTED_IMAGE_TYPES.includes(photoFile.type)) {
          isValid = false;
          message = 'Format non supporté (JPG, PNG seulement)';
        } else if (photoFile.size > MAX_FILE_SIZE) {
          isValid = false;
          message = 'Fichier trop volumineux (max 5MB)';
        }
        break;
    }

    if (!isValid) {
      setErrors(prev => ({ ...prev, [field]: message }));
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    return isValid;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validation en temps réel
    validateField(name, value);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fileType: 'piece_identite' | 'photo_identite') => {
    const file = e.target.files?.[0] || null;
    
    if (fileType === 'piece_identite') {
      setPieceIdentite(file);
      validateField('piece_identite', file);
    } else {
      setPhotoIdentite(file);
      validateField('photo_identite', file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validation des champs requis
    if (!formData.sfd_choisie) {
      newErrors.sfd_choisie = 'Veuillez sélectionner un SFD';
    }

    if (!formData.numero_telephone_paiement) {
      newErrors.numero_telephone_paiement = 'Le numéro de téléphone est requis';
    } else if (formData.numero_telephone_paiement.length < 8 || formData.numero_telephone_paiement.length > 15) {
      newErrors.numero_telephone_paiement = 'Numéro de téléphone invalide';
    }

    if (!pieceIdentite) {
      newErrors.piece_identite = 'La pièce d\'identité est requise';
    } else if (!ACCEPTED_DOCUMENT_TYPES.includes(pieceIdentite.type)) {
      newErrors.piece_identite = 'Format de fichier non supporté';
    } else if (pieceIdentite.size > MAX_FILE_SIZE) {
      newErrors.piece_identite = 'Fichier trop volumineux';
    }

    if (!photoIdentite) {
      newErrors.photo_identite = 'La photo d\'identité est requise';
    } else if (!ACCEPTED_IMAGE_TYPES.includes(photoIdentite.type)) {
      newErrors.photo_identite = 'Format de fichier non supporté';
    } else if (photoIdentite.size > MAX_FILE_SIZE) {
      newErrors.photo_identite = 'Fichier trop volumineux';
    }

    if (!user?.id) {
      newErrors.client = 'Utilisateur non connecté';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== DÉBOGAGE RAPIDE ===');
    console.log('SFD sélectionné:', formData.sfd_choisie);
    console.log('Téléphone:', formData.numero_telephone_paiement);
    console.log('Fichier 1:', pieceIdentite?.name, pieceIdentite?.size);
    console.log('Fichier 2:', photoIdentite?.name, photoIdentite?.size);
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    if (!user?.id) {
      toast.error("Vous devez être connecté pour créer un compte épargne");
      router.push('/auth/login');
      return;
    }

    try {
      // Préparation des données selon l'interface CreateSavingsAccountData
      const accountData: CreateRequestData = {
        sfd_id: formData.sfd_choisie,
        numero_telephone_paiement: formData.numero_telephone_paiement,
        piece_identite: pieceIdentite!,
        photo_identite: photoIdentite!,
      };

      // Appel de la fonction du hook
      const newAccount = await createRequest(accountData);
      toast.success("Demande de compte épargne enregistrée avec succès");
      console.log('Compte épargne créé avec succès:', newAccount);
      
      // Redirection après succès
      setTimeout(() => {
        router.push("/dashboards/dashboard-client/saving-accounts");
      }, 1500);

    } catch (error) {
      console.error("Error creating savings account:", error);
      toast.error("Vous avez déjà une demande de création de compte courant en cours")
    }
  };

  const formatFileSize = (bytes: number): string => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <GlassCard hover={false}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PiggyBank className="text-emerald-600" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-primary mb-2">Ouvrir un Compte Épargne</h1>
              <p className="text-gray-600">Créez votre compte épargne en quelques étapes simples</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sélection SFD */}
              <div className="space-y-2">
                <Label className="text-primary font-medium flex items-center">
                  <Building2 className="inline mr-2" size={16} />
                  Sélectionner un SFD *
                </Label>
                <select 
                  name="sfd_choisie" 
                  value={formData.sfd_choisie}
                  onChange={handleInputChange}
                  className={`w-full bg-white/50 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.sfd_choisie ? 'border-red-300' : 'border-primary/20'
                  }`}
                  disabled={loading}
                >
                  <option value="">-- Choisissez un SFD --</option>
                  {availableSFDs.map((sfd) => (
                    <option key={sfd.id} value={sfd.id}>
                      {sfd.nom}
                    </option>
                  ))}
                </select>
                {errors.sfd_choisie && (
                  <p className="text-xs text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.sfd_choisie}
                  </p>
                )}
              </div>

              {/* Numéro de téléphone */}
              <div className="space-y-2">
                <Label className="text-primary font-medium flex items-center">
                  <Phone className="inline mr-2" size={16} />
                  Votre numéro de téléphone *
                </Label>
                <Input
                  type="tel"
                  name="numero_telephone_paiement"
                  value={formData.numero_telephone_paiement}
                  onChange={handleInputChange}
                  placeholder="Ex: 69123456"
                  className={`bg-white/50 ${errors.numero_telephone_paiement ? 'border-red-300' : 'border-primary/20'}`}
                  disabled={loading}
                />
                {errors.numero_telephone_paiement && (
                  <p className="text-xs text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.numero_telephone_paiement}
                  </p>
                )}
              </div>

              {/* Pièce d'identité */}
              <div className="space-y-2">
                <Label className="text-primary font-medium flex items-center">
                  <FileText className="inline mr-2" size={16} />
                  Votre pièce d'identité (CIP, CNI) *
                </Label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {pieceIdentite ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        <FileText className="text-emerald-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{pieceIdentite.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(pieceIdentite.size)}</p>
                      </div>
                      <GlassButton
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('piece_identite')?.click()}
                        disabled={loading}
                      >
                        Changer le fichier
                      </GlassButton>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto text-gray-400" size={24} />
                      <p className="text-sm text-gray-600">Cliquez pour sélectionner votre pièce d'identité</p>
                      <p className="text-xs text-gray-500">PDF, JPG ou PNG - Max 5MB</p>
                      <GlassButton
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('piece_identite')?.click()}
                        disabled={loading}
                      >
                        <Upload className="mr-2" size={16} />
                        Sélectionner un fichier
                      </GlassButton>
                    </div>
                  )}
                </div>

                <Input
                  id="piece_identite"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'piece_identite')}
                  className="hidden"
                  disabled={loading}
                />
                {errors.piece_identite && (
                  <p className="text-xs text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.piece_identite}
                  </p>
                )}
              </div>

              {/* Photo d'identité */}
              <div className="space-y-2">
                <Label className="text-primary font-medium flex items-center">
                  <ImageIcon className="inline mr-2" size={16} />
                  Photo d'identité *
                </Label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {photoIdentite ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        <ImageIcon className="text-emerald-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{photoIdentite.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(photoIdentite.size)}</p>
                      </div>
                      <GlassButton
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('photo_identite')?.click()}
                        disabled={loading}
                      >
                        Changer la photo
                      </GlassButton>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="mx-auto text-gray-400" size={24} />
                      <p className="text-sm text-gray-600">Cliquez pour sélectionner votre photo d'identité</p>
                      <p className="text-xs text-gray-500">JPG ou PNG - Max 5MB</p>
                      <GlassButton
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('photo_identite')?.click()}
                        disabled={loading}
                      >
                        <ImageIcon className="mr-2" size={16} />
                        Sélectionner une photo
                      </GlassButton>
                    </div>
                  )}
                </div>

                <Input
                  id="photo_identite"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'photo_identite')}
                  className="hidden"
                  disabled={loading}
                />
                {errors.photo_identite && (
                  <p className="text-xs text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.photo_identite}
                  </p>
                )}
              </div>

              {/* Erreur générale */}
              {errors.client && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="text-red-600" size={16} />
                    <p className="text-sm text-red-800">{errors.client}</p>
                  </div>
                </div>
              )}

              {/* Bouton de soumission */}
              <GlassButton 
                type="submit" 
                size="lg" 
                className=""
                disabled={loading || !formData.sfd_choisie || !formData.numero_telephone_paiement || !pieceIdentite || !photoIdentite}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <PiggyBank className="mr-2" size={16} />
                    Créer mon compte épargne
                  </>
                )}
              </GlassButton>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default SavingsAccountForm;