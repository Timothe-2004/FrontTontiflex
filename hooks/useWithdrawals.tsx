import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Retrait, RetraitFilters, PaginatedRetraitList, CreateRetraitData, UpdateRetraitData, ValidationData, InitierVirementData, ValidationRetraitResponse, ValidationRetraitError, StatutRetrait } from '@/types/retraits';

interface useRetraitsResults {
  retraits: Retrait[];
  retrait: Retrait | null;
  loading: boolean;
  error: string | null;

  // CRUD operations
  fetchRetraits: (filters?: RetraitFilters) => Promise<PaginatedRetraitList>;
  fetchRetraitById: (id: string) => Promise<Retrait | null>;
  createRetrait: (retraitData: CreateRetraitData) => Promise<Retrait>;
  updateRetrait: (id: string, retraitData: UpdateRetraitData) => Promise<Retrait>;
  updateRetraitPartial: (id: string, retraitData: Partial<UpdateRetraitData>) => Promise<Retrait>;
  deleteRetrait: (id: string) => Promise<boolean>;

  // Opérations spécifiques
  validerRetrait: (id: string, validationData: ValidationData) => Promise<ValidationRetraitResponse>;
  initierVirement: (id: string, virementData: InitierVirementData) => Promise<any>;
}

export function useRetraits(): useRetraitsResults {
  const [retraits, setRetraits] = useState<Retrait[]>([]);
  const [retrait, setRetrait] = useState<Retrait | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();
  const baseUrl = 'https://tontiflexapp.onrender.com/api';

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    };
  };

  // Récupérer la liste des retraits
  const fetchRetraits = useCallback(async (filters: RetraitFilters = {}): Promise<PaginatedRetraitList> => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const url = `${baseUrl}/retraits/?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des demandes de retrait');
      }
      
      const data: PaginatedRetraitList = await response.json();
      setRetraits(data.results || []);
      console.log("demandes de retrait", data.results);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement des demandes de retrait');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Récupérer un retrait par ID
  const fetchRetraitById = async (id: string): Promise<Retrait | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/retraits/${id}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la demande de retrait');
      }
      
      const retraitData = await response.json();
      setRetrait(retraitData);
      return retraitData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast.error('Erreur lors du chargement de la demande de retrait');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer une demande de retrait
  const createRetrait = async (retraitData: CreateRetraitData): Promise<Retrait> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/retraits/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(retraitData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création de la demande de retrait';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 400) {
            errorMessage = 'Solde insuffisant ou données invalides';
          } else if (response.status === 409) {
            errorMessage = 'Retrait déjà en cours';
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

      const newRetrait = await response.json();
      setRetraits(prev => [newRetrait, ...prev]);
      return newRetrait;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un retrait (PUT)
  const updateRetrait = async (id: string, retraitData: UpdateRetraitData): Promise<Retrait> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/retraits/${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(retraitData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la demande de retrait');
      }

      const updatedRetrait = await response.json();
      setRetraits(prev => 
        prev.map(retrait => retrait.id === id ? { ...retrait, ...updatedRetrait } : retrait)
      );
      setRetrait(updatedRetrait);
      toast.success('Demande de retrait mise à jour avec succès');
      return updatedRetrait;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour partiellement un retrait (PATCH)
  const updateRetraitPartial = async (id: string, retraitData: Partial<UpdateRetraitData>): Promise<Retrait> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/retraits/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(retraitData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour partielle de la demande de retrait');
      }

      const updatedRetrait = await response.json();
      setRetraits(prev => 
        prev.map(retrait => retrait.id === id ? { ...retrait, ...updatedRetrait } : retrait)
      );
      setRetrait(updatedRetrait);
      toast.success('Demande de retrait mise à jour avec succès');
      return updatedRetrait;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une demande de retrait
  const deleteRetrait = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/retraits/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Erreur lors de la suppression de la demande de retrait');
      }

      setRetraits(prev => prev.filter(retrait => retrait.id !== id));
      if (retrait?.id === id) {
        setRetrait(null);
      }
      toast.success('Demande de retrait supprimée avec succès');
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

  // Valider une demande de retrait (Agent SFD)
  const validerRetrait = async (id: string, validationData: ValidationData): Promise<ValidationRetraitResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/retraits/${id}/valider/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(validationData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la validation';
        try {
          const errorData: ValidationRetraitError = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
            if (errorData.details) {
              errorMessage += ` - ${errorData.details}`;
            }
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      const validationResult: ValidationRetraitResponse = await response.json();
      
      // Mettre à jour le retrait dans la liste locale
      setRetraits(prev => 
        prev.map(retrait => 
          retrait.id === id 
            ? { 
                ...retrait, 
                statut: validationData.decision as StatutRetrait,
                commentaires_agent: validationData.commentaire,
                date_validation_retrait: new Date().toISOString()
              } 
            : retrait
        )
      );

      const actionMessage = validationData.decision === 'approved' 
        ? 'Demande de retrait approuvée avec succès' 
        : 'Demande de retrait rejetée';
      
      toast.success(actionMessage);
      return validationResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initier le virement KKiaPay
  const initierVirement = async (id: string, virementData: InitierVirementData): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/retraits/${id}/initier-virement/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(virementData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de l\'initiation du virement';
        try {
          const errorData = await response.json();
          if (errorData.error || errorData.detail) {
            errorMessage = errorData.error || errorData.detail;
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Mettre à jour le statut du retrait
      setRetraits(prev => 
        prev.map(retrait => 
          retrait.id === id 
            ? { ...retrait, statut: 'confirmee' as StatutRetrait }
            : retrait
        )
      );

      toast.success('Virement initié avec succès');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    retraits,
    retrait,
    loading,
    error,
    fetchRetraits,
    fetchRetraitById,
    createRetrait,
    updateRetrait,
    updateRetraitPartial,
    deleteRetrait,
    validerRetrait,
    initierVirement,
  };
}