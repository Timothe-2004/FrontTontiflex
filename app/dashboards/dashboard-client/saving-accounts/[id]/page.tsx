'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import {
  PiggyBank,
  ArrowLeft,
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
  FileText,
  Settings,
  Info,
  Plus,
  Minus,
  Shield,
  User,
  ChevronRight,
  Phone,
  MapPin,
  Activity,
  Zap,
  Loader2
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, differenceInMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import WithdrawalForm from '@/components/forms/WithdrawalForm';
import DepositForm from '@/components/forms/DepositForm';
import { useSavingsAccounts } from '@/hooks/useSavingAccounts';
import { toast } from 'sonner';
import WidrawalSavingsForm from '@/components/forms/WidrawalSavingsForm';

interface Transaction {
  id: string;
  accountId: string;
  type: 'depot' | 'retrait' | 'frais';
  montant: number;
  date: string;
  description: string;
  reference: string;
  methodePaiement?: 'mtn_money' | 'moov_money' | 'especes';
  numeroMobileMoney?: string;
  statut: 'confirmee' | 'en_cours' | 'echouee';
  frais?: number;
  soldeAvant: number;
  soldeApres: number;
  notes?: string;
}

const SavingsAccountDetails = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // For debugging - will show in browser console
  console.log('Current savings account ID:', id);

  const {
    savingsAccount,
    fetchSavingsAccountById,
    createDepositForPayment,
    confirmDepositPayment,
    withdraw
  } = useSavingsAccounts();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'tous' | 'depot' | 'retrait'>('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  useEffect(() => {
    const loadAccount = async () => {
      await fetchSavingsAccountById(id);
    };
    loadAccount();
  }, [id]);

  useEffect(() => {
    if (savingsAccount?.transactions) {
      const formattedTransactions: Transaction[] = savingsAccount.transactions.map(tx => ({
        id: tx.id,
        accountId: id as string,
        type: tx.type_transaction.toLowerCase() as 'depot' | 'retrait' | 'frais',
        montant: parseFloat(tx.montant),
        date: tx.date_transaction,
        description: tx.commentaires || tx.type_display,
        reference: tx.id,
        statut: tx.statut as 'confirmee' | 'en_cours' | 'echouee',
        soldeAvant: 0, // Ces valeurs devront peut-être être fournies par l'API
        soldeApres: 0,  // Ces valeurs devront peut-être être fournies par l'API
        notes: tx.commentaires
      }));
      setTransactions(formattedTransactions);
    }
  }, [savingsAccount, id]);

  // 🆕 Fonction pour gérer les dépôts avec KKiaPay
  const handleDepositSubmit = async (depositData: any) => {
    try {
      console.log('📝 Soumission dépôt:', depositData);

      // Créer le dépôt (sans paiement pour l'instant)
      const response = await createDepositForPayment(id, {
        montant: depositData.montant.toString(),
        numero_telephone: depositData.numero_telephone,
        commentaires: depositData.commentaires || `Dépôt via KKiaPay - ${depositData.montant.toLocaleString()} FCFA`
      });
      console.log('✅ Réponse dépôt:', response);
      return response;

    } catch (error) {
      console.error('❌ Erreur création dépôt:', error);
      throw error;
    }
  };

  // 🆕 Callback de succès de paiement KKiaPay pour dépôt
  const handleDepositPaymentSuccess = async (kkiapayResponse: any, depositData: any) => {
    try {
      console.log('🎉 Paiement de dépôt réussi, confirmation en cours...', kkiapayResponse);

      // 🎉 TOAST DE SUCCÈS SPÉCIFIQUE AU DÉPÔT
      toast.success('💰 Dépôt Mobile Money confirmé !', {
        description: `${depositData.montant.toLocaleString()} FCFA ajouté à votre compte épargne`,
        duration: 5000,
      });

      // Confirmer le paiement auprès du backend
      await confirmDepositPayment({
        kkiapay_transaction_id: kkiapayResponse.transactionId,
        internal_transaction_id: savingsAccount?.id || '',
        reference: `DEP-${kkiapayResponse.transactionId}`,
        amount: depositData.montant,
        phone: depositData.numero_telephone,
        status: 'success',
        timestamp: new Date().toISOString(),
        deposit_data: {
          montant: depositData.montant.toString(),
          numero_telephone: depositData.numero_telephone,
          commentaires: depositData.commentaires
        },
        account_id: id
      });

      // Rafraîchir les détails du compte
      await fetchSavingsAccountById(id);

      // 🎊 TOAST FINAL AVEC MISE À JOUR DU SOLDE
      toast.success('🏦 Compte épargne mis à jour !', {
        description: 'Votre nouveau solde est maintenant disponible',
        duration: 4000,
      });

    } catch (error) {
      console.error('❌ Erreur confirmation dépôt:', error);
    }
  };
  console.log("savingsAccount", savingsAccount);
  // 🆕 Callback d'erreur de paiement KKiaPay pour dépôt
  const handleDepositPaymentError = (error: any) => {
    console.log('❌ Erreur de paiement de dépôt:', error);
    toast.error(`❌ Dépôt échoué: ${error.message || 'Erreur inconnue'}`, {
      description: 'Veuillez réessayer ou contacter le support',
      duration: 6000,
    });
  };

  const handleWithdraw = async (withdrawData: any) => {
    try {
      setLoading(true);
      console.log('Processing withdrawal:', withdrawData);

      // Appeler l'API pour effectuer le retrait
      const result = await withdraw(id, {
        montant: withdrawData.montant.toString(),
        numero_telephone: withdrawData.numero_telephone,
        motif_retrait: withdrawData.commentaire || 'Retrait depuis l\'interface client'
      });

      // 🎉 TOAST DE SUCCÈS POUR RETRAIT
      toast.success('💸 Demande de retrait envoyé avec succès !', {
        description: `${withdrawData.montant.toLocaleString()} FCFA transféré vers ${withdrawData.numero_telephone}`,
        duration: 5000,
      });

      setIsWithdrawalModalOpen(false);

      // Rafraîchir les données du compte
      await fetchSavingsAccountById(id);

    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast.error('❌ Erreur lors du retrait', {
        description: 'Veuillez vérifier votre solde et réessayer',
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculs statistiques
  const creationDate = savingsAccount?.dateCreation ? new Date(savingsAccount.dateCreation) : new Date();
  const monthsActive = differenceInMonths(new Date(), creationDate);

  const totalDepose = savingsAccount?.totalDepose ? Number(savingsAccount.totalDepose) : 0;
  const totalRetire = savingsAccount?.totalRetire ? Number(savingsAccount.totalRetire) : 0;

  const averageMonthlyDeposit = totalDepose / Math.max(monthsActive, 1);
  const netGrowth = totalDepose - totalRetire;
  const growthPercentage = totalDepose > 0 ?
    ((netGrowth / totalDepose) * 100).toFixed(1) :
    '0.0';

  // Filtrage des transactions
  const filteredTransactions = transactions.filter(transaction => {
    if (filter !== 'tous' && transaction.type !== filter) return false;
    if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });
  console.log("Mes transactions", transactions);
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'depot': return ArrowUp;
      case 'retrait': return ArrowDown;
      case 'frais': return Minus;
      default: return DollarSign;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'depot': return 'text-green-600 bg-green-100';
      case 'retrait': return 'text-red-600 bg-red-100';
      case 'frais': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };


  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'en_cours_creation': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'validee_agent': return 'bg-green-100 text-green-700 border-green-200';
      case 'paiement_effectue': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'actif': return 'bg-green-100 text-green-700 border-green-200';
      case 'suspendu': return 'bg-red-100 text-red-700 border-red-200';
      case 'ferme': return 'bg-red-100 text-red-700 border-red-200';
      case 'rejete': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement des détails du compte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-3 hover:bg-white/60 rounded-xl transition-colors backdrop-blur-sm border border-white/20"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{savingsAccount?.accountNumber}</h1>
            <div className="flex items-center gap-4">
              <span className="text-lg font-medium text-gray-600">{savingsAccount?.sfdName}</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500">Dernière activité: {savingsAccount?.derniereMouvement ? format(new Date(savingsAccount.derniereMouvement), 'dd/MM/yyyy', { locale: fr }) : 'Aucune mouvement'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section principale - Solde et Actions */}
        <div className="grid lg:grid-cols-12 gap-8 mb-8">

          {/* Carte Solde Principal */}
          <div className="lg:col-span-5">
            <GlassCard className="p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <PiggyBank className="text-white" size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{savingsAccount?.sfdName}</h3>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-3 py-1 text-xs font-medium rounded-full border",
                        savingsAccount?.statut === 'actif' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      )}>
                        {savingsAccount?.statut === 'actif' ? 'Actif' : 'En cours'}
                      </span>
                      {savingsAccount?.eligibiliteCredit && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                          <Award size={12} className="inline mr-1" />
                          Éligible crédit
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-600 mb-2">Solde disponible</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {savingsAccount?.solde.toLocaleString()}
                  </p>
                  <p className="text-lg text-gray-500">FCFA</p>
                </div>

                {/* Actions rapides avec KKiaPay */}
                {savingsAccount?.statut === 'actif' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <GlassButton
                      onClick={() => setIsDepositModalOpen(true)}
                      variant="outline"
                    >
                      Déposer
                    </GlassButton>

                    <GlassButton
                      onClick={() => setIsWithdrawalModalOpen(true)}
                      disabled={!savingsAccount || savingsAccount.statut !== 'actif' || (savingsAccount?.solde || 0) <= 0}
                      variant="outline"
                      className=''
                    >
                      Retirer
                    </GlassButton>
                  </div>

                ) : (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock className="text-blue-600" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800 mb-2">
                          🏦 Compte en cours de création
                        </p>
                        <p className="text-xs text-blue-700 mb-3">
                          Votre compte sera <strong>automatiquement activé</strong> dès le paiement des frais de création.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </GlassCard>
          </div>

          {/* Statistiques en grille */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-4 h-full">

              {/* Total déposé */}
              <GlassCard className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total déposé</p>
                    <p className="text-2xl font-bold text-green-600">{savingsAccount?.totalDepose.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">FCFA</p>
                  </div>
                </div>
              </GlassCard>

              {/* Total retiré */}
              <GlassCard className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <ArrowDown className="text-red-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total retiré</p>
                    <p className="text-2xl font-bold text-red-600">{savingsAccount?.totalRetire.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">FCFA</p>
                  </div>
                </div>
              </GlassCard>

              {/* Nombre de transactions */}
              <GlassCard className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Activity className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transactions</p>
                    <p className="text-2xl font-bold text-blue-600">{savingsAccount?.nombreTransactions}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                </div>
              </GlassCard>

              {/* Solde actuel avec indicateur KKiaPay */}
              <GlassCard className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Paiements sécurisés</p>
                    <p className="text-lg font-bold text-purple-600">KKiaPay Mobile Money</p>
                    <p className="text-xs text-gray-500">MTN • Moov</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>

        {/* Message d'information KKiaPay */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  💳 Dépôts sécurisés avec KKiaPay Mobile Money
                </p>
                <p className="text-xs text-blue-600">
                  Déposez instantanément depuis votre compte MTN Money ou Moov Money
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section principale */}
        <div className="grid lg:grid-cols-12 gap-8">

          {/* Contenu principal - Historique des transactions */}
          <div className="lg:col-span-8">
            <GlassCard className="p-6" hover={false}>

              {/* Header avec filtres */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Historique des transactions</h3>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/60 backdrop-blur-sm"
                    />
                  </div>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/60 backdrop-blur-sm"
                  >
                    <option value="tous">Tous</option>
                    <option value="depot">Dépôts</option>
                    <option value="retrait">Retraits</option>
                  </select>
                </div>
              </div>

              {/* Liste des transactions */}
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => {
                  const IconComponent = getTransactionIcon(transaction.type);
                  const colorClass = getTransactionColor(transaction.type);

                  return (
                    <div key={transaction.id} className="group p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/60 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-4">

                        {/* Icône de transaction */}
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", colorClass)}>
                          <IconComponent size={20} />
                        </div>

                        {/* Informations principales */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-gray-900">{transaction.description}</p>
                                {transaction.type === 'depot' && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    KKiaPay
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-1">
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  {format(new Date(transaction.date), 'dd MMM yyyy à HH:mm', { locale: fr })}
                                </span>
                                <span>•</span>
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{transaction.reference}</span>
                                {transaction.methodePaiement && (
                                  <>
                                    <span>•</span>
                                    <span className="capitalize flex items-center gap-1">
                                      <Smartphone size={12} />
                                      {transaction.methodePaiement.replace('_', ' ')}
                                      {transaction.numeroMobileMoney && (
                                        <span className="font-mono">({transaction.numeroMobileMoney})</span>
                                      )}
                                    </span>
                                  </>
                                )}
                              </div>
                              {transaction.notes && (
                                <p className="text-xs text-gray-400 italic">{transaction.notes}</p>
                              )}
                            </div>

                            {/* Montant et statut */}
                            <div className="text-right ml-4">
                              <p className={cn(
                                "font-bold text-xl mb-1",
                                transaction.type === 'retrait' || transaction.type === 'frais' ? 'text-red-600' : 'text-green-600'
                              )}>
                                {transaction.type === 'retrait' || transaction.type === 'frais' ? '-' : '+'}
                                {transaction.montant.toLocaleString()}
                                <span className="text-sm ml-1">FCFA</span>
                              </p>

                              <div className="flex items-center justify-end gap-2 mb-1">
                                <div className={cn(
                                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                                  getStatusBadge(transaction.statut)
                                )}>
                                  <CheckCircle size={10} className="mr-1" />
                                  {transaction.statut === 'confirmee' ? 'Confirmé' :
                                    transaction.statut === 'en_cours' ? 'En cours' : 'Rejeté'}
                                </div>
                              </div>

                              <div className="text-xs text-gray-400">
                                Solde: {transaction.soldeApres.toLocaleString()} FCFA
                                {transaction.frais && transaction.frais > 0 && (
                                  <div className="text-orange-600">Frais: {transaction.frais} FCFA</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!savingsAccount ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-lg font-medium text-gray-900 mb-2">Chargement du compte...</p>
                </div>
              ) : !savingsAccount.transactions || savingsAccount.transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-gray-400" size={32} />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-2">Aucune transaction trouvée</p>
                  <p className="text-gray-500">
                    {searchTerm || filter !== 'tous'
                      ? "Modifiez les filtres de recherche pour voir plus de résultats"
                      : "Les transactions apparaîtront ici après vos premiers dépôts ou retraits"
                    }
                  </p>
                </div>
              ) : null}
            </GlassCard>
          </div>

          {/* Sidebar - Informations et actions */}
          <div className="lg:col-span-4 space-y-6">

            {/* Éligibilité crédit */}
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  savingsAccount?.eligibiliteCredit ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white" : "bg-gray-100 text-gray-600"
                )}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Éligibilité crédit</h3>
                  <p className={cn(
                    "text-sm font-medium",
                    savingsAccount?.eligibiliteCredit ? "text-purple-600" : "text-gray-500"
                  )}>
                    {savingsAccount?.eligibiliteCredit ? 'Éligible' : 'Non éligible'}
                  </p>
                </div>
              </div>

              {savingsAccount?.eligibiliteCredit ? (
                <div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-purple-800 mb-2">
                      🎉 Félicitations ! Votre compte est éligible pour une demande de prêt.
                    </p>
                    <p className="text-xs text-purple-600">
                      Ancienneté du compte: {monthsActive} mois
                    </p>
                  </div>
                  <Link href={`/dashboards/dashboard-client/loans/new/${id}`}>
                    <GlassButton className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                      <CreditCard size={16} className="mr-2" />
                      Demander un prêt
                    </GlassButton>
                  </Link>
                </div>
              ) : (
                <div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 mb-3">
                      Votre compte doit être actif depuis au moins 3 mois pour être éligible aux prêts.
                    </p>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progression</span>
                        <span>{monthsActive}/3 mois</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((monthsActive / 3) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {Math.max(0, 3 - monthsActive)} mois restants
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Modal de retrait */}
      {isWithdrawalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full relative max-w-xl">
            <button
              onClick={() => setIsWithdrawalModalOpen(false)}
              className="absolute top-5 right-5 text-black hover:text-gray-800 cursor-pointer"
            >
              ✕
            </button>
            <WidrawalSavingsForm
              isOpen={isWithdrawalModalOpen}
              onClose={() => setIsWithdrawalModalOpen(false)}
              details={savingsAccount}
              loading={loading}
              onSubmit={handleWithdraw}
            />
          </div>
        </div>
      )}

      {/* Modal de dépôt avec KKiaPay */}
      {isDepositModalOpen && (
        <DepositForm
          id={id}
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          details={savingsAccount}
          loading={loading}
          onSubmit={handleDepositSubmit}
          onPaymentSuccess={handleDepositPaymentSuccess}
          onPaymentError={handleDepositPaymentError}
        />
      )}
    </div>
  );
};

export default SavingsAccountDetails;