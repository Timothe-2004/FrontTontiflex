'use client'
import { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  PieChart, 
  FileText,
  Target,
  DollarSign,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  Percent,
  Award,
  Activity,
  Send,
  Eye,
  RefreshCw,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ReportsAnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const [reportType, setReportType] = useState("performance");
  const [selectedMetric, setSelectedMetric] = useState("all");

  // Données mockées pour les rapports
  const analyticsData = {
    thisMonth: {
      loansProcessed: 12,
      loansApproved: 9,
      loansRejected: 3,
      totalAmountApproved: 4200000,
      averageAmount: 466667,
      averageProcessingTime: 3.2,
      portfolioGrowth: 8.5,
      clientSatisfaction: 94.2,
      riskScore: 76.8,
      overdueRate: 4.2
    },
    lastMonth: {
      loansProcessed: 15,
      loansApproved: 11,
      loansRejected: 4,
      totalAmountApproved: 5100000,
      averageAmount: 463636,
      averageProcessingTime: 4.1,
      portfolioGrowth: 6.2,
      clientSatisfaction: 91.8,
      riskScore: 78.3,
      overdueRate: 5.1
    },
    thisQuarter: {
      loansProcessed: 42,
      loansApproved: 32,
      loansRejected: 10,
      totalAmountApproved: 14800000,
      averageAmount: 462500,
      averageProcessingTime: 3.8,
      portfolioGrowth: 7.3,
      clientSatisfaction: 92.5,
      riskScore: 77.2,
      overdueRate: 4.8
    }
  };

  const currentData = analyticsData[selectedPeriod as keyof typeof analyticsData] || analyticsData.thisMonth;
  const previousData = selectedPeriod === "thisMonth" ? analyticsData.lastMonth : analyticsData.thisQuarter;

  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0
    };
  };

  const approvalRate = (currentData.loansApproved / currentData.loansProcessed) * 100;
  const previousApprovalRate = (previousData.loansApproved / previousData.loansProcessed) * 100;
  const approvalChange = calculateChange(approvalRate, previousApprovalRate);

  const MetricCard = ({ 
    title, 
    value, 
    previousValue, 
    icon: Icon, 
    color, 
    format = "number",
    suffix = "" 
  }: {
    title: string;
    value: number;
    previousValue: number;
    icon: any;
    color: string;
    format?: "number" | "currency" | "percentage";
    suffix?: string;
  }) => {
    const change = calculateChange(value, previousValue);
    
    const formatValue = (val: number) => {
      switch (format) {
        case "currency":
          return `${(val / 1000000).toFixed(1)}M FCFA`;
        case "percentage":
          return `${val.toFixed(1)}%`;
        default:
          return val.toLocaleString() + suffix;
      }
    };

    return (
      <GlassCard className={`p-6 border-l-4 ${color}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
            <Icon className={color.replace('border-l-', 'text-').replace('-500', '-600')} size={24} />
          </div>
        </div>
        <div className={`flex items-center text-sm ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change.isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
          {change.isPositive ? '+' : '-'}{change.value.toFixed(1)}% vs période précédente
        </div>
      </GlassCard>
    );
  };

  const generateReport = () => {
    // Simulation de génération de rapport
    console.log("Génération du rapport:", { reportType, selectedPeriod, selectedMetric });
    alert("Rapport généré avec succès ! Le téléchargement va commencer.");
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rapports & Analytics</h1>
            <p className="text-gray-600">Analysez les performances et générez des rapports détaillés</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48 bg-white/60">
                <Calendar className="mr-2" size={16} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisMonth">Ce mois</SelectItem>
                <SelectItem value="lastMonth">Mois dernier</SelectItem>
                <SelectItem value="thisQuarter">Ce trimestre</SelectItem>
              </SelectContent>
            </Select>
            <GlassButton variant="outline" size="sm">
              <RefreshCw size={16} className="mr-2" />
              Actualiser
            </GlassButton>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Demandes traitées"
            value={currentData.loansProcessed}
            previousValue={previousData.loansProcessed}
            icon={FileText}
            color="border-l-emerald-500"
          />
          <MetricCard
            title="Taux d'approbation"
            value={approvalRate}
            previousValue={previousApprovalRate}
            icon={CheckCircle}
            color="border-l-green-500"
            format="percentage"
          />
          <MetricCard
            title="Montant approuvé"
            value={currentData.totalAmountApproved}
            previousValue={previousData.totalAmountApproved}
            icon={DollarSign}
            color="border-l-blue-500"
            format="currency"
          />
          <MetricCard
            title="Temps de traitement"
            value={currentData.averageProcessingTime}
            previousValue={previousData.averageProcessingTime}
            icon={Clock}
            color="border-l-purple-500"
            suffix=" jours"
          />
        </div>

        {/* Métriques secondaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Croissance portfolio"
            value={currentData.portfolioGrowth}
            previousValue={previousData.portfolioGrowth}
            icon={TrendingUp}
            color="border-l-cyan-500"
            format="percentage"
          />
          <MetricCard
            title="Satisfaction client"
            value={currentData.clientSatisfaction}
            previousValue={previousData.clientSatisfaction}
            icon={Award}
            color="border-l-yellow-500"
            format="percentage"
          />
          <MetricCard
            title="Score de risque moyen"
            value={currentData.riskScore}
            previousValue={previousData.riskScore}
            icon={Target}
            color="border-l-orange-500"
            suffix="/100"
          />
          <MetricCard
            title="Taux de retard"
            value={currentData.overdueRate}
            previousValue={previousData.overdueRate}
            icon={AlertTriangle}
            color="border-l-red-500"
            format="percentage"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Graphiques et visualisations */}
          <div className="lg:col-span-2 space-y-8">
            {/* Évolution des approbations */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="mr-2 text-emerald-600" size={20} />
                  Évolution des Approbations
                </h3>
                <Select value="monthly" onValueChange={() => {}}>
                  <SelectTrigger className="w-32 bg-white/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Simulation d'un graphique */}
              <div className="h-64 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="mx-auto mb-2 text-emerald-600" size={48} />
                  <p className="text-gray-600">Graphique d'évolution mensuelle</p>
                  <p className="text-sm text-gray-500">
                    {currentData.loansApproved} prêts approuvés cette période
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Répartition par montant */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <PieChart className="mr-2 text-emerald-600" size={20} />
                  Répartition par Montant
                </h3>
              </div>
              
              {/* Simulation d'un graphique en secteurs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-48 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="mx-auto mb-2 text-emerald-600" size={48} />
                    <p className="text-gray-600">Graphique en secteurs</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-emerald-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-700">100K - 300K FCFA</span>
                    </div>
                    <span className="font-bold text-emerald-600">45%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-700">300K - 600K FCFA</span>
                    </div>
                    <span className="font-bold text-blue-600">35%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-700">600K+ FCFA</span>
                    </div>
                    <span className="font-bold text-purple-600">20%</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Performance par score de risque */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Target className="mr-2 text-emerald-600" size={20} />
                Performance par Niveau de Risque
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="text-green-600 mr-3" size={20} />
                    <div>
                      <p className="font-medium text-gray-900">Risque Faible (85+)</p>
                      <p className="text-sm text-gray-600">Taux d'approbation: 95%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">6 prêts</p>
                    <p className="text-sm text-gray-600">2.8M FCFA</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="text-yellow-600 mr-3" size={20} />
                    <div>
                      <p className="font-medium text-gray-900">Risque Moyen (75-84)</p>
                      <p className="text-sm text-gray-600">Taux d'approbation: 78%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-600">4 prêts</p>
                    <p className="text-sm text-gray-600">1.6M FCFA</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="text-red-600 mr-3" size={20} />
                    <div>
                      <p className="font-medium text-gray-900">Risque Élevé (&lt;75)</p>
                      <p className="text-sm text-gray-600">Taux d'approbation: 25%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">1 prêt</p>
                    <p className="text-sm text-gray-600">200K FCFA</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Sidebar - Générateur de rapports */}
          <div className="space-y-6">
            {/* Générateur de rapport */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="mr-2 text-emerald-600" size={20} />
                Générer un Rapport
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reportType">Type de rapport</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="mt-1 bg-white/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance globale</SelectItem>
                      <SelectItem value="risk">Analyse des risques</SelectItem>
                      <SelectItem value="portfolio">Portfolio détaillé</SelectItem>
                      <SelectItem value="clients">Rapport clients</SelectItem>
                      <SelectItem value="trends">Tendances mensuelles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="period">Période</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="mt-1 bg-white/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thisMonth">Ce mois</SelectItem>
                      <SelectItem value="lastMonth">Mois dernier</SelectItem>
                      <SelectItem value="thisQuarter">Ce trimestre</SelectItem>
                      <SelectItem value="custom">Période personnalisée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="metrics">Métriques incluses</Label>
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger className="mt-1 bg-white/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les métriques</SelectItem>
                      <SelectItem value="financial">Métriques financières</SelectItem>
                      <SelectItem value="operational">Métriques opérationnelles</SelectItem>
                      <SelectItem value="risk">Métriques de risque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <GlassButton 
                    onClick={generateReport}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Download className="mr-2" size={16} />
                    Générer le rapport
                  </GlassButton>
                </div>
              </div>
            </GlassCard>

            {/* Rapports récents */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="mr-2 text-emerald-600" size={20} />
                Rapports Récents
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Performance Juin 2025</p>
                    <p className="text-xs text-gray-600">Généré le 28 juin</p>
                  </div>
                  <div className="flex gap-1">
                    <GlassButton variant="outline" size="sm">
                      <Eye size={12} />
                    </GlassButton>
                    <GlassButton variant="outline" size="sm">
                      <Download size={12} />
                    </GlassButton>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Analyse Risques T2</p>
                    <p className="text-xs text-gray-600">Généré le 25 juin</p>
                  </div>
                  <div className="flex gap-1">
                    <GlassButton variant="outline" size="sm">
                      <Eye size={12} />
                    </GlassButton>
                    <GlassButton variant="outline" size="sm">
                      <Download size={12} />
                    </GlassButton>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Portfolio Mai 2025</p>
                    <p className="text-xs text-gray-600">Généré le 20 juin</p>
                  </div>
                  <div className="flex gap-1">
                    <GlassButton variant="outline" size="sm">
                      <Eye size={12} />
                    </GlassButton>
                    <GlassButton variant="outline" size="sm">
                      <Download size={12} />
                    </GlassButton>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Actions rapides */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
              
              <div className="space-y-2">
                <GlassButton variant="outline" className="w-full justify-start">
                  <Send className="mr-2" size={16} />
                  Envoyer rapport mensuel
                </GlassButton>
                
                <GlassButton variant="outline" className="w-full justify-start">
                  <Users className="mr-2" size={16} />
                  Rapport satisfaction client
                </GlassButton>
                
                <GlassButton variant="outline" className="w-full justify-start">
                  <Target className="mr-2" size={16} />
                  Analyse comparative
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalyticsPage;