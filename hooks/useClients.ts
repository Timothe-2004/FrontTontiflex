
'use client'
import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Types TypeScript basés sur l'API des clients
export type ClientStatus = 'actif' | 'inactif' | 'suspendu';

export type TransactionType = 
  | 'adhesion_tontine'
  | 'cotisation_tontine' 
  | 'retrait_tontine'
  | 'frais_creation_epargne'
  | 'depot_epargne'
  | 'retrait_epargne'
  | 'remboursement_pret'
  | 'autre';

export type TransactionStatus = 
  | 'success'
  | 'pending' 
  | 'failed'
  | 'initialized'
  | string; // Pour couvrir d'autres statuts possibles

export type RetraitStatus = 'en_attente' | 'valide' | 'traite' | 'rejete';
export type RetraitType = 'partiel' | 'fin_cycle' | 'urgence' | 'distribution';

export type TontineParticipationStatus = 'actif' | 'suspendu' | 'en_attente' | 'termine';

export interface Client {
  id: string; // UUID, readOnly
  tontines_count: string; // readOnly
  nom: string; // maxLength: 100
  prenom: string; // maxLength: 100
  telephone: string; // pattern: ^\+?1?\d{9,15}$, maxLength: 15
  email: string; // email, maxLength: 254
  adresse: string;
  profession: string; // maxLength: 100
  motDePasse: string; // maxLength: 128, hashé
  dateCreation?: string; // datetime
  statut?: ClientStatus;
  derniere_connexion?: string | null; // datetime, nullable
  email_verifie: boolean;
  pieceIdentite?: string | null; // URI, nullable, pattern: (?:pdf|jpg|jpeg|png)$
  photoIdentite?: string | null; // URI, nullable, pattern: (?:jpg|jpeg|png)$
  scorefiabilite: string; // decimal, pattern: ^-?\d{0,3}(?:\.\d{0,2})?$
  user?: number | null; // nullable
}

export interface ClientCotisation {
  id: number;
  montant: string;
  date_cotisation: string;
  numero_transaction: string;
  statut: 'pending' | 'confirmee' | 'rejetee';
  tontine_nom: string;
  cycle_numero: number;
  jour_carnet?: number | null;
  est_commission_sfd: boolean;
  cycle_display: string;
  type_cotisation: string;
  transaction_kkiapay?: string | null;
}

export interface ClientRetrait {
  id: number;
  montant_demande: string;
  montant_recu?: string;
  date_demande: string;
  date_traitement?: string;
  statut: RetraitStatus;
  type_retrait: RetraitType;
  tontine_nom: string;
  agent_validateur?: string;
  motif_rejet?: string;
  frais_traitement?: string;
  justification?: string;
}

export interface ClientTontine {
  id: string;
  nom: string;
  description: string;
  sfd_gestionnaire: string;
  administrateur: string;
  montant_cotisation: string;
  nombre_participants: number;
  cycle_actuel: number;
  progression: number; // pourcentage
  statut_participation: TontineParticipationStatus;
  position_distribution: number;
  prochaine_date_reception?: string;
  solde_accumule: string;
  nombre_cotisations_effectuees: number;
  taux_ponctualite: number;
  montant_total_cotise: string;
  prochaines_echeances: string[];
  distributions_recues: number;
}

export interface KKiaPayTransaction {
  id: string; // UUID
  reference: string; // Référence TontiFlex
  type: TransactionType;
  type_libelle: string;
  montant: number;
  devise: string; // XOF
  statut: TransactionStatus;
  statut_libelle: string;
  date_creation: string; // datetime
  date_traitement?: string | null; // datetime, nullable
  description: string;
  numero_telephone: string;
  reference_kkiapay: string;
  success: boolean;
  pending: boolean;
  failed: boolean;
}

export interface ClientCotisationsStats {
  total_cotisations: string;
  moyenne_mensuelle: string;
  jours_ponctualite: number;
  bonus_appliques: string;
  penalites_appliquees: string;
}

export interface ClientRetraitsStats {
  total_retraits: string;
  delai_moyen_traitement: number;
  taux_approbation: number;
  solde_disponible: string;
}

export interface PaginatedClientList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Client[];
}

export interface ClientsFilters {
  page?: number;
  sfd_id?: string;
  statut?: ClientStatus;
  date_inscription_debut?: string;
  date_inscription_fin?: string;
  search?: string; // recherche textuelle (nom, email, téléphone)
}

interface useClientsAPIResults {
  clients: Client[];
  client: Client | null;
  clientCotisations: ClientCotisation[];
  clientRetraits: ClientRetrait[];
  clientTontines: ClientTontine[];
  myTransactionHistory: KKiaPayTransaction[];
  cotisationsStats: ClientCotisationsStats | null;
  retraitsStats: ClientRetraitsStats | null;
  loading: boolean;
  error: string | null;

  // Clients operations
  fetchClients: (filters?: ClientsFilters) => Promise<PaginatedClientList>;
  fetchClientById: (id: string) => Promise<Client | null>;

