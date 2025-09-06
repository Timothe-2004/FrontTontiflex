import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoanApplication, LoanApplicationFilters, PaginatedLoanApplicationList, CreateLoanApplicationData, UpdateLoanApplicationData, AdminDecisionData, SupervisorProcessData, LoanApplicationResponse, RapportDemande } from '../types/loans-applications';
import { CompleterRapportData } from '../types/loans-applications';
import { toast } from 'sonner';

interface useLoansApplicationsResults {
  applications: LoanApplication[];
  application: LoanApplication | null;
  loading: boolean;
  error: string | null;

  // CRUD operations
  fetchApplications: (filters?: LoanApplicationFilters) => Promise<PaginatedLoanApplicationList>;
  fetchApplicationById: (id: string) => Promise<LoanApplication | null>;
  createApplication: (applicationData: CreateLoanApplicationData) => Promise<LoanApplication>;
  updateApplication: (id: string, applicationData: UpdateLoanApplicationData) => Promise<LoanApplication>;
  updateApplicationPartial: (id: string, applicationData: Partial<UpdateLoanApplicationData>) => Promise<LoanApplication>;
  deleteApplication: (id: string) => Promise<boolean>;

  // Specialized operations
  processApplication: (id: string, processData: SupervisorProcessData) => Promise<LoanApplicationResponse>;
  adminDecision: (id: string, decisionData: AdminDecisionData) => Promise<LoanApplicationResponse>;
  fetchRapportAnalyse: (id: string) => Promise<RapportDemande>;
  // 🆕 Nouveau endpoint
  completerRapport: (id: string, rapportData: CompleterRapportData) => Promise<LoanApplication>;
}

export function useLoansApplications(): useLoansApplicationsResults {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [application, setApplication] = useState<LoanApplication | null>(null);
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

  // Récupérer la liste des demandes de prêt
  const fetchApplications = useCallback(async (filters: LoanApplicationFilters = {}): Promise<PaginatedLoanApplicationList> => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const url = `${baseUrl}/applications/?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des demandes de prêt');
      }
      
      const data: PaginatedLoanApplicationList = await response.json();
      setApplications(data.results || []);
      console.log("Demandes de prêt chargées:", data.results);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Récupérer une demande par ID
  const fetchApplicationById = async (id: string): Promise<LoanApplication | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/applications/${id}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la demande');
      }
      
      const applicationData = await response.json();
      setApplication(applicationData);
      return applicationData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer une demande de prêt
  const createApplication = async (applicationData: CreateLoanApplicationData): Promise<LoanApplication> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      // Ajouter tous les champs au FormData
      Object.entries(applicationData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${baseUrl}/applications/`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: formData,
      });


      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création de la demande';
        
        try {
          const errorData = await response.json();
      
          if (errorData.detail) {
            errorMessage = errorData.detail;
      
          } else if (typeof errorData === 'object') {
            const validationErrors = Object.entries(errorData)
              .map(([field, errors]) => {
                const formattedErrors = Array.isArray(errors) ? errors.join(', ') : errors;
                return `${field}: ${formattedErrors}`;
              })
              .join('\n');
      
            if (validationErrors) {
              errorMessage = `Erreurs de validation :\n${validationErrors}`;
            }
          }
        } catch (e) {
          console.error("Erreur lors de l'analyse de la réponse d'erreur :", e);
        }
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      

      const newApplication = await response.json();
      setApplications(prev => [newApplication, ...prev]);
      return newApplication;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une demande (PUT)
  const updateApplication = async (id: string, applicationData: UpdateLoanApplicationData): Promise<LoanApplication> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      Object.entries(applicationData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${baseUrl}/applications/${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la demande');
      }

      const updatedApplication = await response.json();
      setApplications(prev => 
        prev.map(app => app.id === id ? { ...app, ...updatedApplication } : app)
      );
      setApplication(updatedApplication);
      return updatedApplication;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour partiellement une demande (PATCH)
  const updateApplicationPartial = async (id: string, applicationData: Partial<UpdateLoanApplicationData>): Promise<LoanApplication> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      Object.entries(applicationData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${baseUrl}/applications/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(true),
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour partielle de la demande');
      }

      const updatedApplication = await response.json();
      setApplications(prev => 
        prev.map(app => app.id === id ? { ...app, ...updatedApplication } : app)
      );
      setApplication(updatedApplication);
      return updatedApplication;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une demande
  const deleteApplication = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/applications/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Erreur lors de la suppression de la demande');
      }

      setApplications(prev => prev.filter(app => app.id !== id));
      if (application?.id === id) {
        setApplication(null);
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

  // Traiter une demande (Superviseur SFD) - 🔄 Mis à jour pour JSON
  const processApplication = async (id: string, processData: SupervisorProcessData): Promise<LoanApplicationResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/applications/${id}/process-application/`, {
        method: 'POST',
        headers: getAuthHeaders(), // JSON Content-Type
        body: JSON.stringify(processData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors du traitement de la demande';
        
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (typeof errorData === 'object') {
            // Gérer les erreurs de validation
            const validationErrors = Object.entries(errorData)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('\n');
            if (validationErrors) {
              errorMessage = `Erreurs de validation :\n${validationErrors}`;
              toast.error(errorMessage);
            }
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
          // Garder les messages par défaut basés sur le status
          if (response.status === 400) {
            errorMessage = 'Erreur de validation ou demande non traitable';
          } else if (response.status === 403) {
            errorMessage = 'Permissions insuffisantes';
          } else if (response.status === 404) {
            errorMessage = 'Demande introuvable';
          }
        }
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      toast.success('Demande traitée avec succès');
      // Mettre à jour la demande dans la liste
      if (result.demande) {
        setApplications(prev => 
          prev.map(app => app.id === id ? { ...app, ...result.demande } : app)
        );
        if (application?.id === id) {
          setApplication(result.demande);
        }
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Compléter le rapport d'analyse par le superviseur
  const completerRapport = async (id: string, rapportData: CompleterRapportData): Promise<LoanApplication> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('rapport_superviseur', rapportData.rapport_superviseur);

      const response = await fetch(`${baseUrl}/applications/${id}/completer-rapport/`, {
        method: 'POST',
        headers: getAuthHeaders(true), // multipart/form-data
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la completion du rapport';
        if (response.status === 400) {
          errorMessage = 'Données invalides ou rapport déjà complété';
        } else if (response.status === 403) {
          errorMessage = 'Permissions insuffisantes pour compléter ce rapport';
        } else if (response.status === 404) {
          errorMessage = 'Demande introuvable';
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

      const updatedApplication = await response.json();
      
      // Mettre à jour la demande dans la liste et l'état local
      setApplications(prev => 
        prev.map(app => app.id === id ? { ...app, ...updatedApplication } : app)
      );
      
      if (application?.id === id) {
        setApplication(updatedApplication);
      }
      
      return updatedApplication;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Décision finale Admin SFD
  const adminDecision = async (id: string, decisionData: AdminDecisionData): Promise<LoanApplicationResponse> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      Object.entries(decisionData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await fetch(`${baseUrl}/applications/${id}/admin-decision/`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la validation finale';
        if (response.status === 400) {
          errorMessage = 'Erreur de validation ou fonds insuffisants';
        } else if (response.status === 403) {
          errorMessage = 'Permissions insuffisantes';
        } else if (response.status === 404) {
          errorMessage = 'Demande non transférée';
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Mettre à jour la demande dans la liste
      if (result.demande) {
        setApplications(prev => 
          prev.map(app => app.id === id ? { ...app, ...result.demande } : app)
        );
        if (application?.id === id) {
          setApplication(result.demande);
        }
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer le rapport d'analyse détaillé
  const fetchRapportAnalyse = async (id: string): Promise<RapportDemande> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/applications/${id}/rapport-analyse/`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Non autorisé à consulter ce rapport');
        } else if (response.status === 404) {
          throw new Error('Demande non trouvée');
        } else if (response.status === 500) {
          throw new Error('Erreur génération rapport');
        }
        throw new Error('Erreur lors du chargement du rapport d\'analyse');
      }
      
      const data: RapportDemande = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    applications,
    application,
    loading,
    error,
    fetchApplications,
    fetchApplicationById,
    createApplication,
    updateApplication,
    updateApplicationPartial,
    deleteApplication,
    processApplication,
    adminDecision,
    fetchRapportAnalyse,
    completerRapport,
  };
}