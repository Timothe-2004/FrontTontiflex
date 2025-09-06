import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AgentSFDAdmin, AgentSFDResponse, AgentActionsResponse, AgentsSFDFilters, StatistiquesDashboard, PaginatedAgentSFDResponseList, AgentAction, AgentSFDCreate } from '../types/agents-sfd';

interface ApiError {
  message: string;
  status?: number;
}

const API_BASE_URL = 'https://tontiflexapp.onrender.com/api';

// Hook principal pour la gestion des agents SFD
export const useAgentsSFDManagement = () => {
  // États pour les données
  const [agents, setAgents] = useState<PaginatedAgentSFDResponseList | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentSFDResponse | null>(null);
  const [agentActions, setAgentActions] = useState<AgentActionsResponse | null>(null);
  const [myActions, setMyActions] = useState<AgentActionsResponse | null>(null);
  const [searchResults, setSearchResults] = useState<AgentSFDResponse[] | null>(null);
  const [statistics, setStatistics] = useState<StatistiquesDashboard | null>(null);
  
  // États pour le chargement et les erreurs
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [actionError, setActionError] = useState<ApiError | null>(null);
  
  // États pour les filtres
  const [filters, setFilters] = useState<AgentsSFDFilters>({ page: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  
  const { accessToken } = useAuth();

  // Fonction pour charger la liste des agents
  const loadAgents = useCallback(async (customFilters?: AgentsSFDFilters) => {
    if (!accessToken) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const filtersToUse = customFilters || filters;
      const searchParams = new URLSearchParams();
      Object.entries(filtersToUse).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const url = `${API_BASE_URL}/admin/agents-sfd/?${searchParams.toString()}`;
      
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

      const data: PaginatedAgentSFDResponseList = await response.json();
      setAgents(data);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Erreur lors du chargement des agents SFD',
        status: err instanceof Error && 'status' in err ? (err as any).status : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, filters]);

  // Fonction pour charger un agent spécifique
  const loadAgent = useCallback(async (agentId: string) => {
    if (!accessToken || !agentId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/agents-sfd/${agentId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data: AgentSFDResponse = await response.json();
      setSelectedAgent(data);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Erreur lors du chargement de l\'agent',
        status: err instanceof Error && 'status' in err ? (err as any).status : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Fonction pour charger les actions d'un agent
  const loadAgentActions = useCallback(async (agentId: string) => {
    if (!accessToken || !agentId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/agents-sfd/${agentId}/actions/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data: AgentActionsResponse = await response.json();
      setAgentActions(data);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Erreur lors du chargement des actions',
        status: err instanceof Error && 'status' in err ? (err as any).status : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Fonction pour charger mes actions (agent connecté)
  const loadMyActions = useCallback(async () => {
    if (!accessToken) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/agents-sfd/me/actions/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data: AgentActionsResponse = await response.json();
      setMyActions(data);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Erreur lors du chargement de vos actions',
        status: err instanceof Error && 'status' in err ? (err as any).status : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Fonction pour créer un agent
  const createAgent = useCallback(async (data: AgentSFDCreate): Promise<AgentSFDResponse | null> => {
    if (!accessToken) {
      setActionError({ message: 'Token d\'accès manquant' });
      return null;
    }

    setIsActionLoading(true);
    setActionError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/agents-sfd/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 400) {
          throw new Error(errorData.detail || errorData.message || 'Erreur de validation');
        }
        throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
      }

      const agent: AgentSFDResponse = await response.json();
      
      // Rafraîchir la liste
      await loadAgents();
      
      return agent;
    } catch (err) {
      setActionError({
        message: err instanceof Error ? err.message : 'Erreur lors de la création de l\'agent',
        status: err instanceof Error && 'status' in err ? (err as any).status : undefined,
      });
      return null;
    } finally {
      setIsActionLoading(false);
    }
  }, [accessToken, loadAgents]);

  // Fonction pour mettre à jour un agent (PATCH)
  const updateAgent = useCallback(async (
    agentId: string, 
    data: Partial<AgentSFDAdmin>
  ): Promise<AgentSFDAdmin | null> => {
    if (!accessToken) {
      setActionError({ message: 'Token d\'accès manquant' });
      return null;
    }

    setIsActionLoading(true);
    setActionError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/agents-sfd/${agentId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
      }

      const agent: AgentSFDAdmin = await response.json();
      
      // Rafraîchir les données
      await loadAgents();
      if (selectedAgent?.agentId === agentId) {
        await loadAgent(agentId);
      }
      
      return agent;
    } catch (err) {
      setActionError({
        message: err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'agent',
        status: err instanceof Error && 'status' in err ? (err as any).status : undefined,
      });
      return null;
    } finally {
      setIsActionLoading(false);
    }
  }, [accessToken, loadAgents, loadAgent, selectedAgent]);

  // Fonction pour supprimer un agent
  const deleteAgent = useCallback(async (agentId: string): Promise<boolean> => {
    if (!accessToken) {
      setActionError({ message: 'Token d\'accès manquant' });
      return false;
    }

    setIsActionLoading(true);
    setActionError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/agents-sfd/${agentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
      }

      // Rafraîchir la liste
      await loadAgents();
      
      // Reset l'agent sélectionné si c'était celui supprimé
      if (selectedAgent?.agentId === agentId) {
        setSelectedAgent(null);
        setAgentActions(null);
      }

      return true;
    } catch (err) {
      setActionError({
        message: err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'agent',
        status: err instanceof Error && 'status' in err ? (err as any).status : undefined,
      });
      return false;
    } finally {
      setIsActionLoading(false);
    }
  }, [accessToken, loadAgents, selectedAgent]);

  // Fonction pour activer/désactiver un agent
  const toggleAgentStatus = useCallback(async (
    agentId: string, 
    currentStatus: boolean
  ): Promise<boolean> => {
    const result = await updateAgent(agentId, { est_actif: !currentStatus });
    return !!result;
  }, [updateAgent]);

  // Fonction de recherche
  const searchAgents = useCallback(async (query: string) => {
    if (!accessToken || !query.trim()) {
      setSearchResults(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        search: query.trim(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => 
            key !== 'search' && key !== 'page' && value !== undefined && value !== null
          )
        ),
      });

      const response = await fetch(`${API_BASE_URL}/admin/agents-sfd/?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data: PaginatedAgentSFDResponseList = await response.json();
      setSearchResults(data.results);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Erreur lors de la recherche',
        status: err instanceof Error && 'status' in err ? (err as any).status : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, filters]);

  // Fonction pour mettre à jour les filtres
  const updateFilters = useCallback((newFilters: Partial<AgentsSFDFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Fonction pour changer de page
  const changePage = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  // Fonction pour sélectionner un agent
  const selectAgent = useCallback(async (agentId: string) => {
    await loadAgent(agentId);
    await loadAgentActions(agentId);
  }, [loadAgent, loadAgentActions]);

  // Fonction pour nettoyer la recherche
  const clearSearch = useCallback(() => {
    setSearchResults(null);
    setSearchQuery('');
  }, []);

  // Fonction pour nettoyer les erreurs
  const clearError = useCallback(() => {
    setError(null);
    setActionError(null);
  }, []);

  // Chargement initial
  useEffect(() => {
    loadAgents();
    loadMyActions();
  }, [filters]); // Recharge quand les filtres changent

  // Gestion de la recherche
  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        searchAgents(searchQuery);
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timeoutId);
    } else {
      clearSearch();
    }
  }, [searchQuery, searchAgents, clearSearch]);

  return {
    // Données
    agents,
    selectedAgent,
    agentActions,
    myActions,
    searchResults,
    statistics,
    
    // États
    isLoading,
    isActionLoading,
    error,
    actionError,
    filters,
    searchQuery,
    
    // Actions CRUD
    createAgent,
    updateAgent,
    deleteAgent,
    toggleAgentStatus,
    
    // Actions de navigation/sélection
    selectAgent,
    loadAgent,
    loadAgentActions,
    
    // Actions de recherche et filtrage
    searchAgents,
    updateFilters,
    changePage,
    clearSearch,
    
    // Actions de chargement
    loadAgents,
    loadMyActions,
    
    // Utilitaires
    clearError,
    
    // Setters pour la recherche
    setSearchQuery,
    
    // Données calculées
    agentsToDisplay: searchResults || agents?.results || [],
    hasNextPage: !!agents?.next,
    hasPreviousPage: !!agents?.previous,
    currentPage: filters.page || 1,
    totalAgents: agents?.count || 0,
    
    // Méta-informations
    hasError: !!(error || actionError),
    isEmpty: !agents?.results?.length && !isLoading,
    isSearching: !!searchQuery.trim(),
  };
};