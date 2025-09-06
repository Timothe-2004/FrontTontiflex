'use client'
import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  ArrowDown,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  X,
  Check,
  Ban,
  Wallet,
  TrendingDown,
  RefreshCw,
  Send,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useSavingsTransactions } from '@/hooks/useTransactions';
import { SavingsTransaction } from '@/types/transactions';
import { toast } from 'sonner';

const AgentSFDRetraitsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDemande, setSelectedDemande] = useState<SavingsTransaction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [customRejectReason, setCustomRejectReason] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferPhone, setTransferPhone] = useState("");
  const [transferComments, setTransferComments] = useState("");
  const [fondsSFDTotal, setFondsSFDTotal] = useState(185000);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const {
    fetchSavingsTransactions, 
    savingsTransactions, 
    validateWithdrawal,
    initiateTransfer,
    loading
  } = useSavingsTransactions();

  useEffect(() => {
    fetchSavingsTransactions();
  }, []);

  // Filtrage des demandes
  const filteredDemandes = savingsTransactions.filter(demande => {
    const searchMatch = demande.client_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.telephone.includes(searchTerm) ||
      demande.compte_epargne.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch = filterStatus === "all" || demande.statut === filterStatus;

    return searchMatch && statusMatch;
  });

  const handleApproveRetrait = async (demande: SavingsTransaction) => {
    try {
      setProcessingId(demande.id);
      
      await validateWithdrawal(demande.id, {
        decision: 'approved',
        commentaires: 'Demande de retrait approuvée par l\'agent SFD'
      });

      toast.success(`Retrait approuvé pour ${demande.client_nom}`);
      
      // Rafraîchir la liste
      await fetchSavingsTransactions();
      
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      toast.error('Erreur lors de l\'approbation du retrait');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRetrait = async (demande: SavingsTransaction, raison: string, customReason?: string) => {
    try {
      setProcessingId(demande.id);
      
      const finalReason = raison === 'autre' ? customReason : raison;
      const motifRejet = finalReason || 'Demande de retrait rejetée';
      
      await validateWithdrawal(demande.id, {
        decision: 'rejected',
        commentaires: motifRejet // Obligatoire pour les rejets - représente le motif
      });

      toast.success(`Retrait rejeté pour ${demande.client_nom}`);
      
      // Rafraîchir la liste
      await fetchSavingsTransactions();
      
      setShowRejectModal(false);
      setRejectReason("");
      setCustomRejectReason("");
      
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      toast.error('Erreur lors du rejet du retrait');
    } finally {
      setProcessingId(null);
    }
  };

  const handleInitiateTransfer = async (demande: SavingsTransaction) => {
    try {
      if (!transferAmount || !transferPhone) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      setProcessingId(demande.id);
      
      await initiateTransfer(demande.id, {
        numero_telephone: transferPhone
      });

      toast.success(`Virement initié avec succès pour ${demande.client_nom}`);
      
      // Rafraîchir la liste
      await fetchSavingsTransactions();
      
      setShowTransferModal(false);
      setTransferAmount("");
      setTransferPhone("");
      setTransferComments("");
      
    } catch (error) {
      console.error('Erreur lors du virement:', error);
      toast.error('Erreur lors de l\'initiation du virement');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetails = (demande: SavingsTransaction) => {
    setSelectedDemande(demande);
    setShowModal(true);
  };

  const handleRejectClick = (demande: SavingsTransaction) => {
    setSelectedDemande(demande);
    setShowRejectModal(true);
  };

  const handleTransferClick = (demande: SavingsTransaction) => {
    setSelectedDemande(demande);
    setTransferAmount(demande.montant.toString());
    setTransferPhone(demande.telephone);
    setShowTransferModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_attente':
      case 'en_cours':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'approuve':
      case 'confirmee':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejete':
      case 'echouee':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'en_transfert':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en_attente':
      case 'en_cours':
        return 'En attente';
      case 'approuve':
        return 'Approuvé';
      case 'confirmee':
        return 'Confirmé';
      case 'rejete':
      case 'echouee':
        return 'Rejeté';
      case 'en_transfert':
        return 'En transfert';
      default:
        return status;
    }
  };

  const getValidationStatus = (demande: SavingsTransaction) => {
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
                  {savingsTransactions.filter(d => d.statut === 'pending').length}
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
                  {savingsTransactions.filter(d => d.statut === 'approved' || d.statut === 'confirmee').length}
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
                  {savingsTransactions.reduce((sum, d) => sum + (d.statut === 'confirmee' ? Number(d.montant) : 0), 0).toLocaleString()}
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
              placeholder="Rechercher par nom, téléphone, compte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/60"
            />
          </div>

          <div className="flex gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 bg-white/60">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_cours">En attente</SelectItem>
                <SelectItem value="approuve">Approuvé</SelectItem>
                <SelectItem value="confirmee">Confirmé</SelectItem>
                <SelectItem value="echouee">Rejeté</SelectItem>
                <SelectItem value="en_transfert">En transfert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tableau des demandes de retrait */}
        <div className="overflow-x-auto mb-8 w-full">
          <table className="min-w-[1200px] w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-2 text-left">Client</th>
                <th className="px-2 py-2 text-left">Téléphone</th>
                <th className="px-2 py-2 text-left">Compte</th>
                <th className="px-2 py-2 text-left">Montant</th>
                <th className="px-2 py-2 text-left">Date</th>
                <th className="px-2 py-2 text-center">Statut</th>
                <th className="px-2 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDemandes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-6">
                    <ArrowDown className="mx-auto mb-2 text-gray-300" size={36} />
                    <div>Aucune demande de retrait trouvée</div>
                    <div className="text-xs text-gray-500">Essayez de modifier vos filtres de recherche</div>
                  </td>
                </tr>
              ) : (
                filteredDemandes.map((demande) => {
                  const validationStatus = getValidationStatus(demande);
                  const isProcessing = processingId === demande.id;
                  
                  return (
                    <tr key={demande.id}
                      className={cn("bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 transition-all hover:shadow-md")}
                    >
                      <td className="px-2 py-2 font-semibold text-gray-900 align-middle">
                        {demande.client_nom} {demande.client_prenom}
                      </td>
                      <td className="px-2 py-2 text-gray-700 align-middle">{demande.telephone}</td>
                      <td className="px-2 py-2 text-gray-700 align-middle">{demande.compte_epargne}</td>
                      <td className="px-2 py-2 text-green-700 align-middle font-bold">
                        {Number(demande.montant).toLocaleString()} FCFA
                      </td>
                      <td className="px-2 py-2 text-gray-600 align-middle text-xs">
                        {format(new Date(demande.date_transaction), 'dd/MM/yyyy HH:mm', { locale: fr })}
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
                          
                          {(demande.statut === 'pending') && (
                            <>
                              <GlassButton
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproveRetrait(demande)}
                                disabled={isProcessing || !validationStatus.valid}
                              >
                                {isProcessing ? (
                                  <Loader2 size={16} className="mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle size={16} className="mr-1" />
                                )}
                              </GlassButton>
                              <GlassButton
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => handleRejectClick(demande)}
                                disabled={isProcessing}
                              >
                                <Ban size={16} className="mr-1" />
                              </GlassButton>
                            </>
                          )}
                          
                          {(demande.statut === 'approved') && (
                            <GlassButton
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleTransferClick(demande)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 size={16} className="mr-1 animate-spin" />
                              ) : (
                                <Send size={16} className="mr-1" />
                              )}
                            </GlassButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal détails */}
        {showModal && selectedDemande && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
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
                    <label className="block text-sm font-medium text-green-600 mb-1">ID Transaction</label>
                    <p className="text-gray-900 font-mono text-sm">{selectedDemande.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-600 mb-1">Téléphone</label>
                    <p className="text-gray-900">{selectedDemande.telephone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-600 mb-1">Compte Épargne</label>
                    <p className="text-gray-900">{selectedDemande.compte_epargne}</p>
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

                {(() => {
                  const validationStatus = getValidationStatus(selectedDemande);
                  return (
                    <div className={cn("mb-6 px-3 py-2 rounded text-sm flex items-center gap-2", validationStatus.bgClass, validationStatus.textClass)}>
                      {validationStatus.icon}
                      <span>{validationStatus.message}</span>
                    </div>
                  );
                })()}

                <div className="flex gap-3">
                  {(selectedDemande.statut === 'en_cours') && (
                    <>
                      <GlassButton
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          handleApproveRetrait(selectedDemande);
                          setShowModal(false);
                        }}
                        disabled={!getValidationStatus(selectedDemande).valid}
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
                    </>
                  )}

                  {(selectedDemande.statut === 'approved') && (
                    <GlassButton
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        setShowModal(false);
                        handleTransferClick(selectedDemande);
                      }}
                    >
                      <Send size={16} className="mr-2" />
                      Initier le virement
                    </GlassButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal rejet */}
        {showRejectModal && selectedDemande && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif du rejet <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Sélectionner un motif</option>
                    <option value="Fonds SFD insuffisants">Fonds SFD insuffisants</option>
                    <option value="Documents non conformes">Documents non conformes</option>
                    <option value="Montant invalide ou dépassant les limites">Montant invalide ou dépassant les limites</option>
                    <option value="Compte client suspendu ou inactif">Compte client suspendu ou inactif</option>
                    <option value="Activité suspecte détectée">Activité suspecte détectée</option>
                    <option value="Informations client incorrectes">Informations client incorrectes</option>
                    <option value="autre">Autre motif</option>
                  </select>
                </div>

                {rejectReason === 'autre' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Préciser le motif <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={customRejectReason}
                      onChange={(e) => setCustomRejectReason(e.target.value)}
                      placeholder="Expliquez précisément le motif du rejet..."
                      className="w-full"
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <GlassButton
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleRejectRetrait(selectedDemande, rejectReason, customRejectReason)}
                    disabled={!rejectReason || (rejectReason === 'autre' && !customRejectReason)}
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
        {showTransferModal && selectedDemande && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">Initier le virement</h3>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Virement Mobile Money pour <strong>{selectedDemande.client_nom}</strong>
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de téléphone *</label>
                    <Input
                      type="tel"
                      value={transferPhone}
                      onChange={(e) => setTransferPhone(e.target.value)}
                      placeholder="Numéro Mobile Money"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <GlassButton
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleInitiateTransfer(selectedDemande)}
                    disabled={!transferAmount || !transferPhone}
                  >
                    <Send size={16} className="mr-2" />
                    Initier le virement
                  </GlassButton>

                  <GlassButton
                    variant="outline"
                    onClick={() => setShowTransferModal(false)}
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