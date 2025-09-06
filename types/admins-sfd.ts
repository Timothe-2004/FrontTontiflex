// Types TypeScript basés sur l'API
export interface AdministrateurSFDAdmin {
  nom: string; // maxLength: 100
  prenom: string; // maxLength: 100
  telephone: string; // pattern: ^\+?1?\d{9,15}$, maxLength: 15
  email: string; // email, maxLength: 254
  adresse: string; // Adresse physique complète
  profession: string; // maxLength: 100
  peut_creer_tontines: boolean; // Autorisation pour créer des tontines
  est_actif: boolean; // Indique si l'administrateur est actuellement actif
}

export interface CreateAdministrateurSFDData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string; // Requis uniquement pour la création
  adresse: string;
  profession: string;
  sfd_id: string; // ID de la SFD à administrer
  peut_creer_tontines?: boolean;
  est_actif?: boolean;
}

export interface UpdateAdministrateurSFDData {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  motDePasse?: string;
  adresse?: string;
  profession?: string;
  sfd_id?: string;
  peut_creer_tontines?: boolean;
  est_actif?: boolean;
}

export interface PaginatedAdministrateurSFDAdminList {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdministrateurSFDAdmin[];
}

export interface AdministrateurSFDFilters {
  page?: number;
  search?: string;
  sfd_id?: string;
  est_actif?: boolean;
  peut_creer_tontines?: boolean;
}