  // Client specific data
  fetchClientCotisations: (id: string) => Promise<{
    cotisations: ClientCotisation[];
    stats?: ClientCotisationsStats;
  }>;
  fetchClientRetraits: (id: string) => Promise<{
    retraits: ClientRetrait[];
    stats?: ClientRetraitsStats;
  }>;
  fetchClientTontines: (id: string) => Promise<ClientTontine[]>;

  // My transactions (for connected client)
  fetchMyTransactionHistory: () => Promise<KKiaPayTransaction[]>;
}

export function useClientsAPI(): useClientsAPIResults {
  const [clients, setClients] = useState<Client[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [clientCotisations, setClientCotisations] = useState<ClientCotisation[]>([]);
  const [clientRetraits, setClientRetraits] = useState<ClientRetrait[]>([]);
  const [clientTontines, setClientTontines] = useState<ClientTontine[]>([]);
  const [myTransactionHistory, setMyTransactionHistory] = useState<KKiaPayTransaction[]>([]);
  const [cotisationsStats, setCotisationsStats] = useState<ClientCotisationsStats | null>(null);
  const [retraitsStats, setRetraitsStats] = useState<ClientRetraitsStats | null>(null);
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

  // Récupérer la liste des clients
  const fetchClients = useCallback(async (filters: ClientsFilters = {}): Promise<PaginatedClientList> => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const url = `${baseUrl}/accounts/clients/?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des clients');
      }
      
      const data: PaginatedClientList = await response.json();
      setClients(data.results || []);
      console.log("clients", data.results);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
        throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Récupérer un client par ID
  const fetchClientById = async (id: string): Promise<Client | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/accounts/clients/${id}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Accès refusé à ce profil');
        }
        if (response.status === 404) {
          throw new Error('Client introuvable');
        }
        throw new Error('Erreur lors du chargement du client');
      }
      
      const clientData = await response.json();
      setClient(clientData);
      return clientData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer l'historique des cotisations d'un client
  const fetchClientCotisations = async (id: string): Promise<{
    cotisations: ClientCotisation[];
    stats?: ClientCotisationsStats;
  }> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/accounts/clients/${id}/cotisations/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Accès refusé à cet historique');
        }
        if (response.status === 404) {
          throw new Error('Client introuvable');
        }
        throw new Error('Erreur lors du chargement des cotisations');
      }
      
      const data = await response.json();
      
      // La réponse peut être un array direct ou un objet avec cotisations et stats
      let cotisations: ClientCotisation[] = [];
      let stats: ClientCotisationsStats | undefined;
      
      if (Array.isArray(data)) {
        cotisations = data;
      } else if (data.cotisations) {
        cotisations = data.cotisations;
        stats = data.stats;
      } else {
        // Si c'est un objet mais pas la structure attendue, essayer de l'utiliser directement
        cotisations = data;
      }
      
      setClientCotisations(cotisations);
      if (stats) {
        setCotisationsStats(stats);
      }
      
      return { cotisations, stats };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer l'historique des retraits d'un client
  const fetchClientRetraits = async (id: string): Promise<{
    retraits: ClientRetrait[];
    stats?: ClientRetraitsStats;
  }> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/accounts/clients/${id}/retraits/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Accès refusé à cet historique');
        }
        if (response.status === 404) {
          throw new Error('Client introuvable');
        }
        throw new Error('Erreur lors du chargement des retraits');
      }
      
      const data = await response.json();
      
      // La réponse peut être un array direct ou un objet avec retraits et stats
      let retraits: ClientRetrait[] = [];
      let stats: ClientRetraitsStats | undefined;
      
      if (Array.isArray(data)) {
        retraits = data;
      } else if (data.retraits) {
        retraits = data.retraits;
        stats = data.stats;
      } else {
        // Si c'est un objet mais pas la structure attendue, essayer de l'utiliser directement
        retraits = data;
      }
      
      setClientRetraits(retraits);
      if (stats) {
        setRetraitsStats(stats);
      }
      
      return { retraits, stats };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les tontines d'un client
  const fetchClientTontines = async (id: string): Promise<ClientTontine[]> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/accounts/clients/${id}/tontines/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Accès refusé à ces informations');
        }
        if (response.status === 404) {
          throw new Error('Client introuvable');
        }
        throw new Error('Erreur lors du chargement des tontines');
      }
      
      const tontines: ClientTontine[] = await response.json();
      setClientTontines(tontines);
      return tontines;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer l'historique complet des transactions KKiaPay du client connecté
  const fetchMyTransactionHistory = async (): Promise<KKiaPayTransaction[]> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/clients/my-histories/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Accès refusé - seuls les clients peuvent accéder');
        }
        if (response.status === 404) {
          throw new Error('Client introuvable');
        }
        throw new Error('Erreur lors du chargement de l\'historique des transactions');
      }
      
      const transactions: KKiaPayTransaction[] = await response.json();
      setMyTransactionHistory(transactions);
      console.log("historique transactions KKiaPay", transactions);
      return transactions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    clients,
    client,
    clientCotisations,
    clientRetraits,
    clientTontines,
    myTransactionHistory,
    cotisationsStats,
    retraitsStats,
    loading,
    error,
    fetchClients,
    fetchClientById,
    fetchClientCotisations,
    fetchClientRetraits,
    fetchClientTontines,
    fetchMyTransactionHistory,
  };
}