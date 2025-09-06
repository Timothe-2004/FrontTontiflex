import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Types
export interface Cotisation {
  id: number;
  montant: string;
  date_cotisation: string;
  numero_transaction: string;
  statut: 'pending' | 'confirmee' | 'rejetee';
  participant_id: string;
  client_nom: string;
  tontine_nom: string;
  cycle_numero: number;
  jour_carnet: number | null;
  est_commission_sfd: boolean;
  cycle_display: string;
  type_cotisation: string;
  transaction_kkiapay: string | null;
}

export interface CotisationCreate {
  montant: string;
  numero_transaction: string;
  statut?: 'pending' | 'confirmee' | 'rejetee';
  cycle_numero: number;
  jour_carnet: number;
  est_commission_sfd: boolean;
  transaction_kkiapay?: string;
}

export interface CotisationUpdate {
  montant?: string;
  numero_transaction?: string;
  statut?: 'pending' | 'confirmee' | 'rejetee';
  cycle_numero?: number;
  jour_carnet?: number;
  est_commission_sfd?: boolean;
  transaction_kkiapay?: string;
}

export interface CotisationsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Cotisation[];
}

export interface CotisationsFilters {
  page?: number;
  participant_id?: string;
  tontine_id?: string;
  date_debut?: string;
  date_fin?: string;
  type_cotisation?: string;
  statut?: 'pending' | 'confirmee' | 'rejetee';
}

interface ApiError {
  message: string;
  status?: number;
}

const API_BASE_URL = 'https://tontiflexapp.onrender.com/api';

// Hook principal pour lister les cotisations
export const useCotisations = (filters: CotisationsFilters = {}) => {
  const [cotisations, setCotisations] = useState<CotisationsListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { accessToken } = useAuth();

  const fetchCotisations = useCallback(async () => {
    if (!accessToken) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Construction des paramètres de requête
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const url = `${API_BASE_URL}/cotisations/?${searchParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data: CotisationsListResponse = await response.json();
      setCotisations(data);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Erreur lors du chargement des cotisations',
        status: err instanceof Error && 'status' in err ? (err as any).status : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, filters]);

  useEffect(() => {
    fetchCotisations();
  }, [fetchCotisations]);

  return {
    cotisations,
    isLoading,
    error,
    refetch: fetchCotisations,
  };
};

// Hook pour récupérer une cotisation spécifique
export const useCotisation = (id: number | null) => {
  const [cotisation, setCotisation] = useState<Cotisation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { accessToken } = useAuth();

  const fetchCotisation = useCallback(async () => {
    if (!accessToken || !id) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/cotisations/${id}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data: Cotisation = await response.json();
      setCotisation(data);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Erreur lors du chargement de la cotisation',
        status: err instanceof Error && 'status' in err ? (err as any).status : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, id]);

  useEffect(() => {
    if (id) {
      fetchCotisation();
    }
  }, [fetchCotisation, id]);

  return {
    cotisation,
    isLoading,
    error,
    refetch: fetchCotisation,
  };
};

// Hook pour créer une cotisation
export const useCreateCotisation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { accessToken } = useAuth();

  const createCotisation = useCallback(async (data: CotisationCreate): Promise<Cotisation | null> => {
    if (!accessToken) {
      setError({ message: 'Token d\'accès manquant' });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/cotisations/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 
          errorData.message || 
          `Erreur ${response.status}: ${response.statusText}`
        );
      }

      const cotisation: Cotisation = await response.json();
      return cotisation;
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Erreur lors de la création de la cotisation',
        status: err instanceof Error && 'status' in err ? (err as any).status : undefined,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  return {
    createCotisation,
    isLoading,
    error,
  };
};

// Hook pour mettre à jour une cotisation (PUT)
export const useUpdateCotisation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { accessToken } = useAuth();

  const updateCotisation = useCallback(async (
    id: number, 
    data: CotisationCreate
  ): Promise<Cotisation | null> => {
    if (!accessToken) {
      setError({ message: 'Token d\'accès manquant' });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/cotisations/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 
          errorData.message || 
          `Erreur ${response.status}: ${response.statusText}`
        );
      }

      const cotisation: Cotisation = await response.json();
      return cotisation;
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la cotisation',
        status: err instanceof Error && 'status' in err ? (err as any).status : undefined,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  return {
    updateCotisation,
    isLoading,
    error,
  };
};

// Hook pour mettre à jour partiellement une cotisation (PATCH)
export const usePatchCotisation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { accessToken } = useAuth();

  const patchCotisation = useCallback(async (
    id: number, 
    data: CotisationUpdate
  ): Promise<Cotisation | null> => {
    if (!accessToken) {
      setError({ message: 'Token d\'accès manquant' });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/cotisations/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 
          errorData.message || 
          `Erreur ${response.status}: ${response.statusText}`
        );
      }

      const cotisation: Cotisation = await response.json();
      return cotisation;
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Erreur lors de la mise à jour partielle de la cotisation',
        status: err instanceof Error && 'status' in err ? (err as any).status : undefined,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  return {
    patchCotisation,
    isLoading,
    error,
  };
};

// Hook pour supprimer une cotisation
export const useDeleteCotisation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { accessToken } = useAuth();

  const deleteCotisation = useCallback(async (id: number): Promise<boolean> => {
    if (!accessToken) {
      setError({ message: 'Token d\'accès manquant' });
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/cotisations/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 
          errorData.message || 
          `Erreur ${response.status}: ${response.statusText}`
        );
      }

      return true;
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Erreur lors de la suppression de la cotisation',
        status: err instanceof Error && 'status' in err ? (err as any).status : undefined,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  return {
    deleteCotisation,
    isLoading,
    error,
  };
};

// Hook combiné pour toutes les opérations sur les cotisations
export const useCotisationsActions = () => {
  const { createCotisation, isLoading: isCreating, error: createError } = useCreateCotisation();
  const { updateCotisation, isLoading: isUpdating, error: updateError } = useUpdateCotisation();
  const { patchCotisation, isLoading: isPatching, error: patchError } = usePatchCotisation();
  const { deleteCotisation, isLoading: isDeleting, error: deleteError } = useDeleteCotisation();

  return {
    createCotisation,
    updateCotisation,
    patchCotisation,
    deleteCotisation,
    isLoading: isCreating || isUpdating || isPatching || isDeleting,
    error: createError || updateError || patchError || deleteError,
  };
};