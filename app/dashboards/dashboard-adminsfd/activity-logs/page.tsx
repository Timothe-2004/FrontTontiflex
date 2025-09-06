// app/dashboard-sfd-admin/activity-log/page.tsx
'use client'
import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  User, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  FileText,
  DollarSign,
  Users,
  Settings,
  Shield,
  Calendar,
  MapPin,
  Building,
  Phone,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ActivityLogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('30j');
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Données mockées des actions
  const activityLog = [
    {
      id: 'ACT001',
      timestamp: '2025-06-12T14:30:15Z',
      user: {
        nom: 'AHOYO Bernadette',
        role: 'Agent SFD',
        email: 'b.ahoyo@sfdportionovo.bj',
        telephone: '+229 97 12 34 56'
      },
      action: 'validation_adhesion',
      objet: 'Adhésion tontine',
      details: {
        client: 'Marie JOHNSON',
        tontine: 'Tontine ALAFIA',
        montant: 2500,
        decision: 'approuvée'
      },
      resultats: 'Adhésion validée avec succès',
      adresseIP: '192.168.1.45',
      navigateur: 'Chrome 125.0',
      impact: 'normal',
      categorie: 'adhesion'
    },
    {
      id: 'ACT002',
      timestamp: '2025-06-12T13:15:22Z',
      user: {
        nom: 'DOSSA Paulin',
        role: 'Superviseur SFD',
        email: 'p.dossa@sfdportionovo.bj',
        telephone: '+229 96 23 45 67'
      },
      action: 'traitement_pret',
      objet: 'Demande de prêt',
      details: {
        client: 'Fatou AHOUNOU',
        montant: 150000,
        duree: 12,
        decision: 'transmis_admin'
      },
      resultats: 'Dossier transmis à l\'administrateur pour validation finale',
      adresseIP: '192.168.1.78',
      navigateur: 'Firefox 126.0',
      impact: 'élevé',
      categorie: 'credit'
    },
    {
      id: 'ACT003',
      timestamp: '2025-06-12T11:45:33Z',
      user: {
        nom: 'KPADE Michel',
        role: 'Agent SFD',
        email: 'm.kpade@sfdportionovo.bj',
        telephone: '+229 95 34 56 78'
      },
      action: 'validation_retrait',
      objet: 'Demande de retrait',
      details: {
        client: 'Adjoa MENSAH',
        tontine: 'Tontine Agricole',
        montant: 25000,
        decision: 'rejetée',
        motif: 'Fonds insuffisants dans la tontine'
      },
      resultats: 'Retrait rejeté - Notification SMS envoyée au client',
      adresseIP: '192.168.1.92',
      navigateur: 'Safari 17.4',
      impact: 'normal',
      categorie: 'retrait'
    },
    {
      id: 'ACT004',
      timestamp: '2025-06-12T10:20:45Z',
      user: {
        nom: 'AHOYO Bernadette',
        role: 'Agent SFD',
        email: 'b.ahoyo@sfdportionovo.bj',
        telephone: '+229 97 12 34 56'
      },
      action: 'creation_compte_epargne',
      objet: 'Compte épargne',
      details: {
        client: 'Yvette GBAGUIDI',
        typeCompte: 'Épargne classique',
        depotInitial: 10000
      },
      resultats: 'Compte épargne créé avec succès - Numéro: EP2025001247',
      adresseIP: '192.168.1.45',
      navigateur: 'Chrome 125.0',
      impact: 'normal',
      categorie: 'epargne'
    },
    {
      id: 'ACT005',
      timestamp: '2025-06-12T09:10:12Z',
      user: {
        nom: 'DOSSA Paulin',
        role: 'Superviseur SFD',
        email: 'p.dossa@sfdportionovo.bj',
        telephone: '+229 96 23 45 67'
      },
      action: 'modification_parametres',
      objet: 'Configuration tontine',
      details: {
        tontine: 'Tontine des Commerçantes',
        modification: 'Augmentation limite cotisation',
        ancienneValeur: 8000,
        nouvelleValeur: 10000
      },
      resultats: 'Paramètres modifiés - Notification envoyée aux membres',
      adresseIP: '192.168.1.78',
      navigateur: 'Firefox 126.0',
      impact: 'élevé',
      categorie: 'configuration'
    },
    {
      id: 'ACT006',
      timestamp: '2025-06-12T08:30:28Z',
      user: {
        nom: 'KPADE Michel',
        role: 'Agent SFD',
        email: 'm.kpade@sfdportionovo.bj',
        telephone: '+229 95 34 56 78'
      },
      action: 'desactivation_client',
      objet: 'Compte client',
      details: {
        client: 'Jean AKPOVI',
        motif: 'Compte inactif depuis 6 mois',
        derniereCotisation: '2024-12-15'
      },
      resultats: 'Compte désactivé - Email de notification envoyé',
      adresseIP: '192.168.1.92',
      navigateur: 'Safari 17.4',
      impact: 'critique',
      categorie: 'gestion_client'
    },
    {
      id: 'ACT007',
      timestamp: '2025-06-11T16:45:18Z',
      user: {
        nom: 'AHOYO Bernadette',
        role: 'Agent SFD',
        email: 'b.ahoyo@sfdportionovo.bj',
        telephone: '+229 97 12 34 56'
      },
      action: 'validation_cotisation',
      objet: 'Cotisation exceptionnelle',
      details: {
        client: 'Grace HOUNKPATIN',
        tontine: 'Tontine ALAFIA',
        montant: 15000,
        type: 'rattrapage'
      },
      resultats: 'Cotisation validée - Solde client mis à jour',
      adresseIP: '192.168.1.45',
      navigateur: 'Chrome 125.0',
      impact: 'normal',
      categorie: 'cotisation'
    }
  ];

  const filteredActions = activityLog.filter(action => {
    const matchesSearch = action.user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.objet.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.details.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = userFilter === 'all' || action.user.role === userFilter;
    const matchesAction = actionFilter === 'all' || action.categorie === actionFilter;
    
    return matchesSearch && matchesUser && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'validation_adhesion':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'validation_retrait':
        return <DollarSign className="text-blue-600" size={20} />;
      case 'traitement_pret':
        return <FileText className="text-purple-600" size={20} />;
      case 'creation_compte_epargne':
        return <Plus className="text-emerald-600" size={20} />;
      case 'modification_parametres':
        return <Settings className="text-orange-600" size={20} />;
      case 'desactivation_client':
        return <XCircle className="text-red-600" size={20} />;
      case 'validation_cotisation':
        return <CheckCircle className="text-green-600" size={20} />;
      default:
        return <Activity className="text-gray-600" size={20} />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Agent SFD':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Agent</span>;
      case 'Superviseur SFD':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Superviseur</span>;
      case 'Administrateur SFD':
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">Admin</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Utilisateur</span>;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'critique':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Critique</span>;
      case 'élevé':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Élevé</span>;
      case 'normal':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Normal</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Faible</span>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      'adhesion': 'Adhésion',
      'credit': 'Crédit',
      'retrait': 'Retrait',
      'epargne': 'Épargne',
      'configuration': 'Configuration',
      'gestion_client': 'Gestion client',
      'cotisation': 'Cotisation'
    };
    return categories[category] || category;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Filtres et contrôles */}
        <div className="my-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Barre de recherche */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Rechercher une action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white/60 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              {/* Filtres */}
              <div className="flex gap-2">
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-40 bg-white/60">
                    <User className="mr-2" size={16} />
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="Agent SFD">Agents</SelectItem>
                    <SelectItem value="Superviseur SFD">Superviseurs</SelectItem>
                    <SelectItem value="Administrateur SFD">Administrateurs</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-40 bg-white/60">
                    <Activity className="mr-2" size={16} />
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="adhesion">Adhésions</SelectItem>
                    <SelectItem value="credit">Crédits</SelectItem>
                    <SelectItem value="retrait">Retraits</SelectItem>
                    <SelectItem value="epargne">Épargne</SelectItem>
                    <SelectItem value="configuration">Configuration</SelectItem>
                    <SelectItem value="gestion_client">Gestion client</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-32 bg-white/60">
                    <Calendar className="mr-2" size={16} />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1j">Aujourd'hui</SelectItem>
                    <SelectItem value="7j">7 jours</SelectItem>
                    <SelectItem value="30j">30 jours</SelectItem>
                    <SelectItem value="90j">3 mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <GlassButton variant="outline" size="sm">
                <Download className="mr-2" size={16} />
                Exporter
              </GlassButton>
            </div>
          </div>
        </div>

        {/* Liste des actions */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-50/50 border-b border-emerald-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-emerald-800">Date & Heure</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Utilisateur</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Action</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Détails</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Impact</th>
                  <th className="text-right p-4 font-semibold text-emerald-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredActions.map((action) => (
                  <tr key={action.id} className="hover:bg-white/50 transition-colors">
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {format(new Date(action.timestamp), 'dd/MM/yyyy', { locale: fr })}
                        </div>
                        <div className="text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {format(new Date(action.timestamp), 'HH:mm:ss', { locale: fr })}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{action.user.nom}</div>
                          <div className="flex items-center gap-2">
                            {getRoleBadge(action.user.role)}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {getActionIcon(action.action)}
                        <div>
                          <div className="font-medium text-gray-900">{action.objet}</div>
                          <div className="text-xs text-gray-500">
                            {getCategoryLabel(action.categorie)}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="text-sm space-y-1">
                        {action.details.client && (
                          <div><strong>Client:</strong> {action.details.client}</div>
                        )}
                        {action.details.tontine && (
                          <div><strong>Tontine:</strong> {action.details.tontine}</div>
                        )}
                        {action.details.montant && (
                          <div><strong>Montant:</strong> {action.details.montant.toLocaleString()} FCFA</div>
                        )}
                        {action.details.decision && (
                          <div><strong>Décision:</strong> {action.details.decision}</div>
                        )}
                        {action.details.motif && (
                          <div className="text-red-600"><strong>Motif:</strong> {action.details.motif}</div>
                        )}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      {getImpactBadge(action.impact)}
                    </td>
                    
                    <td className="p-4 text-right">
                      <GlassButton
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAction(action);
                          setShowDetails(true);
                        }}
                      >
                        <Eye size={14} className="mr-1" />
                        Détails
                      </GlassButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredActions.length === 0 && (
            <div className="text-center py-12">
              <Activity className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 text-lg mb-2">Aucune action trouvée</p>
              <p className="text-gray-500">
                {searchTerm || userFilter !== 'all' || actionFilter !== 'all' 
                  ? 'Essayez de modifier vos filtres' 
                  : 'Aucune activité enregistrée pour cette période'
                }
              </p>
            </div>
          )}
        </div>

        {/* Modal de détails */}
        {showDetails && selectedAction && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  {getActionIcon(selectedAction.action)}
                  Détails de l'action {selectedAction.id}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <XCircle size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <User size={16} className="text-emerald-600" />
                      Utilisateur
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Nom:</strong> {selectedAction.user.nom}</div>
                      <div><strong>Rôle:</strong> {selectedAction.user.role}</div>
                      <div className="flex items-center gap-1">
                        <Mail size={12} />
                        {selectedAction.user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone size={12} />
                        {selectedAction.user.telephone}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Clock size={16} className="text-emerald-600" />
                      Informations techniques
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Horodatage:</strong> {format(new Date(selectedAction.timestamp), 'dd/MM/yyyy à HH:mm:ss', { locale: fr })}</div>
                      <div><strong>Adresse IP:</strong> {selectedAction.adresseIP}</div>
                      <div><strong>Navigateur:</strong> {selectedAction.navigateur}</div>
                      <div className="flex items-center gap-2">
                        <strong>Impact:</strong> {getImpactBadge(selectedAction.impact)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText size={16} className="text-emerald-600" />
                    Détails de l'action
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div><strong>Type d'action:</strong> {selectedAction.objet}</div>
                    <div><strong>Catégorie:</strong> {getCategoryLabel(selectedAction.categorie)}</div>
                    
                    {/* {Object.entries(selectedAction.details).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {value}
                      </div>
                    ))} */}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-600" />
                    Résultats
                  </h4>
                  <div className="bg-emerald-50 p-4 rounded-lg text-sm">
                    {selectedAction.resultats}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogPage;