// Types TypeScript basés sur l'API
export type TypeTransaction = 'depot' | 'retrait';

export type StatutTransaction = 'pending' | 'approved' | 'rejected' | 'confirmee' | 'en_cours';

export interface SavingsTransaction {
  id: string; // UUID, readOnly
  client_nom: string; // readOnly
  client_prenom: string; // readOnly
  compte_id: string; // readOnly
  tontine_nom: string; // readOnly
  transaction_kkiapay_statut: string; // readOnly
  type_transaction: TypeTransaction;
  montant: string; // decimal
  statut: StatutTransaction;
  telephone: string; // maxLength: 15
  operateur: string | null; // maxLength: 10, nullable
  date_transaction: string; // datetime
  date_confirmation: string | null; // datetime, nullable
  commentaires: string | null; // maxLength: 500, nullable
  compte_epargne: string; // UUID
  transaction_kkiapay: string; // UUID
}

export interface CreateSavingsTransactionData {
  type_transaction: TypeTransaction;
  montant: string; // decimal
  statut?: StatutTransaction;
  telephone: string;
  operateur?: string;
  date_transaction?: string; // datetime
  date_confirmation?: string; // datetime
  commentaires?: string;
  compte_epargne: string; // UUID
  transaction_kkiapay: string; // UUID
}

export interface UpdateSavingsTransactionData {
  type_transaction?: TypeTransaction;
  montant?: string;
  statut?: StatutTransaction;
  telephone?: string;
  operateur?: string;
  date_transaction?: string;
  date_confirmation?: string;
  commentaires?: string;
  compte_epargne?: string;
  transaction_kkiapay?: string;
}

export interface ValidateWithdrawalData {
  decision: 'approved' | 'rejected';
  commentaires?: string;
}

export interface InitiateTransferData {
  numero_telephone: string;
  commentaires?: string;
}

export interface TransactionStatistics {
  volume_total_depot: string;
  volume_total_retrait: string;
  nombre_transactions_depot: number;
  nombre_transactions_retrait: number;
  montant_moyen_depot: string;
  montant_moyen_retrait: string;
  evolution_mensuelle: Array<{
    mois: string;
    depot: string;
    retrait: string;
    nombre_transactions: number;
  }>;
  repartition_statut: Array<{
    statut: StatutTransaction;
    nombre: number;
    pourcentage: number;
  }>;
}

export interface PaginatedSavingsTransactionList {
  count: number;
  next: string | null;
  previous: string | null;
  results: SavingsTransaction[];
}

export interface SavingsTransactionFilters {
  page?: number;
  compte_epargne?: string;
  type_transaction?: TypeTransaction;
  statut?: StatutTransaction;
  date_debut?: string;
  date_fin?: string;
  montant_min?: number;
  montant_max?: number;
telephone?: string;
}