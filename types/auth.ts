export interface User {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    adresse: string;
    profession: string;
    role: UserRole;
    sfd_id?: string;
    created_at: string;
    updated_at: string;
  }
  
  export enum UserRole {
    CLIENT = 'client',
    AGENT_SFD = 'agent_sfd',
    SUPERVISEUR_SFD = 'superviseur_sfd',
    ADMIN_SFD = 'admin_sfd',
    ADMIN_PLATEFORME = 'admin_plateforme'
  }
  
  export interface AuthTokens {
    access: string;
    refresh: string;
  }
  
  export interface LoginResponse {
    access: string;
    refresh: string;
    user: User;
  }
  
  export interface AuthState {
    user: User | null;
    tokens: AuthTokens | null;
    isLoading: boolean;
    isAuthenticated: boolean;
  }
  
  // Types pour les formulaires d'authentification
  export interface InscriptionRequest {
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    adresse: string;
    profession: string;
    motDePasse: string;
    confirmMotDePasse: string;
    piece_identite: File;
    photo_identite: File;
  }
  
  export interface LoginRequest {
    email: string;
    motDePasse: string;
  }
  
  export interface APIError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
  }