import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Types TypeScript basés sur l'API
export interface CarnetCotisation {
  id: number;
  client_nom: string;
  tontine_nom: string;
  mises_completees: number;
  cycle_debut: string; // Date format YYYY-MM-DD
  mises_cochees: boolean[]; // Array de 31 booleans (jour 1 à 31)
  date_creation: string;
  date_modification: string;
  client: string; // UUID
  tontine: string; // UUID
}

export interface CreateCarnetCotisationData {
  cycle_debut: string; // Date format YYYY-MM-DD
  mises_cochees: boolean[] | string; // Array de 31 booleans ou string
  client: string; // UUID
  tontine: string; // UUID
}

export interface UpdateCarnetCotisationData {
  cycle_debut?: string;
  mises_cochees?: boolean[] | string;
  client?: string;
  tontine?: string;
}

export interface CarnetEtat {
  carnet_actuel: CarnetCotisation;
  cycle_numero: number;
  jours_cotises: number;
  jours_manques: number;
  progression_pourcentage: number;
  prochains_jours: number[];
  historique_cycles: CarnetCotisation[];
  date_prochain_cycle: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface useCarnetsCotisationResults {
  carnets: CarnetCotisation[];
  carnetEtat: CarnetEtat | null;
  loading: boolean;
  error: string | null;

  // CRUD des carnets
  fetchCarnets: () => Promise<void>;
  fetchCarnetById: (id: number) => Promise<CarnetCotisation | null>;
  createCarnet: (carnetData: CreateCarnetCotisationData | FormData) => Promise<CarnetCotisation>;
  updateCarnet: (id: number, carnetData: UpdateCarnetCotisationData | FormData) => Promise<CarnetCotisation>;
  deleteCarnet: (id: number) => Promise<boolean>;

  // Consultation de l'état du carnet
  fetchCarnetEtat: (id: number) => Promise<CarnetEtat | null>;

  // Fonctions utilitaires
  calculerStatistiquesCarnet: (carnet: CarnetCotisation) => {
    joursPayes: number;
    joursRestants: number;
    pourcentageCompletion: number;
    premierJourLibre: number | null;
  };
  
  genererNouveauCarnet: (clientId: string, tontineId: string, dateDebut?: string) => CreateCarnetCotisationData;
  cocherMises: (carnet: CarnetCotisation, nombreMises: number) => boolean[];
}

export function useCarnetsCotisation(): useCarnetsCotisationResults {
  const [carnets, setCarnets] = useState<CarnetCotisation[]>([]);
  const [carnetEtat, setCarnetEtat] = useState<CarnetEtat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();
  const baseUrl = 'https://gep-api-fn92.onrender.com/api';

  const getAuthHeaders = (isFormData = false) => {
    const headers: HeadersInit = {
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    };
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  };

  // Récupérer la liste des carnets de cotisation
  const fetchCarnets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/carnets-cotisation/`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des carnets de cotisation');
      }
      
      const data: PaginatedResponse<CarnetCotisation> = await response.json();
      setCarnets(data.results || []);
      console.log("carnets de cotisation", data.results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Récupérer un carnet par ID
  const fetchCarnetById = async (id: number): Promise<CarnetCotisation | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/carnets-cotisation/${id}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du carnet de cotisation');
      }
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer un carnet de cotisation
  const createCarnet = async (carnetData: CreateCarnetCotisationData | FormData) => {
    setLoading(true);
    setError(null);
    try {
      const isFormData = carnetData instanceof FormData;
      
      // Si ce n'est pas FormData, s'assurer que mises_cochees est au bon format
      let processedData = carnetData;
      if (!isFormData && typeof carnetData === 'object') {
        processedData = {
          ...carnetData,
          mises_cochees: Array.isArray(carnetData.mises_cochees) 
            ? carnetData.mises_cochees 
            : Array(31).fill(false) // Carnet vide par défaut
        };
      }
      
      const response = await fetch(`${baseUrl}/carnets-cotisation/`, {
        method: 'POST',
        headers: getAuthHeaders(isFormData),
        body: isFormData ? carnetData : JSON.stringify(processedData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création du carnet de cotisation';
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

      const newCarnet = await response.json();
      setCarnets(prev => [newCarnet, ...prev]);
      return newCarnet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un carnet de cotisation
  const updateCarnet = async (id: number, carnetData: UpdateCarnetCotisationData | FormData) => {
    setLoading(true);
    setError(null);
    try {
      const isFormData = carnetData instanceof FormData;
      
      const response = await fetch(`${baseUrl}/carnets-cotisation/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(isFormData),
        body: isFormData ? carnetData : JSON.stringify(carnetData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du carnet de cotisation');
      }

      const updatedCarnet = await response.json();
      setCarnets(prev => 
        prev.map(carnet => carnet.id === id ? { ...carnet, ...updatedCarnet } : carnet)
      );
      return updatedCarnet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un carnet de cotisation
  const deleteCarnet = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/carnets-cotisation/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Erreur lors de la suppression du carnet de cotisation');
      }

      setCarnets(prev => prev.filter(carnet => carnet.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Consulter l'état du carnet de cotisation
  const fetchCarnetEtat = async (id: number): Promise<CarnetEtat | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/carnets-cotisation/${id}/carnet-cotisation/`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Accès refusé au carnet de cotisation');
        } else if (response.status === 404) {
          throw new Error('Participant introuvable');
        }
        throw new Error('Erreur lors du chargement de l\'état du carnet');
      }
      
      const etatData = await response.json();
      setCarnetEtat(etatData);
      return etatData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires

  // Calculer les statistiques d'un carnet
  const calculerStatistiquesCarnet = (carnet: CarnetCotisation) => {
    const joursPayes = carnet.mises_cochees.filter(Boolean).length;
    const joursRestants = 31 - joursPayes;
    const pourcentageCompletion = Math.round((joursPayes / 31) * 100);
    
    // Trouver le premier jour libre (première case false)
    const premierJourLibre = carnet.mises_cochees.findIndex(mise => !mise);
    
    return {
      joursPayes,
      joursRestants,
      pourcentageCompletion,
      premierJourLibre: premierJourLibre === -1 ? null : premierJourLibre + 1 // +1 car les jours commencent à 1
    };
  };

  // Générer un nouveau carnet vide
  const genererNouveauCarnet = (
    clientId: string, 
    tontineId: string, 
    dateDebut?: string
  ): CreateCarnetCotisationData => {
    const today = new Date();
    const cycleDebut = dateDebut || today.toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    return {
      cycle_debut: cycleDebut,
      mises_cochees: Array(31).fill(false), // 31 jours, tous à false au départ
      client: clientId,
      tontine: tontineId
    };
  };

  // Cocher des mises dans un carnet (pour simulation)
  const cocherMises = (carnet: CarnetCotisation, nombreMises: number): boolean[] => {
    const nouvellesMises = [...carnet.mises_cochees];
    let misesRestantes = nombreMises;
    
    // Cocher chronologiquement les premières cases disponibles
    for (let i = 0; i < 31 && misesRestantes > 0; i++) {
      if (!nouvellesMises[i]) {
        nouvellesMises[i] = true;
        misesRestantes--;
      }
    }
    
    return nouvellesMises;
  };

  return {
    carnets,
    carnetEtat,
    loading,
    error,
    fetchCarnets,
    fetchCarnetById,
    createCarnet,
    updateCarnet,
    deleteCarnet,
    fetchCarnetEtat,
    calculerStatistiquesCarnet,
    genererNouveauCarnet,
    cocherMises,
  };
}