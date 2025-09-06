// Types TypeScript basés sur l'API
export interface SFD {
  id: string; // maxLength: 50
  nom: string; // maxLength: 255
  adresse: string; // maxLength: 255
  telephone: string; // maxLength: 30
  email: string; // email, maxLength: 255
  numeroMobileMoney: string; // maxLength: 30, Numéro Mobile Money principal de la SFD
  frais_creation_compte_epargne: string; // decimal, Frais de création d'un compte épargne dans cette SFD en FCFA
  dateCreation: string; // date-time
}

export interface CreateSFDData {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  numeroMobileMoney: string;
  frais_creation_compte_epargne: string;
  dateCreation?: string; // Optionnel, peut être généré automatiquement
}

export interface UpdateSFDData {
  id?: string;
  nom?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  numeroMobileMoney?: string;
  frais_creation_compte_epargne?: string;
  dateCreation?: string;
}

export interface PaginatedSFDList {
  count: number;
  next: string | null;
  previous: string | null;
  results: SFD[];
}

export interface SFDFilters {
  page?: number;
  search?: string;
  nom?: string;
  adresse?: string;
}