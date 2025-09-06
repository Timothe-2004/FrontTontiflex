import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

// Types TypeScript basés sur l'API
export interface AdminPlateformeAdmin {
  id: string;
  nom: string; // maxLength: 100
  prenom: string; // maxLength: 100
  telephone: string; // pattern: ^\+?1?\d{9,15}$, maxLength: 15
  email: string; // email, maxLength: 254
  adresse: string;
  profession: string; // maxLength: 100
  peut_gerer_comptes: boolean; // Peut créer, suspendre, supprimer les comptes clients, agents, admins SFD, superviseurs
  peut_gerer_sfd: boolean; // Peut ajouter, supprimer, suspendre des SFD
  est_actif: boolean; // Indique si l'admin plateforme est actuellement actif
}

export interface CreateAdminPlateformeData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string; // Requis uniquement pour la création
  adresse: string;
  profession: string;
}

export interface UpdateAdminPlateformeData {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  motDePasse?: string;
  adresse?: string;
  profession?: string;
  peut_gerer_comptes?: boolean;
  peut_gerer_sfd?: boolean;
  est_actif?: boolean;
}

export interface PaginatedAdminPlateformeAdminList {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminPlateformeAdmin[];
}

export interface AdminPlateformeFilters {
  page?: number;
  search?: string;
  est_actif?: boolean;
  peut_gerer_comptes?: boolean;
  peut_gerer_sfd?: boolean;
}

interface useAdminsPlateformeResults {
  adminsplateforme: AdminPlateformeAdmin[];
  adminplateforme: AdminPlateformeAdmin | null;
  loading: boolean;
  error: string | null;

  // CRUD operations
  fetchAdminsPlateforme: (filters?: AdminPlateformeFilters) => Promise<PaginatedAdminPlateformeAdminList>;
  fetchAdminPlateformeById: (id: string) => Promise<AdminPlateformeAdmin | null>;
  createAdminPlateforme: (adminData: CreateAdminPlateformeData) => Promise<AdminPlateformeAdmin>;
  updateAdminPlateforme: (id: string, adminData: UpdateAdminPlateformeData) => Promise<AdminPlateformeAdmin>;
  updateAdminPlateformePartial: (id: string, adminData: Partial<UpdateAdminPlateformeData>) => Promise<AdminPlateformeAdmin>;
  deleteAdminPlateforme: (id: string) => Promise<boolean>;
}

export function useAdminsPlateforme(): useAdminsPlateformeResults {
  const [adminsplateforme, setAdminsPlateforme] = useState<AdminPlateformeAdmin[]>([]);
  const [adminplateforme, setAdminPlateforme] = useState<AdminPlateformeAdmin | null>(null);
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

  // Récupérer la liste des administrateurs plateforme
  const fetchAdminsPlateforme = useCallback(async (filters: AdminPlateformeFilters = {}): Promise<PaginatedAdminPlateformeAdminList> => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const url = `${baseUrl}/admin/admins-plateforme/?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des administrateurs plateforme');
      }
      
      const data: PaginatedAdminPlateformeAdminList = await response.json();
      setAdminsPlateforme(data.results || []);
      console.log("administrateurs plateforme", data.results);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement des administrateurs plateforme');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Récupérer un administrateur plateforme par ID
  const fetchAdminPlateformeById = async (id: string): Promise<AdminPlateformeAdmin | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/admin/admins-plateforme/${id}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de l\'administrateur plateforme');
      }
      
      const adminData = await response.json();
      setAdminPlateforme(adminData);
      return adminData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast.error('Erreur lors du chargement de l\'administrateur plateforme');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer un administrateur plateforme
  // Dans useAdminsPlateforme.ts - Fonction createAdminPlateforme avec debugging

const createAdminPlateforme = async (adminData: CreateAdminPlateformeData): Promise<AdminPlateformeAdmin> => {
  setLoading(true);
  setError(null);
  
  try {
    // 🔍 DEBUGGING - Validation des données avant envoi
    console.group('🚀 DEBUG: Création Admin Plateforme');
    console.log('📤 URL:', `${baseUrl}/admin/admins-plateforme/`);
    console.log('📤 Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'MANQUANT');
    console.log('📤 Headers:', getAuthHeaders());
    console.log('📤 Raw adminData:', adminData);
    
    // Validation des champs requis
    const requiredFields = ['nom', 'prenom', 'email', 'telephone', 'motDePasse', 'adresse', 'profession'];
    const missingFields = requiredFields.filter(field => !adminData[field as keyof CreateAdminPlateformeData]?.trim());
    
    if (missingFields.length > 0) {
      console.error('❌ Champs manquants:', missingFields);
      throw new Error(`Champs requis manquants: ${missingFields.join(', ')}`);
    }
    
    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminData.email)) {
      console.error('❌ Email invalide:', adminData.email);
      throw new Error('Format email invalide');
    }
    
    // Validation format téléphone (selon le pattern de l'API: ^\+?1?\d{9,15}$)
    const phoneRegex = /^\+?1?\d{9,15}$/;
    if (!phoneRegex.test(adminData.telephone)) {
      console.error('❌ Téléphone invalide:', adminData.telephone);
      console.log('📋 Pattern attendu: ^\\+?1?\\d{9,15}$');
      throw new Error(`Format téléphone invalide. Pattern attendu: +229xxxxxxxxx ou 229xxxxxxxxx`);
    }
    
    // Validation longueurs maximales
    const maxLengths = {
      nom: 100,
      prenom: 100,
      telephone: 15,
      email: 254,
      profession: 100
    };
    
    for (const [field, maxLength] of Object.entries(maxLengths)) {
      const value = adminData[field as keyof CreateAdminPlateformeData] as string;
      if (value && value.length > maxLength) {
        console.error(`❌ ${field} trop long:`, value.length, '>', maxLength);
        throw new Error(`${field} dépasse la longueur maximale (${maxLength} caractères)`);
      }
    }
    
    // Nettoyage des données (trim des espaces)
    const cleanedData = {
      nom: adminData.nom.trim(),
      prenom: adminData.prenom.trim(),
      email: adminData.email.trim().toLowerCase(),
      telephone: adminData.telephone.trim(),
      motDePasse: adminData.motDePasse.trim(),
      adresse: adminData.adresse.trim(),
      profession: adminData.profession.trim(),
    };
    
    console.log('📤 Cleaned Data:', cleanedData);
    console.log('📤 JSON Body:', JSON.stringify(cleanedData, null, 2));
    
    const response = await fetch(`${baseUrl}/admin/admins-plateforme/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(cleanedData),
    });

    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Status Text:', response.statusText);
    console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));

    // Lire la réponse une seule fois
    const responseText = await response.text();
    console.log('📥 Raw Response Body:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
        console.log('📥 Parsed Error Data:', errorData);
      } catch (parseError) {
        console.error('❌ Erreur parsing réponse:', parseError);
        errorData = { detail: responseText };
      }

      let errorMessage = 'Erreur lors de la création de l\'administrateur plateforme';
      
      if (response.status === 400) {
        console.error('❌ Bad Request (400):', errorData);
        if (typeof errorData === 'object' && errorData !== null) {
          const validationErrors = Object.entries(errorData)
            .map(([field, errors]) => {
              const errorArray = Array.isArray(errors) ? errors : [errors];
              return `${field}: ${errorArray.join(', ')}`;
            })
            .join('\n');
          if (validationErrors) {
            errorMessage = `Erreurs de validation:\n${validationErrors}`;
          }
        }
      } else if (response.status === 403) {
        errorMessage = 'Permissions insuffisantes - Super admin requis';
        console.error('❌ Forbidden (403): Vérifiez vos permissions');
      } else if (response.status === 401) {
        errorMessage = 'Token d\'authentification invalide ou expiré';
        console.error('❌ Unauthorized (401): Token invalide');
      } else {
        errorMessage = errorData?.detail || `Erreur HTTP ${response.status}: ${response.statusText}`;
      }
      
      console.groupEnd();
      throw new Error(errorMessage);
    }

    let newAdmin;
    try {
      newAdmin = JSON.parse(responseText);
      console.log('✅ Admin créé avec succès:', newAdmin);
    } catch (parseError) {
      console.error('❌ Erreur parsing réponse succès:', parseError);
      throw new Error('Erreur lors du traitement de la réponse du serveur');
    }

    setAdminsPlateforme(prev => [newAdmin, ...prev]);
    toast.success('Administrateur plateforme créé avec succès');
    
    console.groupEnd();
    return newAdmin;
    
  } catch (err) {
    console.error('❌ Erreur complète:', err);
    console.groupEnd();
    
    const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
    setError(errorMessage);
    toast.error(errorMessage);
    throw err;
  } finally {
    setLoading(false);
  }
};

  // Mettre à jour un administrateur plateforme (PUT)
  const updateAdminPlateforme = async (id: string, adminData: UpdateAdminPlateformeData): Promise<AdminPlateformeAdmin> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/admin/admins-plateforme/${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la mise à jour de l\'administrateur plateforme';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 403) {
            errorMessage = 'Permissions insuffisantes - Super admin requis';
          } else if (response.status === 404) {
            errorMessage = 'Administrateur plateforme introuvable';
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      const updatedAdmin = await response.json();
      setAdminsPlateforme(prev => 
        prev.map(admin => admin.email === updatedAdmin.email ? { ...admin, ...updatedAdmin } : admin)
      );
      setAdminPlateforme(updatedAdmin);
      toast.success('Administrateur plateforme mis à jour avec succès');
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

  // Mettre à jour partiellement un administrateur plateforme (PATCH)
  const updateAdminPlateformePartial = async (id: string, adminData: Partial<UpdateAdminPlateformeData>): Promise<AdminPlateformeAdmin> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/admin/admins-plateforme/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la mise à jour partielle de l\'administrateur plateforme';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 403) {
            errorMessage = 'Permissions insuffisantes - Super admin requis';
          } else if (response.status === 404) {
            errorMessage = 'Administrateur plateforme introuvable';
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      const updatedAdmin = await response.json();
      setAdminsPlateforme(prev => 
        prev.map(admin => admin.email === updatedAdmin.email ? { ...admin, ...updatedAdmin } : admin)
      );
      setAdminPlateforme(updatedAdmin);
      toast.success('Administrateur plateforme mis à jour avec succès');
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

  // Supprimer un administrateur plateforme
  const deleteAdminPlateforme = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/admin/admins-plateforme/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        let errorMessage = 'Erreur lors de la suppression de l\'administrateur plateforme';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 403) {
            errorMessage = 'Permissions insuffisantes - Super admin requis';
          } else if (response.status === 404) {
            errorMessage = 'Administrateur plateforme introuvable';
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      // Retirer de la liste locale par email (pas d'ID unique visible)
      setAdminsPlateforme(prev => prev.filter((_, index) => index.toString() !== id));
      if (adminplateforme) {
        setAdminPlateforme(null);
      }
      toast.success('Administrateur plateforme supprimé avec succès');
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
    adminsplateforme,
    adminplateforme,
    loading,
    error,
    fetchAdminsPlateforme,
    fetchAdminPlateformeById,
    createAdminPlateforme,
    updateAdminPlateforme,
    updateAdminPlateformePartial,
    deleteAdminPlateforme,
  };
}