// Types TypeScript basés sur l'API des comptes épargne
export type SavingsAccountStatus = 
  | 'en_cours_creation' 
  | 'validee_agent' 
  | 'paiement_effectue' 
  | 'actif' 
  | 'suspendu' 
  | 'ferme' 
  | 'rejete';

export type TransactionType = 'depot' | 'retrait' | 'frais';
export type TransactionStatus = 'confirmee' | 'en_cours' | 'echouee';

interface TransactionRecente {
  id: string;
  type_transaction: string;
  type_display: string;
  montant: string; // Peut être number si converti
  statut: string;
  statut_display: string;
  date_transaction: string; // ISO date
  date_confirmation: string | null; // Peut être null
  operateur: string | null;
  commentaires: string;
}

export interface SavingsAccount {
  idAdherents: string;
  sfdName: string;
  accountNumber: string;
  solde: number;
  dateCreation: string;
  statut: string;
  totalDepose: number;
  totalRetire: number;
  nombreTransactions: number;
  eligibiliteCredit: boolean;
  derniereMouvement: string;
  id: string;
  client_nom: string;
  agent_nom: string;
  derniere_transaction: string;
  transactions: TransactionRecente[];
  piece_identite_url: string;
  photo_identite_url: string;
  numero_telephone_paiement: string;
  frais_creation: number | null;
  date_validation_agent: string;
  date_paiement_frais: string;
  date_activation: string;
  date_demande: string;
  commentaires_agent: string;
  raison_rejet: string | null;
}


export interface CreateSavingsAccountData {
  statut?: SavingsAccountStatus;
  piece_identite: File; // binary
  photo_identite: File; // binary
  numero_telephone_paiement?: string; // maxLength: 15
  frais_creation?: string; // decimal
  date_demande?: string; // datetime
  date_validation_agent?: string; // datetime
  date_paiement_frais?: string; // datetime
  date_activation?: string; // datetime
  commentaires_agent?: string; // maxLength: 1000
  raison_rejet?: string; // maxLength: 500
  client: string; // UUID
  sfd_choisie?: string;
  agent_validateur?: string; // UUID
  transaction_frais_creation?: string; // UUID
}

export interface UpdateSavingsAccountData {
  statut?: SavingsAccountStatus;
  piece_identite?: File; // binary
  photo_identite?: File; // binary
  numero_telephone_paiement?: string; // maxLength: 15
  frais_creation?: string; // decimal
  date_demande?: string; // datetime
  date_validation_agent?: string; // datetime
  date_paiement_frais?: string; // datetime
  date_activation?: string; // datetime
  commentaires_agent?: string; // maxLength: 1000
  raison_rejet?: string; // maxLength: 500
  client?: string; // UUID
  sfd_choisie?: string;
  agent_validateur?: string; // UUID
  transaction_frais_creation?: string; // UUID
}

export interface DepositData {
  montant: string; // decimal
  numero_telephone: string; // minLength: 1, maxLength: 15
  commentaires?: string; // maxLength: 500
}

export interface WithdrawData {
  montant: string; // decimal
  numero_telephone: string; // minLength: 1, maxLength: 15
  motif_retrait?: string; // maxLength: 500
}

export interface ValidateRequestData {
  approuver: boolean; // True pour approuver, False pour rejeter
  commentaires?: string; // maxLength: 1000
  raison_rejet?: string; // maxLength: 500
}

export interface CreateRequestData {
  piece_identite: File; // binary
  photo_identite: File; // binary
  sfd_id: string; // minLength: 1, maxLength: 50
  numero_telephone_paiement?: string; // minLength: 1, maxLength: 15
}

export interface TransactionHistory {
  id: string;
  type: TransactionType;
  montant: string;
  description?: string;
  date_transaction: string;
  statut: TransactionStatus;
  numero_telephone?: string;
  frais?: string;
}

export interface SFDSelection {
  id: string;
  nom: string;
  adresse: string;
  telephone?: string;
  email?: string;
}

export interface AccountStatusResponse {
  compte_id: string; // UUID
  statut: string;
  message: string;
  prochaine_action: string;
  solde_disponible: string; // decimal
}

export interface MyAccountSummary {
  id: string;
  idAdherents: string;
  sfdName: string;
  accountNumber: string;
  solde: string;
  dateCreation: string;
  statut: SavingsAccountStatus;
  totalDepose: string;
  totalRetire: string;
  nombreTransactions: number;
  eligibiliteCredit: boolean;
  derniereMouvement?: string;
}

export interface PaginatedSavingsAccountList {
  count: number;
  next: string | null;
  previous: string | null;
  results: SavingsAccount[];
}

export interface PaginatedTransactionHistoryList {
  count: number;
  next: string | null;
  previous: string | null;
  results: TransactionHistory[];
}

export interface PaginatedSFDSelectionList {
  count: number;
  next: string | null;
  previous: string | null;
  sfds: SFDSelection[];
}

export interface SavingsAccountFilters {
  page?: number;
  statut?: SavingsAccountStatus;
  client?: string;
  agent_validateur?: string;
  date_debut?: string;
  date_fin?: string;
}