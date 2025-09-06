'use client'
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { 
  ArrowLeft,
  Calendar,
  CreditCard,
  DollarSign,
  User,
  Building,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  Download,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  Target,
  Percent,
  Users,
  MapPin,
  Send,
  Eye,
  Calculator
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLoans } from '@/hooks/useLoans';
import { Loan, RepaymentSchedule, CalendrierRemboursement } from '@/types/loans';

const LoanDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const loanId = params?.id as string;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  
  const { 
    loan, 
    calendrierRemboursement, 
    loading, 
    error, 
    fetchLoanById, 
    fetchCalendrierRemboursement 
  } = useLoans();

  useEffect(() => {
    if (loanId) {
      loadLoanDetails();
    }
  }, [loanId]);

  const loadLoanDetails = async () => {
    try {
      await fetchLoanById(loanId);
      await fetchCalendrierRemboursement(loanId);
    } catch (err) {
      console.error('Erreur lors du chargement des détails:', err);
    }
  };

  const formatAmount = (amount: string | number) => {
    return Number(amount).toLocaleString('fr-FR');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accorde': return 'Accordé';
      case 'en_attente_decaissement': return 'En attente décaissement';
      case 'decaisse': return 'Décaissé';
      case 'en_remboursement': return 'En remboursement';
      case 'solde': return 'Soldé';
      case 'en_defaut': return 'En défaut';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accorde': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'en_attente_decaissement': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'decaisse': return 'bg-green-100 text-green-700 border-green-200';
      case 'en_remboursement': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'solde': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'en_defaut': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEcheanceStatusColor = (statut: string) => {
    switch (statut) {
      case 'paye': return 'bg-green-100 text-green-700';
      case 'en_attente': return 'bg-yellow-100 text-yellow-700';
      case 'en_retard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const calculateProgress = () => {
    if (!loan) return 0;
    const totalAmount = Number(loan.montant_accorde);
    const remaining = Number(loan.solde_restant_du);
    const paid = totalAmount - remaining;
    return totalAmount > 0 ? (paid / totalAmount) * 100 : 0;
  };

  if (loading && !loan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Chargement des détails du prêt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-8 max-w-md">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <GlassButton onClick={() => router.back()}>
              <ArrowLeft className="mr-2" size={16} />
              Retour
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-8 max-w-md">
          <div className="text-center">
            <FileText className="mx-auto mb-4 text-gray-400" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Prêt non trouvé</h2>
            <p className="text-gray-600 mb-4">Le prêt demandé n'existe pas ou a été supprimé.</p>
            <GlassButton onClick={() => router.back()}>
              <ArrowLeft className="mr-2" size={16} />
              Retour
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <GlassButton variant="outline" onClick={() => router.back()}>
              <ArrowLeft size={16} />
            </GlassButton>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Détails du Prêt</h1>
              <p className="text-gray-600">Client: {loan.client_nom}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GlassButton variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Exporter
            </GlassButton>
            <GlassButton variant="outline" size="sm">
              <Edit size={16} className="mr-2" />
              Modifier
            </GlassButton>
            <GlassButton variant="outline" size="sm" onClick={loadLoanDetails}>
              <RefreshCw size={16} className="mr-2" />
              Actualiser
            </GlassButton>
          </div>
        </div>

        {/* Statut et informations principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Statut */}
          <GlassCard className="p-6">
            <div className="text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(loan.statut)} mb-4`}>
                {loan.statut === 'en_remboursement' && <CheckCircle size={16} className="mr-2" />}
                {loan.statut === 'en_defaut' && <AlertTriangle size={16} className="mr-2" />}
                {loan.statut === 'solde' && <CheckCircle size={16} className="mr-2" />}
                {!['en_remboursement', 'en_defaut', 'solde'].includes(loan.statut) && <Clock size={16} className="mr-2" />}
                {getStatusLabel(loan.statut)}
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {formatAmount(loan.montant_accorde)} FCFA
              </p>
              <p className="text-gray-600">Montant accordé</p>
              {Number(loan.est_en_retard) > 0 && (
                <div className="mt-3 p-2 bg-red-50 rounded-lg">
                  <p className="text-red-700 font-medium">{loan.est_en_retard} jours de retard</p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Progression */}
          <GlassCard className="p-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-24 h-24 mx-auto relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray={`${calculateProgress()}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">
                      {Number(loan.progression_remboursement).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600">Progression</p>
            </div>
          </GlassCard>

          {/* Solde restant */}
          <GlassCard className="p-6">
            <div className="text-center">
              <TrendingUp className="mx-auto mb-4 text-blue-500" size={32} />
              <p className="text-2xl font-bold text-blue-600 mb-2">
                {formatAmount(loan.solde_restant_du)} FCFA
              </p>
              <p className="text-gray-600">Solde restant</p>
              <p className="text-sm text-gray-500 mt-2">
                {formatAmount(loan.montant_total_rembourse)} FCFA remboursés
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Échéancier
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Historique
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations du prêt */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="mr-2" size={20} />
                Informations du Prêt
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">ID du prêt</p>
                    <p className="font-medium">{loan.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ID de la demande</p>
                    <p className="font-medium">{loan.demande}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date de création</p>
                    <p className="font-medium">
                      {format(new Date(loan.date_creation), 'dd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date de décaissement</p>
                    <p className="font-medium">
                      {loan.date_decaissement 
                        ? format(new Date(loan.date_decaissement), 'dd MMM yyyy', { locale: fr })
                        : 'Non décaissé'
                      }
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Durée</p>
                    <p className="font-medium">{loan.duree_pret_mois} mois</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Taux d'intérêt</p>
                    <p className="font-medium">{Number(loan.taux_interet_annuel).toFixed(2)}% / an</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Mensualité</p>
                  <p className="font-medium text-lg text-emerald-600">
                    {formatAmount(loan.montant_mensualite)} FCFA
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Informations client et SFD */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="mr-2" size={20} />
                Client & SFD
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Nom du client</p>
                  <p className="font-medium text-lg">{loan.client_nom}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">ID client</p>
                  <p className="font-medium">{loan.client}</p>
                </div>

                <div className="border-t pt-4">
                  <div>
                    <p className="text-sm text-gray-600">SFD</p>
                    <p className="font-medium text-lg">{loan.sfd_nom}</p>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">ID SFD</p>
                    <p className="font-medium">{loan.sfd_id}</p>
                  </div>
                </div>

                {loan.admin_decaisseur_nom && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">Agent décaisseur</p>
                    <p className="font-medium">{loan.admin_decaisseur_nom}</p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Résumé financier */}
            <GlassCard className="p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calculator className="mr-2" size={20} />
                Résumé Financier
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Montant accordé</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {formatAmount(loan.montant_accorde)} FCFA
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total remboursé</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatAmount(loan.montant_total_rembourse)} FCFA
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Solde restant</p>
                  <p className="text-xl font-bold text-orange-600">
                    {formatAmount(loan.solde_restant_du)} FCFA
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Progression</p>
                  <p className="text-xl font-bold text-purple-600">
                    {Number(loan.progression_remboursement).toFixed(1)}%
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {/* Résumé de l'échéancier */}
            {calendrierRemboursement?.resume && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Résumé de l'Échéancier
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(calendrierRemboursement.resume).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</p>
                      <p className="font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Tableau des échéances */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Échéancier de Remboursement</h3>
                <GlassButton size="sm" variant="outline">
                  <Download className="mr-2" size={14} />
                  Exporter
                </GlassButton>
              </div>
              
              {calendrierRemboursement?.echeances ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">N°</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Date échéance</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Capital</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Intérêt</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Mensualité</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Solde restant</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Statut</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calendrierRemboursement.echeances.map((echeance) => (
                        <tr key={echeance.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 text-sm">{echeance.numero_echeance}</td>
                          <td className="py-3 px-2 text-sm">
                            {format(new Date(echeance.date_echeance), 'dd MMM yyyy', { locale: fr })}
                          </td>
                          <td className="py-3 px-2 text-sm text-right">
                            {formatAmount(echeance.montant_capital)} FCFA
                          </td>
                          <td className="py-3 px-2 text-sm text-right">
                            {formatAmount(echeance.montant_interet)} FCFA
                          </td>
                          <td className="py-3 px-2 text-sm text-right font-medium">
                            {formatAmount(echeance.montant_mensualite)} FCFA
                          </td>
                          <td className="py-3 px-2 text-sm text-right">
                            {formatAmount(echeance.solde_restant)} FCFA
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEcheanceStatusColor(echeance.statut)}`}>
                              {echeance.statut}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            {echeance.statut === 'en_attente' && (
                              <GlassButton size="sm" variant="outline">
                                <Send size={12} className="mr-1" />
                                Payer
                              </GlassButton>
                            )}
                            {echeance.statut === 'paye' && echeance.date_paiement && (
                              <span className="text-xs text-gray-500">
                                {format(new Date(echeance.date_paiement), 'dd/MM', { locale: fr })}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600">Échéancier non disponible</p>
                  <GlassButton 
                    size="sm" 
                    className="mt-4"
                    onClick={loadLoanDetails}
                  >
                    <RefreshCw size={14} className="mr-2" />
                    Recharger
                  </GlassButton>
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {activeTab === 'history' && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des Transactions</h3>
            <div className="text-center py-8">
              <Clock className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600">Fonctionnalité en cours de développement</p>
              <p className="text-sm text-gray-500 mt-2">
                L'historique détaillé des paiements sera bientôt disponible
              </p>
            </div>
          </GlassCard>
        )}

        {/* Actions rapides */}
        <div className="mt-8">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
            <div className="flex flex-wrap gap-3">
              <GlassButton className="bg-emerald-600 hover:bg-emerald-700">
                <Send className="mr-2" size={16} />
                Enregistrer un paiement
              </GlassButton>
              
              <GlassButton variant="outline">
                <Phone className="mr-2" size={16} />
                Contacter le client
              </GlassButton>
              
              <GlassButton variant="outline">
                <FileText className="mr-2" size={16} />
                Générer rapport
              </GlassButton>
              
              <GlassButton variant="outline">
                <Calculator className="mr-2" size={16} />
                Recalculer échéances
              </GlassButton>
              
              {loan.statut === 'accorde' && (
                <GlassButton variant="outline" className="border-green-300 text-green-600">
                  <DollarSign className="mr-2" size={16} />
                  Décaisser
                </GlassButton>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default LoanDetailsPage;