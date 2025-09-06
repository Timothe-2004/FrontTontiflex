import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { AdministrateurSFDAdmin, AdministrateurSFDFilters, PaginatedAdministrateurSFDAdminList, CreateAdministrateurSFDData, UpdateAdministrateurSFDData } from '../../types/admins-sfd';

interface useAdminsSFDResults {
  adminsSFD: AdministrateurSFDAdmin[];
  adminSFD: AdministrateurSFDAdmin | null;
  loading: boolean;
  error: string | null;

  // CRUD operations
  fetchAdminsSFD: (filters?: AdministrateurSFDFilters) => Promise<PaginatedAdministrateurSFDAdminList>;
  fetchAdminSFDById: (id: string) => Promise<AdministrateurSFDAdmin | null>;
  createAdminSFD: (adminData: CreateAdministrateurSFDData) => Promise<AdministrateurSFDAdmin>;
  updateAdminSFD: (id: string, adminData: UpdateAdministrateurSFDData) => Promise<AdministrateurSFDAdmin>;
  updateAdminSFDPartial: (id: string, adminData: Partial<UpdateAdministrateurSFDData>) => Promise<AdministrateurSFDAdmin>;
  deleteAdminSFD: (id: string) => Promise<boolean>;
}

export function useAdminsSFD(): useAdminsSFDResults {
  const [adminsSFD, setAdminsSFD] = useState<AdministrateurSFDAdmin[]>([]);
  const [adminSFD, setAdminSFD] = useState<AdministrateurSFDAdmin | null>(null);
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

  // Récupérer la liste des administrateurs SFD
  const fetchAdminsSFD = useCallback(async (filters: AdministrateurSFDFilters = {}): Promise<PaginatedAdministrateurSFDAdminList> => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const url = `${baseUrl}/admin/administrateurs-sfd/?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des administrateurs SFD');
      }
      
      const data: PaginatedAdministrateurSFDAdminList = await response.json();
      setAdminsSFD(data.results || []);
      console.log("administrateurs SFD", data.results);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement des administrateurs SFD');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Récupérer un administrateur SFD par ID
  const fetchAdminSFDById = async (id: string): Promise<AdministrateurSFDAdmin | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/admin/administrateurs-sfd/${id}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de l\'administrateur SFD');
      }
      
      const adminData = await response.json();
      setAdminSFD(adminData);
      return adminData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast.error('Erreur lors du chargement de l\'administrateur SFD');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer un administrateur SFD
  const createAdminSFD = async (adminData: CreateAdministrateurSFDData): Promise<AdministrateurSFDAdmin> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/admin/administrateurs-sfd/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création de l\'administrateur SFD';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 400) {
            errorMessage = 'Données invalides';
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

      const newAdmin = await response.json();
      setAdminsSFD(prev => [newAdmin, ...prev]);
      toast.success('Administrateur SFD créé avec succès');
      return newAdmin;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un administrateur SFD (PUT)
  const updateAdminSFD = async (id: string, adminData: UpdateAdministrateurSFDData): Promise<AdministrateurSFDAdmin> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/admin/administrateurs-sfd/${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la mise à jour de l\'administrateur SFD';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 403) {
            errorMessage = 'Permissions insuffisantes - Administrateur plateforme requis';
          } else if (response.status === 404) {
            errorMessage = 'Administrateur SFD introuvable';
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      const updatedAdmin = await response.json();
      setAdminsSFD(prev => 
        prev.map(admin => admin.email === updatedAdmin.email ? { ...admin, ...updatedAdmin } : admin)
      );
      setAdminSFD(updatedAdmin);
      toast.success('Administrateur SFD mis à jour avec succès');
      return updatedAdmin;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour partiellement un administrateur SFD (PATCH)
  const updateAdminSFDPartial = async (id: string, adminData: Partial<UpdateAdministrateurSFDData>): Promise<AdministrateurSFDAdmin> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/admin/administrateurs-sfd/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la mise à jour partielle de l\'administrateur SFD';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 403) {
            errorMessage = 'Permissions insuffisantes - Administrateur plateforme requis';
          } else if (response.status === 404) {
            errorMessage = 'Administrateur SFD introuvable';
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      const updatedAdmin = await response.json();
      setAdminsSFD(prev => 
        prev.map(admin => admin.email === updatedAdmin.email ? { ...admin, ...updatedAdmin } : admin)
      );
      setAdminSFD(updatedAdmin);
      toast.success('Administrateur SFD mis à jour avec succès');
      return updatedAdmin;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un administrateur SFD
  const deleteAdminSFD = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/admin/administrateurs-sfd/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        let errorMessage = 'Erreur lors de la suppression de l\'administrateur SFD';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 403) {
            errorMessage = 'Permissions insuffisantes - Administrateur plateforme requis';
          } else if (response.status === 404) {
            errorMessage = 'Administrateur SFD introuvable';
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      // Retirer de la liste locale par email (pas d'ID unique visible)
      setAdminsSFD(prev => prev.filter((_, index) => index.toString() !== id));
      if (adminSFD) {
        setAdminSFD(null);
      }
      toast.success('Administrateur SFD supprimé avec succès');
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
    adminsSFD,
    adminSFD,
    loading,
    error,
    fetchAdminsSFD,
    fetchAdminSFDById,
    createAdminSFD,
    updateAdminSFD,
    updateAdminSFDPartial,
    deleteAdminSFD,
  };
}