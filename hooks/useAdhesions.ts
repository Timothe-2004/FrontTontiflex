import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Adhesion, AdhesionFilters, PaginatedAdhesionList, CreateAdhesionData, UpdateAdhesionData, UpdateAdhesionPartialData, ValidateAgentData, PayerData, RejectAdhesionData } from '../types/adhesions';

interface useAdhesionsResults {
  adhesions: Adhesion[];
  adhesion: Adhesion | null;
  loading: boolean;
  error: string | null;

  // CRUD operations
  fetchAdhesions: (filters?: AdhesionFilters) => Promise<PaginatedAdhesionList>;
  fetchAdhesionById: (id: string) => Promise<Adhesion | null>;
  createAdhesion: (adhesionData: CreateAdhesionData) => Promise<Adhesion>;
  updateAdhesion: (id: string, adhesionData: UpdateAdhesionData) => Promise<Adhesion>;
  updateAdhesionPartial: (id: string, adhesionData: UpdateAdhesionPartialData) => Promise<Adhesion>;
  deleteAdhesion: (id: string) => Promise<boolean>;

  // Workflow actions
  integrerClient: (id: string) => Promise<Adhesion>;
  payerFraisAdhesion: (id: string, payerData: PayerData) => Promise<Adhesion>;
  validerAgent: (id: string, validateData?: ValidateAgentData) => Promise<Adhesion>;
  rejectAdhesion: (id: string, rejectData?: RejectAdhesionData) => Promise<Adhesion>;
}

export function useAdhesions(): useAdhesionsResults {
  const [adhesions, setAdhesions] = useState<Adhesion[]>([]);
  const [adhesion, setAdhesion] = useState<Adhesion | null>(null);
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

  // Récupérer la liste des demandes d'adhésion
  const fetchAdhesions = useCallback(async (filters: AdhesionFilters = {}): Promise<PaginatedAdhesionList> => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const url = `${baseUrl}/adhesions/?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des demandes d\'adhésion');
      }
      
      const data: PaginatedAdhesionList = await response.json();
      setAdhesions(data.results || []);
      console.log("demandes d'adhésion", data.results);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Récupérer une demande d'adhésion par ID
  const fetchAdhesionById = async (id: string): Promise<Adhesion | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/adhesions/${id}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la demande d\'adhésion');
      }
      
      const adhesionData = await response.json();
      setAdhesion(adhesionData);
      return adhesionData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer une demande d'adhésion
  const createAdhesion = async (adhesionData: CreateAdhesionData): Promise<Adhesion> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('tontine', adhesionData.tontine);
      formData.append('montant_mise', adhesionData.montant_mise);
      
      if (adhesionData.document_identite) {
        formData.append('document_identite', adhesionData.document_identite);
      }

      const response = await fetch(`${baseUrl}/adhesions/`, {
        method: 'POST',
        headers: getAuthHeaders(true), // multipart/form-data
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création de la demande d\'adhésion';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 400) {
            errorMessage = 'Données invalides ou montant hors limites';
          } else if (response.status === 409) {
            errorMessage = 'Vous êtes déjà membre de cette tontine';
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

      const newAdhesion = await response.json();
      setAdhesions(prev => [newAdhesion, ...prev]);
      return newAdhesion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une demande d'adhésion (PUT)
  const updateAdhesion = async (id: string, adhesionData: UpdateAdhesionData): Promise<Adhesion> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      // Pour PUT, tontine et montant_mise sont requis selon l'API
      formData.append('tontine', adhesionData.tontine);
      formData.append('montant_mise', adhesionData.montant_mise);
      
      if (adhesionData.document_identite) {
        formData.append('document_identite', adhesionData.document_identite);
      }

      const response = await fetch(`${baseUrl}/adhesions/${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(true), // multipart/form-data
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la mise à jour de la demande d\'adhésion';
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

      const updatedAdhesion = await response.json();
      setAdhesions(prev => 
        prev.map(adhesion => adhesion.id === id ? { ...adhesion, ...updatedAdhesion } : adhesion)
      );
      setAdhesion(updatedAdhesion);
      return updatedAdhesion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour partiellement une demande d'adhésion (PATCH)
  const updateAdhesionPartial = async (id: string, adhesionData: UpdateAdhesionPartialData): Promise<Adhesion> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      if (adhesionData.tontine) {
        formData.append('tontine', adhesionData.tontine);
      }
      if (adhesionData.montant_mise) {
        formData.append('montant_mise', adhesionData.montant_mise);
      }
      if (adhesionData.document_identite) {
        formData.append('document_identite', adhesionData.document_identite);
      }

      const response = await fetch(`${baseUrl}/adhesions/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(true), // multipart/form-data
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour partielle de la demande d\'adhésion');
      }

      const updatedAdhesion = await response.json();
      setAdhesions(prev => 
        prev.map(adhesion => adhesion.id === id ? { ...adhesion, ...updatedAdhesion } : adhesion)
      );
      setAdhesion(updatedAdhesion);
      return updatedAdhesion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une demande d'adhésion
  const deleteAdhesion = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/adhesions/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Erreur lors de la suppression de la demande d\'adhésion');
      }

      setAdhesions(prev => prev.filter(adhesion => adhesion.id !== id));
      if (adhesion?.id === id) {
        setAdhesion(null);
      }
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Intégrer le client dans la tontine
  const integrerClient = async (id: string): Promise<Adhesion> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/adhesions/${id}/integrer/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de l\'intégration';
        if (response.status === 400) {
          errorMessage = 'Intégration impossible - conditions non remplies';
        } else if (response.status === 409) {
          errorMessage = 'Client déjà intégré ou tontine complète';
        }
        throw new Error(errorMessage);
      }

      const updatedAdhesion = await response.json();
      setAdhesions(prev => 
        prev.map(adhesion => adhesion.id === id ? { ...adhesion, ...updatedAdhesion } : adhesion)
      );
      setAdhesion(updatedAdhesion);
      return updatedAdhesion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Payer les frais d'adhésion via Mobile Money
  const payerFraisAdhesion = async (id: string, payerData: PayerData): Promise<Adhesion> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('numero_telephone', payerData.numero_telephone);

      const response = await fetch(`${baseUrl}/adhesions/${id}/payer/`, {
        method: 'POST',
        headers: getAuthHeaders(true), // multipart/form-data
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors du paiement';
        if (response.status === 400) {
          errorMessage = 'Erreur de paiement ou demande non validée';
        } else if (response.status === 402) {
          errorMessage = 'Solde Mobile Money insuffisant';
        } else if (response.status === 503) {
          errorMessage = 'Service Mobile Money temporairement indisponible';
        }
        throw new Error(errorMessage);
      }

      const updatedAdhesion = await response.json();
      setAdhesions(prev => 
        prev.map(adhesion => adhesion.id === id ? { ...adhesion, ...updatedAdhesion } : adhesion)
      );
      setAdhesion(updatedAdhesion);
      return updatedAdhesion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  

  // Rejeter une demande d'adhésion (Agent SFD)
  const rejectAdhesion = async (id: string, ): Promise<Adhesion> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/adhesions/${id}/reject/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors du rejet de la demande';
        if (response.status === 403) {
          errorMessage = 'Action non autorisée';
        } else if (response.status === 404) {
          errorMessage = 'Demande d\'adhésion introuvable';
        } else if (response.status === 409) {
          errorMessage = 'La demande ne peut pas être rejetée dans son état actuel';
        }
        throw new Error(errorMessage);
      }

      const updatedAdhesion = await response.json();
      setAdhesions(prev => 
        prev.map(adhesion => adhesion.id === id ? { ...adhesion, ...updatedAdhesion } : adhesion)
      );
      setAdhesion(updatedAdhesion);
      return updatedAdhesion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Valider une demande d'adhésion (Agent SFD)
  const validerAgent = async (id: string, validateData: ValidateAgentData = {}): Promise<Adhesion> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      if (validateData.commentaires) {
        formData.append('commentaires', validateData.commentaires);
      }

      const response = await fetch(`${baseUrl}/adhesions/${id}/valider-et-payer/`, {
        method: 'POST',
        headers: getAuthHeaders(true), // multipart/form-data
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la validation';
        if (response.status === 400) {
          errorMessage = 'Données de validation invalides';
        } else if (response.status === 403) {
          errorMessage = 'Agent non autorisé pour cette SFD';
        } else if (response.status === 404) {
          errorMessage = 'Demande d\'adhésion introuvable';
        }
        throw new Error(errorMessage);
      }

      const updatedAdhesion = await response.json();
      setAdhesions(prev => 
        prev.map(adhesion => adhesion.id === id ? { ...adhesion, ...updatedAdhesion } : adhesion)
      );
      setAdhesion(updatedAdhesion);
      return updatedAdhesion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    adhesions,
    adhesion,
    loading,
    error,
    fetchAdhesions,
    fetchAdhesionById,
    createAdhesion,
    updateAdhesion,
    updateAdhesionPartial,
    deleteAdhesion,
    integrerClient,
    payerFraisAdhesion,
    validerAgent,
    rejectAdhesion,
  };
}