'use client'
import { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Target, 
  Filter, 
  Search, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle,
  User,
  DollarSign,
  Calendar,
  CreditCard,
  PiggyBank,
  Download,
  RefreshCw,
  BarChart3,
  Percent,
  Award,
  Users,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { mockReliabilityScores, type ReliabilityScore } from '@/data/supervisorMockData';

const ReliabilityScoresPage = () => {
  const [filterRisk, setFilterRisk] = useState("tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");

  // Calculs des statistiques
  const totalClients = mockReliabilityScores.length;
  const lowRiskClients = mockReliabilityScores.filter(client => client.riskLevel === 'low').length;
  const mediumRiskClients = mockReliabilityScores.filter(client => client.riskLevel === 'medium').length;
  const highRiskClients = mockReliabilityScores.filter(client => client.riskLevel === 'high').length;
  const averageScore = mockReliabilityScores.reduce((sum, client) => sum + client.overallScore, 0) / totalClients;

  // Filtrage et tri des scores
  const filteredScores = mockReliabilityScores
    .filter(score => {
      const riskMatch = filterRisk === "tous" || score.riskLevel === filterRisk;
      const searchMatch = searchTerm === "" || 
        score.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        score.clientId.toLowerCase().includes(searchTerm.toLowerCase());
      
      return riskMatch && searchMatch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "score":
          comparison = a.overallScore - b.overallScore;
          break;
        case "savings":
          comparison = a.savingsScore - b.savingsScore;
          break;
        case "tontine":
          comparison = a.tontineScore - b.tontineScore;
          break;
        case "payment":
          comparison = a.paymentHistory - b.paymentHistory;
          break;
        case "name":
          comparison = a.clientName.localeCompare(b.clientName);
          break;
        case "lastUpdated":
          comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === "desc" ? -comparison : comparison;
    });

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRiskLevelLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'Faible';
      case 'medium':
        return 'Moyen';
      case 'high':
        return 'Élevé';
      default:
        return riskLevel;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 75) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <TrendingUp className="text-green-600" size={16} />;
    if (score >= 75) return <Activity className="text-yellow-600" size={16} />;
    return <TrendingDown className="text-red-600" size={16} />;
  };

  const ScoreCircle = ({ score, size = "large" }: { score: number; size?: "small" | "large" }) => {
    const circleSize = size === "large" ? "w-20 h-20" : "w-12 h-12";
    const textSize = size === "large" ? "text-2xl" : "text-sm";
    
    return (
      <div className={`relative ${circleSize} flex items-center justify-center`}>
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            strokeWidth="8"
            stroke="#e5e7eb"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            strokeWidth="8"
            stroke={score >= 85 ? "#10b981" : score >= 75 ? "#f59e0b" : "#ef4444"}
            fill="transparent"
            strokeDasharray={`${2.51 * score} 251`}
            strokeLinecap="round"
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center ${textSize} font-bold ${getScoreColor(score).split(' ')[0]}`}>
          {score}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Scores de Fiabilité</h1>
            <p className="text-gray-600">Évaluez la solvabilité et le risque des clients</p>
          </div>
          <div className="flex items-center gap-3">
            <GlassButton variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Exporter scores
            </GlassButton>
            <GlassButton variant="outline" size="sm">
              <RefreshCw size={16} className="mr-2" />
              Recalculer
            </GlassButton>
          </div>
        </div>

        {/* Statistiques des scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clients évalués</p>
                <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
              </div>
              <Users className="text-emerald-600" size={24} />
            </div>
          </GlassCard>
          
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risque faible</p>
                <p className="text-2xl font-bold text-green-600">{lowRiskClients}</p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </GlassCard>
          
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risque moyen</p>
                <p className="text-2xl font-bold text-yellow-600">{mediumRiskClients}</p>
              </div>
              <Activity className="text-yellow-600" size={24} />
            </div>
          </GlassCard>
          
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risque élevé</p>
                <p className="text-2xl font-bold text-red-600">{highRiskClients}</p>
              </div>
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </GlassCard>
          
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Score moyen</p>
                <p className="text-2xl font-bold text-emerald-600">{averageScore.toFixed(0)}</p>
              </div>
              <Target className="text-emerald-600" size={24} />
            </div>
          </GlassCard>
        </div>

        {/* Répartition des risques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="mr-2 text-emerald-600" size={20} />
              Répartition des Risques
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-700">Risque faible (85+)</span>
                </div>
                <span className="font-bold text-green-600">{((lowRiskClients / totalClients) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-700">Risque moyen (75-84)</span>
                </div>
                <span className="font-bold text-yellow-600">{((mediumRiskClients / totalClients) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-700">Risque élevé (&lt;75)</span>
                </div>
                <span className="font-bold text-red-600">{((highRiskClients / totalClients) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="mr-2 text-emerald-600" size={20} />
              Top Performers
            </h3>
            <div className="space-y-3">
              {mockReliabilityScores
                .sort((a, b) => b.overallScore - a.overallScore)
                .slice(0, 3)
                .map((client, index) => (
                  <div key={client.clientId} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{client.clientName}</p>
                      <p className="text-xs text-gray-500">Score: {client.overallScore}</p>
                    </div>
                    <ScoreCircle score={client.overallScore} size="small" />
                  </div>
                ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="mr-2 text-red-600" size={20} />
              Clients à Surveiller
            </h3>
            <div className="space-y-3">
              {mockReliabilityScores
                .filter(client => client.riskLevel === 'high')
                .slice(0, 3)
                .map((client) => (
                  <div key={client.clientId} className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
                    <AlertTriangle className="text-red-600 flex-shrink-0" size={16} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{client.clientName}</p>
                      <p className="text-xs text-red-600">Score: {client.overallScore} - Risque élevé</p>
                    </div>
                  </div>
                ))}
            </div>
          </GlassCard>
        </div>

        {/* Filtres et recherche */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="text-emerald-600" size={20} />
              <span className="text-emerald-600 font-medium">Filtres :</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Recherche */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Rechercher par nom ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/60"
                />
              </div>

              {/* Filtre par niveau de risque */}
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger className="w-48 bg-white/60">
                  <SelectValue placeholder="Niveau de risque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les niveaux</SelectItem>
                  <SelectItem value="low">Risque faible</SelectItem>
                  <SelectItem value="medium">Risque moyen</SelectItem>
                  <SelectItem value="high">Risque élevé</SelectItem>
                </SelectContent>
              </Select>

              {/* Tri */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-white/60">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score global</SelectItem>
                  <SelectItem value="savings">Score épargne</SelectItem>
                  <SelectItem value="tontine">Score tontine</SelectItem>
                  <SelectItem value="payment">Historique paiements</SelectItem>
                  <SelectItem value="name">Nom client</SelectItem>
                  <SelectItem value="lastUpdated">Dernière MAJ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        {/* Liste des scores */}
        <GlassCard className="p-6">
          <div className="space-y-4">
            {filteredScores.length > 0 ? (
              filteredScores.map((score) => (
                <div key={score.clientId} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Informations client et score principal */}
                    <div className="flex items-center gap-6">
                      {/* Score global */}
                      <div className="flex-shrink-0">
                        <ScoreCircle score={score.overallScore} />
                      </div>

                      {/* Informations client */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{score.clientName}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <User className="mr-1" size={14} />
                            ID: {score.clientId}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="mr-1" size={14} />
                            MAJ: {format(new Date(score.lastUpdated), 'dd MMM yyyy', { locale: fr })}
                          </div>
                          <div className="flex items-center">
                            <CreditCard className="mr-1" size={14} />
                            Compte: {score.accountAge} mois
                          </div>
                        </div>
                        
                        {/* Badge niveau de risque */}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(score.riskLevel)}`}>
                          {getScoreIcon(score.overallScore)}
                          <span className="ml-1">Risque {getRiskLevelLabel(score.riskLevel)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Scores détaillés */}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-600 mb-3">Scores détaillés</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-emerald-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Épargne</span>
                            <PiggyBank className="text-emerald-600" size={16} />
                          </div>
                          <p className="text-lg font-bold text-emerald-600">{score.savingsScore}/100</p>
                          <div className="w-full bg-emerald-200 rounded-full h-1 mt-1">
                            <div 
                              className="bg-emerald-500 h-1 rounded-full" 
                              style={{ width: `${score.savingsScore}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Tontines</span>
                            <Users className="text-blue-600" size={16} />
                          </div>
                          <p className="text-lg font-bold text-blue-600">{score.tontineScore}/100</p>
                          <div className="w-full bg-blue-200 rounded-full h-1 mt-1">
                            <div 
                              className="bg-blue-500 h-1 rounded-full" 
                              style={{ width: `${score.tontineScore}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Paiements</span>
                            <CheckCircle className="text-purple-600" size={16} />
                          </div>
                          <p className="text-lg font-bold text-purple-600">{score.paymentHistory}/100</p>
                          <div className="w-full bg-purple-200 rounded-full h-1 mt-1">
                            <div 
                              className="bg-purple-500 h-1 rounded-full" 
                              style={{ width: `${score.paymentHistory}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Détails et actions */}
                    <div className="lg:w-64">
                      <div className="space-y-3">
                        {/* Statistiques détaillées */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h5 className="text-xs font-medium text-gray-600 mb-2">Détails financiers</h5>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total épargnes:</span>
                              <span className="font-medium">{(score.details.totalSavings / 1000).toFixed(0)}k FCFA</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Solde moyen:</span>
                              <span className="font-medium">{(score.details.averageBalance / 1000).toFixed(0)}k FCFA</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tontines actives:</span>
                              <span className="font-medium">{score.details.tontineParticipation}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Paiements à temps:</span>
                              <span className="font-medium text-green-600">{score.details.onTimePayments}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Paiements ratés:</span>
                              <span className="font-medium text-red-600">{score.details.missedPayments}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <GlassButton 
                            size="sm" 
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Eye className="mr-1" size={14} />
                            Voir détails
                          </GlassButton>
                          
                          <GlassButton 
                            variant="outline" 
                            size="sm"
                            className="w-full"
                          >
                            <Download className="mr-1" size={14} />
                            Rapport client
                          </GlassButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Target className="mx-auto mb-4 text-gray-400" size={64} />
                <p className="text-gray-600 text-lg mb-4">Aucun score trouvé</p>
                <p className="text-gray-500">Essayez de modifier les filtres de recherche</p>
              </div>
            )}
          </div>
          
          {filteredScores.length > 0 && (
            <div className="mt-6 text-sm text-gray-600 text-center">
              {filteredScores.length} client(s) trouvé(s) sur {mockReliabilityScores.length} au total
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default ReliabilityScoresPage;