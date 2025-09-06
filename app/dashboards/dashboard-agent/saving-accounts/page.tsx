'use client'
import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  PiggyBank,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  X,
  Check,
  Ban,
  DollarSign,
  Plus,
  UserCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

// Import du hook
import { useSavingsAccounts } from '@/hooks/useSavingAccounts';
import type { SavingsAccount, SavingsAccountStatus } from '@/types/saving-accounts';

const AgentSFDEpargnePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedDemande, setSelectedDemande] = useState<SavingsAccount | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string, title: string }>({ url: "", title: "" });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState<'demandes' | 'actifs'>('demandes');
  const [showHistoriqueModal, setShowHistoriqueModal] = useState(false);
  const [selectedCompte, setSelectedCompte] = useState<SavingsAccount | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCompte, setNewCompte] = useState({
    clientName: '',
    telephone: '',
    profession: '',
    adresse: ''
  });

  // Utilisation du hook
  const {
    savingsAccounts,
    loading,
    error,
    fetchSavingsAccounts,
    validateRequest,
    fetchTransactionHistory,
    transactionHistory
  } = useSavingsAccounts();

  // Chargement initial des données
  useEffect(() => {
    loadSavingsAccounts();
  }, []);

  // Réinitialiser les filtres quand on change d'onglet
  useEffect(() => {
    setSearchTerm("");
    setFilterStatus("all");
  }, [activeTab]);

  const loadSavingsAccounts = async () => {
    try {
      await fetchSavingsAccounts();
    } catch (error) {
      console.error('Erreur lors du chargement des comptes:', error);
    }
  };

  // Séparer d'abord les demandes en attente des comptes actifs
  const demandesEnAttenteBase = savingsAccounts.filter(compte =>
    ['en_cours_creation', 'validee_agent', 'paiement_effectue'].includes(compte.statut)
  );

  const comptesActifsBase = savingsAccounts.filter(compte =>
    compte.statut === 'actif'
  );

  // Filtrage selon l'onglet actif
  const filteredDemandes = (activeTab === 'demandes' ? demandesEnAttenteBase : comptesActifsBase).filter(demande => {
    const searchMatch = demande.client_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.numero_telephone_paiement?.includes(searchTerm) ||
      demande.accountNumber?.includes(searchTerm);

    let statusMatch = true;
    if (activeTab === 'demandes') {
      // Pour l'onglet demandes, filtrer par statuts de demandes
      statusMatch = filterStatus === "all" || demande.statut === filterStatus;
    }
    // Pour l'onglet actifs, pas de filtre par statut (tous sont "actif")

    return searchMatch && statusMatch;
  });

  // Assignation selon l'onglet
  const demandesEnAttente = activeTab === 'demandes' ? filteredDemandes : demandesEnAttenteBase;
  const comptesActifs = activeTab === 'actifs' ? filteredDemandes : comptesActifsBase;

  // Actions interactives
  const handleValidateCompte = async (demande: SavingsAccount) => {
    try {
      await validateRequest(demande.id, {
        approuver: true,
        commentaires: 'Demande validée par l\'agent'
      });
      toast.success(`Compte épargne de ${demande.client_nom} validé avec succès !`);
      setShowModal(false);
      // Recharger les données
      await loadSavingsAccounts();
    } catch (error) {
      toast.error('Erreur lors de la validation du compte');
    }
  };

  const handleRejectCompte = async (demande: SavingsAccount, raison: string) => {
    try {
      await validateRequest(demande.id, {
        approuver: false,
        raison_rejet: raison || 'Non spécifiée'
      });
      toast.error(`Demande de ${demande.client_nom} rejetée. Raison : ${raison || 'Non spécifiée'}`);
      setShowRejectModal(false);
      setRejectReason("");
      // Recharger les données
      await loadSavingsAccounts();
    } catch (error) {
      toast.error('Erreur lors du rejet de la demande');
    }
  };

  const handleViewDetails = (demande: SavingsAccount) => {
    setSelectedDemande(demande);
    setShowModal(true);
  };

  const handleViewImage = (imageUrl: string, title: string) => {
    setSelectedImage({ url: imageUrl, title });
    setShowImageModal(true);
  };

  const handleRejectClick = (demande: SavingsAccount) => {
    setSelectedDemande(demande);
    setShowRejectModal(true);
  };

  const handleNouveauCompte = () => {
    setShowCreateModal(true);
  };

  const handleCreateCompte = () => {
    if (!newCompte.clientName || !newCompte.telephone) {
      toast.error("Nom et téléphone obligatoires");
      return;
    }

    toast.success("Compte épargne créé !");
    setShowCreateModal(false);
    setNewCompte({ clientName: '', telephone: '', profession: '', adresse: '' });
    // Recharger les données après création
    loadSavingsAccounts();
  };

  const handleViewHistorique = async (compte: SavingsAccount) => {
    try {
      await fetchTransactionHistory(compte.id);
      setSelectedCompte(compte);
      setShowHistoriqueModal(true);
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'historique');
    }
  };

  const handleTelechargerReleve = (compte: SavingsAccount) => {
    toast.success(`Téléchargement du relevé du compte ${compte.accountNumber}`);

    // Générer un CSV à partir de l'historique
    let csv = 'Date,Type,Montant,Statut,Commentaire\n';

    if (compte.transactions) {
      compte.transactions.forEach(transaction => {
        csv += `${transaction.date_transaction},${transaction.type_display},${transaction.montant},${transaction.statut_display},${transaction.commentaires || ''}\n`;
      });
    }

    // Créer un blob et lancer le téléchargement
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `releve_${compte.accountNumber}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const getStatusBadge = (status: SavingsAccountStatus) => {
    switch (status) {
      case 'en_cours_creation':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'validee_agent':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'paiement_effectue':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'actif':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'suspendu':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'ferme':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'rejete':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: SavingsAccountStatus) => {
    switch (status) {
      case 'en_cours_creation':
        return 'En création';
      case 'validee_agent':
        return 'Validée';
      case 'paiement_effectue':
        return 'Payée';
      case 'actif':
        return 'Actif';
      case 'suspendu':
        return 'Suspendu';
      case 'ferme':
        return 'Fermé';
      case 'rejete':
        return 'Rejeté';
      default:
        return status;
    }
  };

  // Statistiques calculées sur toutes les données (pas filtrées)
  const statsData = {
    demandesEnAttente: demandesEnAttenteBase.length,
    comptesActifs: comptesActifsBase.length,
    epargneTotal: comptesActifsBase.reduce((sum, compte) => sum + (compte.solde || 0), 0),
    creationsMois: savingsAccounts.filter(compte => {
      const dateCreation = new Date(compte.dateCreation);
      const maintenant = new Date();
      return dateCreation.getMonth() === maintenant.getMonth() &&
        dateCreation.getFullYear() === maintenant.getFullYear();
    }).length
  };

  if (loading && savingsAccounts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des comptes épargne...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GlassCard className="p-4 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Demandes en attente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {statsData.demandesEnAttente}
                </p>
              </div>
              <Clock className="text-orange-600" size={24} />
            </div>
          </GlassCard>

          <GlassCard className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Comptes actifs</p>
                <p className="text-2xl font-bold text-green-600">{statsData.comptesActifs}</p>
              </div>
              <PiggyBank className="text-green-600" size={24} />
            </div>
          </GlassCard>

          <GlassCard className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Épargne totale</p>
                <p className="text-xl font-bold text-blue-600">
                  {statsData.epargneTotal.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">FCFA</p>
              </div>
              <DollarSign className="text-blue-600" size={24} />
            </div>
          </GlassCard>

          <GlassCard className="p-4 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Créés ce mois</p>
                <p className="text-2xl font-bold text-purple-600">{statsData.creationsMois}</p>
              </div>
              <UserCheck className="text-purple-600" size={24} />
            </div>
          </GlassCard>
        </div>

        {/* Navigation par onglets */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            {[
              { id: 'demandes', label: 'Demandes en attente', icon: Clock },
              { id: 'actifs', label: 'Comptes actifs', icon: PiggyBank }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm transition-all",
                  activeTab === tab.id
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <tab.icon size={16} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtres et recherche - disponibles pour tous les onglets */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder={activeTab === 'demandes'
                  ? "Rechercher par nom, téléphone, numéro de compte..."
                  : "Rechercher un compte actif..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/60"
              />
            </div>

            {/* Filtres - Seulement pour l'onglet demandes */}
            {activeTab === 'demandes' && (
              <div className="flex gap-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 bg-white/60">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent className='bg-white'>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="en_cours_creation">En création</SelectItem>
                    <SelectItem value="validee_agent">Validées</SelectItem>
                    <SelectItem value="paiement_effectue">Payées</SelectItem>
                    <SelectItem value="rejete">Rejetées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboards/dashboard-agent/saving-accounts/new">
              <GlassButton size="sm">
                <Plus size={16} className="mr-2" />
                Nouveau compte
              </GlassButton>
            </Link>
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'demandes' && (
          <>
            <div className="overflow-x-auto mb-8 w-full">
              <table className="min-w-[900px] w-full text-sm border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-2 text-left">Client</th>
                    <th className="px-2 py-2 text-left">Date demande</th>
                    <th className="px-2 py-2 text-left">Date création</th>
                    <th className="px-2 py-2 text-center">Statut</th>
                    <th className="px-2 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDemandes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 py-6">
                        <UserCheck className="mx-auto mb-2 text-gray-300" size={36} />
                        <div>
                          {demandesEnAttenteBase.length === 0
                            ? "Aucune demande de compte épargne"
                            : "Aucune demande trouvée"
                          }
                        </div>
                        <div className="text-xs text-gray-500">
                          {demandesEnAttenteBase.length === 0
                            ? "Les nouvelles demandes apparaîtront ici"
                            : "Essayez de modifier vos filtres de recherche"
                          }
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDemandes.map((demande) => (
                      <tr key={demande.id}
                        className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 transition-all hover:shadow-md"
                      >
                        {/* Client */}
                        <td className="px-2 py-2 font-semibold text-gray-900 align-middle">
                          {demande.client_nom || 'Non renseigné'}
                        </td>
                        {/* Date */}
                        <td className="px-2 py-2 text-gray-700 align-middle">
                          {demande.date_demande ? format(new Date(demande.date_demande), 'dd/MM/yyyy', { locale: fr }) : '-'}
                        </td>
                        {/* Date */}
                        <td className="px-2 py-2 text-gray-700 align-middle">
                          {demande.dateCreation ? format(new Date(demande.dateCreation), 'dd/MM/yyyy', { locale: fr }) : '-'}
                        </td>
                        {/* Statut */}
                        <td className="px-2 py-2 text-center align-middle">
                          <span className={cn("px-3 text-nowrap py-1 rounded-full text-xs font-medium border", getStatusBadge(demande.statut as SavingsAccountStatus))}>
                            {getStatusLabel(demande.statut as SavingsAccountStatus)}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-2 py-2 text-center align-middle">
                          <div className="flex items-center gap-3">
                            <GlassButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(demande)}
                            >
                              <Eye size={16} className="mr-1" />
                            </GlassButton>

                            {demande.statut === 'en_cours_creation' && (
                              <>
                                <GlassButton
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleValidateCompte(demande)}
                                  disabled={loading}
                                >
                                  <CheckCircle size={16} className="mr-1" />
                                </GlassButton>

                                <GlassButton
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                  onClick={() => handleRejectClick(demande)}
                                  disabled={loading}
                                >
                                  <Ban size={16} className="mr-1" />
                                </GlassButton>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Onglet comptes actifs */}
        {activeTab === 'actifs' && (
          <div className="overflow-x-auto mb-8 w-full">
            <table className="min-w-[900px] w-full text-sm border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-2 text-left">Client</th>
                  <th className="px-2 py-2 text-left">Nombres de transactions</th>
                  <th className="px-2 py-2 text-left">SFD</th>
                  <th className="px-2 py-2 text-left">Solde</th>
                  <th className="px-2 py-2 text-left">Dernière transaction</th>
                  <th className="px-2 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDemandes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-6">
                      <PiggyBank className="mx-auto mb-2 text-gray-300" size={36} />
                      <div>Aucun compte épargne actif trouvé</div>
                    </td>
                  </tr>
                ) : (
                  filteredDemandes.map((compte) => (
                    <tr key={compte.id}
                      className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 transition-all hover:shadow-md"
                    >
                      {/* Client */}
                      <td className="px-2 py-2 font-semibold text-gray-900 align-middle">
                        {compte.client_nom || 'Non renseigné'}
                      </td>
                      {/* Nombres de transactions */}
                      <td className="px-2 py-2 text-gray-700 align-middle">
                        {compte.transactions?.length || 0}
                      </td>
                      {/* SFD */}
                      <td className="px-2 py-2 text-gray-700 align-middle">
                        {compte.sfdName}
                      </td>
                      {/* Solde */}
                      <td className="px-2 py-2 text-green-700 align-middle font-bold">
                        {compte.solde?.toLocaleString() || '0'} FCFA
                      </td>
                      {/* Date ouverture */}
                      <td className="px-2 py-2 text-gray-700 align-middle">
                        {compte.derniere_transaction ? format(new Date(compte.derniere_transaction), 'dd/MM/yyyy', { locale: fr }) : 'Aucune transaction'}
                      </td>
                      {/* Actions */}
                      <td className="px-2 py-2 text-center align-middle">
                        <div className="flex items-center gap-3 justify-center">
                          <GlassButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewHistorique(compte)}
                          >
                            <Eye size={16} className="mr-1" />
                          </GlassButton>
                          <GlassButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleTelechargerReleve(compte)}
                          >
                            <Download size={16} className="mr-1" />
                          </GlassButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal détails */}
        {showModal && selectedDemande && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">Détails de la demande</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">Client</label>
                    <p className="text-gray-900">{selectedDemande.client_nom || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">ID Adherent</label>
                    <p className="text-gray-900">{selectedDemande.id || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">N° Compte</label>
                    <p className="text-gray-900">{selectedDemande.accountNumber || 'En attente'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">SFD</label>
                    <p className="text-gray-900">{selectedDemande.sfdName || 'Non renseigné'}</p>
                  </div>
                </div>

                {/* Pièces à vérifier */}
                <div className="mb-6">
                  <div className="font-semibold text-green-700 mb-2">Pièces à vérifier</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-3 border">
                      <span className="text-xs text-green-700 mb-1">Pièce d'identité</span>
                      <div className="flex items-center">
                        <a href={selectedDemande.piece_identite_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-sm">Voir</a>
                      </div>
                    </div>
                    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-3 border">
                      <span className="text-xs text-gray-500 mb-1">Photo d'identité</span>
                      <div className="flex items-center">
                        <a href={selectedDemande.photo_identite_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-sm">Voir</a>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedDemande.statut === 'en_cours_creation' && (
                  <div className="flex gap-3">
                    <GlassButton
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleValidateCompte(selectedDemande)}
                      disabled={loading}
                    >
                      <Check size={16} className="mr-2" />
                      Valider le compte
                    </GlassButton>

                    <GlassButton
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setShowModal(false);
                        handleRejectClick(selectedDemande);
                      }}
                      disabled={loading}
                    >
                      <Ban size={16} className="mr-2" />
                      Rejeter
                    </GlassButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal image */}
        {showImageModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">{selectedImage.title}</h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="max-w-full h-auto mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-document.png';
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal rejet */}
        {showRejectModal && selectedDemande && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">Rejeter la demande</h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Vous êtes sur le point de rejeter la demande de compte épargne de <strong>{selectedDemande.client_nom}</strong>.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Raison du rejet</label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Sélectionner une raison</option>
                    <option value="documents_non_conformes">Documents non conformes</option>
                    <option value="photo_non_lisible">Photo d'identité non lisible</option>
                    <option value="informations_incorrectes">Informations incorrectes</option>
                    <option value="autre">Autre raison</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <GlassButton
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleRejectCompte(selectedDemande, rejectReason)}
                    disabled={!rejectReason || loading}
                  >
                    Confirmer le rejet
                  </GlassButton>

                  <GlassButton
                    variant="outline"
                    onClick={() => setShowRejectModal(false)}
                  >
                    Annuler
                  </GlassButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal historique compte actif */}
        {showHistoriqueModal && selectedCompte && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">Historique du compte</h3>
                <button
                  onClick={() => setShowHistoriqueModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <div className="font-semibold text-lg text-gray-900 mb-1">{selectedCompte.client_nom}</div>
                  <div className="text-sm text-gray-600">N° {selectedCompte.accountNumber}</div>
                </div>
                <table className="w-full text-sm border-separate border-spacing-y-1">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-2 py-2 text-left">Date</th>
                      <th className="px-2 py-2 text-left">Type</th>
                      <th className="px-2 py-2 text-right">Montant</th>
                      <th className="px-2 py-2 text-left">Statut</th>
                      <th className="px-2 py-2 text-left">Commentaire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionHistory.length ? (
                      transactionHistory.map((transaction, idx) => (
                        <tr key={idx} className="bg-white/80">
                          <td className="px-2 py-2 text-gray-800">
                            {format(new Date(transaction.date_transaction), 'dd/MM/yyyy', { locale: fr })}
                          </td>
                          <td className="px-2 py-2 text-gray-700">{transaction.type}</td>
                          <td className="px-2 py-2 text-green-700 text-right font-bold">
                            {parseFloat(transaction.montant).toLocaleString()} FCFA
                          </td>
                          <td className="px-2 py-2 text-gray-700">{transaction.statut}</td>
                          <td className="px-2 py-2 text-gray-600">{transaction.description || '-'}</td>
                        </tr>
                      ))
                    ) : selectedCompte.transactions?.length ? (
                      selectedCompte.transactions.map((transaction, idx) => (
                        <tr key={idx} className="bg-white/80">
                          <td className="px-2 py-2 text-gray-800">
                            {format(new Date(transaction.date_transaction), 'dd/MM/yyyy', { locale: fr })}
                          </td>
                          <td className="px-2 py-2 text-gray-700">{transaction.type_display}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transaction.date_transaction).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                            {parseFloat(transaction.montant).toLocaleString('fr-FR', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            })} FCFA
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.statut === 'valide' ? 'bg-green-100 text-green-800' :
                                transaction.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                              }`}>
                              {transaction.statut_display}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            <div className="truncate max-w-xs">
                              {transaction.commentaires || 'Aucun commentaire'}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-6">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>Aucune transaction trouvée</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentSFDEpargnePage;