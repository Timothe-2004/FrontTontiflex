// app/dashboard-sfd-admin/statistics/page.tsx
'use client'
import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar,
  Download,
  Eye,
  Filter,
  RefreshCw,
  PieChart,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  CreditCard,
  PiggyBank,
  Percent,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

const StatisticsPage = () => {
  const [timeRange, setTimeRange] = useState('30j');
  const [reportType, setReportType] = useState('global');
  const [selectedTontine, setSelectedTontine] = useState('all');

  // Données mockées pour les statistiques
  const globalStats = {
    clients: {
      total: 1247,
      actifs: 1089,
      nouveaux: 23,
      inactifs: 158,
      tendance: '+12.5%'
    },
    tontines: {
      total: 12,
      actives: 11,
      enPause: 1,
      membres: 847,
      tendance: '+8.3%'
    },
    financier: {
      volumeTransactions: 25847000,
      cotisationsCollectees: 18250000,
      retraitsTraites: 6890000,
      commissionsSFD: 707000,
      tendance: '+15.2%'
    },
    epargne: {
      comptesOuverts: 89,
      soldeTotalEpargne: 12450000,
      depotsMois: 3200000,
      retraitsMois: 1850000,
      tendance: '+18.7%'
    },
    credits: {
      demandes: 45,
      approuves: 38,
      rejetes: 7,
      enCours: 156,
      montantTotal: 8750000,
      tauxDefaut: 2.3,
      tendance: '-0.8%'
    }
  };

  const tontinesPerformance = [
    {
      id: '1',
      nom: 'Tontine ALAFIA',
      membres: 25,
      cotisationsMoyennes: 2500,
      regularite: 95,
      croissance: '+12%',
      status: 'excellent'
    },
    {
      id: '2',
      nom: 'Tontine des Commerçantes',
      membres: 15,
      cotisationsMoyennes: 5500,
      regularite: 88,
      croissance: '+8%',
      status: 'bon'
    },
    {
      id: '3',
      nom: 'Tontine Agricole',
      membres: 30,
      cotisationsMoyennes: 8000,
      regularite: 78,
      croissance: '-2%',
      status: 'attention'
    },
    {
      id: '4',
      nom: 'Tontine Étudiantes',
      membres: 20,
      cotisationsMoyennes: 1000,
      regularite: 92,
      croissance: '+15%',
      status: 'excellent'
    }
  ];

  const monthlyData = [
    { mois: 'Jan', cotisations: 1200000, retraits: 800000, nouveauxClients: 15 },
    { mois: 'Fév', cotisations: 1350000, retraits: 920000, nouveauxClients: 18 },
    { mois: 'Mar', cotisations: 1480000, retraits: 1100000, nouveauxClients: 22 },
    { mois: 'Avr', cotisations: 1620000, retraits: 1250000, nouveauxClients: 28 },
    { mois: 'Mai', cotisations: 1750000, retraits: 1380000, nouveauxClients: 31 },
    { mois: 'Juin', cotisations: 1890000, retraits: 1420000, nouveauxClients: 23 }
  ];

  const getTrendIcon = (trend: string) => {
    if (trend.startsWith('+')) return <ArrowUp className="text-green-500" size={16} />;
    if (trend.startsWith('-')) return <ArrowDown className="text-red-500" size={16} />;
    return <Minus className="text-gray-500" size={16} />;
  };

  const getTrendColor = (trend: string) => {
    if (trend.startsWith('+')) return 'text-green-600';
    if (trend.startsWith('-')) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Excellent</span>;
      case 'bon':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Bon</span>;
      case 'attention':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Attention</span>;
      case 'critique':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Critique</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Neutre</span>;
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Contrôles et filtres */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40 bg-white/60">
                  <Calendar className="mr-2" size={16} />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7j">7 derniers jours</SelectItem>
                  <SelectItem value="30j">30 derniers jours</SelectItem>
                  <SelectItem value="3m">3 derniers mois</SelectItem>
                  <SelectItem value="6m">6 derniers mois</SelectItem>
                  <SelectItem value="1a">Année en cours</SelectItem>
                </SelectContent>
              </Select>

              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-40 bg-white/60">
                  <BarChart3 className="mr-2" size={16} />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Vue globale</SelectItem>
                  <SelectItem value="tontines">Tontines</SelectItem>
                  <SelectItem value="credits">Crédits</SelectItem>
                  <SelectItem value="epargne">Épargne</SelectItem>
                  <SelectItem value="clients">Clients</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedTontine} onValueChange={setSelectedTontine}>
                <SelectTrigger className="w-48 bg-white/60">
                  <Building className="mr-2" size={16} />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les tontines</SelectItem>
                  <SelectItem value="1">Tontine ALAFIA</SelectItem>
                  <SelectItem value="2">Tontine des Commerçantes</SelectItem>
                  <SelectItem value="3">Tontine Agricole</SelectItem>
                  <SelectItem value="4">Tontine Étudiantes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <GlassButton variant="outline" size="sm">
                <RefreshCw className="mr-2" size={16} />
                Actualiser
              </GlassButton>
              <GlassButton variant="outline" size="sm">
                <Download className="mr-2" size={16} />
                Exporter
              </GlassButton>
            </div>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard className="p-6 border-l-4 border-l-emerald-500" hover={false}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Clients actifs</p>
                <p className="text-2xl font-bold text-emerald-600">{globalStats.clients.actifs.toLocaleString()}</p>
                <p className="text-xs text-gray-500">sur {globalStats.clients.total.toLocaleString()} total</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users className="text-emerald-600" size={24} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon(globalStats.clients.tendance)}
              <span className={`text-sm font-medium ${getTrendColor(globalStats.clients.tendance)}`}>
                {globalStats.clients.tendance}
              </span>
              <span className="text-xs text-gray-500">vs période précédente</span>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-l-blue-500" hover={false}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Volume transactions</p>
                <p className="text-2xl font-bold text-blue-600">{(globalStats.financier.volumeTransactions / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-gray-500">FCFA ce mois</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon(globalStats.financier.tendance)}
              <span className={`text-sm font-medium ${getTrendColor(globalStats.financier.tendance)}`}>
                {globalStats.financier.tendance}
              </span>
              <span className="text-xs text-gray-500">vs période précédente</span>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-l-purple-500" hover={false}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Taux de défaut</p>
                <p className="text-2xl font-bold text-purple-600">{globalStats.credits.tauxDefaut}%</p>
                <p className="text-xs text-gray-500">Crédits en cours</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Percent className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon(globalStats.credits.tendance)}
              <span className={`text-sm font-medium ${getTrendColor(globalStats.credits.tendance)}`}>
                {globalStats.credits.tendance}
              </span>
              <span className="text-xs text-gray-500">vs période précédente</span>
            </div>
          </GlassCard>
        </div>

        {/* Graphiques et analyses */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Évolution mensuelle */}
          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Évolution mensuelle</h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                  <span>Cotisations</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Retraits</span>
                </div>
              </div>
            </div>
            
            {/* Simulation de graphique en barres */}
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{data.mois}</span>
                    <span className="text-gray-500">{data.nouveauxClients} nouveaux clients</span>
                  </div>
                  <div className="flex gap-2 h-6">
                    <div 
                      className="bg-emerald-500 rounded flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${(data.cotisations / 2000000) * 100}%` }}
                    >
                      {(data.cotisations / 1000).toFixed(0)}K
                    </div>
                    <div 
                      className="bg-blue-500 rounded flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${(data.retraits / 2000000) * 100}%` }}
                    >
                      {(data.retraits / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Répartition par type d'opération */}
          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Répartition des opérations</h3>
              <PieChart className="text-emerald-600" size={20} />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                  <span className="font-medium">Cotisations tontines</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600">70.6%</div>
                  <div className="text-xs text-gray-500">{(globalStats.financier.cotisationsCollectees / 1000000).toFixed(1)}M FCFA</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="font-medium">Retraits</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">26.7%</div>
                  <div className="text-xs text-gray-500">{(globalStats.financier.retraitsTraites / 1000000).toFixed(1)}M FCFA</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="font-medium">Commissions SFD</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-600">2.7%</div>
                  <div className="text-xs text-gray-500">{(globalStats.financier.commissionsSFD / 1000).toFixed(0)}K FCFA</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Performance des tontines */}
        <GlassCard className="p-6" hover={false}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance des tontines</h3>
            <GlassButton variant="outline" size="sm">
              <Eye className="mr-2" size={16} />
              Voir détails
            </GlassButton>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-50/50 border-b border-emerald-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-emerald-800">Tontine</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Membres</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Cotisation moy.</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Régularité</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Croissance</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tontinesPerformance.map((tontine) => (
                  <tr key={tontine.id} className="hover:bg-white/50">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{tontine.nom}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        <span>{tontine.membres}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{tontine.cotisationsMoyennes.toLocaleString()} FCFA</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              tontine.regularite >= 90 ? 'bg-green-500' :
                              tontine.regularite >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${tontine.regularite}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{tontine.regularite}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {getTrendIcon(tontine.croissance)}
                        <span className={`font-medium ${getTrendColor(tontine.croissance)}`}>
                          {tontine.croissance}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(tontine.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Alertes et recommandations */}
        <GlassCard className="p-6" hover={false}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <AlertCircle className="mr-2 text-orange-600" size={20} />
            Alertes et recommandations
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Points d'attention</h4>
              
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-yellow-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Tontine Agricole en baisse</p>
                    <p className="text-xs text-yellow-700">Régularité de 78% et croissance négative</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-red-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium text-red-800">Pic de retraits détecté</p>
                    <p className="text-xs text-red-700">+35% de demandes de retrait cette semaine</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Recommandations</h4>
              
              <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                <div className="flex items-start gap-2">
                  <CheckCircle className="text-green-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium text-green-800">Optimiser Tontine Étudiantes</p>
                    <p className="text-xs text-green-700">Forte croissance (+15%), envisager augmentation capacité</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <div className="flex items-start gap-2">
                  <Target className="text-blue-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Campagne de fidélisation</p>
                    <p className="text-xs text-blue-700">158 clients inactifs à réactiver</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default StatisticsPage;