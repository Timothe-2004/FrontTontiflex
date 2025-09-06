// Types TypeScript alignés sur l'API

interface ReglesRetrait {
  type: 'libre' | 'planifié' | string;
  delai_minimum: number;
  pourcentage_retrait: number;
}

export interface Tontine {
  id: string;
  nom: string;
  description?: string;
  montantMinMise: string;
  montantMaxMise: string;
  reglesRetrait?: ReglesRetrait;
  dateCreation: string;
  statut: 'active' | 'fermee' | 'suspendue';
  fraisAdhesion: string;
  date_modification: string;
  administrateurId: string;
  participants: TontineParticipant[];
}

export interface MyTontine {
  id: string;
  participant_id: string;
  nom: string;
  sfd_nom: string;
  solde_client: string;
  montantMinMise: string; 
  montantMaxMise: string; 
  reglesRetrait: ReglesRetrait;
  dateCreation: string; 
  statut: 'active' | 'inactive' | 'cloturee' | string;
  fraisAdhesion: string;
  date_modification: string;
  administrateurId: string;
  participants: TontineParticipant[];
}

export interface TontineParticipant {
  id: string;
  client: string;
  tontine: string;
  dateAdhesion: string;
  montantCotisation: string;
  statut: string;
  rang?: number;
  soldeActuel?: string;
}

// Interface corrigée selon l'API
export interface CreateTontineData {
  nom: string;
  description?: string;
  montantMinMise: string;
  montantMaxMise: string;
  fraisAdhesion: string;
  administrateurId: string;
  statut?: 'active' | 'fermee' | 'suspendue';
}

export interface UpdateTontineData {
  nom?: string;
  montantMinMise?: string;
  montantMaxMise?: string;
  reglesRetrait?: ReglesRetrait;
  statut?: 'active' | 'fermee' | 'suspendue';
  fraisAdhesion?: string;
  administrateurId?: string;
}