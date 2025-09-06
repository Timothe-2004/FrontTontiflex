import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import {TypeTransaction, TransactionStatistics, SavingsTransaction, PaginatedSavingsTransactionList, SavingsTransactionFilters, CreateSavingsTransactionData, UpdateSavingsTransactionData, ValidateWithdrawalData, InitiateTransferData} from '@/types/transactions';
interface useSavingsTransactionsResults {
  savingsTransactions: SavingsTransaction[];
  savingsTransaction: SavingsTransaction | null;
  withdrawalRequests: SavingsTransaction[];
  statistics: TransactionStatistics | null;
  loading: boolean;
  error: string | null;

  // CRUD operations
  fetchSavingsTransactions: (filters?: SavingsTransactionFilters) => Promise<PaginatedSavingsTransactionList>;
  fetchSavingsTransactionById: (id: string) => Promise<SavingsTransaction | null>;
  createSavingsTransaction: (transactionData: CreateSavingsTransactionData) => Promise<SavingsTransaction>;
  updateSavingsTransaction: (id: string, transactionData: UpdateSavingsTransactionData) => Promise<SavingsTransaction>;
  updateSavingsTransactionPartial: (id: string, transactionData: Partial<UpdateSavingsTransactionData>) => Promise<SavingsTransaction>;
  deleteSavingsTransaction: (id: string) => Promise<boolean>;

  // Opérations spécialisées Agent SFD
  fetchWithdrawalRequestsBySFD: (filters?: SavingsTransactionFilters) => Promise<PaginatedSavingsTransactionList>;
  fetchWithdrawalRequests: (filters?: SavingsTransactionFilters) => Promise<SavingsTransaction[]>;
  validateWithdrawal: (id: string, validationData: ValidateWithdrawalData) => Promise<SavingsTransaction>;
  initiateTransfer: (id: string, transferData: InitiateTransferData) => Promise<SavingsTransaction>;

  // Statistiques
  fetchTransactionStatistics: (filters?: { periode?: string; sfd_id?: string; type_transaction?: TypeTransaction }) => Promise<TransactionStatistics | null>;
}

export function useSavingsTransactions(): useSavingsTransactionsResults {
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([]);
  const [savingsTransaction, setSavingsTransaction] = useState<SavingsTransaction | null>(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState<SavingsTransaction[]>([]);
  const [statistics, setStatistics] = useState<TransactionStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, user } = useAuth();
  const baseUrl = 'https://tontiflexapp.onrender.com/api';

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    };
  };

  // Récupérer la liste des transactions d'épargne
  const fetchSavingsTransactions = useCallback(async (filters: SavingsTransactionFilters = {}): Promise<PaginatedSavingsTransactionList> => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const url = `${baseUrl}/savings/transactions/?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des transactions d\'épargne');
      }
      
      const data: PaginatedSavingsTransactionList = await response.json();
      setSavingsTransactions(data.results || []);
      console.log("transactions d'épargne", data.results);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement des transactions d\'épargne');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Récupérer une transaction par ID
  const fetchSavingsTransactionById = async (id: string): Promise<SavingsTransaction | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/savings/transactions/${id}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la transaction');
      }
      
      const transactionData = await response.json();
      setSavingsTransaction(transactionData);
      return transactionData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast.error('Erreur lors du chargement de la transaction');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer une transaction d'épargne
  const createSavingsTransaction = async (transactionData: CreateSavingsTransactionData): Promise<SavingsTransaction> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/savings/transactions/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création de la transaction';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 400) {
            errorMessage = 'Données de transaction invalides';
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

      const newTransaction = await response.json();
      setSavingsTransactions(prev => [newTransaction, ...prev]);
      toast.success('Transaction créée avec succès');
      return newTransaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une transaction (PUT)
  const updateSavingsTransaction = async (id: string, transactionData: UpdateSavingsTransactionData): Promise<SavingsTransaction> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/savings/transactions/${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la transaction');
      }

      const updatedTransaction = await response.json();
      setSavingsTransactions(prev => 
        prev.map(transaction => transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction)
      );
      setSavingsTransaction(updatedTransaction);
      toast.success('Transaction mise à jour avec succès');
      return updatedTransaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour partiellement une transaction (PATCH)
  const updateSavingsTransactionPartial = async (id: string, transactionData: Partial<UpdateSavingsTransactionData>): Promise<SavingsTransaction> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/savings/transactions/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour partielle de la transaction');
      }

      const updatedTransaction = await response.json();
      setSavingsTransactions(prev => 
        prev.map(transaction => transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction)
      );
      setSavingsTransaction(updatedTransaction);
      toast.success('Transaction mise à jour avec succès');
      return updatedTransaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une transaction
  const deleteSavingsTransaction = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/savings/transactions/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Erreur lors de la suppression de la transaction');
      }

      setSavingsTransactions(prev => prev.filter(transaction => transaction.id !== id));
      if (savingsTransaction?.id === id) {
        setSavingsTransaction(null);
      }
      toast.success('Transaction supprimée avec succès');
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

  // Récupérer les retraits par SFD (Agent SFD)
  const fetchWithdrawalRequestsBySFD = async (filters: SavingsTransactionFilters = {}): Promise<PaginatedSavingsTransactionList> => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const url = `${baseUrl}/savings/transactions/by-sfd/${user?.sfd.id}/retraits/?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Permissions insuffisantes - Agent SFD requis');
        }
        throw new Error('Erreur lors du chargement des retraits par SFD');
      }
      
      const data: PaginatedSavingsTransactionList = await response.json();
      console.log("retraits par SFD", data.results);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement des retraits par SFD');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les demandes de retrait à valider (Agent SFD)
  const fetchWithdrawalRequests = async (filters: SavingsTransactionFilters = {}): Promise<SavingsTransaction[]> => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const url = `${baseUrl}/savings/transactions/withdrawal-requests/?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Permissions insuffisantes - Agent SFD requis');
        }
        throw new Error('Erreur lors du chargement des demandes de retrait');
      }
      
      const data: SavingsTransaction[] = await response.json();
      setWithdrawalRequests(data);
      console.log("demandes de retrait", data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement des demandes de retrait');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Valider/refuser une demande de retrait (Agent SFD)
  const validateWithdrawal = async (id: string, validationData: ValidateWithdrawalData): Promise<SavingsTransaction> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/savings/transactions/${id}/validate/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(validationData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la validation';
        if (response.status === 403) {
          errorMessage = 'Permissions insuffisantes - Agent SFD requis';
        } else if (response.status === 404) {
          errorMessage = 'Transaction introuvable';
        }
        throw new Error(errorMessage);
      }

      const updatedTransaction = await response.json();
      setSavingsTransactions(prev => 
        prev.map(transaction => transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction)
      );
      setWithdrawalRequests(prev => 
        prev.filter(request => request.id !== id)
      );
      setSavingsTransaction(updatedTransaction);
      return updatedTransaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initier le virement Mobile Money (Agent SFD)
  const initiateTransfer = async (id: string, transferData: InitiateTransferData): Promise<SavingsTransaction> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/savings/transactions/${id}/initiate-transfer/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(transferData),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de l\'initiation du virement';
        if (response.status === 403) {
          errorMessage = 'Permissions insuffisantes - Agent SFD requis';
        } else if (response.status === 404) {
          errorMessage = 'Transaction introuvable';
        }
        throw new Error(errorMessage);
      }

      const updatedTransaction = await response.json();
      setSavingsTransactions(prev => 
        prev.map(transaction => transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction)
      );
      setSavingsTransaction(updatedTransaction);
      toast.success('Virement Mobile Money initié avec succès');
      return updatedTransaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les statistiques des transactions
  const fetchTransactionStatistics = async (filters: { periode?: string; sfd_id?: string; type_transaction?: TypeTransaction } = {}): Promise<TransactionStatistics | null> => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const url = `${baseUrl}/savings/transactions/statistics/?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Permissions insuffisantes pour accéder aux statistiques');
        }
        throw new Error('Erreur lors du chargement des statistiques');
      }
      
      const data: TransactionStatistics = await response.json();
      setStatistics(data);
      console.log("statistiques des transactions", data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement des statistiques');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    savingsTransactions,
    savingsTransaction,
    withdrawalRequests,
    statistics,
    loading,
    error,
    fetchSavingsTransactions,
    fetchSavingsTransactionById,
    createSavingsTransaction,
    updateSavingsTransaction,
    updateSavingsTransactionPartial,
    deleteSavingsTransaction,
    fetchWithdrawalRequestsBySFD,
    fetchWithdrawalRequests,
    validateWithdrawal,
    initiateTransfer,
    fetchTransactionStatistics,
  };
}