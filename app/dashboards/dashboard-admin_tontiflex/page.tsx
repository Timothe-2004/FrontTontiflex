
'use client'
import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Shield, 
  Settings, 
  Activity,
  Database,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  CreditCard,
  PiggyBank,
  FileText,
  Smartphone,
  MessageSquare,
  BarChart3,
  Globe
} from 'lucide-react';

const AdminPlatformDashboard = () => {
  const [activeFilter, setActiveFilter] = useState('today');

  // Données simulées
  const stats = {
    totalUsers: 12847,
    activeSFDs: 23,
    totalTransactions: 156789,
    monthlyVolume: 2456789000,
    newUsersToday: 47,
    activeConnections: 8932,
    systemUptime: 99.9,
    lastUpdate: new Date().toLocaleTimeString('fr-FR')
  };

  const recentActivity = [
    { 
      id: 1, 
      action: "Nouveau SFD inscrit", 
      user: "Coopec Atlantique", 
      time: "Il y a 2h", 
      type: "sfd",
      description: "Un nouveau SFD s'est inscrit sur la plateforme et attend la validation"
    },
    { 
      id: 2, 
      action: "Demande de prêt approuvée", 
      user: "SFD Finances+", 
      time: "Il y a 5h", 
      type: "loan",
      description: "Une demande de prêt de 5 000 000 FCFA a été approuvée"
    },
    { 
      id: 3, 
      action: "Mise à jour de sécurité", 
      user: "Système", 
      time: "Hier, 23:45", 
      type: "security",
      description: "Mise à jour des protocoles de sécurité du système effectuée avec succès"
    },
    { 
      id: 4, 
      action: "Nouvelle intégration API", 
      user: "SFD MicroCred", 
      time: "Hier, 18:30", 
      type: "integration",
      description: "Intégration de l'API de paiement mobile money terminée"
    },
    { 
      id: 5, 
      action: "Nouveau SFD en attente", 
      user: "Banque Atlantique", 
      time: "Hier, 16:15", 
      type: "sfd",
      description: "Une nouvelle demande d'accès pour un SFD est en attente de validation"
    }
  ];

  const sfdStats = [
    { name: "CLCAM", users: 3247, transactions: 45678, status: "active" },
    { name: "Coopec", users: 2156, transactions: 32145, status: "active" },
    { name: "Fescoop", users: 1890, transactions: 28934, status: "active" },
    { name: "Vital Finance", users: 1654, transactions: 25432, status: "maintenance" },
  ];

  interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    trend?: number;
    color?: string;
  }

  const StatCard = ({ title, value, icon: Icon, trend, color = "primary" }: StatCardProps) => (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-archivo text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={`text-xs font-archivo mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend}% ce mois
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color === 'primary' ? 'bg-primary/10' : color === 'secondary' ? 'bg-accent/20' : 'bg-destructive/10'}`}>
          <Icon className={`w-6 h-6 ${color === 'primary' ? 'text-primary' : color === 'secondary' ? 'text-accent-foreground' : 'text-destructive'}`} />
        </div>
      </div>
    </GlassCard>
  );

  interface ActivityItemProps {
    activity: {
      id: number;
      type: 'sfd' | 'loan' | 'integration' | 'security' | string;
      action: string;
      user: string;
      description: string;
      time: string;
    };
  }

  const ActivityItem = ({ activity }: ActivityItemProps) => {
    const getIcon = (type: string) => {
      switch(type) {
        case 'sfd': return <Building2 className="w-4 h-4 text-primary" />;
        case 'loan': return <CreditCard className="w-4 h-4 text-blue-500" />;
        case 'integration': return <Smartphone className="w-4 h-4 text-purple-500" />;
        case 'security': return <Shield className="w-4 h-4 text-red-500" />;
        default: return <Activity className="w-4 h-4 text-gray-500" />;
      }
    };

    return (
      <div className="flex items-center space-x-3 p-3 hover:bg-accent/10 rounded-lg transition-colors">
        {getIcon(activity.type)}
        <div className="flex-1">
          <p className="text-sm font-archivo font-medium text-foreground">{activity.action}</p>
          <p className="text-xs font-archivo text-muted-foreground">{activity.user}</p>
        </div>
        <span className="text-xs font-archivo text-muted-foreground">{activity.time}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Vue d'ensemble de la plateforme
            </h1>
            <p className="font-archivo text-muted-foreground">
              Supervision globale de TontiFlex • Dernière mise à jour: {stats.lastUpdate}
            </p>
          </div>

          {/* Stats principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Utilisateurs totaux"
              value={stats.totalUsers.toLocaleString('fr-FR')}
              icon={Users}
              trend={12}
            />
            <StatCard
              title="SFD actifs"
              value={stats.activeSFDs}
              icon={Building2}
              trend={5}
              color="secondary"
            />
            <StatCard
              title="Transactions totales"
              value={stats.totalTransactions.toLocaleString('fr-FR')}
              icon={CreditCard}
              trend={18}
            />
            <StatCard
              title="Volume mensuel (FCFA)"
              value={`${(stats.monthlyVolume / 1000000).toFixed(1)}M`}
              icon={TrendingUp}
              trend={23}
            />
          </div>

          {/* Bento Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* État du système */}
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">État du système</h3>
                <Activity className="w-5 h-5 text-primary" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-archivo text-sm text-muted-foreground">Disponibilité</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-archivo text-sm font-medium">{stats.systemUptime}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-archivo text-sm text-muted-foreground">Connexions actives</span>
                  <span className="font-archivo text-sm font-medium">{stats.activeConnections.toLocaleString('fr-FR')}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-archivo text-sm text-muted-foreground">API Mobile Money</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-archivo text-xs">Opérationnel</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-archivo text-sm text-muted-foreground">Passerelle SMS</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-archivo text-xs">Opérationnel</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Activité récente */}
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Activité récente</h3>
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              
              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
              
              <GlassButton className=""
              size="lg"
              variant="outline"
              >
                Voir tout l'historique
              </GlassButton>
            </GlassCard>

            {/* Top SFD */}
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Top SFD</h3>
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              
              <div className="space-y-3">
                {sfdStats.map((sfd, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-accent/10 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${sfd.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <div>
                        <p className="font-archivo text-sm font-medium text-foreground">{sfd.name}</p>
                        <p className="font-archivo text-xs text-muted-foreground">{sfd.users} utilisateurs</p>
                      </div>
                    </div>
                    <span className="font-archivo text-xs text-muted-foreground">
                      {sfd.transactions.toLocaleString('fr-FR')} trans.
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: UserPlus, label: 'Nouveau SFD', color: 'bg-blue-500' },
              { icon: Users, label: 'Gestion utilisateurs', color: 'bg-green-500' },
              { icon: Database, label: 'Voir les logs', color: 'bg-purple-500' },
              { icon: Settings, label: 'Paramètres', color: 'bg-gray-500' },
            ].map((action, index) => (
              <GlassButton
                key={index}
                type="submit"
                size="lg"
                className=""
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color}/20 group-hover:${action.color}/30 transition-colors`}>
                    <action.icon className={`w-5 h-5 ${action.color.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="font-archivo text-sm font-medium text-foreground">{action.label}</span>
                </div>
              </GlassButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPlatformDashboard;