'use client'
import { JSX, useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CreditCard,
  Plus,
  Eye,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Building,
  TrendingUp,
  DollarSign,
  Target,
  Download,
  RefreshCw,
  ArrowRight,
  Percent,
  Timer,
  FileText,
  Users,
  BadgeCheck,
  Flag,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import router from "next/router";
import Link from "next/link";
import { useLoans } from "@/hooks/useLoans"; // Ajustez le chemin selon votre structure
import { MyLoan } from "@/types/loans";

// Types et interfaces
import { LoanStatus } from '@/types/loans';

interface Loan {
  id: string;
  sfd: string;
  amount: number;
  purpose: string;
  status: LoanStatus;
  startDate: string | null;
  endDate: string | null;
  monthlyPayment: number;
  remainingAmount: number;
  paidAmount: number;
  interestRate: number;
  nextPaymentDate: string | null;
}

const MyLoans: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedSfd, setSelectedSfd] = useState<string>("all");

  // Utilisation du hook useLoans
  const { myLoans, loading, error, fetchMyLoans } = useLoans();

  // Charger les prêts au montage du composant
  useEffect(() => {
    const loadMyLoans = async () => {
      try {
        await fetchMyLoans();
      } catch (err) {
        console.error('Erreur lors du chargement des prêts:', err);
      }
    };

    loadMyLoans();
  }, []);

  // Fonction pour mapper les statuts de l'API vers les statuts du composant
  const mapApiStatusToDisplayStatus = (apiStatus: string): LoanStatus => {
    // Since we're now using the API status directly, we just need to ensure it's a valid LoanStatus
    const validStatuses: LoanStatus[] = ['accorde', 'en_attente_decaissement', 'decaisse', 'en_remboursement', 'solde', 'en_defaut'];
    if (validStatuses.includes(apiStatus as LoanStatus)) {
      return apiStatus as LoanStatus;
    }
    return 'en_attente_decaissement'; // Default status
  };

  const allLoans = myLoans;

  // Liste unique des SFD
  const sfdList: string[] = Array.from(new Set(allLoans.map(loan => loan.nom_sfd)));

  // Filtrage des prêts
  const getFilteredLoans = ():  MyLoan[] => {
    return allLoans.filter(loan => {
      const matchesSearch = loan.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.id_sfd.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.nom_sfd.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === "all" || 
        loan.status.toLowerCase() === filterStatus.toLowerCase();
      
      const matchesSfd = selectedSfd === "all" || loan.nom_sfd === selectedSfd;
      
      return matchesSearch && matchesFilter && matchesSfd;
    });
  };

  const filteredLoans: MyLoan[] = getFilteredLoans();

  const handleNewLoan = (): void => {
    router.push('/dashboards/dashboard-client/loans/new');
  };

  const handleViewLoan = (loanId: string): void => {
    router.push(`/dashboards/dashboard-client/loans/${loanId}`);
  };

  const handleRefresh = async (): Promise<void> => {
    try {
      await fetchMyLoans();
      toast.success('Prêts rechargés avec succès');
    } catch (err) {
      toast.error('Erreur lors du rechargement des prêts');
    }
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };

  const getStatusIcon = (status: LoanStatus): JSX.Element => {
    switch (status) {
      case 'accorde':
        return <CheckCircle className="text-blue-600" size={16} />;
      case 'en_attente_decaissement':
        return <Clock className="text-yellow-600" size={16} />;
      case 'decaisse':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'en_remboursement':
        return <Clock className="text-purple-600" size={16} />;
      case 'solde':
        return <BadgeCheck className="text-gray-600" size={16} />;
      case 'en_defaut':
        return <AlertCircle className="text-red-600" size={16} />;
      default:
        return <XCircle className="text-gray-600" size={16} />;
    }
  };

  const getStatusColor = (status: LoanStatus): string => {
    switch (status) {
      case 'accorde':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'en_attente_decaissement':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'decaisse':
        return "bg-green-100 text-green-800 border-green-200";
      case 'en_remboursement':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'solde':
        return "bg-gray-100 text-gray-800 border-gray-200";
      case 'en_defaut':
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Fonction pour vérifier si une SFD peut accorder un nouveau prêt
  const canRequestNewLoan = (sfdName: string): boolean => {
    const sfdLoans = allLoans.filter(loan => loan.nom_sfd === sfdName);
    return !sfdLoans.some(loan => loan.status === "decaisse" || loan.status === "en_remboursement");
  };

  // Obtenir les SFD avec prêts actifs
  const getActiveLoanSfds = (): string[] => {
    return allLoans
      .filter(loan => loan.status === "Actif" || loan.status === "En cours")
      .map(loan => loan.nom_sfd);
  };

  const activeLoanSfds = getActiveLoanSfds();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilterStatus(e.target.value);
  };

  const handleSfdChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedSfd(e.target.value);
  };

  // Affichage du loading
  if (loading && allLoans.length === 0) {
    return (
      <div className="min-h-screen">
    <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error && allLoans.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <GlassCard className="p-8 text-center max-w-md">
              <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <GlassButton onClick={handleRefresh} className="flex items-center gap-2">
                <RefreshCw size={16} />
                Réessayer
              </GlassButton>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Prêts</h1>
              <p className="text-gray-600">Gérez et consultez vos demandes de crédit</p>
            </div>

            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <GlassButton
                onClick={handleRefresh}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Actualiser
              </GlassButton>
              <Link href="/dashboards/dashboard-client/saving-accounts">
                <GlassButton
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <Plus size={16} className="mr-2" />
                  Nouvelle demande
                </GlassButton>
              </Link>
            </div>
          </div>
          
          {/* Avertissement discret */}
          <div className="bg-orange-50/80 backdrop-blur-sm border border-orange-200/50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div>
                <p className="text-sm font-medium text-orange-800 mb-1 flex items-center gap-2">
                  <Flag size={16} />
                  <span>Règle importante</span>
                </p>
                <p className="text-sm text-orange-700">
                  Une SFD n'accorde qu'un seul prêt actif à la fois. Vous devez rembourser intégralement votre prêt en cours avant d'en demander un nouveau.
                </p>
                {activeLoanSfds.length > 0 && (
                  <p className="text-sm text-orange-700 mt-2">
                    <strong>SFD avec prêts actifs :</strong> {activeLoanSfds.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search" className="text-gray-700 font-medium mb-2 block">
                  <Search className="inline mr-2" size={16} />
                  Rechercher un prêt
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    id="search"
                    type="text"
                    placeholder="Objet du prêt, numéro ou SFD..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sfd-filter" className="text-gray-700 font-medium mb-2 block">
                  <Building className="inline mr-2" size={16} />
                  Filtrer par SFD
                </Label>
                <select
                  id="sfd-filter"
                  value={selectedSfd}
                  onChange={handleSfdChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes les SFD</option>
                  {sfdList.map(sfd => (
                    <option key={sfd} value={sfd}>{sfd}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="status-filter" className="text-gray-700 font-medium mb-2 block">
                  <Filter className="inline mr-2" size={16} />
                  Filtrer par statut
                </Label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les prêts</option>
                  <option value="actif">Actifs</option>
                  <option value="en cours">En cours</option>
                  <option value="en attente">En attente</option>
                  <option value="remboursé">Remboursés</option>
                  <option value="suspendu">Suspendus</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des prêts */}
        <div className="space-y-4">
          {filteredLoans.map((loan) => (
            <GlassCard key={loan.id_sfd} className="p-6" hover={false}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      <Building className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{loan.purpose}</h3>
                      <p className="text-sm text-gray-600">{loan.nom_sfd}</p>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border",
                      getStatusColor(loan.status as LoanStatus)
                    )}>
                      {getStatusIcon(loan.status as LoanStatus)}
                      {loan.status}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-mono mb-3">{loan.id_sfd}</p>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Montant:</span>
                      <p className="font-semibold text-blue-600">{formatCurrency(loan.amount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Taux d'intérêt:</span>
                      <p className="font-semibold text-purple-600">{loan.interestRate}% /an</p>
                    </div>
                    {loan.monthlyPayment > 0 && (
                      <div>
                        <span className="text-gray-600">Mensualité:</span>
                        <p className="font-semibold text-orange-600">{formatCurrency(loan.monthlyPayment)}</p>
                      </div>
                    )}
                    {loan.nextPaymentDate && (
                      <div>
                        <span className="text-gray-600">Prochain paiement:</span>
                        <p className="font-semibold text-gray-900">
                          {format(new Date(loan.nextPaymentDate), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {loan.status !== "En attente" && loan.amount > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progression du remboursement</span>
                    <span className="font-medium">{((loan.paidAmount / loan.amount) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(loan.paidAmount / loan.amount) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Payé: {formatCurrency(loan.paidAmount)}</span>
                    <span>Reste: {formatCurrency(loan.remainingAmount)}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  {loan.startDate && loan.endDate ? (
                    <>Période: {format(new Date(loan.startDate), 'MMM yyyy', { locale: fr })} - {format(new Date(loan.endDate), 'MMM yyyy', { locale: fr })}</>
                  ) : (
                    <>En attente d'approbation</>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!canRequestNewLoan(loan.nom_sfd) && (loan.status === "Actif" || loan.status === "En cours") && (
                    <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full border border-orange-200">
                      Prêt actif - {loan.nom_sfd}
                    </span>
                  )}
                  <Link href={`/dashboards/dashboard-client/loans/${loan.id_prêt}`}>
                    <GlassButton
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Eye size={16} />
                      Voir détails
                      <ArrowRight size={14} />
                    </GlassButton>
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {filteredLoans.length === 0 && !loading && (
          <GlassCard className="p-12 text-center" hover={false}>
            <CreditCard className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun prêt trouvé</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== "all" || selectedSfd !== "all"
                ? "Aucun prêt ne correspond à vos critères de recherche."
                : "Vous n'avez pas encore de prêt."
              }
            </p>
          </GlassCard>
        )}

        {/* Indicateur de chargement pendant le rafraîchissement */}
        {loading && allLoans.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
              <Loader2 className="animate-spin text-blue-600" size={16} />
              <span className="text-sm text-gray-700">Actualisation en cours...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLoans;