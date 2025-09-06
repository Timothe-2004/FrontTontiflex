import { Loan } from "./loans";

export interface LoanApplication {
    id: string;
    client: string;
    superviseur_examinateur?: string;
    admin_validateur?: string;
    statut: 'soumis' | 'en_cours_examen' | 'transfere_admin' | 'accorde' | 'decaisse' | 'en_remboursement' | 'solde' | 'rejete';
    date_soumission: string;
    date_examen_superviseur?: string;
    date_transfert_admin?: string;
    date_validation_admin?: string;
    date_decaissement?: string;
    nom: string;
    prenom: string;
    date_naissance: string;
    adresse_domicile: string;
    adresse_bureau?: string;
    situation_familiale: 'celibataire' | 'marie' | 'divorce' | 'veuf' | 'union_libre';
    telephone: string;
    email: string;
    situation_professionnelle: string;
    justificatif_identite: string;
    revenu_mensuel: string;
    charges_mensuelles: string;
    ratio_endettement: string;
    historique_prets_anterieurs?: string;
    plan_affaires?: string;
    montant_souhaite: string;
    duree_pret: number;
    type_pret: 'consommation' | 'immobilier' | 'professionnel' | 'urgence';
    objet_pret: string;
    type_garantie: 'bien_immobilier' | 'garant_physique' | 'depot_garantie' | 'aucune';
    details_garantie: string;
    signature_caution?: boolean;
    signature_collecte_donnees: boolean;
    document_complet: string;
    commentaires_superviseur?: string;
    commentaires_admin?: string;
    raison_rejet?: string;
    score_fiabilite?: string;
    date_creation: string;
    date_modification: string;
    prochaine_action: string;
  }
  
  export interface CreateLoanApplicationData {
    compte_epargne: string;
    date_naissance: string;
    adresse_domicile: string;
    adresse_bureau?: string;
    situation_familiale: 'celibataire' | 'marie' | 'divorce' | 'veuf' | 'union_libre';
    situation_professionnelle: string;
    justificatif_identite: string;
    revenu_mensuel: string;
    charges_mensuelles: string;
    historique_prets_anterieurs?: string;
    plan_affaires?: string;
    montant_souhaite: string;
    duree_pret: number;
    type_pret: 'consommation' | 'immobilier' | 'professionnel' | 'urgence';
    objet_pret: string;
    type_garantie: 'bien_immobilier' | 'garant_physique' | 'depot_garantie' | 'aucune';
    details_garantie: string;
    signature_caution?: boolean;
    signature_collecte_donnees: boolean;
    document_complet: File;
  }
  
  export interface UpdateLoanApplicationData {
    superviseur_examinateur?: string;
    admin_validateur?: string;
    statut?: 'soumis' | 'en_cours_examen' | 'transfere_admin' | 'accorde' | 'decaisse' | 'en_remboursement' | 'solde' | 'rejete';
    date_examen_superviseur?: string;
    date_transfert_admin?: string;
    date_validation_admin?: string;
    date_decaissement?: string;
    date_naissance?: string;
    adresse_domicile?: string;
    adresse_bureau?: string;
    situation_familiale?: 'celibataire' | 'marie' | 'divorce' | 'veuf' | 'union_libre';
    situation_professionnelle?: string;
    justificatif_identite?: string;
    revenu_mensuel?: string;
    charges_mensuelles?: string;
    historique_prets_anterieurs?: string;
    plan_affaires?: string;
    montant_souhaite?: string;
    duree_pret?: number;
    type_pret?: 'consommation' | 'immobilier' | 'professionnel' | 'urgence';
    objet_pret?: string;
    type_garantie?: 'bien_immobilier' | 'garant_physique' | 'depot_garantie' | 'aucune';
    details_garantie?: string;
    signature_caution?: boolean;
    signature_collecte_donnees?: boolean;
    document_complet?: File;
    commentaires_superviseur?: string;
    commentaires_admin?: string;
    raison_rejet?: string;
    score_fiabilite?: string;
  }
  
  export interface PaginatedLoanApplicationList {
    count: number;
    next?: string;
    previous?: string;
    results: LoanApplication[];
  }
  
  export interface LoanApplicationFilters {
    page?: number;
    statut?: string;
    type_pret?: string;
    client?: string;
    superviseur_examinateur?: string;
    admin_validateur?: string;
  }
  
  export interface AdminDecisionData {
    action: 'valider' | 'rejeter';
    commentaires?: string;
    montant_accorde?: string;
  }
  
  export interface SupervisorProcessData {
    action: "approuver" | "rejeter";
    // Pour approuver
    montant_accorde?: number;
    taux_interet?: number;
    duree_mois?: number;
    rapport_superviseur?: string;
    // Optionnel
    commentaire?: string;
  }
  export interface LoanApplicationResponse {
    message: string;
    demande: LoanApplication;
    pret: Loan;
  }
  
  export interface RapportDemande {
    demande_id: string;
  
    client: {
      nom: string;
      age: number | null;
      situation_familiale: string;
      profession: string;
    };
  
    pret_demande: {
      montant: number;
      duree: number;
      type: string;
      objet: string;
    };
  
    situation_financiere: {
      revenu_mensuel: number;
      charges_mensuelles: number;
      ratio_endettement: number;
    };
  
    score_fiabilite: {
      score: number;
      evaluation: string;
      details: {
        score_base: number;
        bonus_anciennete_epargne: number;
        bonus_participation_tontines: number;
        bonus_regularite_cotisations: number;
        bonus_historique_prets: number;
        malus_retards: number;
      };
      recommandations: string[];
    };
  
    analyse_capacite: {
      revenu_mensuel: number;
      charges_actuelles: number;
      reste_a_vivre_actuel: number;
      mensualite_pret: number;
      nouveau_ratio_endettement: number;
      reste_apres_pret: number;
      ratio_max_recommande: number;
      reste_minimum_recommande: number;
      analyse_favorable: boolean;
      niveau_risque: string;
      commentaires: string[];
    };
  
    recommandations: string[]; // (peut être vide)
    niveau_risque_global: string;
    decision_recommandee: string;
  }
  
  
  // 🆕 Interface pour compléter le rapport superviseur
  export interface CompleterRapportData {
    rapport_superviseur: string; // minLength: 1
  }
  
