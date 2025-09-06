import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { SFD, SFDFilters, PaginatedSFDList, CreateSFDData, UpdateSFDData } from '../../types/sfds';

interface useSFDsResults {
  sfds: SFD[];
  sfd: SFD | null;
  loading: boolean;
  error: string | null;

  // CRUD operations
  fetchSFDs: (filters?: SFDFilters) => Promise<PaginatedSFDList>;
  fetchSFDById: (id: string) => Promise<SFD | null>;
  createSFD: (sfdData: CreateSFDData) => Promise<SFD>;
  updateSFD: (id: string, sfdData: UpdateSFDData) => Promise<SFD>;
  updateSFDPartial: (id: string, sfdData: Partial<UpdateSFDData>) => Promise<SFD>;
  deleteSFD: (id: string) => Promise<boolean>;
}

export function useSFDs(): useSFDsResults {
  const [sfds, setSFDs] = useState<SFD[]>([]);
  const [sfd, setSFD] = useState<SFD | null>(null);
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

  // Récupérer la liste des SFD
  const fetchSFDs = useCallback(async (filters: SFDFilters = {}): Promise<PaginatedSFDList> => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const url = `${baseUrl}/admin/sfds/?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des SFD');
      }
      
      const data: PaginatedSFDList = await response.json();
      setSFDs(data.results || []);
      console.log("SFD", data.results);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement des SFD');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Récupérer une SFD par ID
  const fetchSFDById = async (id: string): Promise<SFD | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/admin/sfds/${id}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la SFD');
      }
      
      const sfdData = await response.json();
      setSFD(sfdData);
      return sfdData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast.error('Erreur lors du chargement de la SFD');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer une SFD
  const createSFD = async (sfdData: CreateSFDData): Promise<SFD> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/admin/sfds/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sfdData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création de la SFD';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 403) {
            errorMessage = 'Permissions insuffisantes - Administrateur plateforme requis';
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

      const newSFD = await response.json();
      setSFDs(prev => [newSFD, ...prev]);
      toast.success('SFD créée avec succès');
      return newSFD;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une SFD (PUT)
  const updateSFD = async (id: string, sfdData: UpdateSFDData): Promise<SFD> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/admin/sfds/${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(sfdData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la mise à jour de la SFD';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 403) {
            errorMessage = 'Permissions insuffisantes - Administrateur plateforme requis';
          } else if (response.status === 404) {
            errorMessage = 'SFD introuvable';
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      const updatedSFD = await response.json();
      setSFDs(prev => 
        prev.map(sfd => sfd.id === id ? { ...sfd, ...updatedSFD } : sfd)
      );
      setSFD(updatedSFD);
      toast.success('SFD mise à jour avec succès');
      return updatedSFD;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour partiellement une SFD (PATCH)
  const updateSFDPartial = async (id: string, sfdData: Partial<UpdateSFDData>): Promise<SFD> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/admin/sfds/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(sfdData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la mise à jour partielle de la SFD';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 403) {
            errorMessage = 'Permissions insuffisantes - Administrateur plateforme requis';
          } else if (response.status === 404) {
            errorMessage = 'SFD introuvable';
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      const updatedSFD = await response.json();
      setSFDs(prev => 
        prev.map(sfd => sfd.id === id ? { ...sfd, ...updatedSFD } : sfd)
      );
      setSFD(updatedSFD);
      toast.success('SFD mise à jour avec succès');
      return updatedSFD;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une SFD
  const deleteSFD = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/admin/sfds/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        let errorMessage = 'Erreur lors de la suppression de la SFD';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 403) {
            errorMessage = 'Permissions insuffisantes - Administrateur plateforme requis';
          } else if (response.status === 404) {
            errorMessage = 'SFD introuvable';
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      setSFDs(prev => prev.filter(sfd => sfd.id !== id));
      if (sfd?.id === id) {
        setSFD(null);
      }
      toast.success('SFD supprimée avec succès');
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
    sfds,
    sfd,
    loading,
    error,
    fetchSFDs,
    fetchSFDById,
    createSFD,
    updateSFD,
    updateSFDPartial,
    deleteSFD,
  };
}