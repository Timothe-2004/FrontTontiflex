'use client'
import { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search,
  History,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  UserCheck,
  UserX,
  ArrowDown,
  PiggyBank,
  Clock,
  Download,
  Users,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  FileText,
  RefreshCw,
  X
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Interface pour les actions
interface ActionHistorique {
  id: number;
  type: 'adhesion' | 'retrait' | 'compte_epargne' | 'autre';
  action: 'validation' | 'rejet';
  clientName: string;
  clientId: string;
  details: string;
  montant?: number;
  tontine?: string;
  raison?: string;
  dateAction: string;
  dureeTraitement: number; // en minutes
  status: 'completed' | 'pending';
}

// Données mockées pour l'historique
const historiqueActions: ActionHistorique[] = [
  {
    id: 1,
    type: 'adhesion',
    action: 'validation',
    clientName: 'Zeinab OUEDRAOGO',
    clientId: 'CLI008',
    details: 'Adhésion à la Tontine ALAFIA validée',
    montant: 1500,
    tontine: 'Tontine ALAFIA',
    dateAction: '2025-06-20T14:30:00Z',
    dureeTraitement: 45,
    status: 'completed'
  },
  {
    id: 2,
    type: 'retrait',
    action: 'rejet',
    clientName: 'Salimata CISSE',
    clientId: 'CLI009',
    details: 'Demande de retrait rejetée',
    montant: 50000,
    tontine: 'Tontine Entrepreneures',
    raison: 'Fonds SFD insuffisants',
    dateAction: '2025-06-19T16:15:00Z',
    dureeTraitement: 120,
    status: 'completed'
  },
  {
    id: 3,
    type: 'compte_epargne',
    action: 'validation',
    clientName: 'Rokiatou FALL',
    clientId: 'CLI010',
    details: 'Compte épargne validé et créé',
    dateAction: '2025-06-18T11:20:00Z',
    dureeTraitement: 85,
    status: 'completed'
  },
  {
    id: 4,
    type: 'adhesion',
    action: 'validation',
    clientName: 'Fatoumata SAGNA',
    clientId: 'CLI011',
    details: 'Adhésion à la Tontine Commerce validée',
    montant: 2000,
    tontine: 'Tontine Commerce',
    dateAction: '2025-06-18T09:45:00Z',
    dureeTraitement: 30,
    status: 'completed'
  },
  {
    id: 5,
    type: 'retrait',
    action: 'validation',
    clientName: 'Aminata DIALLO',
    clientId: 'CLI012',
    details: 'Retrait approuvé et traité',
    montant: 8000,
    tontine: 'Tontine ALAFIA',
    dateAction: '2025-06-17T15:30:00Z',
    dureeTraitement: 60,
    status: 'completed'
  },
  {
    id: 6,
    type: 'compte_epargne',
    action: 'rejet',
    clientName: 'Mariam TRAORE',
    clientId: 'CLI013',
    details: 'Demande compte épargne rejetée',
    raison: 'Documents non conformes',
    dateAction: '2025-06-17T10:15:00Z',
    dureeTraitement: 25,
    status: 'completed'
  },
  {
    id: 7,
    type: 'adhesion',
    action: 'rejet',
    clientName: 'Aissatou BARRY',
    clientId: 'CLI014',
    details: 'Adhésion rejetée',
    montant: 800,
    tontine: 'Tontine ALAFIA',
    raison: 'Montant non conforme',
    dateAction: '2025-06-16T13:45:00Z',
    dureeTraitement: 15,
    status: 'completed'
  },
  {
    id: 8,
    type: 'retrait',
    action: 'validation',
    clientName: 'Kadidja CAMARA',
    clientId: 'CLI015',
    details: 'Retrait approuvé et traité',
    montant: 12000,
    tontine: 'Tontine Entrepreneures',
    dateAction: '2025-06-15T14:20:00Z',
    dureeTraitement: 90,
    status: 'completed'
  }
];

const AgentSFDHistoriquePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [filterPeriode, setFilterPeriode] = useState("7j");
  const [selectedAction, setSelectedAction] = useState<ActionHistorique | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Calcul des statistiques
  const stats = {
    totalActions: historiqueActions.length,
    validations: historiqueActions.filter(a => a.action === 'validation').length,
    rejets: historiqueActions.filter(a => a.action === 'rejet').length,
    dureeMovenne: Math.round(historiqueActions.reduce((sum, a) => sum + a.dureeTraitement, 0) / historiqueActions.length)
  };

  // Filtrage des actions
  const getPeriodFilter = () => {
    const now = new Date();
    switch (filterPeriode) {
      case '24h':
        return subDays(now, 1);
      case '7j':
        return subDays(now, 7);
      case '30j':
        return subDays(now, 30);
      default:
        return subDays(now, 7);
    }
  };

  const filteredActions = historiqueActions.filter(action => {
    const searchMatch = action.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       action.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       action.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const typeMatch = filterType === "all" || action.type === filterType;
    const actionMatch = filterAction === "all" || action.action === filterAction;
    
    const periodStart = getPeriodFilter();
    const actionDate = new Date(action.dateAction);
    const periodMatch = actionDate >= periodStart;
    
    return searchMatch && typeMatch && actionMatch && periodMatch;
  });

  const handleViewDetails = (action: ActionHistorique) => {
    setSelectedAction(action);
    setShowModal(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'adhesion':
        return <UserCheck className="text-blue-600" size={20} />;
      case 'retrait':
        return <ArrowDown className="text-green-600" size={20} />;
      case 'compte_epargne':
        return <PiggyBank className="text-purple-600" size={20} />;
      default:
        return <FileText className="text-gray-600" size={20} />;
    }
  };

  const getActionIcon = (action: string) => {
    return action === 'validation' ? 
      <CheckCircle className="text-green-600" size={16} /> : 
      <XCircle className="text-red-600" size={16} />;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'adhesion':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'retrait':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'compte_epargne':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getActionBadge = (action: string) => {
    return action === 'validation' ? 
      'bg-green-100 text-green-700 border-green-200' : 
      'bg-red-100 text-red-700 border-red-200';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'adhesion':
        return 'Adhésion';
      case 'retrait':
        return 'Retrait';
      case 'compte_epargne':
        return 'Compte épargne';
      default:
        return 'Autre';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total actions</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalActions}</p>
              </div>
              <History className="text-blue-600" size={24} />
            </div>
          </GlassCard>

          <GlassCard className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Validations</p>
                <p className="text-2xl font-bold text-green-600">{stats.validations}</p>
                <p className="text-xs text-gray-500">
                  {((stats.validations / stats.totalActions) * 100).toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </GlassCard>

          <GlassCard className="p-4 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejets</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejets}</p>
                <p className="text-xs text-gray-500">
                  {((stats.rejets / stats.totalActions) * 100).toFixed(1)}%
                </p>
              </div>
              <XCircle className="text-red-600" size={24} />
            </div>
          </GlassCard>
        </div>

        {/* Filtres et recherche */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Rechercher par client, ID, détails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/60"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-3 flex-wrap">
              <Select value={filterPeriode} onValueChange={setFilterPeriode}>
                <SelectTrigger className="w-32 bg-white/60">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 heures</SelectItem>
                  <SelectItem value="7j">7 jours</SelectItem>
                  <SelectItem value="30j">30 jours</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40 bg-white/60">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="adhesion">Adhésions</SelectItem>
                  <SelectItem value="retrait">Retraits</SelectItem>
                  <SelectItem value="compte_epargne">Comptes épargne</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-40 bg-white/60">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes actions</SelectItem>
                  <SelectItem value="validation">Validations</SelectItem>
                  <SelectItem value="rejet">Rejets</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        {/* Liste des actions */}
        <GlassCard className="p-6">
          <div className="space-y-4">
            {filteredActions.map((action) => (
              <div key={action.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-white rounded-lg p-2 shadow-sm">
                      {getTypeIcon(action.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{action.clientName}</h3>
                        <span className="text-sm text-gray-500">#{action.clientId}</span>
                        {getActionIcon(action.action)}
                      </div>
                      <p className="text-gray-700 mb-2">{action.details}</p>
                      
                      {/* Informations supplémentaires */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="mr-1" size={14} />
                          {format(new Date(action.dateAction), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </span>
                        <span className="flex items-center">
                          <Clock className="mr-1" size={14} />
                          {action.dureeTraitement} min
                        </span>
                        {action.tontine && (
                          <span className="flex items-center">
                            <Users className="mr-1" size={14} />
                            {action.tontine}
                          </span>
                        )}
                        {action.montant && (
                          <span className="flex items-center font-medium">
                            {action.montant.toLocaleString()} FCFA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", 
                      getTypeBadge(action.type))}>
                      {getTypeLabel(action.type)}
                    </span>
                    <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", 
                      getActionBadge(action.action))}>
                      {action.action === 'validation' ? 'Validée' : 'Rejetée'}
                    </span>
                  </div>
                </div>

                {/* Raison du rejet */}
                {action.action === 'rejet' && action.raison && (
                  <div className="bg-red-50 p-3 rounded-lg mb-4 border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="text-red-600" size={16} />
                      <span className="text-sm font-medium text-red-700">Raison du rejet:</span>
                      <span className="text-sm text-red-700">{action.raison}</span>
                    </div>
                  </div>
                )}

                {/* Indicateur de performance */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Temps de traitement:</span>
                    <span className={cn("font-medium",
                      action.dureeTraitement <= 30 ? "text-green-600" :
                      action.dureeTraitement <= 60 ? "text-yellow-600" : "text-red-600"
                    )}>
                      {action.dureeTraitement} minutes
                    </span>
                    {action.dureeTraitement <= 30 && (
                      <span className="text-green-600 text-xs">• Rapide</span>
                    )}
                  </div>

                  <GlassButton 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewDetails(action)}
                  >
                    <Eye size={16} className="mr-1" />
                    Détails
                  </GlassButton>
                </div>
              </div>
            ))}
          </div>

          {filteredActions.length === 0 && (
            <div className="text-center py-12">
              <History className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 text-lg">Aucune action trouvée</p>
              <p className="text-gray-500">Essayez de modifier vos filtres de recherche</p>
            </div>
          )}

          {/* Pagination */}
          {filteredActions.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Affichage de {filteredActions.length} action(s) sur {historiqueActions.length} au total
              </p>
              <div className="flex gap-2">
                <GlassButton variant="outline" size="sm" disabled>
                  Précédent
                </GlassButton>
                <GlassButton variant="outline" size="sm" disabled>
                  Suivant
                </GlassButton>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Modal détails */}
        {showModal && selectedAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">Détails de l'action</h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type d'action</label>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(selectedAction.type)}
                      <span className="text-gray-900">{getTypeLabel(selectedAction.type)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Résultat</label>
                    <div className="flex items-center gap-2">
                      {getActionIcon(selectedAction.action)}
                      <span className="text-gray-900">
                        {selectedAction.action === 'validation' ? 'Validée' : 'Rejetée'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                    <p className="text-gray-900">{selectedAction.clientName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Client</label>
                    <p className="text-gray-900">{selectedAction.clientId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure</label>
                    <p className="text-gray-900">
                      {format(new Date(selectedAction.dateAction), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temps de traitement</label>
                    <p className="text-gray-900">{selectedAction.dureeTraitement} minutes</p>
                  </div>
                  {selectedAction.montant && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Montant</label>
                      <p className="text-gray-900 font-semibold">{selectedAction.montant.toLocaleString()} FCFA</p>
                    </div>
                  )}
                  {selectedAction.tontine && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tontine</label>
                      <p className="text-gray-900">{selectedAction.tontine}</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Détails</label>
                  <p className="text-gray-900">{selectedAction.details}</p>
                </div>

                {selectedAction.raison && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Raison</label>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <p className="text-red-700">{selectedAction.raison}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <GlassButton 
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Fermer
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

export default AgentSFDHistoriquePage;