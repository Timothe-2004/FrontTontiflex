// data/loanRequestsMockData.ts

export interface LoanRequest {
    id: string;
    nom: string;
    prenom: string;
    email?: string;
    telephone?: string;
    statut: 'soumis' | 'en_cours_examen' | 'transfere_admin' | 'rejected' | 'transferred';
    type_pret: string;
    date_soumission: string;
    montant_souhaite: number;
    situation_professionnelle: string;
    ratio_endettement: number; // Score de 0 à 100
    duree_pret: number; // en mois
    revenu_mensuel: number;
    objet_pret: string;
    justificatif_identite: boolean;
    details_garantie: string;
    historique_prets_anterieurs: number; // en mois
    adresse?: string;
    age?: number;
    profession_detaillee?: string;
    employeur?: string;
    anciennete_emploi?: number; // en mois
    charges_mensuelles?: number;
    nombre_dependants?: number;
    patrimoine_estime?: number;
    commentaires_superviseur?: string;
    date_derniere_modification?: string;
    superviseur_assigne?: string;
    priorite?: 'basse' | 'normale' | 'haute' | 'urgente';
    sfd_origine?: string;
    agent_sfd?: string;
  }
  
  export const mockLoanRequests: LoanRequest[] = [
    {
      id: "PRET-2025-001",
      nom: "AHOYO",
      prenom: "Bernadette",
      email: "b.ahoyo@gmail.com",
      telephone: "+229 97 23 45 67",
      statut: "soumis",
      type_pret: "Crédit agricole",
      date_soumission: "2025-07-08T10:30:00Z",
      montant_souhaite: 850000,
      situation_professionnelle: "Agricultrice",
      ratio_endettement: 88,
      duree_pret: 18,
      revenu_mensuel: 120000,
      objet_pret: "Achat de semences et engrais pour la campagne agricole",
      justificatif_identite: true,
      details_garantie: "Terrain agricole de 2 hectares à Sakété",
      historique_prets_anterieurs: 24,
      adresse: "Sakété, Plateau",
      age: 42,
      profession_detaillee: "Productrice de maïs et haricot",
      employeur: "Indépendante",
      anciennete_emploi: 180,
      charges_mensuelles: 45000,
      nombre_dependants: 3,
      patrimoine_estime: 2500000,
      priorite: "normale",
      sfd_origine: "SFD Porto-Novo",
      agent_sfd: "Marie Assogba"
    },
    {
      id: "PRET-2025-002",
      nom: "KPADE",
      prenom: "Michel",
      email: "m.kpade@yahoo.fr",
      telephone: "+229 94 56 78 90",
      statut: "en_cours_examen",
      type_pret: "Crédit commercial",
      date_soumission: "2025-07-06T14:20:00Z",
      montant_souhaite: 1200000,
      situation_professionnelle: "Commerçant",
      ratio_endettement: 76,
      duree_pret: 24,
      revenu_mensuel: 180000,
      objet_pret: "Extension de boutique et achat de marchandises",
      justificatif_identite: true,
      details_garantie: "Boutique commerciale + stock de marchandises",
      historique_prets_anterieurs: 36,
      adresse: "Bohicon, Zou",
      age: 38,
      profession_detaillee: "Vente de produits alimentaires en gros",
      employeur: "Indépendant",
      anciennete_emploi: 144,
      charges_mensuelles: 65000,
      nombre_dependants: 4,
      patrimoine_estime: 3200000,
      commentaires_superviseur: "Dossier solide, historique de remboursement excellent",
      date_derniere_modification: "2025-07-09T09:15:00Z",
      superviseur_assigne: "Superviseur A",
      priorite: "haute",
      sfd_origine: "SFD Porto-Novo",
      agent_sfd: "Paul Sawadogo"
    },
    {
      id: "PRET-2025-003",
      nom: "ADJOVI",
      prenom: "Christine",
      email: "c.adjovi@hotmail.com",
      telephone: "+229 96 12 34 56",
      statut: "transfere_admin",
      type_pret: "Crédit artisanat",
      date_soumission: "2025-07-04T16:45:00Z",
      montant_souhaite: 450000,
      situation_professionnelle: "Couturière",
      ratio_endettement: 92,
      duree_pret: 12,
      revenu_mensuel: 95000,
      objet_pret: "Achat de machines à coudre professionnelles",
      justificatif_identite: true,
      details_garantie: "Matériel de couture existant + caution solidaire",
      historique_prets_anterieurs: 18,
      adresse: "Cotonou, Littoral",
      age: 35,
      profession_detaillee: "Couture et broderie traditionnelle",
      employeur: "Indépendante",
      anciennete_emploi: 120,
      charges_mensuelles: 35000,
      nombre_dependants: 2,
      patrimoine_estime: 800000,
      commentaires_superviseur: "Approuvé - Excellent potentiel de développement",
      date_derniere_modification: "2025-07-09T11:30:00Z",
      superviseur_assigne: "Superviseur B",
      priorite: "normale",
      sfd_origine: "SFD Espoir Togo",
      agent_sfd: "Koffi Mensah"
    },
    {
      id: "PRET-2025-004",
      nom: "BIOKOU",
      prenom: "Séverin",
      email: "s.biokou@gmail.com",
      telephone: "+229 95 67 89 01",
      statut: "rejected",
      type_pret: "Crédit équipement",
      date_soumission: "2025-07-02T11:15:00Z",
      montant_souhaite: 2500000,
      situation_professionnelle: "Mécanicien",
      ratio_endettement: 45,
      duree_pret: 36,
      revenu_mensuel: 150000,
      objet_pret: "Achat d'équipements lourds pour garage automobile",
      justificatif_identite: true,
      details_garantie: "Garage en construction (non finalisé)",
      historique_prets_anterieurs: 0,
      adresse: "Parakou, Borgou",
      age: 29,
      profession_detaillee: "Réparation automobile et moto",
      employeur: "Indépendant",
      anciennete_emploi: 24,
      charges_mensuelles: 85000,
      nombre_dependants: 1,
      patrimoine_estime: 600000,
      commentaires_superviseur: "Rejeté - Garantie insuffisante, premier prêt trop important",
      date_derniere_modification: "2025-07-08T15:20:00Z",
      superviseur_assigne: "Superviseur C",
      priorite: "basse",
      sfd_origine: "SFD Solidarité Burkina",
      agent_sfd: "Amadou Traoré"
    },
    {
      id: "PRET-2025-005",
      nom: "HOUNSOU",
      prenom: "Fatima",
      email: "f.hounsou@gmail.com",
      telephone: "+229 97 11 22 33",
      statut: "soumis",
      type_pret: "Crédit éducation",
      date_soumission: "2025-07-09T08:30:00Z",
      montant_souhaite: 300000,
      situation_professionnelle: "Enseignante",
      ratio_endettement: 89,
      duree_pret: 15,
      revenu_mensuel: 85000,
      objet_pret: "Financement formation professionnelle informatique",
      justificatif_identite: true,
      details_garantie: "Salaire domicilié + caution d'un collègue",
      historique_prets_anterieurs: 12,
      adresse: "Abomey, Zou",
      age: 31,
      profession_detaillee: "Enseignante école primaire publique",
      employeur: "Ministère de l'Enseignement Primaire",
      anciennete_emploi: 84,
      charges_mensuelles: 28000,
      nombre_dependants: 2,
      patrimoine_estime: 450000,
      priorite: "haute",
      sfd_origine: "SFD Test Épargne",
      agent_sfd: "Moussa Traore"
    },
    {
      id: "PRET-2025-006",
      nom: "GANGBO",
      prenom: "Emmanuel",
      email: "e.gangbo@yahoo.fr",
      telephone: "+229 94 88 77 66",
      statut: "transferred",
      type_pret: "Crédit habitat",
      date_soumission: "2025-06-28T13:00:00Z",
      montant_souhaite: 3500000,
      situation_professionnelle: "Fonctionnaire",
      ratio_endettement: 82,
      duree_pret: 60,
      revenu_mensuel: 220000,
      objet_pret: "Construction d'une maison d'habitation",
      justificatif_identite: true,
      details_garantie: "Terrain titré + hypothèque sur construction",
      historique_prets_anterieurs: 48,
      adresse: "Calavi, Atlantique",
      age: 45,
      profession_detaillee: "Inspecteur des impôts",
      employeur: "Direction Générale des Impôts",
      anciennete_emploi: 216,
      charges_mensuelles: 95000,
      nombre_dependants: 5,
      patrimoine_estime: 8500000,
      commentaires_superviseur: "Transféré vers administration centrale pour montant élevé",
      date_derniere_modification: "2025-07-05T16:45:00Z",
      superviseur_assigne: "Superviseur A",
      priorite: "normale",
      sfd_origine: "SFD Porto-Novo",
      agent_sfd: "Marie Assogba"
    },
    {
      id: "PRET-2025-007",
      nom: "DOSSOU",
      prenom: "Régine",
      email: "r.dossou@hotmail.com",
      telephone: "+229 96 55 44 33",
      statut: "soumis",
      type_pret: "Crédit santé",
      date_soumission: "2025-07-09T15:20:00Z",
      montant_souhaite: 180000,
      situation_professionnelle: "Vendeuse",
      ratio_endettement: 71,
      duree_pret: 8,
      revenu_mensuel: 65000,
      objet_pret: "Frais médicaux opération urgente",
      justificatif_identite: true,
      details_garantie: "Caution solidaire familiale",
      historique_prets_anterieurs: 6,
      adresse: "Ouidah, Atlantique",
      age: 28,
      profession_detaillee: "Vente de produits cosmétiques",
      employeur: "Indépendante",
      anciennete_emploi: 36,
      charges_mensuelles: 22000,
      nombre_dependants: 1,
      patrimoine_estime: 150000,
      priorite: "urgente",
      sfd_origine: "SFD Espoir Togo",
      agent_sfd: "deins Roman"
    },
    {
      id: "PRET-2025-008",
      nom: "AKPAKI",
      prenom: "Julien",
      email: "j.akpaki@gmail.com",
      telephone: "+229 95 22 11 99",
      statut: "en_cours_examen",
      type_pret: "Crédit transport",
      date_soumission: "2025-07-07T09:45:00Z",
      montant_souhaite: 950000,
      situation_professionnelle: "Chauffeur",
      ratio_endettement: 67,
      duree_pret: 30,
      revenu_mensuel: 140000,
      objet_pret: "Achat d'un véhicule de transport en commun",
      justificatif_identite: true,
      details_garantie: "Véhicule acheté + police d'assurance",
      historique_prets_anterieurs: 30,
      adresse: "Natitingou, Atacora",
      age: 36,
      profession_detaillee: "Transport inter-urbain",
      employeur: "Indépendant",
      anciennete_emploi: 108,
      charges_mensuelles: 55000,
      nombre_dependants: 3,
      patrimoine_estime: 1200000,
      commentaires_superviseur: "En cours d'évaluation - Vérification des références",
      date_derniere_modification: "2025-07-09T10:00:00Z",
      superviseur_assigne: "Superviseur B",
      priorite: "normale",
      sfd_origine: "SFD Solidarité Burkina",
      agent_sfd: "Depardieu Raoul"
    },
    {
      id: "PRET-2025-009",
      nom: "ZOUNON",
      prenom: "Célestine",
      email: "c.zounon@yahoo.fr",
      telephone: "+229 97 33 66 99",
      statut: "soumis",
      type_pret: "Crédit commercial",
      date_soumission: "2025-07-09T12:15:00Z",
      montant_souhaite: 720000,
      situation_professionnelle: "Commerçante",
      ratio_endettement: 85,
      duree_pret: 20,
      revenu_mensuel: 110000,
      objet_pret: "Stock de produits alimentaires pour grossiste",
      justificatif_identite: true,
      details_garantie: "Boutique + stock existant",
      historique_prets_anterieurs: 15,
      adresse: "Lokossa, Mono",
      age: 33,
      profession_detaillee: "Vente de riz et céréales en gros",
      employeur: "Indépendante",
      anciennete_emploi: 72,
      charges_mensuelles: 42000,
      nombre_dependants: 2,
      patrimoine_estime: 950000,
      priorite: "normale",
      sfd_origine: "SFD Test Épargne",
      agent_sfd: "Moussa Traore"
    },
    {
      id: "PRET-2025-010",
      nom: "TOGNIFODE",
      prenom: "Pierre",
      email: "p.tognifode@gmail.com",
      telephone: "+229 94 77 88 55",
      statut: "rejected",
      type_pret: "Crédit loisir",
      date_soumission: "2025-07-01T16:30:00Z",
      montant_souhaite: 1500000,
      situation_professionnelle: "Étudiant",
      ratio_endettement: 25,
      duree_pret: 48,
      revenu_mensuel: 45000,
      objet_pret: "Achat d'une moto de luxe",
      justificatif_identite: true,
      details_garantie: "Caution parentale",
      historique_prets_anterieurs: 0,
      adresse: "Cotonou, Littoral",
      age: 23,
      profession_detaillee: "Étudiant en gestion",
      employeur: "N/A",
      anciennete_emploi: 0,
      charges_mensuelles: 15000,
      nombre_dependants: 0,
      patrimoine_estime: 50000,
      commentaires_superviseur: "Rejeté - Revenus insuffisants, objet non prioritaire",
      date_derniere_modification: "2025-07-03T14:20:00Z",
      superviseur_assigne: "Superviseur C",
      priorite: "basse",
      sfd_origine: "SFD Porto-Novo",
      agent_sfd: "Marie Assogba"
    },
    {
      id: "PRET-2025-011",
      nom: "HOUNKANRIN",
      prenom: "Sandrine",
      email: "s.hounkanrin@hotmail.com",
      telephone: "+229 96 99 11 22",
      statut: "en_cours_examen",
      type_pret: "Crédit artisanat",
      date_soumission: "2025-07-08T11:00:00Z",
      montant_souhaite: 380000,
      situation_professionnelle: "Artisane",
      ratio_endettement: 79,
      duree_pret: 16,
      revenu_mensuel: 75000,
      objet_pret: "Équipement pour atelier de transformation agroalimentaire",
      justificatif_identite: true,
      details_garantie: "Équipement acheté + local d'activité",
      historique_prets_anterieurs: 8,
      adresse: "Savè, Collines",
      age: 27,
      profession_detaillee: "Transformation manioc et igname",
      employeur: "Indépendante",
      anciennete_emploi: 48,
      charges_mensuelles: 25000,
      nombre_dependants: 1,
      patrimoine_estime: 320000,
      commentaires_superviseur: "Dossier prometteur, secteur porteur",
      date_derniere_modification: "2025-07-09T13:45:00Z",
      superviseur_assigne: "Superviseur A",
      priorite: "haute",
      sfd_origine: "SFD Solidarité Burkina",
      agent_sfd: "Paul Sawadogo"
    },
    {
      id: "PRET-2025-012",
      nom: "ADJAHO",
      prenom: "Robert",
      email: "r.adjaho@yahoo.fr",
      telephone: "+229 95 44 77 11",
      statut: "soumis",
      type_pret: "Crédit agricole",
      date_soumission: "2025-07-09T17:00:00Z",
      montant_souhaite: 650000,
      situation_professionnelle: "Agriculteur",
      ratio_endettement: 94,
      duree_pret: 22,
      revenu_mensuel: 98000,
      objet_pret: "Achat de matériel agricole et semences améliorées",
      justificatif_identite: true,
      details_garantie: "Terrain agricole 3 hectares + récolte sur pied",
      historique_prets_anterieurs: 20,
      adresse: "Kandi, Alibori",
      age: 48,
      profession_detaillee: "Production coton et maïs",
      employeur: "Indépendant",
      anciennete_emploi: 240,
      charges_mensuelles: 38000,
      nombre_dependants: 6,
      patrimoine_estime: 1800000,
      priorite: "normale",
      sfd_origine: "SFD Espoir Togo",
      agent_sfd: "Koffi Mensah"
    }
  ];
  
  // Fonction utilitaire pour obtenir les statistiques
  export const getLoanRequestsStats = () => {
    const total = mockLoanRequests.length;
    const enAttente = mockLoanRequests.filter(r => r.statut === 'soumis').length;
    const enCours = mockLoanRequests.filter(r => r.statut === 'en_cours_examen').length;
    const approuves = mockLoanRequests.filter(r => r.statut === 'transfere_admin').length;
    const rejetes = mockLoanRequests.filter(r => r.statut === 'rejected').length;
    const transferes = mockLoanRequests.filter(r => r.statut === 'transferred').length;
    
    const montantTotal = mockLoanRequests.reduce((sum, r) => sum + r.montant_souhaite, 0);
    const montantMoyen = montantTotal / total;
    
    const scoresMoyens = mockLoanRequests.reduce((sum, r) => sum + r.ratio_endettement, 0) / total;
    
    return {
      total,
      enAttente,
      enCours,
      approuves,
      rejetes,
      transferes,
      montantTotal,
      montantMoyen,
      scoresMoyens: Math.round(scoresMoyens)
    };
  };
  
  // Fonction pour filtrer par statut
  export const filterByStatus = (status: string) => {
    if (status === 'tous') return mockLoanRequests;
    return mockLoanRequests.filter(request => request.statut === status);
  };
  
  // Fonction pour filtrer par priorité
  export const filterByPriority = (priority: string) => {
    if (priority === 'tous') return mockLoanRequests;
    return mockLoanRequests.filter(request => request.priorite === priority);
  };
  
  // Fonction pour rechercher
  export const searchRequests = (searchTerm: string) => {
    if (!searchTerm) return mockLoanRequests;
    
    const term = searchTerm.toLowerCase();
    return mockLoanRequests.filter(request => 
      request.nom.toLowerCase().includes(term) ||
      request.prenom.toLowerCase().includes(term) ||
      request.id.toLowerCase().includes(term) ||
      request.profession_detaillee?.toLowerCase().includes(term) ||
      request.objet_pret.toLowerCase().includes(term)
    );
  };
  
  export default mockLoanRequests;