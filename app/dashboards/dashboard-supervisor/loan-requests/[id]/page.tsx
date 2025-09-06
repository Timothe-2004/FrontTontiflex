'use client'
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  User, 
  DollarSign, 
  Calendar, 
  Target, 
  FileText,
  Phone,
  Briefcase,
  CreditCard,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Send,
  Download,
  Eye,
  Clock,
  BarChart3,
  Heart,
  MapPin,
  Mail,
  Building,
  Users,
  Calculator,
  Home,
  Zap,
  Save,
  X,
  FileEdit,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { useLoansApplications } from '@/hooks/useLoansApplications';
import { LoanApplication, SupervisorProcessData, AdminDecisionData, UpdateLoanApplicationData, CompleterRapportData } from '@/types/loans-applications';

const LoanRequestDetailPage = () => {
  const params = useParams(); 
  const { 
    application, 
    loading, 
    error,
    fetchApplicationById, 
    processApplication, 
    adminDecision,
    updateApplicationPartial
  } = useLoansApplications();
  const router = useRouter();
  const requestId = params.id as string;
  
  const [loanRequest, setLoanRequest] = useState<LoanApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'scoring' | 'decision' | 'edit'>('overview');
  
  // 🔄 États mis à jour pour la nouvelle API
  const [supervisorAction, setSupervisorAction] = useState<'approuver' | 'rejeter' | null>(null);
  const [supervisorComments, setSupervisorComments] = useState("");
  
  // Champs requis pour l'approbation
  const [montantAccorde, setMontantAccorde] = useState("");
  const [tauxInteret, setTauxInteret] = useState("");
  const [dureeMois, setDureeMois] = useState("");
  const [rapportSuperviseurDecision, setRapportSuperviseurDecision] = useState("");
  
  // États pour la décision admin
  const [adminDecisionType, setAdminDecisionType] = useState<'accorder' | 'rejeter' | null>(null);
  const [approvedAmount, setApprovedAmount] = useState("");
  const [adminComments, setAdminComments] = useState("");
  const [adminRejectReason, setAdminRejectReason] = useState("");
  
  // États pour la complétion de rapport
  const [rapportSuperviseur, setRapportSuperviseur] = useState("");
  const [isCompletingRapport, setIsCompletingRapport] = useState(false);
  
  // États pour la modification
  const [editForm, setEditForm] = useState<Partial<UpdateLoanApplicationData>>({});
  const [isEditing, setIsEditing] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const action = searchParams.get('action');
  
  useEffect(() => {
    if (defaultTab === 'decision') {
      setActiveTab('decision');
    } else if (defaultTab === 'edit') {
      setActiveTab('edit');
    }
  }, [defaultTab]);
  
  useEffect(() => {
    const loadLoanRequest = async () => {
      if (requestId) {
        setIsLoading(true);
        try {
          const data = await fetchApplicationById(requestId);
          if (data) {
            setLoanRequest(data);
            setApprovedAmount(data.montant_souhaite);
            setSupervisorComments(data.commentaires_superviseur || "");
            setAdminComments(data.commentaires_admin || "");
            
            // Initialiser le formulaire de modification
            setEditForm({
              montant_souhaite: data.montant_souhaite,
              duree_pret: data.duree_pret,
              objet_pret: data.objet_pret,
              revenu_mensuel: data.revenu_mensuel,
              charges_mensuelles: data.charges_mensuelles,
              adresse_domicile: data.adresse_domicile,
              adresse_bureau: data.adresse_bureau,
              situation_professionnelle: data.situation_professionnelle,
              type_pret: data.type_pret,
              type_garantie: data.type_garantie,
              details_garantie: data.details_garantie
            });
          }
        } catch (error) {
          console.error('Erreur lors du chargement de la demande:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadLoanRequest();
  }, []);

  const handleSupervisorDecision = async () => {
    if (!supervisorAction || !loanRequest) {
      toast.error("Veuillez sélectionner une action");
      return;
    }

    // Validation pour le rejet
    if (supervisorAction === 'rejeter' && !supervisorComments.trim()) {
      toast.error("Le commentaire est obligatoire pour un rejet");
      return;
    }

    // Validation pour l'approbation
    if (supervisorAction === 'approuver') {
      if (!montantAccorde || !tauxInteret || !dureeMois || !rapportSuperviseurDecision.trim()) {
        toast.error("Tous les champs sont obligatoires pour une approbation");
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const processData: SupervisorProcessData = {
        action: supervisorAction,
        ...(supervisorAction === 'approuver' && {
          montant_accorde: parseFloat(montantAccorde),
          taux_interet: parseFloat(tauxInteret),
          duree_mois: parseInt(dureeMois),
          rapport_superviseur: rapportSuperviseurDecision,
          ...(supervisorComments.trim() && { commentaire: supervisorComments })
        }),
        ...(supervisorAction === 'rejeter' && {
          commentaire: supervisorComments
        })
      };

      const result = await processApplication(loanRequest.id, processData);
      
      // Considérer la réussite si aucune erreur n'a été levée
      if (result?.demande) {
        setLoanRequest(result.demande);
      }
      toast.success("Demande traitée avec succès");
      
      // Rediriger après succès
      setTimeout(() => router.push('/dashboards/dashboard-supervisor/loan-requests'), 1500);
    } catch (error: any) {
      console.error('Erreur lors du traitement:', error);
      toast.error(error.message || 'Erreur lors du traitement');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleUpdateApplication = async () => {
    if (!loanRequest || !editForm) {
      toast.error("Aucune donnée à modifier");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updatedApplication = await updateApplicationPartial(loanRequest.id, editForm);
      setLoanRequest(updatedApplication);
      setIsEditing(false);
      toast.success("Demande mise à jour avec succès");
      setActiveTab('overview');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'soumis': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Soumis' },
      'en_cours_examen': { color: 'bg-blue-100 text-blue-800', icon: Eye, label: 'En cours d\'examen' },
      'transfere_admin': { color: 'bg-purple-100 text-purple-800', icon: Send, label: 'Transféré admin' },
      'accorde': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Accordé' },
      'decaisse': { color: 'bg-emerald-100 text-emerald-800', icon: DollarSign, label: 'Décaissé' },
      'en_remboursement': { color: 'bg-indigo-100 text-indigo-800', icon: Calculator, label: 'En remboursement' },
      'solde': { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, label: 'Soldé' },
      'rejete': { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejeté' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.soumis;
    const IconComponent = config.icon;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${config.color}`}>
        <IconComponent size={14} />
        {config.label}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    const types = {
      'consommation': 'Crédit consommation',
      'immobilier': 'Crédit immobilier',
      'professionnel': 'Crédit professionnel',
      'urgence': 'Crédit urgence'
    };
    return types[type as keyof typeof types] || type;
  };

  const getGuaranteeLabel = (type: string) => {
    const guarantees = {
      'bien_immobilier': 'Bien immobilier',
      'garant_physique': 'Garant physique',
      'depot_garantie': 'Dépôt de garantie',
      'aucune': 'Aucune garantie'
    };
    return guarantees[type as keyof typeof guarantees] || type;
  };

  const getFamilyStatusLabel = (status: string) => {
    const statuses = {
      'celibataire': 'Célibataire',
      'marie': 'Marié(e)',
      'divorce': 'Divorcé(e)',
      'veuf': 'Veuf/Veuve',
      'union_libre': 'Union libre'
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (!loanRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <GlassCard className="max-w-md w-full">
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto mb-4 text-red-500" size={64} />
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Demande introuvable</h2>
            <p className="text-gray-600 mb-6">La demande de prêt demandée n'existe pas.</p>
            <GlassButton onClick={() => router.back()} size="lg">
              Retour aux demandes
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Détermine si l'utilisateur peut prendre une décision
  const canMakeDecision = loanRequest.statut === 'soumis' || loanRequest.statut === 'transfere_admin';
  const isSupervisorDecision = loanRequest.statut === 'soumis';
  const isAdminDecision = loanRequest.statut === 'transfere_admin';
  const canEdit = ['soumis', 'en_cours_examen'].includes(loanRequest.statut);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <GlassButton 
              variant="outline" 
              onClick={() => router.back()}
              className="mr-4 h-10 w-10 p-0 rounded-full"
            >
              <ArrowLeft size={18} />
            </GlassButton>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Demande de Prêt - {loanRequest.id}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <User className="mr-2" size={16} />
                  {loanRequest.nom} {loanRequest.prenom}
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2" size={16} />
                  Soumis le {format(new Date(loanRequest.date_soumission), 'dd MMM yyyy', { locale: fr })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(loanRequest.statut)}
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm font-medium text-emerald-600">
                  {getTypeLabel(loanRequest.type_pret)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {canEdit && (
                <GlassButton 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('edit')}
                >
                  <Edit className="mr-2" size={16} />
                  Modifier
                </GlassButton>
              )}
              <GlassButton variant="outline" size="sm">
                <Download className="mr-2" size={16} />
                Télécharger dossier
              </GlassButton>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8 max-w-3xl">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'scoring', label: 'Évaluation', icon: BarChart3 },
            ...(canEdit ? [{ id: 'edit', label: 'Modifier', icon: Edit }] : []),
            ...(canMakeDecision ? [{ id: 'decision', label: 'Décision', icon: CheckCircle }] : [])
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center px-3 py-3 rounded-lg font-medium text-sm transition-all",
                activeTab === tab.id
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <tab.icon size={16} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Informations principales */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations client */}
              <GlassCard className="p-6" hover={false}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="mr-2 text-emerald-600" size={20} />
                  Informations Client
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nom complet</label>
                    <p className="text-lg font-semibold text-gray-900">{loanRequest.nom} {loanRequest.prenom}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date de naissance</label>
                    <p className="text-gray-900">
                      {format(new Date(loanRequest.date_naissance), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Téléphone</label>
                    <p className="text-gray-900">{loanRequest.telephone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{loanRequest.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Situation familiale</label>
                    <p className="text-gray-900">{getFamilyStatusLabel(loanRequest.situation_familiale)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Profession</label>
                    <p className="text-gray-900">{loanRequest.situation_professionnelle}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Adresse domicile</label>
                    <p className="text-gray-900">{loanRequest.adresse_domicile}</p>
                  </div>
                  {loanRequest.adresse_bureau && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">Adresse bureau</label>
                      <p className="text-gray-900">{loanRequest.adresse_bureau}</p>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Détails de la demande */}
              <GlassCard className="p-6" hover={false}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="mr-2 text-emerald-600" size={20} />
                  Détails de la Demande
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Montant demandé</label>
                    <p className="text-2xl font-bold text-emerald-600">
                      {parseInt(loanRequest.montant_souhaite).toLocaleString()} FCFA
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Durée souhaitée</label>
                    <p className="text-xl font-semibold text-gray-900">{loanRequest.duree_pret} mois</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Type de prêt</label>
                    <p className="text-gray-900">{getTypeLabel(loanRequest.type_pret)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Type de garantie</label>
                    <p className="text-gray-900">{getGuaranteeLabel(loanRequest.type_garantie)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Objet du prêt</label>
                    <p className="text-gray-900 mt-1">{loanRequest.objet_pret}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Détails de la garantie</label>
                    <p className="text-gray-900 mt-1">{loanRequest.details_garantie}</p>
                  </div>
                </div>
              </GlassCard>

              {/* Situation financière */}
              <GlassCard className="p-6" hover={false}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="mr-2 text-emerald-600" size={20} />
                  Situation Financière
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-green-700">Revenus mensuels</label>
                    <p className="text-xl font-bold text-green-600">
                      {parseInt(loanRequest.revenu_mensuel).toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-red-700">Charges mensuelles</label>
                    <p className="text-xl font-bold text-red-600">
                      {parseInt(loanRequest.charges_mensuelles).toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-blue-700">Capacité de remboursement</label>
                    <p className="text-xl font-bold text-blue-600">
                      {(parseInt(loanRequest.revenu_mensuel) - parseInt(loanRequest.charges_mensuelles)).toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
                
                {loanRequest.ratio_endettement && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Ratio d'endettement</label>
                    <p className="text-lg font-bold text-gray-900">{loanRequest.ratio_endettement}%</p>
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Sidebar droite */}
            <div className="space-y-6">
              {/* Score de fiabilité */}
              {loanRequest.score_fiabilite && (
                <GlassCard className="p-6" hover={false}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="mr-2 text-emerald-600" size={20} />
                    Score de Fiabilité
                  </h3>
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-2xl font-bold text-emerald-600">
                      {loanRequest.score_fiabilite}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Score calculé</p>
                  </div>
                </GlassCard>
              )}

              {/* Documents */}
              <GlassCard className="p-6" hover={false}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="mr-2 text-emerald-600" size={20} />
                  Documents
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Justificatif d'identité</span>
                    <div className="flex items-center">
                      <CheckCircle className="text-green-600 mr-2" size={16} />
                      <span className="text-xs text-green-600">{loanRequest.justificatif_identite}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Documents complets</span>
                    <div className="flex items-center">
                      <a href={loanRequest.document_complet} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Télécharger PDF</a>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Signature collecte données</span>
                    <div className="flex items-center">
                      {loanRequest.signature_collecte_donnees ? (
                        <CheckCircle className="text-green-600" size={16} />
                      ) : (
                        <XCircle className="text-red-600" size={16} />
                      )}
                    </div>
                  </div>
                  {loanRequest.signature_caution !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Signature caution</span>
                      <div className="flex items-center">
                        {loanRequest.signature_caution ? (
                          <CheckCircle className="text-green-600" size={16} />
                        ) : (
                          <XCircle className="text-red-600" size={16} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Workflow */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="mr-2 text-emerald-600" size={20} />
                  Suivi du Workflow
                </h3>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-gray-600">Date soumission:</span>
                    <p className="font-medium">{format(new Date(loanRequest.date_soumission), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                  </div>
                  {loanRequest.date_examen_superviseur && (
                    <div className="text-sm">
                      <span className="text-gray-600">Date examen superviseur:</span>
                      <p className="font-medium">{format(new Date(loanRequest.date_examen_superviseur), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                    </div>
                  )}
                  {loanRequest.date_transfert_admin && (
                    <div className="text-sm">
                      <span className="text-gray-600">Date transfert admin:</span>
                      <p className="font-medium">{format(new Date(loanRequest.date_transfert_admin), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                    </div>
                  )}
                  {loanRequest.date_validation_admin && (
                    <div className="text-sm">
                      <span className="text-gray-600">Date validation admin:</span>
                      <p className="font-medium">{format(new Date(loanRequest.date_validation_admin), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                    </div>
                  )}
                  {loanRequest.superviseur_examinateur && (
                    <div className="text-sm">
                      <span className="text-gray-600">Superviseur examinateur:</span>
                      <p className="font-medium">{loanRequest.superviseur_examinateur}</p>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Commentaires */}
              {(loanRequest.commentaires_superviseur || loanRequest.commentaires_admin) && (
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Edit className="mr-2 text-emerald-600" size={20} />
                    Commentaires
                  </h3>
                  <div className="space-y-4">
                    {loanRequest.commentaires_superviseur && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Superviseur:</span>
                        <p className="text-sm text-gray-600 mt-1">{loanRequest.commentaires_superviseur}</p>
                      </div>
                    )}
                    {loanRequest.commentaires_admin && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Administrateur:</span>
                        <p className="text-sm text-gray-600 mt-1">{loanRequest.commentaires_admin}</p>
                      </div>
                    )}
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="mr-3 text-emerald-600" size={24} />
                Documents et Justificatifs
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Documents obligatoires</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Justificatif d'identité</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={16} />
                        <span className="text-xs text-green-600">{loanRequest.justificatif_identite}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Dossier complet</span>
                      <div className="flex items-center">
                      <a href={loanRequest.document_complet} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Télécharger PDF</a>
                    </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Signatures et accords</h4>
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between p-3 rounded-lg ${
                      loanRequest.signature_collecte_donnees ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <span className="text-sm font-medium">Accord collecte données</span>
                      {loanRequest.signature_collecte_donnees ? (
                        <CheckCircle className="text-green-600" size={16} />
                      ) : (
                        <XCircle className="text-red-600" size={16} />
                      )}
                    </div>
                    {loanRequest.signature_caution !== undefined && (
                      <div className={`flex items-center justify-between p-3 rounded-lg ${
                        loanRequest.signature_caution ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        <span className="text-sm font-medium">Signature caution</span>
                        {loanRequest.signature_caution ? (
                          <CheckCircle className="text-green-600" size={16} />
                        ) : (
                          <XCircle className="text-red-600" size={16} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'scoring' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <GlassCard className="p-8" hover={false}>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="mr-3 text-emerald-600" size={24} />
                Évaluation et Scoring
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Indicateurs financiers</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-700">Ratio d'endettement</span>
                      <p className="text-2xl font-bold text-blue-600">{loanRequest.ratio_endettement || 'N/A'}%</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-700">Capacité de remboursement</span>
                      <p className="text-xl font-bold text-green-600">
                        {(parseInt(loanRequest.revenu_mensuel) - parseInt(loanRequest.charges_mensuelles)).toLocaleString()} FCFA/mois
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Score global</h4>
                  {loanRequest.score_fiabilite ? (
                    <div className="text-center p-6 bg-emerald-50 rounded-lg">
                      <div className="text-6xl font-bold text-emerald-600 mb-2">
                        {loanRequest.score_fiabilite}
                      </div>
                      <p className="text-emerald-700 font-medium">Score de fiabilité</p>
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <Calculator className="mx-auto mb-2 text-gray-400" size={48} />
                      <p className="text-gray-600">Score en cours de calcul</p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'edit' && canEdit && (
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-8" hover={false}>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Edit className="mr-3 text-emerald-600" size={24} />
                Modifier la Demande
              </h3>
              
              <div className="space-y-6">
                {/* Section financière */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Informations financières</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="montant_souhaite" className="mb-2">Montant demandé (FCFA)</Label>
                      <Input
                        id="montant_souhaite"
                        type="number"
                        value={editForm.montant_souhaite || ''}
                        onChange={(e) => setEditForm({...editForm, montant_souhaite: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duree_pret" className="mb-2">Durée (mois)</Label>
                      <Input
                        id="duree_pret"
                        type="number"
                        value={editForm.duree_pret || ''}
                        onChange={(e) => setEditForm({...editForm, duree_pret: parseInt(e.target.value)})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="revenu_mensuel" className="mb-2">Revenus mensuels (FCFA)</Label>
                      <Input
                        id="revenu_mensuel"
                        type="number"
                        value={editForm.revenu_mensuel || ''}
                        onChange={(e) => setEditForm({...editForm, revenu_mensuel: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="charges_mensuelles" className="mb-2">Charges mensuelles (FCFA)</Label>
                      <Input
                        id="charges_mensuelles"
                        type="number"
                        value={editForm.charges_mensuelles || ''}
                        onChange={(e) => setEditForm({...editForm, charges_mensuelles: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Section prêt */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Détails du prêt</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type_pret" className="mb-2">Type de prêt</Label>
                      <Select 
                        value={editForm.type_pret || ''} 
                        onValueChange={(value) => setEditForm({...editForm, type_pret: value as any})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consommation">Crédit consommation</SelectItem>
                          <SelectItem value="immobilier">Crédit immobilier</SelectItem>
                          <SelectItem value="professionnel">Crédit professionnel</SelectItem>
                          <SelectItem value="urgence">Crédit urgence</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type_garantie" className="mb-2">Type de garantie</Label>
                      <Select 
                        value={editForm.type_garantie || ''} 
                        onValueChange={(value) => setEditForm({...editForm, type_garantie: value as any})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionner la garantie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bien_immobilier">Bien immobilier</SelectItem>
                          <SelectItem value="garant_physique">Garant physique</SelectItem>
                          <SelectItem value="depot_garantie">Dépôt de garantie</SelectItem>
                          <SelectItem value="aucune">Aucune garantie</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor="objet_pret" className="mb-2">Objet du prêt</Label>
                    <Textarea
                      id="objet_pret"
                      value={editForm.objet_pret || ''}
                      onChange={(e) => setEditForm({...editForm, objet_pret: e.target.value})}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor="details_garantie" className="mb-2">Détails de la garantie</Label>
                    <Textarea
                      id="details_garantie"
                      value={editForm.details_garantie || ''}
                      onChange={(e) => setEditForm({...editForm, details_garantie: e.target.value})}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Section adresses */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Adresses</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="adresse_domicile" className="mb-2">Adresse domicile</Label>
                      <Textarea
                        id="adresse_domicile"
                        value={editForm.adresse_domicile || ''}
                        onChange={(e) => setEditForm({...editForm, adresse_domicile: e.target.value})}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="adresse_bureau" className="mb-2">Adresse bureau</Label>
                      <Textarea
                        id="adresse_bureau"
                        value={editForm.adresse_bureau || ''}
                        onChange={(e) => setEditForm({...editForm, adresse_bureau: e.target.value})}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Section profession */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Situation professionnelle</h4>
                  <div>
                    <Label htmlFor="situation_professionnelle" className="mb-2">Profession</Label>
                    <Input
                      id="situation_professionnelle"
                      value={editForm.situation_professionnelle || ''}
                      onChange={(e) => setEditForm({...editForm, situation_professionnelle: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t">
                  <GlassButton
                    variant="outline"
                    onClick={() => setActiveTab('overview')}
                  >
                    Annuler
                  </GlassButton>
                  <GlassButton
                    onClick={handleUpdateApplication}
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2" size={16} />
                        Sauvegarder les modifications
                      </>
                    )}
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
{activeTab === 'decision' && (
          <div className="space-y-6">
            <GlassCard hover={false}>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Traitement de la demande
                </h3>

                <div className="space-y-6">
                  {/* Sélection de l'action */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Action à effectuer</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setSupervisorAction('approuver')}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all text-left",
                          supervisorAction === 'approuver'
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className={cn(
                            "h-5 w-5",
                            supervisorAction === 'approuver' ? "text-green-600" : "text-gray-400"
                          )} />
                          <div>
                            <h4 className="font-medium">Approuver</h4>
                            <p className="text-sm text-gray-600">Approuver la demande de prêt</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setSupervisorAction('rejeter')}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all text-left",
                          supervisorAction === 'rejeter'
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <XCircle className={cn(
                            "h-5 w-5",
                            supervisorAction === 'rejeter' ? "text-red-600" : "text-gray-400"
                          )} />
                          <div>
                            <h4 className="font-medium">Rejeter</h4>
                            <p className="text-sm text-gray-600">Rejeter la demande</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Champs pour l'approbation */}
                  {supervisorAction === 'approuver' && (
                    <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800">Paramètres d'approbation</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="montant_accorde" className="mb-2">Montant accordé (FCFA) *</Label>
                          <Input
                            id="montant_accorde"
                            type="number"
                            value={montantAccorde}
                            onChange={(e) => setMontantAccorde(e.target.value)}
                            placeholder="Ex: 500000"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="taux_interet" className="mb-2">Taux d'intérêt (%) *</Label>
                          <Input
                            id="taux_interet"
                            type="number"
                            step="0.1"
                            value={tauxInteret}
                            onChange={(e) => setTauxInteret(e.target.value)}
                            placeholder="Ex: 12.5"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="duree_mois" className="mb-2">Durée (mois) *</Label>
                          <Input
                            id="duree_mois"
                            type="number"
                            value={dureeMois}
                            onChange={(e) => setDureeMois(e.target.value)}
                            placeholder="Ex: 24"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="rapport_superviseur_decision">Rapport du superviseur *</Label>
                        <Textarea
                          id="rapport_superviseur_decision"
                          value={rapportSuperviseurDecision}
                          onChange={(e) => setRapportSuperviseurDecision(e.target.value)}
                          placeholder="Détaillez votre analyse et les conditions d'approbation..."
                          rows={4}
                          required
                        />
                         <p className="text-sm text-gray-500 mt-1">
                      Analysez la solvabilité, les risques, et donnez votre recommandation
                    </p>
                      </div>

                      <div>
                        <Label htmlFor="commentaire_approbation" className="mb-2">Commentaire (optionnel)</Label>
                        <Textarea
                          id="commentaire_approbation"
                          value={supervisorComments}
                          onChange={(e) => setSupervisorComments(e.target.value)}
                          placeholder="Commentaires additionnels..."
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  {/* Champ pour le rejet */}
                  {supervisorAction === 'rejeter' && (
                    <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-medium text-red-800">Motif du rejet</h4>
                      
                      <div>
                        <Label htmlFor="commentaire_rejet" className="mb-2">Commentaire de rejet *</Label>
                        <Textarea
                          id="commentaire_rejet"
                          value={supervisorComments}
                          onChange={(e) => setSupervisorComments(e.target.value)}
                          placeholder="Expliquez les raisons du rejet..."
                          rows={4}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex justify-end gap-3 pt-4">
                    <GlassButton
                      variant="outline"
                      onClick={() => {
                        setSupervisorAction(null);
                        setSupervisorComments("");
                        setMontantAccorde(loanRequest.montant_souhaite);
                        setTauxInteret("12");
                        setDureeMois(loanRequest.duree_pret?.toString() || "12");
                        setRapportSuperviseurDecision("");
                      }}
                    >
                      Annuler
                    </GlassButton>
                    
                    <GlassButton
                      onClick={handleSupervisorDecision}
                      disabled={!supervisorAction || isSubmitting}
                      className={cn(
                        supervisorAction === 'approuver' ? "bg-green-600 hover:bg-green-700" :
                        supervisorAction === 'rejeter' ? "bg-red-600 hover:bg-red-700" : ""
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Traitement...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          {supervisorAction === 'approuver' ? 'Approuver' : 'Rejeter'}
                        </>
                      )}
                    </GlassButton>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

         
      </div>
    </div>
  );
};

export default LoanRequestDetailPage;