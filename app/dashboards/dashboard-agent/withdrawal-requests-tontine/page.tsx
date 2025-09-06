'use client'
import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  ArrowDown,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Check,
  Ban,
  Wallet,
  TrendingDown,
  RefreshCw,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRetraits } from '@/hooks/useWithdrawals';
import { Retrait, StatutRetrait } from '@/types/retraits';

const AgentSFDRetraitsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatutRetrait | "all">("all");
  const [selectedDemande, setSelectedDemande] = useState<Retrait | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showVirementModal, setShowVirementModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [telephone, setTelephone] = useState("");
  const [fondsSFDTotal, setFondsSFDTotal] = useState(185000);
  
  const {
    retraits,
    loading,
    error,
    fetchRetraits,
    validerRetrait,
    initierVirement
  } = useRetraits();

  useEffect(() => {
    fetchRetraits();
  }, [fetchRetraits]);

  // Filtrage des demandes
  const filteredDemandes = retraits.filter(demande => {
    const searchMatch = demande.client_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.telephone.includes(searchTerm) ||
      demande.tontine_nom.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch = filterStatus === "all" || demande.statut === filterStatus;

    return searchMatch && statusMatch;
  });

  const handleApproveRetrait = async (demande: Retrait) => {
    try {
      await validerRetrait(demande.id, {
        decision: 'approved',
        commentaire: commentaire || 'Retrait approuvé'
      });
      setCommentaire("");
      setShowModal(false);
    } catch (err) {
      console.error('Erreur lors de l\'approbation:', err);
    }
  };

  const handleRejectRetrait = async (demande: Retrait, raison: string) => {
    try {
      await validerRetrait(demande.id, {
        decision: 'rejected',
        commentaire: raison
      });
      setShowRejectModal(false);
      setRejectReason("");
      setCommentaire("");
    } catch (err) {
      console.error('Erreur lors du rejet:', err);
    }
  };

  const handleInitierVirement = async (demande: Retrait) => {
    try {
      await initierVirement(demande.id, {
        numero_telephone: telephone || demande.telephone
      });
      setShowVirementModal(false);
      setTelephone("");
    } catch (err) {
      console.error('Erreur lors de l\'initiation du virement:', err);
    }
  };

  const handleViewDetails = (demande: Retrait) => {
    setSelectedDemande(demande);
    setShowModal(true);
  };

  const handleRejectClick = (demande: Retrait) => {
    setSelectedDemande(demande);
    setShowRejectModal(true);
  };

  const handleVirementClick = (demande: Retrait) => {
    setSelectedDemande(demande);
    setTelephone(demande.telephone);
    setShowVirementModal(true);
  };

  const getStatusBadge = (status: StatutRetrait) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'confirmee':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: StatutRetrait) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      case 'confirmee':
        return 'Confirmé';
      default:
        return status;
    }
  };

  const getValidationStatus = (demande: Retrait) => {
    if (fondsSFDTotal < Number(demande.montant)) {
      return {
        valid: false,
        message: "Fonds SFD insuffisants",
        icon: <AlertTriangle className="text-red-600" size={16} />,
        bgClass: "bg-red-50 border-red-200",
        textClass: "text-red-700"
      };
    }

    return {
      valid: true,
      message: "Retrait autorisé",
      icon: <CheckCircle className="text-green-600" size={16} />,
      bgClass: "bg-green-50 border-green-200",
      textClass: "text-green-700"
    };
  };

  const getRejectReasonLabel = (reason: string) => {
    switch (reason) {
      case 'fonds_sfd_insuffisants':
        return 'Fonds SFD insuffisants';
      case 'documents_non_conformes':
        return 'Documents non conformes';
      case 'suspicious_activity':
        return 'Activité suspecte';
      case 'autre':
        return 'Autre raison';
      default:
        return reason;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Statistiques et fonds disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GlassCard className="p-4 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {retraits.filter(d => d.statut === 'pending').length}
                </p>
              </div>
              <Clock className="text-orange-600" size={24} />
            </div>
          </GlassCard>

          <GlassCard className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approuvées</p>
                <p className="text-2xl font-bold text-green-600">
                  {retraits.filter(d => d.statut === 'approved').length}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </GlassCard>

          <GlassCard className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Montant total</p>
                <p className="text-xl font-bold text-blue-600">
                  {retraits.reduce((sum, d) => sum + (d.statut === 'confirmee' ? Number(d.montant) : 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">FCFA</p>
              </div>
              <TrendingDown className="text-blue-600" size={24} />
            </div>
          </GlassCard>

          <GlassCard className="p-4 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fonds SFD</p>
                <p className="text-xl font-bold text-purple-600">
                  {fondsSFDTotal.toLocaleString()}
                  <button
                    title="Actualiser les fonds"
                    onClick={async () => {
                      const nouveauMontant = Math.floor(180000 + Math.random() * 20000);
                      setFondsSFDTotal(nouveauMontant);
                    }}
                    className="ml-2 inline-flex items-center rounded-full bg-white border border-purple-200 px-2 py-0.5 text-xs text-purple-600 hover:bg-purple-50 transition"
                  >
                    <RefreshCw size={14} className="mr-1" />
                    Actualiser
                  </button>
                </p>
                <p className="text-xs text-gray-500">FCFA disponibles</p>
              </div>
              <Wallet className="text-purple-600" size={24} />
            </div>
          </GlassCard>
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Rechercher par nom, téléphone, tontine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/60"
            />
          </div>

          <div className="flex gap-3">
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as StatutRetrait | "all")}>
              <SelectTrigger className="w-40 bg-white/60">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvées</SelectItem>
                <SelectItem value="rejected">Rejetées</SelectItem>
                <SelectItem value="confirmee">Confirmées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tableau des demandes de retrait */}
        <div className="overflow-x-auto mb-8 w-full">
          <table className="min-w-[1100px] w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-2 text-left">Client</th>
                <th className="px-2 py-2 text-left">Téléphone</th>
                <th className="px-2 py-2 text-left">Tontine</th>
                <th className="px-2 py-2 text-left">Montant</th>
                <th className="px-2 py-2 text-left">Date</th>
                <th className="px-2 py-2 text-center">Statut</th>
                <th className="px-2 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-6">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="animate-spin mr-2" size={20} />
                      Chargement...
                    </div>
                  </td>
                </tr>
              ) : filteredDemandes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-6">
                    <ArrowDown className="mx-auto mb-2 text-gray-300" size={36} />
                    <div>Aucune demande de retrait trouvée</div>
                    <div className="text-xs text-gray-500">Essayez de modifier vos filtres de recherche</div>
                  </td>
                </tr>
              ) : (
                filteredDemandes.map((demande) => (
                  <tr key={demande.id}
                    className={cn("bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 transition-all hover:shadow-md")}
                  >
                    <td className="px-2 py-2 font-semibold text-gray-900 align-middle">
                      {demande.client_nom} {demande.client_prenom}
                    </td>
                    <td className="px-2 py-2 text-gray-700 align-middle">{demande.telephone}</td>
                    <td className="px-2 py-2 text-gray-700 align-middle">{demande.tontine_nom}</td>
                    <td className="px-2 py-2 text-green-700 align-middle font-bold">
                      {Number(demande.montant).toLocaleString()} FCFA
                    </td>
                    <td className="px-2 py-2 text-gray-700 align-middle">
                      {new Date(demande.date_demande_retrait).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-2 py-2 text-center align-middle">
                      <span className={cn("px-3 py-1 text-nowrap rounded-full text-xs font-medium border", getStatusBadge(demande.statut))}>
                        {getStatusLabel(demande.statut)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center align-middle">
                      <div className="flex items-center gap-2 justify-center">
                        <GlassButton size="sm" variant="outline" onClick={() => handleViewDetails(demande)}>
                          <Eye size={16} className="mr-1" />
                        </GlassButton>
                        {demande.statut === 'pending' && (
                          <>
                            <GlassButton
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleViewDetails(demande)}
                            >
                              <CheckCircle size={16} className="mr-1" />
                            </GlassButton>
                            <GlassButton
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => handleRejectClick(demande)}
                            >
                              <Ban size={16} className="mr-1" />
                            </GlassButton>
                          </>
                        )}
                        {demande.statut === 'approved' && (
                          <GlassButton
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleVirementClick(demande)}
                          >
                            <Send size={16} className="mr-1" />
                          </GlassButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal détails */}
        {showModal && selectedDemande && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">Détails de la demande de retrait</h3>
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
                    <label className="block text-sm font-medium text-green-600 mb-1">Client</label>
                    <p className="text-gray-900">{selectedDemande.client_nom} {selectedDemande.client_prenom}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-600 mb-1">ID Retrait</label>
                    <p className="text-gray-900">{selectedDemande.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-600 mb-1">Téléphone</label>
                    <p className="text-gray-900">{selectedDemande.telephone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-600 mb-1">Tontine</label>
                    <p className="text-gray-900">{selectedDemande.tontine_nom}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-600 mb-1">Montant demandé</label>
                    <p className="text-gray-900 font-bold">{Number(selectedDemande.montant).toLocaleString()} FCFA</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-600 mb-1">Statut</label>
                    <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", getStatusBadge(selectedDemande.statut))}>
                      {getStatusLabel(selectedDemande.statut)}
                    </span>
                  </div>
                </div>

                {selectedDemande.commentaires_agent && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-green-600 mb-1">Commentaires Agent</label>
                    <p className="text-gray-900">{selectedDemande.commentaires_agent}</p>
                  </div>
                )}

                {selectedDemande.statut === 'pending' && (() => {
                  const validationStatus = getValidationStatus(selectedDemande);
                  return (
                    <div>
                      <div className={cn("mt-1 px-2 py-2 rounded mb-4 text-xs flex items-center gap-1 justify-center", validationStatus.bgClass, validationStatus.textClass)}>
                        {validationStatus.icon}
                        <span>{validationStatus.message}</span>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
                        <textarea
                          value={commentaire}
                          onChange={(e) => setCommentaire(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          rows={3}
                          placeholder="Ajoutez un commentaire..."
                        />
                      </div>

                      <div className="flex gap-3">
                        <GlassButton
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveRetrait(selectedDemande)}
                        >
                          <Check size={16} className="mr-2" />
                          Approuver le retrait
                        </GlassButton>

                        <GlassButton
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setShowModal(false);
                            handleRejectClick(selectedDemande);
                          }}
                        >
                          <Ban size={16} className="mr-2" />
                          Rejeter
                        </GlassButton>
                      </div>
                    </div>
                  );
                })()}

                {selectedDemande.statut === 'approved' && (
                  <div className="flex gap-3">
                    <GlassButton
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        setShowModal(false);
                        handleVirementClick(selectedDemande);
                      }}
                    >
                      <Send size={16} className="mr-2" />
                      Initier le virement
                    </GlassButton>
                  </div>
                )}
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
                  Vous êtes sur le point de rejeter la demande de retrait de <strong>{selectedDemande.client_nom}</strong>
                  pour un montant de <strong>{Number(selectedDemande.montant).toLocaleString()} FCFA</strong>.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Raison du rejet</label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Sélectionner une raison</option>
                    <option value="fonds_sfd_insuffisants">Fonds SFD insuffisants</option>
                    <option value="documents_non_conformes">Documents non conformes</option>
                    <option value="suspicious_activity">Activité suspecte</option>
                    <option value="autre">Autre raison</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <GlassButton
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleRejectRetrait(selectedDemande, rejectReason)}
                    disabled={!rejectReason}
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

        {/* Modal virement */}
        {showVirementModal && selectedDemande && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">Initier le virement</h3>
                <button
                  onClick={() => setShowVirementModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Vous allez initier un virement de <strong>{Number(selectedDemande.montant).toLocaleString()} FCFA</strong> 
                  pour <strong>{selectedDemande.client_nom}</strong>.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de téléphone</label>
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Numéro de téléphone"
                  />
                </div>

                <div className="flex gap-3">
                  <GlassButton
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleInitierVirement(selectedDemande)}
                    disabled={!telephone}
                  >
                    <Send size={16} className="mr-2" />
                    Initier le virement
                  </GlassButton>

                  <GlassButton
                    variant="outline"
                    onClick={() => setShowVirementModal(false)}
                  >
                    Annuler
                  </GlassButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentSFDRetraitsPage;