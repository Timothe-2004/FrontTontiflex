'use client'
import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  Filter, 
  Search, 
  Eye, 
  Phone, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  User,
  DollarSign,
  Calendar,
  Target,
  Send,
  Download,
  RefreshCw,
  CreditCard,
  Percent,
  BarChart3,
  MessageSquare,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLoans } from '@/hooks/useLoans';
import { Loan, LoanStatus, LoanFilters } from '@/types/loans';

const LoanTrackingPage = () => {
  const [filterStatus, setFilterStatus] = useState<LoanStatus | "tous">("tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_creation");
  const [sortOrder, setSortOrder] = useState("desc");

  const { loans, loading, error, fetchLoans } = useLoans();

  // Charger les prêts au montage du composant
  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const filters: LoanFilters = {};
      if (filterStatus !== "tous") {
        filters.statut = filterStatus as LoanStatus;
      }
      await fetchLoans(filters);
    } catch (err) {
      console.error('Erreur lors du chargement des prêts:', err);
    }
  };

  // Recharger quand les filtres changent
  useEffect(() => {
    loadLoans();
  }, [filterStatus]);

  // Calculs des statistiques
  const totalLoans = loans.length;
  const currentLoans = loans.filter(loan => 
    loan.statut === 'en_remboursement' || loan.statut === 'decaisse'
  ).length;
  const lateLoans = loans.filter(loan => 
    Number(loan.est_en_retard) > 0
  ).length;
  const completedLoans = loans.filter(loan => loan.statut === 'solde').length;
  const totalOutstanding = loans.reduce((sum, loan) => 
    sum + Number(loan.solde_restant_du), 0
  );
  const totalOriginal = loans.reduce((sum, loan) => 
    sum + Number(loan.montant_accorde), 0
  );

  // Filtrage et tri des prêts
  const filteredLoans = loans
    .filter(loan => {
      const statusMatch = filterStatus === "tous" || loan.statut === filterStatus;
      const searchMatch = searchTerm === "" || 
        loan.client_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.sfd_nom.toLowerCase().includes(searchTerm.toLowerCase());
      
      return statusMatch && searchMatch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date_creation":
          comparison = new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime();
          break;
        case "montant_accorde":
          comparison = Number(a.montant_accorde) - Number(b.montant_accorde);
          break;
        case "solde_restant":
          comparison = Number(a.solde_restant_du) - Number(b.solde_restant_du);
          break;
        case "retard":
          comparison = Number(a.est_en_retard || 0) - Number(b.est_en_retard || 0);
          break;
        case "client_nom":
          comparison = a.client_nom.localeCompare(b.client_nom);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === "desc" ? -comparison : comparison;
    });

  const getStatusLabel = (status: LoanStatus) => {
    switch (status) {
      case 'accorde':
        return 'Accordé';
      case 'en_attente_decaissement':
        return 'En attente décaissement';
      case 'decaisse':
        return 'Décaissé';
      case 'en_remboursement':
        return 'En remboursement';
      case 'solde':
        return 'Soldé';
      case 'en_defaut':
        return 'En défaut';
      default:
        return status;
    }
  };

  const getStatusColor = (status: LoanStatus) => {
    switch (status) {
      case 'accorde':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'en_attente_decaissement':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'decaisse':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'en_remboursement':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'solde':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'en_defaut':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: LoanStatus) => {
    switch (status) {
      case 'en_remboursement':
        return <CheckCircle size={12} />;
      case 'en_defaut':
        return <AlertTriangle size={12} />;
      case 'solde':
        return <CheckCircle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  const calculateProgress = (loan: Loan) => {
    const totalAmount = Number(loan.montant_accorde);
    const remaining = Number(loan.solde_restant_du);
    const paid = totalAmount - remaining;
    return totalAmount > 0 ? (paid / totalAmount) * 100 : 0;
  };

  const formatAmount = (amount: string | number) => {
    return Number(amount).toLocaleString('fr-FR');
  };

  if (loading && loans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Chargement des prêts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Suivi des Remboursements</h1>
            <p className="text-gray-600">Surveillez les prêts actifs et les échéances</p>
          </div>
          <div className="flex items-center gap-3">
            <GlassButton variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Rapport Excel
            </GlassButton>
            <GlassButton variant="outline" size="sm" onClick={loadLoans}>
              <RefreshCw size={16} className="mr-2" />
              Actualiser
            </GlassButton>
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-6">
            <GlassCard className="p-4 border-l-4 border-l-red-500" hover={false}>
              <div className="flex items-center">
                <AlertTriangle className="text-red-500 mr-2" size={20} />
                <p className="text-red-700">{error}</p>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Statistiques du portfolio */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total prêts</p>
                <p className="text-2xl font-bold text-gray-900">{totalLoans}</p>
              </div>
              <CreditCard className="text-emerald-600" size={24} />
            </div>
          </GlassCard>
          
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{currentLoans}</p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </GlassCard>
          
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En retard</p>
                <p className="text-2xl font-bold text-red-600">{lateLoans}</p>
              </div>
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </GlassCard>
          
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Encours total</p>
                <p className="text-2xl font-bold text-emerald-600">
                 {filteredLoans.reduce((sum, loan) => sum + Number(loan.solde_restant_du), 0).toFixed(2)} 
                </p>
              </div>
              FCFA
            </div>
          </GlassCard>
        </div>

        {/* Alertes et notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Prêts en retard */}
          {lateLoans > 0 && (
            <GlassCard className="p-6 border-l-4 border-l-red-500" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-700 flex items-center">
                  <AlertTriangle className="mr-2" size={20} />
                  Prêts en Retard ({lateLoans})
                </h3>
                <GlassButton size="sm" variant="outline">
                  <MessageSquare className="mr-1" size={14} />
                  Relancer tous
                </GlassButton>
              </div>
              <div className="space-y-2">
                {filteredLoans.filter(loan => Number(loan.est_en_retard) > 0).slice(0, 5).map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{loan.client_nom}</p>
                      <p className="text-sm text-red-600">{loan.est_en_retard} jours de retard</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-600">
                        {formatAmount(loan.montant_mensualite)} FCFA
                      </span>
                      <GlassButton size="sm" variant="outline">
                        <Phone size={12} />
                      </GlassButton>
                    </div>
                  </div>
                ))}
                {lateLoans > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{lateLoans - 5} autres prêts en retard
                  </p>
                )}
              </div>
            </GlassCard>
          )}

          {/* Prêts soldés récemment */}
          <GlassCard className="p-6 border-l-4 border-l-green-500" hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-700 flex items-center">
                <CheckCircle className="mr-2" size={20} />
                Prêts Soldés ({completedLoans})
              </h3>
            </div>
            <div className="space-y-2">
              {filteredLoans.filter(loan => loan.statut === 'solde').slice(0, 5).map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{loan.client_nom}</p>
                    <p className="text-sm text-green-600">
                      Créé: {format(new Date(loan.date_creation), 'dd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-600">
                      {formatAmount(loan.montant_accorde)} FCFA
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Filtres et recherche */}
        <div className="mb-8">
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
                  placeholder="Rechercher par nom, ID ou SFD..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/60"
                />
              </div>

              {/* Filtre par statut */}
              <Select 
                value={filterStatus} 
                onValueChange={(value) => setFilterStatus(value as LoanStatus | "tous")}
              >
                <SelectTrigger className="w-48 bg-white/60">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous statuts</SelectItem>
                  <SelectItem value="accorde">Accordé</SelectItem>
                  <SelectItem value="en_attente_decaissement">En attente décaissement</SelectItem>
                  <SelectItem value="decaisse">Décaissé</SelectItem>
                  <SelectItem value="en_remboursement">En remboursement</SelectItem>
                  <SelectItem value="solde">Soldé</SelectItem>
                  <SelectItem value="en_defaut">En défaut</SelectItem>
                </SelectContent>
              </Select>

              {/* Tri */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-white/60">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_creation">Date de création</SelectItem>
                  <SelectItem value="montant_accorde">Montant accordé</SelectItem>
                  <SelectItem value="solde_restant">Solde restant</SelectItem>
                  <SelectItem value="retard">Jours de retard</SelectItem>
                  <SelectItem value="client_nom">Nom client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Liste des prêts */}
        <GlassCard className="p-6" hover={false}>
          <div className="space-y-4">
            {filteredLoans.length > 0 ? (
              filteredLoans.map((loan) => (
                <div key={loan.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Informations client */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{loan.client_nom}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <CreditCard className="mr-1" size={14} />
                              ID: {loan.id}
                            </div>
                            <div className="flex items-center">
                              <User className="mr-1" size={14} />
                              SFD: {loan.sfd_nom}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="mr-1" size={14} />
                              Créé: {format(new Date(loan.date_creation), 'dd MMM yyyy', { locale: fr })}
                            </div>
                            <div className="flex items-center">
                              <Percent className="mr-1" size={14} />
                              Taux: {Number(loan.taux_interet_annuel).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Badge statut */}
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 flex items-center gap-1 rounded-full text-xs font-medium border ${getStatusColor(loan.statut)}`}>
                           <span>{getStatusIcon(loan.statut)}</span>
                            <span className="ml-1">{getStatusLabel(loan.statut)}</span>
                          </div>
                          {Number(loan.est_en_retard) > 0 && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              +{loan.est_en_retard}j
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Détails financiers */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-emerald-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Montant accordé</p>
                          <p className="font-bold text-emerald-600">{formatAmount(loan.montant_accorde)} FCFA</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Reste à rembourser</p>
                          <p className="font-bold text-blue-600">{formatAmount(loan.solde_restant_du)} FCFA</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Mensualité</p>
                          <p className="font-bold text-purple-600">{formatAmount(loan.montant_mensualite)} FCFA</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Durée</p>
                          <p className="font-bold text-orange-600">{loan.duree_pret_mois} mois</p>
                        </div>
                      </div>

                      {/* Barre de progression */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progression du remboursement</span>
                          <span>{Number(loan.progression_remboursement).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              Number(loan.est_en_retard) > 0 ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${calculateProgress(loan)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Informations supplémentaires */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total remboursé:</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatAmount(loan.montant_total_rembourse)} FCFA
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Date décaissement:</p>
                          <p className="text-sm text-gray-900">
                            {loan.date_decaissement ? 
                              format(new Date(loan.date_decaissement), 'dd MMM yyyy', { locale: fr }) :
                              'Non décaissé'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:w-32 lg:text-right">
                      <div className="flex lg:flex-col items-center lg:items-end gap-2">
                        <Link href={`/admin/loans/${loan.id}`}>
                          <GlassButton 
                            size="sm" 
                            className="w-full lg:w-auto bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Eye className="mr-1" size={14} />
                            Détails
                          </GlassButton>
                        </Link>
                        
                        {Number(loan.est_en_retard) > 0 && (
                          <GlassButton 
                            variant="outline" 
                            size="sm"
                            className="w-full lg:w-auto border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Phone className="mr-1" size={14} />
                            Relancer
                          </GlassButton>
                        )}
                        
                        <GlassButton 
                          variant="outline" 
                          size="sm"
                          className="w-full lg:w-auto"
                        >
                          <FileText className="mr-1" size={14} />
                          Échéancier
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="mx-auto mb-4 text-gray-400" size={64} />
                <p className="text-gray-600 text-lg mb-4">Aucun prêt trouvé</p>
                <p className="text-gray-500">Essayez de modifier les filtres de recherche</p>
              </div>
            )}
          </div>
          
          {filteredLoans.length > 0 && (
            <div className="mt-6 text-sm text-gray-600 text-center">
              {filteredLoans.length} prêt(s) trouvé(s) sur {totalLoans} au total
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default LoanTrackingPage;