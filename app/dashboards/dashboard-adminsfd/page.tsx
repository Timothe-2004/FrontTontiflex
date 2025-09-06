// app/dashboard-sfd-admin/page.tsx
'use client'
import React from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  CreditCard,
  PiggyBank,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Eye,
  Plus,
  FileText,
  Calendar,
  Target
} from 'lucide-react';
import Link from 'next/link';

const SFDAdminDashboard = () => {
  // Données mockées pour les statistiques
  const sfdStats = {
    totalClients: 1247,
    clientsActifs: 1089,
    nouveuaxClients: 23,
    tontinesActives: 12,
    comptesEpargne: 89,
    pretesEnCours: 45,
    volumeTransactions: 25847000,
    revenusMois: 1247000,
    tauxDefaut: 2.3,
    scoreSante: 92
  };

  const recentActions = [
    {
      id: 1,
      type: "validation",
      description: "Prêt validé par Admin - Marie JOHNSON - 150,000 FCFA",
      time: "Il y a 15 min",
      status: "success",
      user: "Vous"
    },
    {
      id: 2,
      type: "creation",
      description: "Nouvelle tontine créée: Tontine des Commerçantes",
      time: "Il y a 1h",
      status: "info",
      user: "Vous"
    },
    {
      id: 3,
      type: "agent_action",
      description: "Agent AHOYO a validé une adhésion",
      time: "Il y a 2h",
      status: "success",
      user: "Agent AHOYO"
    },
    {
      id: 4,
      type: "superviseur_action",
      description: "Superviseur DOSSA a traité une demande de prêt",
      time: "Il y a 3h",
      status: "warning",
      user: "Superviseur DOSSA"
    }
  ];

  const alertes = [
    {
      type: "urgent",
      message: "5 prêts en attente de validation depuis plus de 48h",
      action: "Valider maintenant",
      link: "/dashboard-sfd-admin/loans"
    },
    {
      type: "warning",
      message: "Limite de crédit atteinte pour 3 clients",
      action: "Voir détails",
      link: "/dashboard-sfd-admin/users"
    },
    {
      type: "info",
      message: "Rapport mensuel disponible",
      action: "Télécharger",
      link: "/dashboard-sfd-admin/statistics"
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
    
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard className="p-6 border-l-4 border-l-emerald-500 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Clients totaux</p>
                <p className="text-3xl font-bold text-emerald-600">{sfdStats.totalClients.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users className="text-emerald-600" size={24} />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <ArrowUp size={16} className="text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+{sfdStats.nouveuaxClients}</span>
              <span className="text-gray-500 ml-1">ce mois</span>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Volume transactions</p>
                <p className="text-3xl font-bold text-blue-600">{(sfdStats.volumeTransactions / 1000000).toFixed(1)}M</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+12.5%</span>
              <span className="text-gray-500 ml-1">vs mois dernier</span>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-l-purple-500 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tontines actives</p>
                <p className="text-3xl font-bold text-purple-600">{sfdStats.tontinesActives}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Building className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle size={16} className="text-green-500 mr-1" />
              <span className="text-green-600 font-medium">Toutes fonctionnelles</span>
            </div>
          </GlassCard>
        </div>

        {/* Grille principale */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Section gauche - Actions rapides */}
          <div className="space-y-6">
            
            {/* Actions rapides */}
            <GlassCard className="p-6" hover={false}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="mr-2 text-emerald-600" size={20} />
                Actions Rapides
              </h3>
              <div className="flex  flex-col gap-2">
              <Link href="/dashboards/dashboard-adminsfd/tontines/create">
                  <GlassButton className="w-full h-12 text-left justify-start ">
                    <Plus className="mr-3" size={20} />
                    <div>
                      <div className="font-medium">Créer une tontine</div>
                      <div className="text-xs opacity-90">Nouvelle configuration</div>
                    </div>
                  </GlassButton>
                </Link>
                
                <Link href="/dashboards/dashboard-adminsfd/loans">
                  <GlassButton variant="outline" className="w-full h-12 text-left justify-start">
                    <CheckCircle className="mr-3" size={20} />
                    <div>
                      <div className="font-medium">Valider les prêts</div>
                      <div className="text-xs text-red-600">5 en attente</div>
                    </div>
                  </GlassButton>
                </Link>
                
                <Link href="/dashboards/dashboard-adminsfd/statistics">
                  <GlassButton variant="outline" className="w-full h-12 text-left justify-start">
                    <BarChart3 className="mr-3" size={20} />
                    <div>
                      <div className="font-medium">Voir rapports</div>
                      <div className="text-xs text-gray-500">Analyses détaillées</div>
                    </div>
                  </GlassButton>
                </Link>
              </div>
            </GlassCard>

            {/* Métriques complémentaires */}
            <GlassCard className="p-6" hover={false}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Métriques clés</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Clients actifs</span>
                  <span className="font-bold text-gray-900">{((sfdStats.clientsActifs / sfdStats.totalClients) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Comptes épargne</span>
                  <span className="font-bold text-gray-900">{sfdStats.comptesEpargne}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Prêts en cours</span>
                  <span className="font-bold text-gray-900">{sfdStats.pretesEnCours}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taux de défaut</span>
                  <span className="font-bold text-red-600">{sfdStats.tauxDefaut}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Revenus ce mois</span>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{(sfdStats.revenusMois / 1000).toFixed(0)}K FCFA</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Section centre et droite - Activités récentes */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6 h-full" hover={false}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="mr-2 text-emerald-600" size={20} />
                  Activités Récentes
                </h3>
                <Link href="/dashboard-sfd-admin/activity-log">
                  <GlassButton variant="outline" size="sm">
                    <Eye className="mr-2" size={16} />
                    Voir tout
                  </GlassButton>
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentActions.map((action) => (
                  <div key={action.id} className="flex items-start gap-4 p-4 bg-white/60 rounded-lg border border-white/20">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      action.status === 'success' ? 'bg-green-100' :
                      action.status === 'warning' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      {action.type === 'validation' && <CheckCircle className="text-green-600" size={20} />}
                      {action.type === 'creation' && <Plus className="text-blue-600" size={20} />}
                      {(action.type === 'agent_action' || action.type === 'superviseur_action') && <Users className="text-gray-600" size={20} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {action.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{action.time}</span>
                        <span>•</span>
                        <span>Par {action.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SFDAdminDashboard;