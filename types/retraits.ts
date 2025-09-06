// Types TypeScript basés sur l'API
export type StatutRetrait = 
  | 'pending'    // En attente
  | 'approved'   // Approuvé
  | 'rejected'   // Rejeté
  | 'confirmee'; // Confirmé

export interface Retrait {
  id: string; 
  client: string; 
  client_nom: string;
  client_prenom: string;
  tontine: string; 
  tontine_nom: string;
  participant: string | null; 
  montant: string; 
  date_demande_retrait: string; 
  date_validation_retrait: string | null; 
  statut: StatutRetrait;
  agent_validateur: string | null; 
  commentaires_agent: string;
  raison_rejet: string;
  transaction_kkiapay: string | null; 
  telephone: string;
}

export interface CreateRetraitData {
  participant: string; 
  montant: string; 
}

export interface UpdateRetraitData {
  client?: string; 
  tontine?: string; 
  participant?: string; 
  montant?: string; 
  date_validation_retrait?: string; 
  statut?: StatutRetrait;
  agent_validateur?: string; 
  commentaires_agent?: string;
  raison_rejet?: string;
  transaction_kkiapay?: string; 
  telephone?: string;
}

export interface ValidationData {
  decision: 'approved' | 'rejected';
  commentaire: string;
}

export interface InitierVirementData {
  numero_telephone: string;
}

export interface ValidationRetraitResponse {
  message: string;
  statut: string;
  virement_initie?: boolean;
  transaction_mobile_money?: string;
}

export interface ValidationRetraitError {
  error: string;
  details?: string;
}

export interface PaginatedRetraitList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Retrait[];
}

export interface RetraitFilters {
  page?: number;
  participant?: string; 
  statut?: StatutRetrait; 
}