export const mockTontines = [
  {
    id: "1",
    name: "Tontine ALAFIA",
    sfd: "SFD Porto-Novo",
    minAmount: 500,
    maxAmount: 5000,
    frequency: "Quotidien",
    members: 25,
    fraisAdhesion: 500,
    type: "Épargne",
    description: "Tontine dédiée aux femmes entrepreneures pour développer leurs activités commerciales.",
    balance: 125000,
    status: "Active"
  },
  {
    id: "2",
    name: "Tontine de la mutuelle pour le developpement à la base",
    sfd: "SFD Cotonou",
    minAmount: 1000,
    maxAmount: 10000,
    frequency: "Hebdomadaire",
    members: 15,
    fraisAdhesion: 500,
    type: "Crédit",
    description: "Système de crédit rotatif pour les petits commerçants.",
    balance: 75000,
    status: "Active"
  },
  {
    id: "3",
    name: "Tontine Agricole Saisonnière",
    sfd: "SFD Abomey",
    minAmount: 2000,
    maxAmount: 15000,
    frequency: "Mensuel",
    members: 30,
    fraisAdhesion: 500,
    type: "Épargne",
    description: "Tontine pour les agricultrices en période de récolte.",
    balance: 200000,
    status: "Active"
  }
];

export const mockUserTontines = [
  {
    id: "1",
    name: "Tontine d'Épargne des Femmes",
    sfd: "SFD Porto-Novo",
    balance: 15000,
    lastContribution: "2025-05-29",
    nextContribution: "2025-05-31"
  },
  {
    id: "2",
    name: "Tontine de Crédit Solidaire",
    sfd: "SFD Cotonou",
    balance: 8500,
    lastContribution: "2025-05-27",
    nextContribution: "2025-06-03"
  }
];

 // Historique des transactions pour toutes les tontines et comptes d'épargne
export const mockTransactionHistory = [
  {
    id: 1,
    date: "2025-06-09T08:30:00Z",
    type: "Contribution",
    montant: 6000,
    tontine: "Tontine ALAFIA", // ← Changé
    statut: "Confirmé",
    reference: "TXN002341",
  },
  {
    id: 2,
    date: "2025-06-08T14:15:00Z",
    type: "Retrait",
    montant: -10000,
    tontine: "Tontine ALAFIA", // ← Changé
    statut: "Confirmé",
    reference: "TXN002342",
  },
  {
    id: 3,
    date: "2025-06-06T10:00:00Z",
    type: "Contribution",
    montant: 4000,
    tontine: "Tontine des Entrepreneurs Dynamiques",
    statut: "En attente",
    reference: "TXN002343",
  },
  {
    id: 4,
    date: "2025-06-04T09:45:00Z",
    type: "Dépôt Épargne",
    montant: 20000,
    tontine: "Compte Épargne Avenir",
    statut: "Confirmé",
    reference: "TXN002344",
  },
  {
    id: 5,
    date: "2025-06-02T16:20:00Z",
    type: "Contribution",
    montant: 3000,
    tontine: "Groupe Solidarité Cotonou",
    statut: "En attente",
    reference: "TXN002345",
  },
  {
    id: 6,
    date: "2025-05-31T11:10:00Z",
    type: "Retrait",
    montant: -7000,
    tontine: "Tontine des Entrepreneurs Dynamiques",
    statut: "Confirmé",
    reference: "TXN002346",
  },
  {
    id: 7,
    date: "2025-05-29T13:50:00Z",
    type: "Paiement Crédit",
    montant: -9000,
    tontine: "Prêt Personnel",
    statut: "Confirmé",
    reference: "TXN002347",
  },
];