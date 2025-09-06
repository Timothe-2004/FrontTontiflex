'use client'
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search,
  Filter,
  UserCheck,
  UserX,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Plus,
  Users,
  Building,
  X,
  Check,
  Loader2,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAdhesions } from '@/hooks/useAdhesions';
import { Adhesion, StatutAdhesion } from '@/types/adhesions';

const AgentSFDAdhesionsPage = () => {
  // Hook pour les adhésions - utilisation du vrai hook backend
  const {
    adhesions,
    loading,
    error,
    fetchAdhesions,
    validerAgent,
    rejectAdhesion
  } = useAdhesions();

  // États locaux
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedAdhesion, setSelectedAdhesion] = useState<Adhesion | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // États pour le modal de validation
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [validateAdhesion, setValidateAdhesion] = useState<Adhesion | null>(null);
  const [validateComment, setValidateComment] = useState("");

  // États pour le modal de rejet avec confirmation
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectAdhesion_state, setRejectAdhesion] = useState<Adhesion | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Charger les adhésions au montage du composant
  useEffect(() => {
    loadAdhesions();
    console.log("adhesions",adhesions);
  }, [currentPage, filterStatus]);

  const loadAdhesions = async () => {
    try {
      const filters: any = {
        page: currentPage
      };
      
      if (filterStatus !== "all") {
        filters.statut = filterStatus as StatutAdhesion;
      }

      await fetchAdhesions(filters);
    } catch (err) {
      console.error('Erreur lors du chargement des adhésions:', err);
    }
  };

  // ✅ FILTRAGE SÉCURISÉ
  const filteredAdhesions = (adhesions || []).filter(adhesion => {
    if (!adhesion) return false;
    
    const searchTermLower = (searchTerm || '').toLowerCase();
    
    // Vérification sécurisée avec valeurs par défaut
    const clientNom = (adhesion.client_nom || '').toLowerCase();
    const tontineNom = (adhesion.tontine_nom || '').toLowerCase();
    const numeroTelephone = adhesion.numero_telephone_paiement || '';
    
    const searchMatch = 
      clientNom.includes(searchTermLower) ||
      tontineNom.includes(searchTermLower) ||
      numeroTelephone.includes(searchTerm || '');
    
    return searchMatch;
  });

  
  const handleValidateAdhesion = (adhesion: Adhesion) => {
    setValidateAdhesion(adhesion);
    setValidateComment('');
    setShowValidateModal(true);
  };

  const executeValidation = async () => {
    if (!validateAdhesion) return;
    setLoadingAction(validateAdhesion.id);
    try {
      await validerAgent(validateAdhesion.id, {
        commentaires: validateComment || "Demande validée par l'agent SFD"
      });
      toast.success(`Adhésion de ${validateAdhesion.client_nom || 'ce client'} validée avec succès.`);
      
      // Fermer le modal et rafraîchir
      setShowValidateModal(false);
      setValidateAdhesion(null);
      setValidateComment('');
      await loadAdhesions();
    } catch (err) {
      console.error('Erreur lors de la validation:', err);
      toast.error('Erreur lors de la validation de la demande.');
    } finally {
      setLoadingAction(null);
    }
  };

  // ✅ REJET AVEC CONFIRMATION ET BACKEND
  const handleRejectAdhesion = (adhesion: Adhesion) => {
    setRejectAdhesion(adhesion);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const executeRejection = async () => {
    if (!rejectAdhesion_state) return;
    
    if (!rejectReason.trim()) {
      toast.error('Veuillez préciser la raison du rejet');
      return;
    }

    setLoadingAction(rejectAdhesion_state.id);
    try {
      await rejectAdhesion(rejectAdhesion_state.id, {
        raison_rejet: rejectReason || "Demande rejetée par l'agent SFD"
      });
      
      toast.success(`Adhésion de ${rejectAdhesion_state.client_nom || 'ce client'} rejetée.`);
      
      // Fermer le modal et rafraîchir
      setShowRejectModal(false);
      setRejectAdhesion(null);
      setRejectReason('');
      await loadAdhesions();
    } catch (err) {
      console.error('Erreur lors du rejet:', err);
      toast.error('Erreur lors du rejet de la demande.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleViewDetails = (adhesion: Adhesion) => {
    setSelectedAdhesion(adhesion);
    setShowModal(true);
  };

  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  // ✅ FONCTION POUR DÉTERMINER LE TYPE DE FICHIER
  const getFileType = (url: string): 'pdf' | 'image' | 'unknown' => {
    if (!url) return 'unknown';
    const extension = url.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(extension || '')) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
    return 'unknown';
  };

  const getStatusBadge = (status: StatutAdhesion) => {
    switch (status) {
      case 'demande_soumise':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'validee_agent':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'en_cours_paiement':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'paiement_effectue':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'adherent':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejetee':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: StatutAdhesion) => {
    switch (status) {
      case 'demande_soumise':
        return 'Demande soumise';
      case 'validee_agent':
        return 'Validée par agent';
      case 'en_cours_paiement':
        return 'En cours de paiement';
      case 'paiement_effectue':
        return 'Paiement effectué';
      case 'adherent':
        return 'Adhérent';
      case 'rejetee':
        return 'Rejetée';
      default:
        return status;
    }
  };

  // ✅ CALCUL SÉCURISÉ DES STATISTIQUES
  const statsEnAttente = (adhesions || []).filter(a => a?.statut_actuel === 'demande_soumise').length;
  const statsValidees = (adhesions || []).filter(a => a?.statut_actuel === 'validee_agent' || a?.statut_actuel === 'adherent').length;
  const statsCeMois = (adhesions || []).filter(a => {
    if (!a?.date_creation) return false;
    try {
      const dateCreation = new Date(a.date_creation);
      const maintenant = new Date();
      return dateCreation.getMonth() === maintenant.getMonth() && 
             dateCreation.getFullYear() === maintenant.getFullYear();
    } catch {
      return false;
    }
  }).length;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <GlassButton onClick={loadAdhesions}>
            Réessayer
          </GlassButton>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-4 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {loading ? <Loader2 className="animate-spin" size={24} /> : statsEnAttente}
                </p>
              </div>
              <Clock className="text-orange-600" size={24} />
            </div>
          </GlassCard>

          <GlassCard className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Validées</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? <Loader2 className="animate-spin" size={24} /> : statsValidees}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </GlassCard>

          <GlassCard className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ce mois</p>
                <p className="text-2xl font-bold text-blue-600">
                  {loading ? <Loader2 className="animate-spin" size={24} /> : statsCeMois}
                </p>
              </div>
              <Users className="text-blue-600" size={24} />
            </div>
          </GlassCard>
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-10">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Rechercher par nom, téléphone, tontine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/60"
            />
          </div>

          {/* Filtres */}
          <div className="flex gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 bg-white/60">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="demande_soumise">Demande soumise</SelectItem>
                <SelectItem value="validee_agent">Validée agent</SelectItem>
                <SelectItem value="en_cours_paiement">En cours paiement</SelectItem>
                <SelectItem value="paiement_effectue">Paiement effectué</SelectItem>
                <SelectItem value="adherent">Adhérent</SelectItem>
                <SelectItem value="rejetee">Rejetée</SelectItem>
              </SelectContent>
            </Select>
            
            <GlassButton 
              variant="outline"
              onClick={loadAdhesions}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Filter size={16} />}
            </GlassButton>
          </div>
        </div>

        {/* Tableau des demandes d'adhésion */}
        <div className="overflow-x-auto mb-8 w-full">
          <table className="min-w-[900px] w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-2 text-left">Client</th>
                <th className="px-2 py-2 text-left">Téléphone</th>
                <th className="px-2 py-2 text-left">Tontine</th>
                <th className="px-2 py-2 text-left">Mise</th>
                <th className="px-2 py-2 text-left">Date</th>
                <th className="px-2 py-2 text-center">Statut</th>
                <th className="px-2 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (!adhesions || adhesions.length === 0) ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-6">
                    <Loader2 className="mx-auto mb-2 animate-spin text-gray-300" size={36} />
                    <div>Chargement des demandes...</div>
                  </td>
                </tr>
              ) : filteredAdhesions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-6">
                    <UserCheck className="mx-auto mb-2 text-gray-300" size={36} />
                    <div>Aucune demande trouvée</div>
                    <div className="text-xs text-gray-500">Essayez de modifier vos filtres de recherche</div>
                  </td>
                </tr>
              ) : (
                filteredAdhesions.map((adhesion) => (
                  <tr key={adhesion.id}
                    className={
                      "bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 transition-all hover:shadow-md"
                    }
                  >
                    {/* Client */}
                    <td className="px-2 py-2 font-semibold text-gray-900 align-middle">
                      {adhesion.client_nom || 'Nom non renseigné'}
                    </td>
                    {/* Téléphone */}
                    <td className="px-2 py-2 text-gray-700 align-middle">
                      {adhesion.client_telephone || 'Non renseigné'}
                    </td>
                    {/* Tontine */}
                    <td className="px-2 py-2 text-gray-700 align-middle">
                      {adhesion.tontine_nom || 'Tontine non renseignée'}
                    </td>
                    {/* Mise */}
                    <td className="px-2 py-2 text-gray-700 align-middle">
                      {adhesion.montant_mise ? `${parseFloat(adhesion.montant_mise).toLocaleString()} FCFA` : 'Non renseigné'}
                    </td>
                    {/* Date */}
                    <td className="px-2 py-2 text-gray-700 align-middle">
                      {adhesion.date_creation ? (
                        format(new Date(adhesion.date_creation), 'dd/MM/yyyy HH:mm', { locale: fr })
                      ) : (
                        'Date non renseignée'
                      )}
                    </td>
                    {/* Statut */}
                    <td className="px-2 py-2 text-center align-middle">
                      <span className={cn("px-3 text-nowrap py-1 rounded-full text-xs font-medium border", getStatusBadge(adhesion.statut_actuel))}>
                        {getStatusLabel(adhesion.statut_actuel)}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-2 py-2 text-center align-middle">
                      <div className="flex gap-1 justify-center">
                        <GlassButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(adhesion)}
                          aria-label="Voir détails"
                          className="hover:bg-emerald-50"
                        >
                          <Eye size={16} />
                        </GlassButton>
                        {adhesion.statut_actuel === 'demande_soumise' && (
                          <>
                            <GlassButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleValidateAdhesion(adhesion)}
                              aria-label="Valider"
                              className="hover:bg-green-100"
                              disabled={loadingAction === adhesion.id}
                            >
                              {loadingAction === adhesion.id ? 
                                <Loader2 size={16} className="animate-spin" /> :
                                <CheckCircle size={18} className="text-green-600" />
                              }
                            </GlassButton>
                            <GlassButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectAdhesion(adhesion)}
                              aria-label="Rejeter"
                              className="hover:bg-red-100"
                              disabled={loadingAction === adhesion.id}
                            >
                              <UserX size={18} className="text-red-600" />
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

        {/* ✅ MODAL DE VALIDATION */}
        {showValidateModal && validateAdhesion && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold text-green-700">
                  Valider la demande
                </h3>
                <button
                  onClick={() => {
                    setShowValidateModal(false);
                    setValidateAdhesion(null);
                    setValidateComment('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-gray-600 mb-2">
                    Client: <span className="font-semibold">{validateAdhesion.client_nom || 'Nom non renseigné'}</span>
                  </p>
                  <p className="text-gray-600">
                    Tontine: <span className="font-semibold">{validateAdhesion.tontine_nom || 'Tontine non renseignée'}</span>
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire (optionnel)
                  </label>
                  <Textarea
                    value={validateComment}
                    onChange={(e) => setValidateComment(e.target.value)}
                    placeholder="Ajoutez un commentaire pour la validation..."
                    rows={4}
                    className="w-full"
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {validateComment.length}/500 caractères
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <GlassButton 
                    variant="outline"
                    onClick={() => {
                      setShowValidateModal(false);
                      setValidateAdhesion(null);
                      setValidateComment('');
                    }}
                    disabled={loadingAction === validateAdhesion.id}
                  >
                    Annuler
                  </GlassButton>
                  
                  <GlassButton 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={executeValidation}
                    disabled={loadingAction === validateAdhesion.id}
                  >
                    {loadingAction === validateAdhesion.id ? (
                      <Loader2 size={16} className="mr-2 animate-spin" />
                    ) : (
                      <Check size={16} className="mr-2" />
                    )}
                    Valider la demande
                  </GlassButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ MODAL DE REJET AVEC CONFIRMATION */}
        {showRejectModal && rejectAdhesion_state && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold text-red-700">
                  ⚠️ Rejeter la demande
                </h3>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectAdhesion(null);
                    setRejectReason('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-gray-600 mb-2">
                    Client: <span className="font-semibold">{rejectAdhesion_state.client_nom || 'Nom non renseigné'}</span>
                  </p>
                  <p className="text-gray-600 mb-4">
                    Tontine: <span className="font-semibold">{rejectAdhesion_state.tontine_nom || 'Tontine non renseignée'}</span>
                  </p>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-700 text-sm">
                      <strong>Attention:</strong> Cette action est irréversible. Le client sera notifié du rejet et devra soumettre une nouvelle demande.
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison du rejet <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Précisez la raison du rejet (obligatoire)..."
                    rows={4}
                    className="w-full"
                    maxLength={500}
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {rejectReason.length}/500 caractères
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <GlassButton 
                    variant="outline"
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectAdhesion(null);
                      setRejectReason('');
                    }}
                    disabled={loadingAction === rejectAdhesion_state.id}
                  >
                    Annuler
                  </GlassButton>
                  
                  <GlassButton 
                    className="bg-red-600 hover:bg-red-700"
                    onClick={executeRejection}
                    disabled={loadingAction === rejectAdhesion_state.id || !rejectReason.trim()}
                  >
                    {loadingAction === rejectAdhesion_state.id ? (
                      <Loader2 size={16} className="mr-2 animate-spin" />
                    ) : (
                      <X size={16} className="mr-2" />
                    )}
                    Confirmer le rejet
                  </GlassButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ MODAL DÉTAILS AMÉLIORÉ AVEC APERÇU DE LA PIÈCE D'IDENTITÉ */}
        {showModal && selectedAdhesion && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">Détails de la demande d'adhésion</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Informations générales */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Informations générales</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                        <p className="text-gray-900">{selectedAdhesion.client_nom || 'Nom non renseigné'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Adhésion</label>
                        <p className="text-gray-900 font-mono text-sm">{selectedAdhesion.id}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <p className="text-gray-900">{selectedAdhesion.numero_telephone_paiement || 'Non renseigné'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tontine</label>
                        <p className="text-gray-900">{selectedAdhesion.tontine_nom || 'Tontine non renseignée'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Montant mise</label>
                        <p className="text-gray-900 font-semibold">
                          {selectedAdhesion.montant_mise ? 
                            `${parseFloat(selectedAdhesion.montant_mise).toLocaleString()} FCFA` : 
                            'Non renseigné'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frais adhésion</label>
                        <p className="text-gray-900">
                          {selectedAdhesion.frais_adhesion_calcules ? 
                            `${parseFloat(selectedAdhesion.frais_adhesion_calcules).toLocaleString()} FCFA` : 
                            'Non calculés'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <span className={cn("px-3 py-1 rounded-full text-sm font-medium border", getStatusBadge(selectedAdhesion.statut_actuel))}>
                          {getStatusLabel(selectedAdhesion.statut_actuel)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prochaine action</label>
                        <p className="text-blue-600 font-medium">{
                        selectedAdhesion.etape_actuelle === 'etape_1' ? 'Validation agent' :
                        selectedAdhesion.etape_actuelle === 'etape_2' ? 'Paiement frais' :
                        selectedAdhesion.etape_actuelle === 'etape_3' ? 'Intégration tontine' :
                        'Terminée'
                          }</p>
                      </div>
                    </div>
                  </div>

                  {/* ✅ APERÇU DE LA PIÈCE D'IDENTITÉ AMÉLIORÉ */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Pièce d'identité</h4>
                    {selectedAdhesion.document_identite ? (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        {getFileType(selectedAdhesion.document_identite) === 'image' ? (
                          <div className="space-y-3">
                            <div className="aspect-video bg-white rounded border overflow-hidden">
                              <img
                                src={selectedAdhesion.document_identite}
                                alt="Pièce d'identité"
                                className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => handleViewImage(selectedAdhesion.document_identite!)}
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-document.png';
                                }}
                              />
                            </div>
                            <div className="flex gap-2">
                              <GlassButton
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewImage(selectedAdhesion.document_identite!)}
                                className="flex items-center gap-2"
                              >
                                <Eye size={16} />
                                Agrandir
                              </GlassButton>
                              <GlassButton
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(selectedAdhesion.document_identite!, '_blank')}
                                className="flex items-center gap-2"
                              >
                                <ExternalLink size={16} />
                                Ouvrir
                              </GlassButton>
                            </div>
                          </div>
                        ) : getFileType(selectedAdhesion.document_identite) === 'pdf' ? (
                          <div className="text-center py-8 space-y-4">
                            <FileText className="mx-auto text-red-500" size={48} />
                            <div>
                              <p className="font-medium">Document PDF</p>
                              <p className="text-sm text-gray-600">Cliquez pour ouvrir le fichier</p>
                            </div>
                            <div className="flex gap-2 justify-center">
                              <GlassButton
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(selectedAdhesion.document_identite!, '_blank')}
                                className="flex items-center gap-2"
                              >
                                <ExternalLink size={16} />
                                Ouvrir le PDF
                              </GlassButton>
                              <GlassButton
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = selectedAdhesion.document_identite!;
                                  link.download = `piece_identite_${selectedAdhesion.client_nom || 'client'}.pdf`;
                                  link.click();
                                }}
                                className="flex items-center gap-2"
                              >
                                <Download size={16} />
                                Télécharger
                              </GlassButton>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 space-y-4">
                            <FileText className="mx-auto text-gray-400" size={48} />
                            <div>
                              <p className="font-medium">Format non reconnu</p>
                              <p className="text-sm text-gray-600">Cliquez pour ouvrir le fichier</p>
                            </div>
                            <GlassButton
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(selectedAdhesion.document_identite!, '_blank')}
                              className="flex items-center gap-2"
                            >
                              <ExternalLink size={16} />
                              Ouvrir le fichier
                            </GlassButton>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <ImageIcon className="mx-auto text-gray-400 mb-2" size={48} />
                        <p className="text-gray-500">Aucun document fourni</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Commentaires et historique */}
                <div className="mt-6 space-y-4">
                  {selectedAdhesion.commentaires_agent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Commentaires agent</label>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="text-blue-800">{selectedAdhesion.commentaires_agent}</p>
                        {selectedAdhesion.agent_nom && (
                          <p className="text-xs text-blue-600 mt-1">Par: {selectedAdhesion.agent_nom}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedAdhesion.raison_rejet && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Raison du rejet</label>
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-red-800">{selectedAdhesion.raison_rejet}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions si demande en attente */}
                {selectedAdhesion.statut_actuel === 'demande_soumise' && (
                  <div className="flex gap-3 mt-6 pt-6 border-t">
                    <GlassButton 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleValidateAdhesion(selectedAdhesion);
                        setShowModal(false);
                      }}
                      disabled={loadingAction === selectedAdhesion.id}
                    >
                      {loadingAction === selectedAdhesion.id ? 
                        <Loader2 size={16} className="mr-2 animate-spin" /> :
                        <Check size={16} className="mr-2" />
                      }
                      Valider la demande
                    </GlassButton>
                    
                    <GlassButton 
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        handleRejectAdhesion(selectedAdhesion);
                        setShowModal(false);
                      }}
                      disabled={loadingAction === selectedAdhesion.id}
                    >
                      <X size={16} className="mr-2" />
                      Rejeter la demande
                    </GlassButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ✅ MODAL IMAGE PLEIN ÉCRAN */}
        {showImageModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/80 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg max-w-6xl max-h-[95vh] overflow-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Pièce d'identité - Vue agrandie</h3>
                <div className="flex gap-2">
                  <GlassButton
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(selectedImage, '_blank')}
                  >
                    <ExternalLink size={16} className="mr-1" />
                    Ouvrir
                  </GlassButton>
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <img
                  src={selectedImage}
                  alt="Pièce d'identité"
                  className="max-w-full h-auto mx-auto"
                  style={{ maxHeight: '80vh' }}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-document.png';
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AgentSFDAdhesionsPage;