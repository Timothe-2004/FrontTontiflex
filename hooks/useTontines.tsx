import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Tontine, TontineParticipant, CreateTontineData, UpdateTontineData, MyTontine } from '../types/tontines';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  my_tontines: T[];
}

interface useTontinesResults {
  tontines: Tontine[];
  loading: boolean;
  error: string | null;
  fetchTontines: () => Promise<Tontine[]>;
  fetchTontineById: (id: string) => Promise<Tontine | null>;
  fetchAvailableTontines: () => Promise<Tontine[]>;
  fetchMyTontines: () => Promise<MyTontine[]>;
  fetchTontineParticipants: (id: string) => Promise<TontineParticipant[]>;
  createTontine: (tontine: CreateTontineData | FormData) => Promise<Tontine>;
  updateTontine: (id: string, tontine: UpdateTontineData | FormData) => Promise<Tontine>;
  deleteTontine: (id: string) => Promise<boolean>;
}

export function useTontines(): useTontinesResults {
  const [tontines, setTontines] = useState<Tontine[]>([]);
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

  const fetchTontines = useCallback(async (): Promise<Tontine[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/tontines/`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des tontines');
      }
      
      const data: PaginatedResponse<Tontine> = await response.json();
      const tontines = data.results || [];
      setTontines(tontines);
      console.log("tontines", tontines);
      return tontines;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement des tontines');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const fetchTontineById = async (id: string): Promise<Tontine | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/tontines/${id}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tontine');
      }
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to fetch tontine');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTontines = async (): Promise<Tontine[]> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/tontines/available/`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des tontines disponibles');
      }
      
      const data: PaginatedResponse<Tontine> = await response.json();
      return data.results || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement des tontines disponibles');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTontines = async (): Promise<MyTontine[]> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/tontines/my-tontines/`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de mes tontines');
      }
      
      const data: PaginatedResponse<MyTontine> = await response.json();
      console.log("data", data);
      return data.my_tontines || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement de mes tontines');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchTontineParticipants = async (id: string): Promise<TontineParticipant[]> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/tontines/${id}/participants/`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des participants');
      }
      
      const data: PaginatedResponse<TontineParticipant> = await response.json();
      return data.results || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement des participants');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTontine = async (tontineData: CreateTontineData | FormData) => {
    setLoading(true);
    setError(null);
    try {
      const isFormData = tontineData instanceof FormData;
      
      const response = await fetch(`${baseUrl}/tontines/`, {
        method: 'POST',
        headers: getAuthHeaders(isFormData),
        body: isFormData ? tontineData : JSON.stringify(tontineData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création de la tontine';
        try {
          const errorData = await response.json();
          console.error('Erreur API:', errorData);
          
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

      const newTontine = await response.json();
      setTontines(prev => [newTontine, ...prev]);
      toast.success('Tontine créée avec succès');
      return newTontine;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTontine = async (id: string, tontineData: UpdateTontineData | FormData) => {
    setLoading(true);
    setError(null);
    try {
      const isFormData = tontineData instanceof FormData;
      
      const response = await fetch(`${baseUrl}/tontines/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(isFormData),
        body: isFormData ? tontineData : JSON.stringify(tontineData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la tontine');
      }

      const updatedTontine = await response.json();
      setTontines(prev => 
        prev.map(tontine => tontine.id === id ? { ...tontine, ...updatedTontine } : tontine)
      );
      toast.success('Tontine mise à jour avec succès');
      return updatedTontine;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRECTION : Endpoint correct pour la suppression
  const deleteTontine = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/tontines/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Erreur lors de la suppression de la tontine');
      }

      setTontines(prev => prev.filter(tontine => tontine.id !== id));
      toast.success('Tontine supprimée avec succès');
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

  return {
    tontines,
    loading,
    error,
    fetchTontines,
    fetchTontineById,
    fetchAvailableTontines,
    fetchMyTontines,
    fetchTontineParticipants,
    createTontine,
    updateTontine,
    deleteTontine,
  };
}