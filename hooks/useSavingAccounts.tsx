import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

import type {
  SavingsAccount,
  CreateSavingsAccountData,
  UpdateSavingsAccountData,
  DepositData,
  WithdrawData,
  ValidateRequestData,
  CreateRequestData,
  TransactionHistory,
  SFDSelection,
  AccountStatusResponse,
  MyAccountSummary,
  PaginatedSavingsAccountList,
  PaginatedTransactionHistoryList,
  PaginatedSFDSelectionList,
  SavingsAccountFilters,
} from '../types/saving-accounts';
import { toast } from 'sonner';

// 🆕 Interface pour les données de paiement KKiaPay (dépôts épargne)
export interface KKiaPayDepositData {
  transactionId: string;
  phone?: string;
  amount?: number;
  status?: string;
}

// 🆕 Interface pour la confirmation de paiement (dépôts épargne)
export interface DepositPaymentConfirmationData {
  kkiapay_transaction_id: string;
  internal_transaction_id: string;
  reference: string;
  amount: number;
  phone: string;
  status: 'success' | 'failed';
  timestamp: string;
  deposit_data: DepositData;
  account_id: string;
}

interface useSavingsAccountsAPIResults {
  savingsAccounts: SavingsAccount[];
  savingsAccount: SavingsAccount | null;
  myAccount: MyAccountSummary | null;
  transactionHistory: TransactionHistory[];
  availableSFDs: SFDSelection[];
  loading: boolean;
  error: string | null;

  // CRUD operations
  fetchSavingsAccounts: (filters?: SavingsAccountFilters) => Promise<PaginatedSavingsAccountList>;
  fetchSavingsAccountById: (id: string) => Promise<SavingsAccount | null>;
  fetchSavingAccountRequests: (page?: number) => Promise<PaginatedSavingsAccountList>;
  createSavingsAccount: (accountData: CreateSavingsAccountData) => Promise<SavingsAccount>;
  updateSavingsAccount: (id: string, accountData: UpdateSavingsAccountData) => Promise<SavingsAccount>;
  updateSavingsAccountPartial: (id: string, accountData: Partial<UpdateSavingsAccountData>) => Promise<SavingsAccount>;
  deleteSavingsAccount: (id: string) => Promise<boolean>;

  // 🆕 Opérations avec support KKiaPay
  createDepositForPayment: (id: string, depositData: DepositData) => Promise<AccountStatusResponse>;
  confirmDepositPayment: (confirmationData: DepositPaymentConfirmationData) => Promise<void>;
  
  // Specialized operations (originales)
  deposit: (id: string, depositData: DepositData) => Promise<AccountStatusResponse>;
  withdraw: (id: string, withdrawData: WithdrawData) => Promise<AccountStatusResponse>;
  validateRequest: (id: string, validateData: ValidateRequestData) => Promise<AccountStatusResponse>;
  fetchTransactionHistory: (id: string, page?: number) => Promise<PaginatedTransactionHistoryList>;
  fetchAvailableSFDs: (page?: number) => Promise<PaginatedSFDSelectionList>;
  createRequest: (requestData: CreateRequestData) => Promise<AccountStatusResponse>;
  fetchMyAccount: () => Promise<MyAccountSummary | null>;
}

