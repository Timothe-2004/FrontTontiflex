// Types principaux
export interface AgentSFDResponse {
  agentId: string;
  agentName: string;
  telephone: string;
  email: string;
  sfd: string;
  status: string;
  dateInscription: string;
}

export interface AgentSFDAdmin {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string;
  profession: string;
  est_actif: boolean;
}

export interface AgentSFDCreate extends AgentSFDAdmin {
  motDePasse: string;
  sfd_id: string;
}

export interface PaginatedAgentSFDResponseList {
  count: number;
  next: string | null;
  previous: string | null;
  results: AgentSFDResponse[];
}

export interface AgentAction {
  id: string;
  action_type: string;
  description: string;
  target_object: string;
  target_id: string;
  date_action: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  duree_traitement?: number;
  status?: string;
  montant?: number;
  raison?: string;
}

export interface AgentActionsResponse {
  agent_id: string;
  agent_name: string;
  total_actions: number;
  actions: AgentAction[];
  period_start?: string;
  period_end?: string;
}

export interface AgentsSFDFilters {
  page?: number;
  sfd_id?: string;
  status?: string;
  est_actif?: boolean;
  search?: string;
  ordering?: string;
}

export interface StatistiquesDashboard {
  total_agents: number;
  agents_actifs: number;
  agents_inactifs: number;
  agents_by_sfd: Record<string, number>;
  actions_today: number;
  actions_week: number;
  actions_month: number;
  avg_response_time: number;
  validation_rate: number;
}

export interface ValidationRequest {
  id: string;
  commentaires?: string;
  decision: 'valide' | 'rejete';
}

export interface RejetRequest {
  id: string;
  raison: string;
  commentaires?: string;
}