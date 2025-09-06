import {
  Home,
  Users,
  PiggyBank,
  FileText,
  Bell,
  User,
  CreditCard,
  File,
  Book,
  LogIn,
  ClipboardList,
  TrendingUp,
  Target,
  BarChart3,
  Activity,
  Settings,
  Globe,
  Database,
  Building2
} from 'lucide-react';
import { RoleKey } from '@/constants/roles';

export interface SidebarItem {
  id: number;
  label: string;
  icon: React.ElementType;
  link: string;
  description?: string;
  badge?: number;
  items?: SidebarItem[];
}

export const sidebarItemsByRole: Record<RoleKey, SidebarItem[]> = {
  ADMIN_PLATEFORME: [
    {
      id: 1,
      label: 'Tableau de bord',
      icon: Users,
      link: '/dashboards/dashboard-admin_tontiflex',
      description: 'Gestion des utilisateurs'
    },
    {
      id: 2,
      label: 'Utilisateurs',
      icon: Users,
      link: '/dashboards/dashboard-admin_tontiflex/utilisateurs',
      description: 'Gestion des utilisateurs',
      items: [
        {
          id: 1,
          label: 'Clients SFD',
          icon: Users,
          link: '/dashboards/dashboard-admin_tontiflex/utilisateurs/clients',
          description: 'Gestion des utilisateurs'
        },
        {
          id: 2,
          label: 'Agents SFD',
          icon: Users,
          link: '/dashboards/dashboard-admin_tontiflex/utilisateurs/agents-sfd',
          description: 'Gestion des utilisateurs'
        },
        {
          id: 3,
          label: 'Superviseurs SFD',
          icon: Users,
          link: '/dashboards/dashboard-admin_tontiflex/utilisateurs',
          description: 'Gestion des utilisateurs'
        },
        {
          id: 4,
          label: 'Admins plateforme',
          icon: Users,
          link: '/dashboards/dashboard-admin_tontiflex/utilisateurs/admins-plateforme',
          description: 'Gestion des utilisateurs'
        }
      ]
    },
    {
      id: 3,
      label: 'SFD',
      icon: Building2,
      link: '/dashboards/dashboard-admin_tontiflex/sfd',
      description: 'Gestion des SFD'
    },
    {
      id: 4,
      label: 'Analytics',
      icon: TrendingUp,
      link: '/dashboards/dashboard-admin_tontiflex/analytics',
      description: 'Analytics'
    },
    {
      id: 5,
      label: 'Logs & Audit',
      icon: Database,
      link: '/dashboards/dashboard-admin_tontiflex/logs',
      description: 'Logs & Audit'
    },
    {
      id: 6,
      label: 'Paramètres',
      icon: Settings,
      link: '/dashboards/dashboard-admin_tontiflex/settings',
      description: 'Paramètres'
    }
  ],
  ADMIN_SFD: [
    {
      id: 1,
      label: 'Tableau de bord',
      icon: Home,
      link: '/dashboards/dashboard-adminsfd',
      description: 'Vue d\'ensemble'
    },
    {
      id: 2,
      label: 'Tontines',
      icon: FileText,
      link: '/dashboards/dashboard-adminsfd/tontines',
      description: 'Gestion des tontines'
    },
    // {
    //   id: 3,
    //   label: 'Créer Tontine',
    //   icon: CreditCard,
    //   link: '/dashboards/dashboard-adminsfd/tontines/create',
    //   description: 'Créer une tontine'
    // },
    {
      id: 3,
      label: 'Prêts',
      icon: File,
      link: '/dashboards/dashboard-adminsfd/loans',
      description: 'Gestion des prêts'
    },
    {
      id: 4,
      label: 'Activités',
      icon: FileText,
      link: '/dashboards/dashboard-adminsfd/activity-logs',
      description: 'Historique des activités'
    },
    {
      id: 5,
      label: 'Statistiques',
      icon: User,
      link: '/dashboards/dashboard-adminsfd/statistics',
      description: 'Statistiques'
    }
  ],
  CLIENT: [
    {
      id: 1,
      label: 'Tableau de bord',
      icon: Home,
      link: '/dashboards/dashboard-client',
      description: 'Vue d\'ensemble'
    },
    {
      id: 2,
      label: 'Tontines',
      icon: Users,
      link: '/dashboards/dashboard-client/my-tontines',
      description: 'Gérer vos tontines'
    },
    {
      id: 3,
      label: 'Compte Courant',
      icon: PiggyBank,
      link: '/dashboards/dashboard-client/saving-accounts',
      description: 'Gérer vos comptes courants'
    },
    {
      id: 4,
      label: 'Prêts',
      icon: PiggyBank,
      link: '/dashboards/dashboard-client/loans',
      description: 'Gérer vos prêts'
    },
    {
      id: 5,
      label: 'Historiques',
      icon: FileText,
      link: '/dashboards/dashboard-client/operations-history',
      description: 'Historique des opérations'
    }
  ],
  AGENT_SFD: [
    {
      id: 1,
      label: 'Tableau de bord',
      icon: Home,
      link: '/dashboards/dashboard-agent',
      description: 'Vue d\'ensemble'
    },
    {
      id: 2,
      label: 'Adhésions',
      icon: Home,
      link: '/dashboards/dashboard-agent/membership-requests',
      description: 'Gérer les demandes d\'adhésion'
    },
    {
      id: 3,
      label: 'Création comptes',
      icon: Users,
      link: '/dashboards/dashboard-agent/saving-accounts',
      description: 'Gérer les demandes de création de comptes'
    },
    {
      id: 4,
      label: 'Retraits tontines',
      icon: PiggyBank,
      link: '/dashboards/dashboard-agent/withdrawal-requests-tontine',
      description: 'Gérer les demandes de retraits'
    },
    {
      id: 5,
      label: 'Retraits comptes',
      icon: PiggyBank,
      link: '/dashboards/dashboard-agent/withdrawal-requests-compte',
      description: 'Gérer les demandes de retraits'
    },
    {
      id: 6,
      label: 'Historiques',
      icon: PiggyBank,
      link: '/dashboards/dashboard-agent/history',
      description: 'Historique des actions'
    }
  ],
  SUPERVISEUR_SFD: [
    {
      id: 1,
      label: 'Tableau de bord',
      icon: Home,
      link: '/dashboards/dashboard-supervisor',
      description: 'Vue d\'ensemble'
    },
    {
      id: 2,
      label: 'Demandes de prêt',
      icon: FileText,
      link: '/dashboards/dashboard-supervisor/loan-requests',
      description: 'Gérer les demandes de prêt'
      },
    {
      id: 3,
      label: 'Suivi remboursements',
      icon: TrendingUp,
      link: '/dashboards/dashboard-supervisor/loan-tracking',
      description: 'Suivre les remboursements'
    },
    // {
    //   id: 4,
    //   label: 'Scores de fiabilité',
    //   icon: Target,
    //   link: '/dashboards/dashboard-supervisor/reliability-scores',
    // },
    {
      id: 4,
      label: 'Rapports & Analytics',
      icon: BarChart3,
      link: '/dashboards/dashboard-supervisor/reports',
      description: 'Gérer les rapports & analytics' 
    },
    {
      id: 5,
      label: 'Historique décisions',
      icon: ClipboardList,
      link: '/dashboards/dashboard-supervisor/decision-history',
      description: 'Historique des décisions'
    },
  ]
};