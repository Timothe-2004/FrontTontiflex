// Types pour les prêts accordés
export type LoanStatus = 
  | 'accorde' 
  | 'en_attente_decaissement' 
  | 'decaisse' 
  | 'en_remboursement' 
  | 'solde' 
  | 'en_defaut';

export interface Loan {
  id: string;
  demande: string;
  demande_info: string;
  client: string;
  client_nom: string;
  montant_accorde: string;
  statut: LoanStatus;
  date_creation: string;
  date_decaissement: string | null;
  admin_decaisseur: string | null;
  admin_decaisseur_nom: string;
  montant_total_rembourse: string;
  solde_restant_du: string;
  est_en_retard: string;
  progression_remboursement: string;
  sfd_id: string;
  sfd_nom: string;
  montant_mensualite: string;
  taux_interet_annuel: string;
  duree_pret_mois: string;
}

export interface CreateLoanData {
  demande: string;
  client: string;
  montant_accorde: string;
  statut?: LoanStatus;
  date_decaissement?: string;
  admin_decaisseur?: string;
}

export interface UpdateLoanData {
  demande?: string;
  client?: string;
  montant_accorde?: string;
  statut?: LoanStatus;
  date_decaissement?: string;
  admin_decaisseur?: string;
}

export interface RepaymentSchedule {
  id: number;
  loan: number;
  loan_info: string;
  client_nom: string;
  numero_echeance: number;
  date_echeance: string;
  montant_mensualite: number;
  montant_capital: number;
  montant_interet: number;
  solde_restant: number;
  statut: string;
  date_paiement?: string;
  montant_penalites: number;
  montant_total_du: number;
  jours_retard: number;
  est_en_retard: boolean;
}


export interface CalendrierRemboursement {
  echeances: RepaymentSchedule[];
  resume: Record<string, any>;
  statistiques: Record<string, any>;
}

export interface RepaymentData {
  numero_telephone: string;
  description?: string;
}

export interface MyLoan {
  id_sfd: string;
  id_prêt: string;
  nom_sfd: string;
  amount: number;
  purpose: string;
  status: string;
  startDate: string;
  endDate: string;
  monthlyPayment: number;
  remainingAmount: number;
  paidAmount: number;
  interestRate: number;
  nextPaymentDate: string;
}

export interface MyLoansResponse {
  success: boolean;
  count: number;
  loans: MyLoan[];
}

export interface PaginatedLoanList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Loan[];
}

export interface LoanFilters {
  page?: number;
  statut?: LoanStatus;
  client?: string;
  sfd?: string;
  date_creation_after?: string;
  date_creation_before?: string;
}