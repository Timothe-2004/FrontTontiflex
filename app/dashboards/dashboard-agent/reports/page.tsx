
'use client'
import { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Download,
  Eye,
  Target,
  Award,
  AlertTriangle,
  DollarSign,
  PieChart,
  LineChart,
  Activity,
  UserCheck,
  ArrowDown,
  PiggyBank,
  RefreshCw,
  Filter
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Interfaces pour les données de rapports
interface StatistiquesPeriode {
  periode: string;
  adhesions: { validees: number; rejetees: number; total: number };
  retraits: { approuves: number; rejetes: number; total: number; montant: number };
  comptesEpargne: { valides: number; rejetes: number; total: number };
  tempsTraitement: { moyen: number; median: number; min: number; max: number };
  tauxValidation: number;
}

interface PerformanceQuotidienne {
  date: string;
  actionsTotal: number;
  validations: number;
  rejets: number;
  tempsMovenTraitement: number;
}

// Données mockées pour les statistiques
const statistiquesActuelles: StatistiquesPeriode = {
  periode: "30 derniers jours",
  adhesions: { validees: 45, rejetees: 8, total: 53 },
  retraits: { approuves: 32, rejetes: 6, total: 38, montant: 1250000 },
  comptesEpargne: { valides: 18, rejetes: 3, total: 21 },
  tempsTraitement: { moyen: 65, median: 45, min: 15, max: 180 },
  tauxValidation: 87
};

const performanceQuotidienne: PerformanceQuotidienne[] = [
  { date: '2025-06-14', actionsTotal: 12, validations: 10, rejets: 2, tempsMovenTraitement: 45 },
  { date: '2025-06-15', actionsTotal: 8, validations: 7, rejets: 1, tempsMovenTraitement: 52 },
  { date: '2025-06-16', actionsTotal: 15, validations: 13, rejets: 2, tempsMovenTraitement: 38 },
  { date: '2025-06-17', actionsTotal: 10, validations: 9, rejets: 1, tempsMovenTraitement: 41 },
  { date: '2025-06-18', actionsTotal: 14, validations: 11, rejets: 3, tempsMovenTraitement: 67 },
  { date: '2025-06-19', actionsTotal: 9, validations: 8, rejets: 1, tempsMovenTraitement: 35 },
  { date: '2025-06-20', actionsTotal: 11, validations: 10, rejets: 1, tempsMovenTraitement: 48 }
];

const repartitionParType = [
  { type: 'Adhésions', total: 53, validees: 45, pourcentage: 47 },
  { type: 'Retraits', total: 38, validees: 32, pourcentage: 34 },
  { type: 'Comptes épargne', total: 21, validees: 18, pourcentage: 19 }
];

const objectifsAgent = {
  mensuel: {
    adhesions: { objectif: 50, realise: 45, pourcentage: 90 },
    retraits: { objectif: 40, realise: 32, pourcentage: 80 },
    comptesEpargne: { objectif: 25, realise: 18, pourcentage: 72 },
    tempsTraitement: { objectif: 60, realise: 65, respect: false }
  }
};

const AgentSFDRapportsPage = () => {
  const [selectedPeriode, setSelectedPeriode] = useState("30j");
  const [selectedMetrique, setSelectedMetrique] = useState("actions");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);

  const getPeriodeLabel = (periode: string) => {
    switch (periode) {
      case '7j': return '7 derniers jours';
      case '30j': return '30 derniers jours';
      case '3m': return '3 derniers mois';
      case '6m': return '6 derniers mois';
      default: return '30 derniers jours';
    }
  };

  const getEvolutionIcon = (value: number, isPositiveGood: boolean = true) => {
    if (value > 0) {
      return isPositiveGood ? 
        <TrendingUp className="text-green-600" size={16} /> : 
        <TrendingDown className="text-red-600" size={16} />;
    } else {
      return isPositiveGood ? 
        <TrendingDown className="text-red-600" size={16} /> : 
        <TrendingUp className="text-green-600" size={16} />;
    }
  };

  const getObjectifStatus = (pourcentage: number) => {
    if (pourcentage >= 100) return { color: 'text-green-600', bg: 'bg-green-100', status: 'Atteint' };
    if (pourcentage >= 80) return { color: 'text-yellow-600', bg: 'bg-yellow-100', status: 'En cours' };
    return { color: 'text-red-600', bg: 'bg-red-100', status: 'En retard' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rapports et Statistiques</h1>
            <p className="text-gray-600">Analysez vos performances et suivez vos objectifs</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
              <SelectTrigger className="w-48 bg-white/60">
                <Calendar className="mr-2" size={16} />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7j">7 derniers jours</SelectItem>
                <SelectItem value="30j">30 derniers jours</SelectItem>
                <SelectItem value="3m">3 derniers mois</SelectItem>
                <SelectItem value="6m">6 derniers mois</SelectItem>
              </SelectContent>
            </Select>
            <GlassButton variant="outline" size="sm">
              <RefreshCw size={16} className="mr-2" />
              Actualiser
            </GlassButton>
            <GlassButton variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Exporter rapport
            </GlassButton>
          </div>
        </div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GlassCard className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Actions totales</p>
                <p className="text-3xl font-bold text-blue-600">{statistiquesActuelles.adhesions.total + statistiquesActuelles.retraits.total + statistiquesActuelles.comptesEpargne.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getEvolutionIcon(8)}
              <span className="text-sm text-green-600 font-medium">+8% vs période précédente</span>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Taux de validation</p>
                <p className="text-3xl font-bold text-green-600">{statistiquesActuelles.tauxValidation}%</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Target className="text-green-600" size={24} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getEvolutionIcon(2)}
              <span className="text-sm text-green-600 font-medium">+2% vs période précédente</span>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Temps moyen</p>
                <p className="text-3xl font-bold text-purple-600">{statistiquesActuelles.tempsTraitement.moyen}<span className="text-lg">min</span></p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getEvolutionIcon(-5, false)}
              <span className="text-sm text-green-600 font-medium">-5 min vs période précédente</span>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Montant traité</p>
                <p className="text-2xl font-bold text-orange-600">{(statistiquesActuelles.retraits.montant / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-gray-500">FCFA</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <DollarSign className="text-orange-600" size={24} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getEvolutionIcon(12)}
              <span className="text-sm text-green-600 font-medium">+12% vs période précédente</span>
            </div>
          </GlassCard>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Répartition par type d'actions */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <PieChart className="mr-3 text-emerald-600" size={24} />
                  Répartition par type d'actions
                </h2>
                <GlassButton variant="outline" size="sm">
                  <Eye size={16} className="mr-1" />
                  Détails
                </GlassButton>
              </div>

              <div className="space-y-4">
                {repartitionParType.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/60 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-4 h-4 rounded-full", 
                        index === 0 ? "bg-blue-500" : 
                        index === 1 ? "bg-green-500" : "bg-purple-500"
                      )}></div>
                      <div>
                        <h3 className="font-medium text-gray-900">{item.type}</h3>
                        <p className="text-sm text-gray-600">{item.validees} validées sur {item.total}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{item.pourcentage}%</p>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className={cn("h-2 rounded-full",
                            index === 0 ? "bg-blue-500" : 
                            index === 1 ? "bg-green-500" : "bg-purple-500"
                          )}
                          style={{ width: `${item.pourcentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Performance quotidienne */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <LineChart className="mr-3 text-emerald-600" size={24} />
                  Performance des 7 derniers jours
                </h2>
                <Select value={selectedMetrique} onValueChange={setSelectedMetrique}>
                  <SelectTrigger className="w-40 bg-white/60">
                    <SelectValue placeholder="Métrique" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actions">Actions totales</SelectItem>
                    <SelectItem value="validations">Validations</SelectItem>
                    <SelectItem value="temps">Temps traitement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {performanceQuotidienne.map((jour, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-gray-900 w-20">
                        {format(new Date(jour.date), 'EEE dd', { locale: fr })}
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {jour.actionsTotal} actions
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {jour.validations} validées
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-gray-600">Temps moyen</p>
                        <p className="font-medium">{jour.tempsMovenTraitement} min</p>
                      </div>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-emerald-500 rounded-full"
                          style={{ width: `${(jour.validations / jour.actionsTotal) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Détails par type d'action */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="mr-3 text-emerald-600" size={24} />
                Détails par type d'action
              </h2>

              <div className="grid gap-6">
                {/* Adhésions */}
                <div className="bg-white/60 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <UserCheck className="text-blue-600" size={20} />
                      <h3 className="font-medium text-gray-900">Adhésions aux tontines</h3>
                    </div>
                    <span className="text-sm text-gray-600">{getPeriodeLabel(selectedPeriode)}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{statistiquesActuelles.adhesions.validees}</p>
                      <p className="text-xs text-gray-600">Validées</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{statistiquesActuelles.adhesions.rejetees}</p>
                      <p className="text-xs text-gray-600">Rejetées</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{statistiquesActuelles.adhesions.total}</p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                  </div>
                </div>

                {/* Retraits */}
                <div className="bg-white/60 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <ArrowDown className="text-green-600" size={20} />
                      <h3 className="font-medium text-gray-900">Demandes de retrait</h3>
                    </div>
                    <span className="text-sm text-gray-600">{getPeriodeLabel(selectedPeriode)}</span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{statistiquesActuelles.retraits.approuves}</p>
                      <p className="text-xs text-gray-600">Approuvées</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{statistiquesActuelles.retraits.rejetes}</p>
                      <p className="text-xs text-gray-600">Rejetées</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{statistiquesActuelles.retraits.total}</p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-orange-600">{(statistiquesActuelles.retraits.montant / 1000).toLocaleString()}K</p>
                      <p className="text-xs text-gray-600">FCFA</p>
                    </div>
                  </div>
                </div>

                {/* Comptes épargne */}
                <div className="bg-white/60 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <PiggyBank className="text-purple-600" size={20} />
                      <h3 className="font-medium text-gray-900">Comptes épargne</h3>
                    </div>
                    <span className="text-sm text-gray-600">{getPeriodeLabel(selectedPeriode)}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{statistiquesActuelles.comptesEpargne.valides}</p>
                      <p className="text-xs text-gray-600">Validés</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{statistiquesActuelles.comptesEpargne.rejetes}</p>
                      <p className="text-xs text-gray-600">Rejetés</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{statistiquesActuelles.comptesEpargne.total}</p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Sidebar droite */}
          <div className="space-y-6">
            {/* Objectifs mensuels */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="mr-2 text-emerald-600" size={20} />
                Objectifs mensuels
              </h3>
              
              <div className="space-y-4">
                {/* Adhésions */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Adhésions</span>
                    <span className="text-sm text-gray-600">
                      {objectifsAgent.mensuel.adhesions.realise}/{objectifsAgent.mensuel.adhesions.objectif}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${objectifsAgent.mensuel.adhesions.pourcentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className={cn("text-xs font-medium", 
                      getObjectifStatus(objectifsAgent.mensuel.adhesions.pourcentage).color
                    )}>
                      {objectifsAgent.mensuel.adhesions.pourcentage}%
                    </span>
                    <span className={cn("text-xs px-2 py-1 rounded-full",
                      getObjectifStatus(objectifsAgent.mensuel.adhesions.pourcentage).bg,
                      getObjectifStatus(objectifsAgent.mensuel.adhesions.pourcentage).color
                    )}>
                      {getObjectifStatus(objectifsAgent.mensuel.adhesions.pourcentage).status}
                    </span>
                  </div>
                </div>

                {/* Retraits */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Retraits</span>
                    <span className="text-sm text-gray-600">
                      {objectifsAgent.mensuel.retraits.realise}/{objectifsAgent.mensuel.retraits.objectif}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${objectifsAgent.mensuel.retraits.pourcentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className={cn("text-xs font-medium", 
                      getObjectifStatus(objectifsAgent.mensuel.retraits.pourcentage).color
                    )}>
                      {objectifsAgent.mensuel.retraits.pourcentage}%
                    </span>
                    <span className={cn("text-xs px-2 py-1 rounded-full",
                      getObjectifStatus(objectifsAgent.mensuel.retraits.pourcentage).bg,
                      getObjectifStatus(objectifsAgent.mensuel.retraits.pourcentage).color
                    )}>
                      {getObjectifStatus(objectifsAgent.mensuel.retraits.pourcentage).status}
                    </span>
                  </div>
                </div>

                {/* Comptes épargne */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Comptes épargne</span>
                    <span className="text-sm text-gray-600">
                      {objectifsAgent.mensuel.comptesEpargne.realise}/{objectifsAgent.mensuel.comptesEpargne.objectif}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${objectifsAgent.mensuel.comptesEpargne.pourcentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className={cn("text-xs font-medium", 
                      getObjectifStatus(objectifsAgent.mensuel.comptesEpargne.pourcentage).color
                    )}>
                      {objectifsAgent.mensuel.comptesEpargne.pourcentage}%
                    </span>
                    <span className={cn("text-xs px-2 py-1 rounded-full",
                      getObjectifStatus(objectifsAgent.mensuel.comptesEpargne.pourcentage).bg,
                      getObjectifStatus(objectifsAgent.mensuel.comptesEpargne.pourcentage).color
                    )}>
                      {getObjectifStatus(objectifsAgent.mensuel.comptesEpargne.pourcentage).status}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Temps de traitement */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="mr-2 text-emerald-600" size={20} />
                Temps de traitement
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Temps moyen</span>
                  <span className="font-bold text-gray-900">{statistiquesActuelles.tempsTraitement.moyen} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Temps médian</span>
                  <span className="font-bold text-gray-900">{statistiquesActuelles.tempsTraitement.median} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Le plus rapide</span>
                  <span className="font-bold text-green-600">{statistiquesActuelles.tempsTraitement.min} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Le plus long</span>
                  <span className="font-bold text-red-600">{statistiquesActuelles.tempsTraitement.max} min</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">Objectif: ≤ 60 min</span>
                    {!objectifsAgent.mensuel.tempsTraitement.respect ? (
                      <AlertTriangle className="text-red-500" size={16} />
                    ) : (
                      <CheckCircle className="text-green-500" size={16} />
                    )}
                  </div>
                  <div className={cn("text-xs px-2 py-1 rounded-full inline-flex",
                    !objectifsAgent.mensuel.tempsTraitement.respect 
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  )}>
                    {!objectifsAgent.mensuel.tempsTraitement.respect ? 'Non respecté' : 'Respecté'}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Badge performance */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="mr-2 text-emerald-600" size={20} />
                Performance
              </h3>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="text-white" size={32} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Agent Performant</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Taux de validation de {statistiquesActuelles.tauxValidation}%
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-emerald-600">
                      {statistiquesActuelles.adhesions.validees + statistiquesActuelles.retraits.approuves + statistiquesActuelles.comptesEpargne.valides}
                    </p>
                    <p className="text-xs text-gray-600">Validations</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">#{Math.floor(Math.random() * 5) + 1}</p>
                    <p className="text-xs text-gray-600">Classement SFD</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentSFDRapportsPage;