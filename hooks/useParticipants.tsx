import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

// Types TypeScript basés sur l'API
export type ParticipantStatus = 'actif' | 'inactif' | 'suspendu';
export type CotisationStatus = 'pending' | 'confirmee' | 'rejetee';

export interface TontineParticipant {
  id: string;
  client_nom: string;
  tontine_nom: string;
  solde_disponible: string;
  montantMise: string;
  dateAdhesion: string;
  dateRetrait?: string;
  statut: ParticipantStatus;
  fraisAdhesionPayes: boolean;
  tontine: string;
  client: string;
  transactionAdhesion?: string;
}

export interface CotisationResponse {
  success: boolean;
  message: string;
  payment_link: string;
  cotisations: Cotisation[];
  transaction_kkiapay: TransactionKkiapay;
  solde: Solde;
  cycles_cotises: CycleCotise[];
}

export interface Cotisation {
  id: number;
  montant: number;
  est_commission_sfd: boolean;
  cycle_numero: number;
  statut: "pending" | "completed" | "failed" | string;
}

export interface TransactionKkiapay {
  id: string;
  reference: string;
  status: "initialized" | "success" | "failed" | string;
  montant: number;
}

export interface Solde {
  nouveau_solde: number;
}

export interface CycleCotise {
  cycle_numero: number;
  cycle_debut: string;
  jours_coches: number[];
  commission_sfd: boolean;
  montant: number;
}

export interface CreateParticipantData {
  montantMise: string;
  dateAdhesion: string;
  dateRetrait?: string;
  statut: ParticipantStatus;
  fraisAdhesionPayes: boolean;
  tontine: string;
  client: string;
  transactionAdhesion?: string;
}

export interface UpdateParticipantData {
  montantMise?: string;
  dateAdhesion?: string;
  dateRetrait?: string;
  statut?: ParticipantStatus;
  fraisAdhesionPayes?: boolean;
  tontine?: string;
  client?: string;
  transactionAdhesion?: string;
}

export interface CotiserData {
  nombre_mises: number;
  numero_telephone: string;
  commentaire?: string;
}

export interface ParticipantDetailsComplets {
  id: string;
  client_nom: string;
  tontine_nom: string;
  solde_disponible: string;
  montantMise: string;
  dateAdhesion: string;
  total_cotise: string;
  sfd_nom: string;
  statut_tontine: string;
  carnets_cotisation: any[];
}

export interface ParticipantsStats {
  total_participants: number;
  participants_actifs: number;
  participants_inactifs: number;
  volume_total_cotisations: string;
  cotisations_mois_courant: string;
  montant_commissions_sfd: string;
  moyenne_cotisation_participant: string;
  taux_retention: number;
  evolution_mensuelle: any[];
  repartition_par_sfd: any[];
  segmentation_montants: any[];
}

// 🆕 Interface pour les données de paiement KKiaPay
export interface KKiaPayPaymentData {
  transactionId: string;
  phone?: string;
  amount?: number;
  status?: string;
}

// 🆕 Interface pour la confirmation de paiement
export interface PaymentConfirmationData {
  kkiapay_transaction_id: string;
  internal_transaction_id: string;
  reference: string;
  amount: number;
  phone: string;
  status: 'success' | 'failed';
  timestamp: string;
  cotisation_data: CotiserData;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface useParticipantsResults {
  participants: TontineParticipant[];
  participantDetails: ParticipantDetailsComplets | null;
  stats: ParticipantsStats | null;
  loading: boolean;
  error: string | null;

  // Gestion des participants
  fetchParticipants: () => Promise<void>;
  fetchParticipantById: (id: string) => Promise<TontineParticipant | null>;
  fetchParticipantDetailsComplets: (id: string) => Promise<ParticipantDetailsComplets | null>;
  createParticipant: (participantData: CreateParticipantData | FormData) => Promise<TontineParticipant>;
  updateParticipant: (id: string, participantData: UpdateParticipantData | FormData) => Promise<TontineParticipant>;
  deleteParticipant: (id: string) => Promise<boolean>;

  // 🆕 Cotisations avec support KKiaPay
  createCotisationForPayment: (id: string, cotiserData: CotiserData) => Promise<CotisationResponse>;
  confirmPayment: (confirmationData: PaymentConfirmationData) => Promise<void>;
  cotiser: (id: string, cotiserData: CotiserData) => Promise<CotisationResponse>;

  // Statistiques
  fetchParticipantsStats: () => Promise<ParticipantsStats | null>;
}

export function useParticipants(): useParticipantsResults {
  const [participants, setParticipants] = useState<TontineParticipant[]>([]);
  const [participantDetails, setParticipantDetails] = useState<ParticipantDetailsComplets | null>(null);
  const [stats, setStats] = useState<ParticipantsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();
  const baseUrl = 'https://tontiflexapp.onrender.com/api';

  const getAuthHeaders = (isFormData = false) => {
    const headers: HeadersInit = {
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    };
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  };

  // Récupérer la liste des participants
  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/participants/`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des participants');
      }
      
      const data: PaginatedResponse<TontineParticipant> = await response.json();
      setParticipants(data.results || []);
      console.log("participants", data.results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement des participants');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Récupérer un participant par ID
  const fetchParticipantById = async (id: string): Promise<TontineParticipant | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/participants/${id}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du participant');
      }
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast.error('Erreur lors du chargement du participant');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les détails complets d'un participant
  const fetchParticipantDetailsComplets = async (id: string): Promise<ParticipantDetailsComplets | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/participants/${id}/details-complets/`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des détails complets du participant');
      }
      
      const detailsData = await response.json();
      setParticipantDetails(detailsData);
      return detailsData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast.error('Erreur lors du chargement des détails complets');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer un participant
  const createParticipant = async (participantData: CreateParticipantData | FormData) => {
    setLoading(true);
    setError(null);
    try {
      const isFormData = participantData instanceof FormData;
      
      const response = await fetch(`${baseUrl}/participants/`, {
        method: 'POST',
        headers: getAuthHeaders(isFormData),
        body: isFormData ? participantData : JSON.stringify(participantData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création du participant';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (typeof errorData === 'object') {
            const validationErrors = Object.entries(errorData)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('\n');
            if (validationErrors) {
              errorMessage = `Erreurs de validation :\n${validationErrors}`;
            }
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      const newParticipant = await response.json();
      setParticipants(prev => [newParticipant, ...prev]);
      toast.success('Participant ajouté avec succès');
      return newParticipant;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un participant
  const updateParticipant = async (id: string, participantData: UpdateParticipantData | FormData) => {
    setLoading(true);
    setError(null);
    try {
      const isFormData = participantData instanceof FormData;
      
      const response = await fetch(`${baseUrl}/participants/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(isFormData),
        body: isFormData ? participantData : JSON.stringify(participantData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du participant');
      }

      const updatedParticipant = await response.json();
      setParticipants(prev => 
        prev.map(participant => participant.id === id ? { ...participant, ...updatedParticipant } : participant)
      );
      toast.success('Participant mis à jour avec succès');
      return updatedParticipant;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Retirer un participant
  const deleteParticipant = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/participants/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Erreur lors du retrait du participant');
      }

      setParticipants(prev => prev.filter(participant => participant.id !== id));
      toast.success('Participant retiré avec succès');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Créer une cotisation pour le paiement (sans effectuer le paiement)
  const createCotisationForPayment = async (id: string, cotiserData: CotiserData): Promise<CotisationResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/participants/${id}/cotiser/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(cotiserData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création de la cotisation';
        if (response.status === 400) {
          errorMessage = 'Nombre de mises invalide ou carnet complet';
        } else if (response.status === 409) {
          errorMessage = 'Pas assez de cases libres dans le carnet';
        }
        
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        
        throw new Error(errorMessage);
      }

      const cotisationResult = await response.json();
      console.log('✅ Cotisation créée:', cotisationResult);
      
      return cotisationResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Confirmer le paiement après succès KKiaPay
  const confirmPayment = async (confirmationData: PaymentConfirmationData): Promise<void> => {
    try {
      const webhookData = {
        transactionId: confirmationData.kkiapay_transaction_id,
        isPaymentSucces: confirmationData.status === 'success',
        event: confirmationData.status === 'success' ? 'payment.success' : 'payment.failed',
        timestamp: confirmationData.timestamp,
        amount: confirmationData.amount,
        status: confirmationData.status.toUpperCase(),
        data: {
          transaction_id: confirmationData.internal_transaction_id,
          reference: confirmationData.reference,
          type: 'cotisation_tontine',
          form_data: confirmationData.cotisation_data
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
        throw new Error(`Erreur confirmation paiement: ${response.status}`);
      }

      console.log('✅ Paiement confirmé avec succès');
    } catch (err) {
      console.error('❌ Erreur confirmation paiement:', err);
      throw err;
    }
  };

  // 🔄 Cotiser - Version classique (pour compatibilité)
  const cotiser = async (id: string, cotiserData: CotiserData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/participants/${id}/cotiser/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(cotiserData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la cotisation';
        if (response.status === 400) {
          errorMessage = 'Nombre de mises invalide ou carnet complet';
        } else if (response.status === 402) {
          errorMessage = 'Erreur de paiement KKiaPay';
        } else if (response.status === 409) {
          errorMessage = 'Pas assez de cases libres dans le carnet';
        }
        
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        
        throw new Error(errorMessage);
      }

      const cotisationResult = await response.json();
      
      // Message de succès personnalisé selon le nombre de mises
      const nombreMises = cotiserData.nombre_mises;
      const messageSucces = nombreMises === 1 
        ? 'Cotisation effectuée avec succès' 
        : `${nombreMises} cotisations effectuées avec succès`;
      
      toast.success(messageSucces);
      
      // Rafraîchir les détails du participant si disponibles
      if (participantDetails?.id === id) {
        await fetchParticipantDetailsComplets(id);
      }
      
      return cotisationResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les statistiques des participants
  const fetchParticipantsStats = async (): Promise<ParticipantsStats | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/participants/stats/`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Permissions insuffisantes pour accéder aux statistiques');
        }
        throw new Error('Erreur lors du chargement des statistiques');
      }
      
      const statsData = await response.json();
      setStats(statsData);
      return statsData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast.error('Erreur lors du chargement des statistiques');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    participants,
    participantDetails,
    stats,
    loading,
    error,
    fetchParticipants,
    fetchParticipantById,
    fetchParticipantDetailsComplets,
    createParticipant,
    updateParticipant,
    deleteParticipant,
    createCotisationForPayment,
    confirmPayment,
    cotiser,
    fetchParticipantsStats,
  };
}