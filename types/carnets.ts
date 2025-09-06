// src/types/carnets.ts

export interface CarnetCotisation {
    id: number; // readonly
    client_nom: string; // readonly
    tontine_nom: string; // readonly
    mises_completees: string; // readonly - nombre de mises complétées
    cycle_debut: string; // date YYYY-MM-DD
    mises_cochees: MisesCochees; // Liste de 31 booleans
    date_creation: string; // readonly datetime
    date_modification: string; // readonly datetime
    client: string; // UUID
    tontine: string; // UUID
  }
  
  // Structure pour les mises cochées (31 jours)
  export interface MisesCochees {
    [key: string]: boolean; // "jour_1" à "jour_31"
  }
  
  export interface CarnetCreateData {
    cycle_debut: string; // date YYYY-MM-DD
    mises_cochees?: MisesCochees;
    client: string; // UUID
    tontine: string; // UUID
  }
  
  export interface CarnetUpdateData {
    cycle_debut?: string;
    mises_cochees?: MisesCochees;
    client?: string;
    tontine?: string;
  }
  
  // Interface pour les statistiques calculées
  export interface CarnetStatistiques {
    jours_payes: number;
    jours_manques: number;
    taux_ponctualite: number; // pourcentage
    jours_retard: number;
    montant_total_verse: number;
    prochaine_echeance: string | null;
    commission_sfd_payee: boolean;
  }
  
  // Interface pour un jour dans le calendrier
  export interface JourCotisation {
    numero: number; // 1 à 31
    date: string; // date calculée
    est_paye: boolean;
    est_commission_sfd: boolean; // true pour le jour 1
    montant?: number;
    reference_transaction?: string;
    est_en_retard: boolean;
  }
  
  // Interface pour le calendrier complet du carnet
  export interface CalendrierCarnet {
    carnet: CarnetCotisation;
    jours: JourCotisation[];
    statistiques: CarnetStatistiques;
    cycle_actuel: number;
    date_fin_cycle: string;
  }
  
  export interface CarnetFilters {
    page?: number;
    client?: string;
    tontine?: string;
    cycle_debut?: string;
    actif_seulement?: boolean;
  }
  
  export interface PaginatedCarnetResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: CarnetCotisation[];
  }
  
  // Types pour les actions sur les cotisations
  export interface CotisationAction {
    carnet_id: number;
    jour: number; // 1 à 31
    payer: boolean;
    montant?: number;
    reference_transaction?: string;
  }
  
  // Interface pour les résumés mensuels
  export interface ResumeMensuel {
    mois: string;
    annee: number;
    carnets_actifs: number;
    total_cotisations: number;
    taux_ponctualite_moyen: number;
    jours_retard_total: number;
  }