export function useSavingsAccounts(): useSavingsAccountsAPIResults {
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [savingsAccount, setSavingsAccount] = useState<SavingsAccount | null>(null);
  const [myAccount, setMyAccount] = useState<MyAccountSummary | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([]);
  const [availableSFDs, setAvailableSFDs] = useState<SFDSelection[]>([]);
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

  // Récupérer la liste des comptes épargne
  const fetchSavingsAccounts = useCallback(async (filters: SavingsAccountFilters = {}): Promise<PaginatedSavingsAccountList> => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const url = `${baseUrl}/savings/accounts/?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des comptes épargne');
      }
      
      const data: PaginatedSavingsAccountList = await response.json();
      setSavingsAccounts(data.results || []);
      console.log("comptes épargne", data.results);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Récupérer un compte épargne par ID
  const fetchSavingsAccountById = async (id: string): Promise<SavingsAccount | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/savings/accounts/${id}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du compte épargne');
      }
      
      const accountData = await response.json();
      setSavingsAccount(accountData);
      return accountData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Créer un dépôt pour le paiement (sans effectuer le paiement directement)
  const createDepositForPayment = async (id: string, depositData: DepositData): Promise<AccountStatusResponse> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('montant', depositData.montant);
      formData.append('numero_telephone', depositData.numero_telephone);
      if (depositData.commentaires) formData.append('commentaires', depositData.commentaires);

      const response = await fetch(`${baseUrl}/savings/accounts/${id}/deposit/`, {
        method: 'POST',
        headers: getAuthHeaders(true), // multipart/form-data
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création du dépôt';
        if (response.status === 400) {
          errorMessage = 'Montant invalide ou compte non actif';
        } else if (response.status === 402) {
          errorMessage = 'Erreur de configuration de paiement';
        } else if (response.status === 503) {
          errorMessage = 'Service temporairement indisponible';
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

      const result = await response.json();
      console.log('✅ Dépôt créé pour paiement:', result);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Confirmer le paiement de dépôt après succès KKiaPay
  const confirmDepositPayment = async (confirmationData: DepositPaymentConfirmationData): Promise<void> => {
    try {
      const webhookData = {
        transactionId: confirmationData.kkiapay_transaction_id,
        isPaymentSucces: confirmationData.status === 'success',
        event: confirmationData.status === 'success' ? 'payment.success' : 'payment.failed',
        timestamp: confirmationData.timestamp,
        amount: confirmationData.amount,
        status: confirmationData.status.toUpperCase(),
        data: {
          transaction_id: confirmationData.internal_transaction_id,
          reference: confirmationData.reference,
          type: 'depot_epargne',
          account_id: confirmationData.account_id,
          form_data: confirmationData.deposit_data
        }
      };

      const response = await fetch(`${baseUrl}/payments/webhook/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        throw new Error(`Erreur confirmation dépôt: ${response.status}`);
      }

      console.log('✅ Dépôt confirmé avec succès');
    } catch (err) {
      console.error('❌ Erreur confirmation dépôt:', err);
      throw err;
    }
  };

  // Créer une demande de compte épargne
  const createSavingsAccount = async (accountData: CreateSavingsAccountData): Promise<SavingsAccount> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      // Ajouter tous les champs optionnels si présents
      if (accountData.statut) formData.append('statut', accountData.statut);
      formData.append('piece_identite', accountData.piece_identite);
      formData.append('photo_identite', accountData.photo_identite);
      if (accountData.numero_telephone_paiement) formData.append('numero_telephone_paiement', accountData.numero_telephone_paiement);
      if (accountData.frais_creation) formData.append('frais_creation', accountData.frais_creation);
      if (accountData.date_demande) formData.append('date_demande', accountData.date_demande);
      if (accountData.date_validation_agent) formData.append('date_validation_agent', accountData.date_validation_agent);
      if (accountData.date_paiement_frais) formData.append('date_paiement_frais', accountData.date_paiement_frais);
      if (accountData.date_activation) formData.append('date_activation', accountData.date_activation);
      if (accountData.commentaires_agent) formData.append('commentaires_agent', accountData.commentaires_agent);
      if (accountData.raison_rejet) formData.append('raison_rejet', accountData.raison_rejet);
      formData.append('client', accountData.client);
      if (accountData.sfd_choisie) formData.append('sfd_choisie', accountData.sfd_choisie);
      if (accountData.agent_validateur) formData.append('agent_validateur', accountData.agent_validateur);
      if (accountData.transaction_frais_creation) formData.append('transaction_frais_creation', accountData.transaction_frais_creation);

      const response = await fetch(`${baseUrl}/savings/accounts/`, {
        method: 'POST',
        headers: getAuthHeaders(true), // multipart/form-data
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création du compte épargne';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 400) {
            errorMessage = 'Vous avez déjà une demande de création de compte courant en cours pour cette SFD';
            console.error(errorMessage);
            toast.error(errorMessage);
          } else if (response.status === 409) {
            errorMessage = 'Vous possèdez déjà un compte courant actif pour cette SFD';
            toast.error(errorMessage);
          } else if (typeof errorData === 'object') {
            const validationErrors = Object.entries(errorData)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('\n');
            if (validationErrors) {
              errorMessage = `Erreurs de validation :\n${validationErrors}`
              toast.error(errorMessage);
            }
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      const newAccount = await response.json();
      setSavingsAccounts(prev => [newAccount, ...prev]);
      return newAccount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un compte épargne (PUT)
  const updateSavingsAccount = async (id: string, accountData: UpdateSavingsAccountData): Promise<SavingsAccount> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      if (accountData.statut) formData.append('statut', accountData.statut);
      if (accountData.piece_identite) formData.append('piece_identite', accountData.piece_identite);
      if (accountData.photo_identite) formData.append('photo_identite', accountData.photo_identite);
      if (accountData.numero_telephone_paiement) formData.append('numero_telephone_paiement', accountData.numero_telephone_paiement);
      if (accountData.frais_creation) formData.append('frais_creation', accountData.frais_creation);
      if (accountData.date_demande) formData.append('date_demande', accountData.date_demande);
      if (accountData.date_validation_agent) formData.append('date_validation_agent', accountData.date_validation_agent);
      if (accountData.date_paiement_frais) formData.append('date_paiement_frais', accountData.date_paiement_frais);
      if (accountData.date_activation) formData.append('date_activation', accountData.date_activation);
      if (accountData.commentaires_agent) formData.append('commentaires_agent', accountData.commentaires_agent);
      if (accountData.raison_rejet) formData.append('raison_rejet', accountData.raison_rejet);
      if (accountData.client) formData.append('client', accountData.client);
      if (accountData.sfd_choisie) formData.append('sfd_choisie', accountData.sfd_choisie);
      if (accountData.agent_validateur) formData.append('agent_validateur', accountData.agent_validateur);
      if (accountData.transaction_frais_creation) formData.append('transaction_frais_creation', accountData.transaction_frais_creation);

      const response = await fetch(`${baseUrl}/savings/accounts/${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(true), // multipart/form-data
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du compte épargne');
      }

      const updatedAccount = await response.json();
      setSavingsAccounts(prev => 
        prev.map(account => account.id === id ? { ...account, ...updatedAccount } : account)
      );
      setSavingsAccount(updatedAccount);
      return updatedAccount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour partiellement un compte épargne (PATCH)
  const updateSavingsAccountPartial = async (id: string, accountData: Partial<UpdateSavingsAccountData>): Promise<SavingsAccount> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      if (accountData.statut) formData.append('statut', accountData.statut);
      if (accountData.piece_identite) formData.append('piece_identite', accountData.piece_identite);
      if (accountData.photo_identite) formData.append('photo_identite', accountData.photo_identite);
      if (accountData.numero_telephone_paiement) formData.append('numero_telephone_paiement', accountData.numero_telephone_paiement);
      if (accountData.frais_creation) formData.append('frais_creation', accountData.frais_creation);
      if (accountData.date_demande) formData.append('date_demande', accountData.date_demande);
      if (accountData.date_validation_agent) formData.append('date_validation_agent', accountData.date_validation_agent);
      if (accountData.date_paiement_frais) formData.append('date_paiement_frais', accountData.date_paiement_frais);
      if (accountData.date_activation) formData.append('date_activation', accountData.date_activation);
      if (accountData.commentaires_agent) formData.append('commentaires_agent', accountData.commentaires_agent);
      if (accountData.raison_rejet) formData.append('raison_rejet', accountData.raison_rejet);
      if (accountData.client) formData.append('client', accountData.client);
      if (accountData.sfd_choisie) formData.append('sfd_choisie', accountData.sfd_choisie);
      if (accountData.agent_validateur) formData.append('agent_validateur', accountData.agent_validateur);
      if (accountData.transaction_frais_creation) formData.append('transaction_frais_creation', accountData.transaction_frais_creation);

      const response = await fetch(`${baseUrl}/savings/accounts/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(true), // multipart/form-data
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour partielle du compte épargne');
      }

      const updatedAccount = await response.json();
      setSavingsAccounts(prev => 
        prev.map(account => account.id === id ? { ...account, ...updatedAccount } : account)
      );
      setSavingsAccount(updatedAccount);
      return updatedAccount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fermer un compte épargne
  const deleteSavingsAccount = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/savings/accounts/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Erreur lors de la fermeture du compte épargne');
      }

      setSavingsAccounts(prev => prev.filter(account => account.id !== id));
      if (savingsAccount?.id === id) {
        setSavingsAccount(null);
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

  // Effectuer un dépôt via Mobile Money (méthode originale)
  const deposit = async (id: string, depositData: DepositData): Promise<AccountStatusResponse> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('montant', depositData.montant);
      formData.append('numero_telephone', depositData.numero_telephone);
      if (depositData.commentaires) formData.append('commentaires', depositData.commentaires);

      const response = await fetch(`${baseUrl}/savings/accounts/${id}/deposit/`, {
        method: 'POST',
        headers: getAuthHeaders(true), // multipart/form-data
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors du dépôt';
        if (response.status === 400) {
          errorMessage = 'Montant invalide ou compte non actif';
        } else if (response.status === 402) {
          errorMessage = 'Solde Mobile Money insuffisant';
        } else if (response.status === 503) {
          errorMessage = 'Service Mobile Money indisponible';
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Rafraîchir le compte si c'est le compte affiché
      if (savingsAccount?.id === id) {
        await fetchSavingsAccountById(id);
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

  // Effectuer un retrait via Mobile Money
  const withdraw = async (id: string, withdrawData: WithdrawData): Promise<AccountStatusResponse> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('montant', withdrawData.montant);
      formData.append('numero_telephone', withdrawData.numero_telephone);
      if (withdrawData.motif_retrait) formData.append('motif_retrait', withdrawData.motif_retrait);

      const response = await fetch(`${baseUrl}/savings/accounts/${id}/withdraw/`, {
        method: 'POST',
        headers: getAuthHeaders(true), // multipart/form-data
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors du retrait';
        if (response.status === 400) {
          errorMessage = 'Montant invalide ou solde insuffisant';
        } else if (response.status === 403) {
          errorMessage = 'Limite de retrait dépassée';
        } else if (response.status === 503) {
          errorMessage = 'Service Mobile Money indisponible';
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Rafraîchir le compte
      if (savingsAccount?.id === id) {
        await fetchSavingsAccountById(id);
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

  // Valider une demande de compte épargne (Agent SFD)
  const validateRequest = async (id: string, validateData: ValidateRequestData): Promise<AccountStatusResponse> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('approuver', validateData.approuver.toString());
      if (validateData.commentaires) formData.append('commentaires', validateData.commentaires);
      if (validateData.raison_rejet) formData.append('raison_rejet', validateData.raison_rejet);

      const response = await fetch(`${baseUrl}/savings/accounts/${id}/validate-request/`, {
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
          errorMessage = 'Demande de compte introuvable';
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Rafraîchir le compte
      if (savingsAccount?.id === id) {
        await fetchSavingsAccountById(id);
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

  // Récupérer l'historique des transactions du compte
  const fetchTransactionHistory = async (id: string, page?: number): Promise<PaginatedTransactionHistoryList> => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams();
      if (page) searchParams.append('page', page.toString());

      const url = `${baseUrl}/savings/accounts/${id}/transactions/?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de l\'historique des transactions');
      }
      
      const data: PaginatedTransactionHistoryList = await response.json();
      setTransactionHistory(data.results || []);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer la liste des SFDs disponibles
  const fetchAvailableSFDs = async (page?: number): Promise<PaginatedSFDSelectionList> => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams();
      if (page) searchParams.append('page', page.toString());

      const url = `${baseUrl}/savings/accounts/available-sfds/?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des SFDs disponibles');
      }
      
      const data: PaginatedSFDSelectionList = await response.json();
      console.log("data sfddddddd", data.sfds);
      setAvailableSFDs(data.sfds || []);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Créer une demande de compte épargne
  const createRequest = async (requestData: CreateRequestData): Promise<AccountStatusResponse> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('piece_identite', requestData.piece_identite);
      formData.append('photo_identite', requestData.photo_identite);
      formData.append('sfd_id', requestData.sfd_id);
      if (requestData.numero_telephone_paiement) formData.append('numero_telephone_paiement', requestData.numero_telephone_paiement);

      const response = await fetch(`${baseUrl}/savings/accounts/create-request/`, {
        method: 'POST',
        headers: getAuthHeaders(true), // multipart/form-data
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création de la demande';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (response.status === 400) {
            errorMessage = 'Vous avez déjà une demande de création de compte courant en cours';
          } else if (response.status === 409) {
            errorMessage = 'Vous possèdez déjà un compte courant actif';
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer mes comptes épargne (Client)
  const fetchMyAccount = async (): Promise<MyAccountSummary | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/savings/accounts/my-account/`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setMyAccount(null);
          return null;
        }
        throw new Error('Erreur lors du chargement de votre compte épargne');
      }
      const accountData = await response.json();
      setMyAccount(accountData.accounts);
      return accountData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les demandes de comptes épargne pour l'agent SFD
  const fetchSavingAccountRequests = async (page: number = 1): Promise<PaginatedSavingsAccountList> => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());

      const url = `${baseUrl}/savings/accounts/agent-requests/?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
          
      if (!response.ok) {
        let errorMessage = 'Erreur lors du chargement des demandes de comptes épargne';
        if (response.status === 403) {
          errorMessage = 'Non autorisé à accéder à ces demandes';
        } else if (response.status === 404) {
          errorMessage = 'Aucune demande trouvée pour votre SFD';
        }
        throw new Error(errorMessage);
      }
          
      const data: PaginatedSavingsAccountList = await response.json();
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
    savingsAccounts,
    savingsAccount,
    myAccount,
    transactionHistory,
    availableSFDs,
    loading,
    error,
    fetchSavingsAccounts,
    fetchSavingsAccountById,
    fetchSavingAccountRequests,
    createSavingsAccount,
    updateSavingsAccount,
    updateSavingsAccountPartial,
    deleteSavingsAccount,
    // 🆕 Nouvelles méthodes KKiaPay
    createDepositForPayment,
    confirmDepositPayment,
    // Méthodes originales
    deposit,
    withdraw,
    validateRequest,
    fetchTransactionHistory,
    fetchAvailableSFDs,
    createRequest,
    fetchMyAccount,
  };
}