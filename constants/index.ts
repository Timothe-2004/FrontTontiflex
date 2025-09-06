import { FAQ, Feature, ImageHero, Sidebar } from "@/types";
import {
  Users,
  CreditCard,
  TrendingUp,
  Smartphone,
  Globe,
  Shield,
  Home,
  DollarSign,
  User
} from 'lucide-react';

// Sidebar items
export const sidebarItem: Sidebar[] = [
  {
    id: 1,
    label: 'Tableau de bord',
    icon: Home,
    link: '/dashboard',
  },
  {
    id: 2,
    label: 'Mes Tontines',
    icon: DollarSign,
    link: '/dashboards/dashboard-client/my-tontines',
  },
  {
    id: 3,
    label: 'Mon comptes Epargnes',
    icon: Users,
    link: '#',
  },
  {
    id: 3,
    label: 'Mes transactions',
    icon: Users,
    link: '#',
  },
  {
    id: 4,
    label: 'Mon profil',
    icon: User,
    link: '#',
  },
    {
    id: 4,
    label: 'Mon profil',
    icon: User,
    link: '#',
  },
    {
    id: 4,
    label: 'Notifications',
    icon: User,
    link: '#',
  },
];

export const imagesHero: ImageHero[] = [

  {
    src: "/images/img-1.jpeg",
    alt: "Femme avec téléphone",
    size: "w-32 h-56"
  },
  {
    src: "/images/img-2.jpeg",
    alt: "Homme avec téléphone",
    size: "w-36 h-40"
  },
  {
    src: "/images/img-3.jpeg",
    alt: "Homme avec téléphone",
    size: "w-28 h-44"
  },
  {
    src: "/images/img-4.jpeg",
    alt: "Homme avec téléphone",
    size: "w-44 h-28"
  },
  {
    src: "/images/img-5.jpeg",
    alt: "Femme avec téléphone",
    size: "w-48 h-32"
  }
];


export const features: Feature[] = [
  {
    id: 1,
    title: "Tontines Digitales",
    description:
      "Rejoignez plusieurs tontines simultanément, suivez vos cotisations en temps réel et recevez des notifications SMS automatiques.",
    icon: Users,
  },
  {
    id: 2,
    title: "Comptes Épargne",
    description:
      "Ouvrez et gérez vos comptes épargne auprès de plusieurs SFD avec des dépôts et retraits via Mobile Money.",
    icon: CreditCard,
  },
  {
    id: 3,
    title: "Prêts Simplifiés",
    description:
      "Obtenez des financements rapidement avec un processus d'évaluation automatisé et des remboursements flexibles.",
    icon: TrendingUp,
  },
  {
    id: 4,
    title: "Mobile Money",
    description:
      "Effectuez toutes vos transactions via MTN Mobile Money et Moov Money, 24h/24 et 7j/7.",
    icon: Smartphone,
  },
  {
    id: 5,
    title: "Multi-SFD",
    description:
      "Accédez à plusieurs Systèmes Financiers Décentralisés depuis une seule plateforme unifiée.",
    icon: Globe,
  },
  {
    id: 6,
    title: "Sécurité Garantie",
    description:
      "Vos données sont protégées et chiffrées, conformément aux réglementations BCEAO du Bénin.",
    icon: Shield,
  },
];


export const clientFAQs: FAQ[] = [
  {
    id: 1,
    question: "Comment m'inscrire sur TontiFlex ?",
    answer: "L'inscription est simple et rapide. Il vous suffit de fournir vos informations personnelles (nom, prénom, téléphone, adresse, profession) et de créer un mot de passe. Vous recevrez un SMS de confirmation immédiatement."
  },
  {
    id: 2,
    question: "Quels sont les frais d'adhésion à une tontine ?",
    answer: "Les frais d'adhésion varient entre 1 000 et 5 000 FCFA selon le SFD choisi. Ces frais sont uniques et payables via Mobile Money (MTN ou Moov)."
  },
  {
    id: 2,
    question: "Puis-je rejoindre plusieurs tontines en même temps ?",
    answer: "Oui, absolument ! TontiFlex vous permet de rejoindre des tontines de différents SFD depuis un seul compte. Vous pouvez gérer toutes vos participations depuis votre tableau de bord."
  },
  {
    id: 3,
    question: "Comment effectuer mes cotisations ?",
    answer: "Vous pouvez cotiser 24h/24 et 7j/7 via MTN Mobile Money ou Moov Money directement depuis l'application. Le montant est calculé automatiquement selon votre mise journalière."
  },
  {
    id: 4,
    question: "Mes données sont-elles sécurisées ?",
    answer: "Oui, nous utilisons un chiffrement de niveau bancaire et respectons toutes les réglementations BCEAO du Bénin. Vos informations personnelles et financières sont protégées."
  },
  {
    id: 5,
    question: "Comment puis-je suivre mes contributions ?",
    answer: "Votre tableau de bord affiche en temps réel vos soldes, historiques de cotisations, et échéances. Vous recevez également des notifications SMS pour chaque transaction."
  }
];

// FAQ pour les SFD
export const sfdFAQs: FAQ[] = [
  {
    id: 1,
    question: "Comment intégrer mon SFD à TontiFlex ?",
    answer: "Contactez notre équipe via le formulaire de contact. Nous vous accompagnons dans le processus d'intégration, de la configuration à la formation de vos équipes."
  },
  {
    id: 2,
    question: "Quels sont les avantages pour mon SFD ?",
    answer: "TontiFlex digitalise entièrement vos opérations, réduit les coûts administratifs, améliore le suivi client, et vous donne accès à des rapports détaillés et des analyses de performance."
  },
  {
    id: 3,
    question: "Quelle formation est fournie à mes équipes ?",
    answer: "Nous offrons une formation complète à vos agents, superviseurs et administrateurs. Cela inclut l'utilisation de la plateforme, la gestion des validations, et le support client."
  },
  {
    id: 4,
    question: "Comment gérer les validations et les approbations ?",
    answer: "Vos agents peuvent valider les adhésions et retraits directement depuis leur interface. Les superviseurs gèrent les demandes de prêts avec des outils d'évaluation automatisés."
  },
  {
    id: 5,
    question: "Quels rapports et statistiques sont disponibles ?",
    answer: "Vous avez accès à des tableaux de bord complets avec statistiques en temps réel : nombre de clients, volumes de transactions, performances par agent, et analyses de rentabilité."
  },
  {
    id: 6,
    question: "La plateforme est-elle conforme aux réglementations ?",
    answer: "Oui, TontiFlex respecte toutes les directives BCEAO applicables au Bénin, avec traçabilité complète des transactions et protection des données personnelles."
  }
];