'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { toast } from 'sonner';
import {
  PiggyBank,
  Plus,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Building,
  Calendar,
  Eye,
  Target,
  Award,
  Clock,
  DollarSign,
  CreditCard,
  Smartphone,
  Filter,
  Search,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Star
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { MyAccountSummary } from '@/types/saving-accounts';
import { useSavingsAccounts } from '@/hooks/useSavingAccounts'; // Corrigé le nom du hook

const SavingsAccountsOverview = () => {
  const [filter, setFilter] = useState<'tous' | 'actif' | 'en_cours'>('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  
  const { myAccount, loading, error, fetchMyAccount } = useSavingsAccounts();

  useEffect(() => {
    fetchMyAccount();
  }, []); 
  const accountsArray = Array.isArray(myAccount) ? myAccount : (myAccount ? [myAccount] : []);
  
  const stats = {
    totalSolde: accountsArray.reduce((sum, acc) => sum + Number(acc.solde || 0), 0),
    totalDepose: accountsArray.reduce((sum, acc) => sum + Number(acc.totalDepose || 0), 0),
    totalRetire: accountsArray.reduce((sum, acc) => sum + Number(acc.totalRetire || 0), 0),
    nombreComptes: accountsArray.length,
    comptesActifs: accountsArray.filter(acc => acc.statut === 'actif').length,
    comptesEligiblesCredit: accountsArray.filter(acc => acc.eligibiliteCredit).length,
  };

  const filteredAccounts = accountsArray.filter((account) => {
    if (filter === 'actif' && account.statut !== 'actif') return false;
    if (filter === 'en_cours' && account.statut !== 'en_cours_creation') return false;
    if (searchTerm && 
        !account.sfdName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !account.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  function formatSafeDate(dateStr?: string, dateFormat = 'dd MMM yyyy') {
    if (!dateStr) return 'Date non spécifiée';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Date invalide';
    return format(date, dateFormat, { locale: fr });
  }
  
  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'actif':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'en_cours_creation':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'suspendu':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'actif': return 'Actif';
      case 'en_cours_creation': return 'En cours';
      case 'suspendu': return 'Suspendu';
      default: return statut;
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes Comptes courant</h1>
              <p className="text-gray-600">Gérez vos comptes courants auprès de différents SFD</p>
            </div>
            <div className="">
              <Link href="/dashboards/dashboard-client/saving-accounts/new">
                <GlassButton className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  <Plus size={16} className="mr-2" />
                  Nouveau compte
                </GlassButton>
              </Link>
            </div>
          </div>

          {/* Conseils d'Épargne */}
          <GlassCard className="p-4 mb-6 bg-white/50 border-l-4 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="text-blue-600" size={20} />
                <p className="text-sm font-medium text-gray-900">
                  Conseil : Diversifiez vos comptes en ouvrant des comptes dans différents SFD pour réduire les risques.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Filtres et recherche */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'tous', label: 'Tous les comptes', count: stats.nombreComptes },
                { id: 'actif', label: 'Comptes actifs', count: stats.comptesActifs },
                { id: 'en_cours', label: 'En création', count: stats.nombreComptes - stats.comptesActifs }
              ].map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id as any)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    filter === filterOption.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white/60 text-gray-700 hover:bg-white/80 border border-white/20"
                  )}
                >
                  {filterOption.label}
                  <span className={cn(
                    "ml-2 px-2 py-0.5 rounded-full text-xs",
                    filter === filterOption.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}>
                    {filterOption.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex gap-3 lg:ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Rechercher un SFD ou numéro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1m">1 mois</option>
                <option value="3m">3 mois</option>
                <option value="6m">6 mois</option>
                <option value="1y">1 an</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Vos comptes ({filteredAccounts.length})
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Erreur de chargement</h3>
              <p className="mt-1 text-sm text-gray-500">
                {error}
              </p>
              <button
                onClick={() => fetchMyAccount()}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((account: MyAccountSummary) => (
                  <GlassCard key={account.id} className="p-6" hover={false}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                          <Building className="text-blue-600" size={28} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{account.sfdName}</h3>
                          <p className="text-sm text-gray-600 font-mono">{account.accountNumber}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                              "px-2 py-1 text-xs font-medium rounded-full border",
                              getStatusBadge(account.statut)
                            )}>
                              {getStatusLabel(account.statut)}
                            </span>
                            {account.eligibiliteCredit && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-200">
                                Éligible crédit
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600">Solde:</span>
                        <p className="font-semibold text-gray-900">
                          {(typeof account.solde === 'number' ? account.solde : Number(account.solde) || 0).toLocaleString()} FCFA
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Transactions:</span>
                        <p className="font-semibold text-gray-900">{account.nombreTransactions || 0}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Créé le:</span>
                        <p className="font-semibold text-gray-900">{formatSafeDate(account.dateCreation)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total déposé:</span>
                        <p className="font-semibold text-gray-900">
                          {(typeof account.totalDepose === 'number' ? account.totalDepose : Number(account.totalDepose) || 0).toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        Dernier mouvement: {account.derniereMouvement ? 
                          formatSafeDate(account.derniereMouvement, 'dd MMM à HH:mm') : 
                          'Aucun mouvement'}
                      </p>
                      <div className="flex gap-2">
                        <Link href={`/dashboards/dashboard-client/saving-accounts/${account.idAdherents}`}>
                          <GlassButton size="sm">
                            <Eye size={16} className="mr-2" />
                            Détails
                          </GlassButton>
                        </Link>
                      </div>
                    </div>
                  </GlassCard>
                ))
              ) : (
                <div className="col-span-full">
                  <GlassCard className="p-12 text-center">
                    <PiggyBank className="mx-auto mb-4 text-gray-400" size={64} />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun compte trouvé</h3>
                    <p className="text-gray-600 mb-6">
                      {filter === 'tous'
                        ? "Vous n'avez pas encore de compte épargne."
                        : `Aucun compte ne correspond au filtre "${filter}".`
                      }
                    </p>
                    <Link href="/dashboards/dashboard-client/saving-accounts/new">
                      <GlassButton>
                        <Plus size={16} className="mr-2" />
                        Créer un compte épargne
                      </GlassButton>
                    </Link>
                  </GlassCard>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavingsAccountsOverview;