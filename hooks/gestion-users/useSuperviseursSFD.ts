import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { SuperviseurSFDAdmin, SuperviseurSFDFilters, PaginatedSuperviseurSFDAdminList, CreateSuperviseurSFDData, UpdateSuperviseurSFDData } from '../../types/superviseurs-sfd';

// 🆕 Types pour l'historique des actions
export interface SuperviseurSFDAction {
  date: string;
  type: string;
  detail: string;
}

export interface SuperviseurSFDActionsResponse {
  superviseur_id: string;
  actions: SuperviseurSFDAction[];
}

interface useSuperviseursSFDResults {
  superviseursSFD: SuperviseurSFDAdmin[];
  superviseurSFD: SuperviseurSFDAdmin | null;
  superviseurActions: SuperviseurSFDAction[] | null;
  loading: boolean;
  error: string | null;

  // CRUD operations
  fetchSuperviseursSFD: (filters?: SuperviseurSFDFilters) => Promise<PaginatedSuperviseurSFDAdminList>;
  fetchSuperviseurSFDById: (id: string) => Promise<SuperviseurSFDAdmin | null>;
  createSuperviseurSFD: (superviseurData: CreateSuperviseurSFDData) => Promise<SuperviseurSFDAdmin>;
  updateSuperviseurSFD: (id: string, superviseurData: UpdateSuperviseurSFDData) => Promise<SuperviseurSFDAdmin>;
  updateSuperviseurSFDPartial: (id: string, superviseurData: Partial<UpdateSuperviseurSFDData>) => Promise<SuperviseurSFDAdmin>;
  deleteSuperviseurSFD: (id: string) => Promise<boolean>;
  
  // 🆕 Nouvelle méthode pour l'historique des actions
  fetchSuperviseurSFDActions: (id: string) => Promise<SuperviseurSFDActionsResponse>;
}

export function useSuperviseursSFD(): useSuperviseursSFDResults {
  const [superviseursSFD, setSuperviseursSFD] = useState<SuperviseurSFDAdmin[]>([]);
  const [superviseurSFD, setSuperviseurSFD] = useState<SuperviseurSFDAdmin | null>(null);
  const [superviseurActions, setSuperviseurActions] = useState<SuperviseurSFDAction[] | null>(null); // 🆕
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

  // Récupérer la liste des superviseurs SFD
  const fetchSuperviseursSFD = useCallback(async (filters: SuperviseurSFDFilters = {}): Promise<PaginatedSuperviseurSFDAdminList> => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const url = `${baseUrl}/admin/superviseurs-sfd/?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des superviseurs SFD');
      }
      
      const data: PaginatedSuperviseurSFDAdminList = await response.json();
      setSuperviseursSFD(data.results || []);
      console.log("superviseurs SFD", data.results);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement des superviseurs SFD');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Récupérer un superviseur SFD par ID
  const fetchSuperviseurSFDById = async (id: string): Promise<SuperviseurSFDAdmin | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/admin/superviseurs-sfd/${id}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du superviseur SFD');
      }
      
      const superviseurData = await response.json();
      setSuperviseurSFD(superviseurData);
      return superviseurData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast.error('Erreur lors du chargement du superviseur SFD');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Récupérer l'historique des actions d'un superviseur SFD
  const fetchSuperviseurSFDActions = async (id: string): Promise<SuperviseurSFDActionsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/admin/superviseurs-sfd/${id}/actions/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        let errorMessage = 'Erreur lors du chargement de l\'historique des actions';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 403) {
            errorMessage = 'Permissions insuffisantes pour consulter l\'historique';
          } else if (response.status === 404) {
            errorMessage = 'Superviseur SFD introuvable';
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }
      
      const actionsData: SuperviseurSFDActionsResponse = await response.json();
      setSuperviseurActions(actionsData.actions);
      console.log("Actions du superviseur SFD", actionsData.actions);
      return actionsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement de l\'historique des actions');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Créer un superviseur SFD
  const createSuperviseurSFD = async (superviseurData: CreateSuperviseurSFDData): Promise<SuperviseurSFDAdmin> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/admin/superviseurs-sfd/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(superviseurData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création du superviseur SFD';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 400) {
            errorMessage = 'Données invalides';
          } else if (response.status === 403) {
            errorMessage = 'Permissions insuffisantes';
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

      const newSuperviseur = await response.json();
      setSuperviseursSFD(prev => [newSuperviseur, ...prev]);
      toast.success('Superviseur SFD créé avec succès');
      return newSuperviseur;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un superviseur SFD (PUT)
  const updateSuperviseurSFD = async (id: string, superviseurData: UpdateSuperviseurSFDData): Promise<SuperviseurSFDAdmin> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/admin/superviseurs-sfd/${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(superviseurData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la mise à jour du superviseur SFD';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 403) {
            errorMessage = 'Permissions insuffisantes';
          } else if (response.status === 404) {
            errorMessage = 'Superviseur SFD introuvable';
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      const updatedSuperviseur = await response.json();
      setSuperviseursSFD(prev => 
        prev.map(superviseur => superviseur.email === updatedSuperviseur.email ? { ...superviseur, ...updatedSuperviseur } : superviseur)
      );
      setSuperviseurSFD(updatedSuperviseur);
      toast.success('Superviseur SFD mis à jour avec succès');
      return updatedSuperviseur;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour partiellement un superviseur SFD (PATCH)
  const updateSuperviseurSFDPartial = async (id: string, superviseurData: Partial<UpdateSuperviseurSFDData>): Promise<SuperviseurSFDAdmin> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/admin/superviseurs-sfd/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(superviseurData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la mise à jour partielle du superviseur SFD';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 403) {
            errorMessage = 'Permissions insuffisantes';
          } else if (response.status === 404) {
            errorMessage = 'Superviseur SFD introuvable';
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      const updatedSuperviseur = await response.json();
      setSuperviseursSFD(prev => 
        prev.map(superviseur => superviseur.email === updatedSuperviseur.email ? { ...superviseur, ...updatedSuperviseur } : superviseur)
      );
      setSuperviseurSFD(updatedSuperviseur);
      toast.success('Superviseur SFD mis à jour avec succès');
      return updatedSuperviseur;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un superviseur SFD
  const deleteSuperviseurSFD = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/admin/superviseurs-sfd/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        let errorMessage = 'Erreur lors de la suppression du superviseur SFD';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 403) {
            errorMessage = 'Permissions insuffisantes - Admin plateforme uniquement';
          } else if (response.status === 404) {
            errorMessage = 'Superviseur SFD introuvable';
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      // Retirer de la liste locale
      setSuperviseursSFD(prev => prev.filter((_, index) => index.toString() !== id));
      if (superviseurSFD) {
        setSuperviseurSFD(null);
      }
      toast.success('Superviseur SFD supprimé avec succès');
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
    superviseursSFD,
    superviseurSFD,
    superviseurActions,
    loading,
    error,
    fetchSuperviseursSFD,
    fetchSuperviseurSFDById,
    fetchSuperviseurSFDActions,
    createSuperviseurSFD,
    updateSuperviseurSFD,
    updateSuperviseurSFDPartial,
    deleteSuperviseurSFD,
  };
}