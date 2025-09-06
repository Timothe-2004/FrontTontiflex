'use client'
import { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Users,
  Calendar,
  Target,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Send
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  mockLoanRequests, 
  mockActiveLoans, 
  supervisorStats,
  type LoanRequest,
  type ActiveLoan 
} from '@/data/supervisorMockData';

const SupervisorDashboard = () => {
  const [timeRange, setTimeRange] = useState("30j");
  
  // Prêts en retard
  const overdueLoans = mockActiveLoans.filter(loan => loan.status === 'late');

  // Demandes récentes
  const recentRequests = mockLoanRequests
    .filter(req => req.status === 'pending' || req.status === 'under_review')
    .slice(0, 5);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header avec statistiques principales */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vue d'ensemble</h1>
          <p className="text-gray-600">Gestion des prêts et suivi des performances</p>
        </div>

        {/* Cartes de statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6 border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Demandes en attente</p>
                <p className="text-2xl font-bold text-emerald-600">{supervisorStats.pendingRequests}</p>
                <p className="text-xs text-gray-500">À examiner</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <FileText className="text-emerald-600" size={24} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Prêts actifs</p>
                <p className="text-2xl font-bold text-blue-600">{supervisorStats.activeLoans}</p>
                <p className="text-xs text-gray-500">En cours</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-red-600">
              <AlertTriangle size={16} className="mr-1" />
              {supervisorStats.overdueLoans} en retard
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Approuvés ce mois</p>
                <p className="text-2xl font-bold text-green-600">{supervisorStats.approvedThisMonth}</p>
                <p className="text-xs text-gray-500">Prêts accordés</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <ArrowUp size={16} className="mr-1" />
              +{((supervisorStats.approvedThisMonth / (supervisorStats.approvedThisMonth + supervisorStats.rejectedThisMonth)) * 100).toFixed(1)}% approbation
            </div>
          </GlassCard>
        </div>

        {/* Section principale en grille */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonnes principales */}
          <div className="lg:col-span-2 space-y-8">
            {/* Demandes récentes */}
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="mr-3 text-emerald-600" size={24} />
                  Demandes Récentes
                </h2>
                <Link href="/dashboard-supervisor/loan-requests">
                  <GlassButton size="sm" variant="outline">
                    Voir toutes
                  </GlassButton>
                </Link>
              </div>

              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div key={request.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-emerald-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.clientName}</h3>
                        <p className="text-sm text-gray-600">{request.clientProfession}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.reliabilityScore >= 85 ? 'bg-green-100 text-green-700' :
                            request.reliabilityScore >= 75 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            Score: {request.reliabilityScore}/100
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                            request.status === 'under_review' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {request.status === 'pending' ? 'En attente' :
                             request.status === 'under_review' ? 'En cours' : 'Autre'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">{request.requestedAmount.toLocaleString()} FCFA</p>
                        <p className="text-sm text-gray-600">{request.requestedDuration} mois</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {request.purpose}
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/dashboard-supervisor/loan-requests/${request.id}`}>
                          <GlassButton size="sm" variant="outline">
                            <Eye className="mr-1" size={14} />
                            Voir
                          </GlassButton>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Sidebar droite avec informations utiles */}
          <div className="space-y-6">
            {/* Actions rapides */}
            <GlassCard className="p-6" hover={false}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
              <div className="space-y-3 flex-col gap-2 flex">
                <Link href="/dashboard-supervisor/loan-requests">
                  <GlassButton className="w-full text-left justify-start">
                    <FileText className="mr-3" size={20} />
                    <div>
                      <div className="font-medium">Examiner demandes</div>
                      <div className="text-xs opacity-90">{supervisorStats.pendingRequests} en attente</div>
                    </div>
                  </GlassButton>
                </Link>
                
                <Link href="/dashboard-supervisor/loan-tracking">
                  <GlassButton variant="outline" className="w-full text-left justify-start">
                    <TrendingUp className="mr-3" size={20} />
                    <div>
                      <div className="font-medium">Suivi remboursements</div>
                      <div className="text-xs text-gray-500">{supervisorStats.activeLoans} prêts actifs</div>
                    </div>
                  </GlassButton>
                </Link>
                
                <Link href="/dashboard-supervisor/reports">
                  <GlassButton variant="outline" className="w-full text-left justify-start">
                    <Target className="mr-3" size={20} />
                    <div>
                      <div className="font-medium">Générer rapport</div>
                      <div className="text-xs text-gray-500">Analytics & statistiques</div>
                    </div>
                  </GlassButton>
                </Link>
              </div>
            </GlassCard>

            {/* Prêts en retard */}
            {overdueLoans.length > 0 && (
              <GlassCard className="p-6" hover={false}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="mr-2 text-red-600" size={20} />
                  Prêts en Retard
                </h3>
                <div className="space-y-3">
                  {overdueLoans.map((loan) => (
                    <div key={loan.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100">
                        <AlertTriangle size={16} className="text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{loan.clientName}</p>
                        <p className="text-xs text-red-600">{loan.daysLate} jours de retard</p>
                      </div>
                      <div className="text-sm font-bold text-red-600">
                        {loan.monthlyPayment.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Statistiques de performance */}
            <GlassCard className="p-6" hover={false}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance du Mois</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Demandes traitées</span>
                  <span className="font-bold text-gray-900">{supervisorStats.approvedThisMonth + supervisorStats.rejectedThisMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taux d'approbation</span>
                  <span className="font-bold text-green-600">{((supervisorStats.approvedThisMonth / (supervisorStats.approvedThisMonth + supervisorStats.rejectedThisMonth)) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Temps moyen</span>
                  <span className="font-bold text-blue-600">{supervisorStats.averageApprovalTime} jours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Portfolio</span>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">{supervisorStats.portfolioPerformance}%</div>
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div className="w-15 h-2 bg-purple-500 rounded-full" style={{width: `${supervisorStats.portfolioPerformance}%`}}></div>
                    </div>
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

export default SupervisorDashboard;