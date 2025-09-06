// app/dashboard-sfd-admin/loans/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  DollarSign,
  User,
  Calendar,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Download,
  TrendingUp,
  Shield,
  Star,
  MoreVertical,
  MessageSquare,
  Phone,
  Mail,
  Building,
  MapPin,
  Briefcase,
  ChevronRight,
  History,
  Target,
  Award,
  FileCheck,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLoansApplications } from '@/hooks/useLoansApplications';
import { useLoans } from '@/hooks/useLoans';
import { LoanApplication, AdminDecisionData, RapportDemande } from '@/types/loans-applications';
import { Input } from '@heroui/react';
import RapportModal from '@/components/modals/RapportModal';

const AdminLoansValidation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showRapportModal, setShowRapportModal] = useState(false);
  const [currentRapport, setCurrentRapport] = useState<RapportDemande | null>(null);
  const [loadingRapport, setLoadingRapport] = useState(false);
  const [decisionType, setDecisionType] = useState<'valider' | 'rejeter' | null>(null);
  const [decisionComment, setDecisionComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [buttonLoading, setButtonLoading] = useState(false);
  const [accordedLoanId, setAccordedLoanId] = useState<string | null>(null);
  const {
    applications,
    loading,
    error,
    fetchApplications,
    adminDecision,
    fetchRapportAnalyse,
  } = useLoansApplications();

  const {
    decaissement
  } = useLoans();

  // Charger les demandes transférées à l'admin au montage du composant
  useEffect(() => {
    const loadApplications = async () => {
      try {
        await fetchApplications({ statut: 'transfere_admin' });
      } catch (error) {
        console.error('Erreur lors du chargement des demandes:', error);
        toast.error('Erreur lors du chargement des demandes');
      }
    };

    loadApplications();
  }, []);

  // Fonction pour charger le rapport détaillé
  const handleViewRapport = async (application: LoanApplication) => {
    setSelectedLoan(application);
    setLoadingRapport(true);
    setShowRapportModal(true);

    try {
      const rapport = await fetchRapportAnalyse(application.id);
      console.log("rapport", rapport);
      setCurrentRapport(rapport);
    } catch (error) {
      console.error('Erreur lors du chargement du rapport:', error);
      toast.error('Erreur lors du chargement du rapport détaillé');
      setShowRapportModal(false);
    } finally {
      setLoadingRapport(false);
    }
  };

  // Filtrer les demandes selon les critères
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || app.type_pret === typeFilter;

    const montant = parseFloat(app.montant_souhaite);
    const matchesAmount = amountFilter === 'all' ||
      (amountFilter === 'small' && montant <= 50000) ||
      (amountFilter === 'medium' && montant > 50000 && montant <= 150000) ||
      (amountFilter === 'large' && montant > 150000);

    return matchesSearch && matchesType && matchesAmount;
  });

  // Gérer la décision de l'admin
  const handleAdminDecision = async () => {
    if (!selectedLoan || !decisionType) return;

    try {
      const decisionData: AdminDecisionData = {
        action: decisionType,
        commentaires: decisionComment || undefined,
        ...(decisionType === 'rejeter' && { raison_rejet: rejectReason }),
        ...(decisionType === 'valider' && { montant_accorde: selectedLoan.montant_souhaite })
      };
      console.log('selectedLoan.id', selectedLoan.id);
      const result = await adminDecision(selectedLoan.id, decisionData);
 // 🚀 AFFICHAGE COMPLET DE LA RÉPONSE
    console.log('✅ Réponse complète de adminDecision:', result);
    console.log('📊 Structure de la réponse:', JSON.stringify(result, null, 2));
    
    if (result.pret) {
      setAccordedLoanId(result.pret.id);
      console.log('📄 Données du prêt:', result.pret.id);
    }
    
      const action = decisionType === 'valider' ? 'accordé' : 'rejeté';
      toast.success(`Prêt ${selectedLoan.id} ${action} avec succès!`);

      // Rafraîchir la liste
      await fetchApplications({ statut: 'transfere_admin' });

      // Fermer les modals
      setShowDecisionModal(false);
      setShowDetails(false);
      setDecisionComment('');
      setRejectReason('');

    } catch (error) {
      toast.error('Erreur lors de la validation');
      console.error('Erreur décision admin:', error);
    }
  };
  const handleDecaissement = async () => {
    setButtonLoading(true);
    try {
      await decaissement(accordedLoanId!);
      toast.success('Prêt décaissé avec succès');
    } catch (e) {
      toast.error('Erreur lors du décaissement : ' + (e instanceof Error ? e.message : ''));
    } finally {
      setButtonLoading(false);
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'transfere_admin':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1">
          <AlertTriangle size={12} />
          En attente validation
        </span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
          {status}
        </span>;
    }
  };

  const getTypeLabel = (type: string) => {
    const types = {
      'consommation': 'Consommation',
      'immobilier': 'Immobilier',
      'professionnel': 'Professionnel',
      'urgence': 'Urgence'
    };
    return types[type as keyof typeof types] || type;
  };

  const getScoreColor = (score: string | number | undefined) => {
    if (!score) return 'text-gray-400';
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    if (numScore >= 85) return 'text-green-600';
    if (numScore >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toLocaleString('fr-FR') + ' FCFA';
  };



  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <Clock className="mx-auto mb-4 text-gray-400 animate-spin" size={48} />
          <p className="text-gray-600">Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Validation des Prêts</h1>
            <p className="text-gray-600">Demandes transférées par les superviseurs</p>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="p-4 text-center border-l-4 border-l-blue-500">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {applications.length}
            </div>
            <div className="text-sm text-gray-600">En attente validation</div>
          </GlassCard>

          <GlassCard className="p-4 text-center border-l-4 border-l-green-500">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {applications.filter(app => app.type_pret === 'professionnel').length}
            </div>
            <div className="text-sm text-gray-600">Prêts professionnels</div>
          </GlassCard>

          <GlassCard className="p-4 text-center border-l-4 border-l-purple-500">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {applications.filter(app => app.type_pret === 'consommation').length}
            </div>
            <div className="text-sm text-gray-600">Prêts consommation</div>
          </GlassCard>

          <GlassCard className="p-4 text-center border-l-4 border-l-emerald-500">
            <div className="text-2xl font-bold text-emerald-600 mb-1">
              {(applications.reduce((sum, app) => sum + parseFloat(app.montant_souhaite), 0) / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-600">Montant total (FCFA)</div>
          </GlassCard>
        </div>

        {/* Filtres et actions */}
        <div className="my-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Barre de recherche */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Rechercher une demande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white/60 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              {/* Filtres */}
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-36 bg-white/60">
                    <SelectValue placeholder="Type de prêt" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="consommation">Consommation</SelectItem>
                    <SelectItem value="professionnel">Professionnel</SelectItem>
                    <SelectItem value="immobilier">Immobilier</SelectItem>
                    <SelectItem value="urgence">Urgence</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={amountFilter} onValueChange={setAmountFilter}>
                  <SelectTrigger className="w-36 bg-white/60">
                    <SelectValue placeholder="Montant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous montants</SelectItem>
                    <SelectItem value="small">≤ 50K FCFA</SelectItem>
                    <SelectItem value="medium">50K - 150K FCFA</SelectItem>
                    <SelectItem value="large"> 150K FCFA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <GlassButton variant="outline" size="sm" onClick={() => fetchApplications({ statut: 'transfere_admin' })}>
                <Filter className="mr-2" size={16} />
                Actualiser
              </GlassButton>
            </div>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <GlassCard className="p-4 border-l-4 border-l-red-500">
            <div className="text-red-600 text-sm">{error}</div>
          </GlassCard>
        )}

        {/* Liste des demandes */}
        <div className="grid gap-6">
          {filteredApplications.map((application) => (
            <GlassCard key={application.id} className="p-6" hover={false}>
              <div className="grid lg:grid-cols-4 gap-6">

                {/* Informations demandeur */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <User size={16} className="text-emerald-600" />
                      {application.prenom} {application.nom}
                    </h3>
                    <div className="flex gap-2 text-xs text-nowrap">
                      {getStatusBadge(application.statut)}
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone size={12} />
                      {application.telephone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={12} />
                      {application.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase size={12} />
                      {application.situation_professionnelle}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin size={12} />
                      {application.adresse_domicile}
                    </div>
                  </div>
                </div>

                {/* Détails de la demande */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-600" />
                    Demande de prêt
                  </h4>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant:</span>
                      <span className="font-bold text-emerald-600">
                        {formatCurrency(application.montant_souhaite)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durée:</span>
                      <span>{application.duree_pret} mois</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {getTypeLabel(application.type_pret)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <strong>Objet:</strong> {application.objet_pret}
                    </div>
                  </div>
                </div>

                {/* Évaluation financière */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-600" />
                    Situation financière
                  </h4>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Revenus:</span>
                      <span className="font-medium">
                        {formatCurrency(application.revenu_mensuel)}/mois
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Charges:</span>
                      <span className="font-medium">
                        {formatCurrency(application.charges_mensuelles)}/mois
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Ratio:</span>
                      <span className={`font-bold ${parseFloat(application.ratio_endettement) > 40 ? 'text-red-600' : 'text-green-600'}`}>
                        {application.ratio_endettement}%
                      </span>
                    </div>
                    {application.score_fiabilite && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Score:</span>
                        <span className={`font-bold ${getScoreColor(application.score_fiabilite)}`}>
                          {application.score_fiabilite}/100
                        </span>
                      </div>
                    )}

                  </div>
                  <GlassButton
                    onClick={() => handleViewRapport(application)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Eye className="mr-2" size={16} />
                    Voir rapport
                  </GlassButton>

                </div>

                {/* Actions et superviseur */}
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="text-gray-600 mb-1">Superviseur:</div>
                    <div className="font-medium">{application.superviseur_examinateur || 'Non assigné'}</div>
                    <div className="text-xs text-gray-500">
                      Transféré le {application.date_transfert_admin ?
                        format(new Date(application.date_transfert_admin), 'dd/MM/yyyy à HH:mm', { locale: fr })
                        : 'N/A'
                      }
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <GlassButton
                      size="sm"
                      onClick={() => {
                        setSelectedLoan(application);
                        setShowDetails(true);
                      }}
                      className="w-full"
                    >
                      <Eye className="mr-2" size={14} />
                      Voir détails
                    </GlassButton>
                    {application.statut != 'accorde' && (
                      <div className="flex gap-2">
                        <GlassButton
                          size="sm"
                          onClick={() => {
                            setSelectedLoan(application);
                            setDecisionType('valider');
                            setShowDecisionModal(true);
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="mr-1" size={14} />
                          Accorder
                        </GlassButton>

                        <GlassButton
                          size="sm"
                          onClick={() => {
                            setSelectedLoan(application);
                            setDecisionType('rejeter');
                            setShowDecisionModal(true);
                          }}
                          className="flex-1 border-red-300 text-red-600 bg-red-50 hover:bg-red-100"
                        >
                          <XCircle className="mr-1" size={14} />
                          Rejeter
                        </GlassButton>
                      </div>
                    )}
                    {application.statut === 'accorde' && (
                      <GlassButton
                        size="sm"
                        onClick={handleDecaissement}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <DollarSign className="mr-1" size={14} />
                        Décaisser
                      </GlassButton>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Message si aucune demande */}
        {filteredApplications.length === 0 && !loading && (
          <GlassCard className="p-12 text-center">
            <FileText className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 text-lg mb-2">Aucune demande en attente de validation</p>
            <p className="text-gray-500">
              {searchTerm || typeFilter !== 'all' || amountFilter !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Toutes les demandes ont été traitées'
              }
            </p>
          </GlassCard>
        )}

        {/* Modal de détails */}
        {showDetails && selectedLoan && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">
                  Détails de la demande {selectedLoan.id}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <XCircle size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Informations personnelles */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <User size={16} />
                      Informations personnelles
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Nom complet:</strong> {selectedLoan.prenom} {selectedLoan.nom}</div>
                      <div><strong>Date de naissance:</strong> {selectedLoan.date_naissance ? format(new Date(selectedLoan.date_naissance), 'dd/MM/yyyy', { locale: fr }) : 'N/A'}</div>
                      <div><strong>Situation familiale:</strong> {selectedLoan.situation_familiale}</div>
                      <div><strong>Téléphone:</strong> {selectedLoan.telephone}</div>
                      <div><strong>Email:</strong> {selectedLoan.email}</div>
                      <div><strong>Adresse domicile:</strong> {selectedLoan.adresse_domicile}</div>
                      {selectedLoan.adresse_bureau && (
                        <div><strong>Adresse bureau:</strong> {selectedLoan.adresse_bureau}</div>
                      )}
                    </div>
                  </div>

                  {/* Informations professionnelles */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Briefcase size={16} />
                      Situation professionnelle
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Profession:</strong> {selectedLoan.situation_professionnelle}</div>
                      <div><strong>Revenus mensuels:</strong> {formatCurrency(selectedLoan.revenu_mensuel)}</div>
                      <div><strong>Charges mensuelles:</strong> {formatCurrency(selectedLoan.charges_mensuelles)}</div>
                      <div><strong>Ratio endettement:</strong>
                        <span className={`ml-2 font-semibold ${parseFloat(selectedLoan.ratio_endettement) > 40 ? 'text-red-600' : 'text-green-600'}`}>
                          {selectedLoan.ratio_endettement}%
                        </span>
                      </div>
                      {selectedLoan.historique_prets_anterieurs && (
                        <div><strong>Historique prêts:</strong> {selectedLoan.historique_prets_anterieurs}</div>
                      )}
                    </div>
                  </div>

                  {/* Détails de la demande */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <DollarSign size={16} />
                      Détails de la demande
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Montant demandé:</strong> {formatCurrency(selectedLoan.montant_souhaite)}</div>
                      <div><strong>Durée:</strong> {selectedLoan.duree_pret} mois</div>
                      <div><strong>Type de prêt:</strong> {getTypeLabel(selectedLoan.type_pret)}</div>
                      <div><strong>Objet:</strong> {selectedLoan.objet_pret}</div>
                      <div><strong>Type de garantie:</strong> {selectedLoan.type_garantie}</div>
                      <div><strong>Détails garantie:</strong> {selectedLoan.details_garantie}</div>
                      {selectedLoan.score_fiabilite && (
                        <div><strong>Score de fiabilité:</strong>
                          <span className={`ml-2 font-semibold ${getScoreColor(selectedLoan.score_fiabilite)}`}>
                            {selectedLoan.score_fiabilite}/100
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Commentaires du superviseur */}
                {selectedLoan.commentaires_superviseur && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare size={16} />
                      Commentaires du superviseur
                    </h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {selectedLoan.commentaires_superviseur}
                    </p>
                  </div>
                )}

                {/* Plan d'affaires si disponible */}
                {selectedLoan.plan_affaires && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Building size={16} />
                      Plan d'affaires
                    </h4>
                    <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                      {selectedLoan.plan_affaires}
                    </p>
                  </div>
                )}

                {/* Actions dans le modal */}
                {selectedLoan.statut != 'accorde' && (
                  <div className="mt-6 pt-4 border-t flex gap-3">
                    <GlassButton
                      onClick={() => {
                        setDecisionType('valider');
                        setShowDecisionModal(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="mr-2" size={16} />
                      Accorder ce prêt
                    </GlassButton>

                    <GlassButton
                      variant="outline"
                      onClick={() => {
                        setDecisionType('rejeter');
                        setShowDecisionModal(true);
                      }}
                      className="border-red-300 text-red-600 bg-red-50 hover:bg-red-100"
                    >
                      <XCircle className="mr-2" size={16} />
                      Rejeter ce prêt
                    </GlassButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de décision */}
        {showDecisionModal && selectedLoan && decisionType && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {decisionType === 'valider' ? 'Accorder le prêt' : 'Rejeter le prêt'}
                </h3>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Demande: <strong>{selectedLoan.id}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Demandeur: <strong>{selectedLoan.prenom} {selectedLoan.nom}</strong>
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaires additionnels *
                  </label>
                  <textarea
                    value={decisionComment}
                    onChange={(e) => setDecisionComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={3}
                    placeholder="Ajoutez des commentaires..."
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <GlassButton
                    onClick={handleAdminDecision}
                    disabled={!decisionComment.trim()}
                    className={`flex-1 ${decisionType === 'valider' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                      }`}
                  >
                    {decisionType === 'valider' ? 'Accorder ce prêt' : 'Rejeter ce prêt'}
                  </GlassButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <RapportModal
        show={showRapportModal}
        onClose={() => {
          setShowRapportModal(false);
          setCurrentRapport(null);
        }}
        rapport={currentRapport}
      />
    </div>

  );
};
export default AdminLoansValidation;