
// Types TypeScript basés sur l'API
export interface SuperviseurSFDAdmin {
  nom: string; // maxLength: 100
  prenom: string; // maxLength: 100
  telephone: string; // pattern: ^\+?1?\d{9,15}$, maxLength: 15
  email: string; // email, maxLength: 254
  adresse: string;
  profession: string; // maxLength: 100
  est_actif: boolean;
}

export interface CreateSuperviseurSFDData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string; // Requis pour la création
  adresse: string;
  profession: string;
  sfd_id: string; // SFD de rattachement
  zone_supervision?: string; // Zone géographique de supervision
  limite_approbation?: number; // Limite d'autorisation financière
  est_actif?: boolean;
}

export interface UpdateSuperviseurSFDData {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  motDePasse?: string;
  adresse?: string;
  profession?: string;
  sfd_id?: string;
  zone_supervision?: string;
  limite_approbation?: number;
  est_actif?: boolean;
}

export interface PaginatedSuperviseurSFDAdminList {
  count: number;
  next: string | null;
  previous: string | null;
  results: SuperviseurSFDAdmin[];
}

export interface SuperviseurSFDFilters {
  page?: number;
  search?: string;
  sfd_id?: string;
  est_actif?: boolean;
  zone_supervision?: string;
}