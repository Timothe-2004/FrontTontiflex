// Types TypeScript basés fidèlement sur l'API
export type StatutAdhesion = 
  | 'demande_soumise' 
  | 'validee_agent' 
  | 'en_cours_paiement' 
  | 'paiement_effectue' 
  | 'adherent' 
  | 'rejetee';

export type EtapeAdhesion = 
  | 'etape_1' 
  | 'etape_2' 
  | 'etape_3'; 
 
export interface Adhesion {
  id: string; 
  client: string; 
  client_nom: string; 
  client_telephone: string; 
  numero_telephone_paiement: string | null; 
  tontine: string; 
  tontine_nom: string; 
  montant_mise: string; 
  document_identite: string | null; 
  statut_actuel: StatutAdhesion; 
  etape_actuelle: EtapeAdhesion; 
  date_creation: string; 
  date_validation_agent: string | null; 
  date_paiement_frais: string | null; 
  date_integration: string | null; 
  frais_adhesion_calcules: string | null; 
  agent_validateur: string | null; 
  agent_nom: string; 
  commentaires_agent: string; 
  raison_rejet: string; 
  prochaine_action: string; 
}

export interface CreateAdhesionData {
  tontine: string; 
  montant_mise: string; 
  document_identite?: File; 
}

export interface UpdateAdhesionData {
  tontine: string; 
  montant_mise: string; 
  document_identite?: File; 
}

export interface UpdateAdhesionPartialData {
  tontine?: string; 
  montant_mise?: string; 
  document_identite?: File; 
}

export interface ValidateAgentData {
  commentaires?: string; 
}

export interface PayerData {
  numero_telephone: string; 
}

export interface RejectAdhesionData {
  raison_rejet: string; 
}

export interface PaginatedAdhesionList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Adhesion[];
}

export interface AdhesionFilters {
  page?: number;
  tontine?: string;
  statut?: StatutAdhesion;
  client?: string;
  agent_validateur?: string;
}