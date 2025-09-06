'use client'
import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Users, 
  User, 
  Search, 
  Download, 
  Plus,
  Eye,
  UserCheck,
  UserX,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MoreVertical,
  Key,
  Ban,
  Unlock,
  Building,
  UserCog,
  Crown,
  Briefcase
} from 'lucide-react';

// Import des hooks
import { useClientsAPI } from '@/hooks/useClients';
import { useAdminsPlateforme } from '@/hooks/gestion-users/useAdminsPlateforme';

// Types
interface UserTab {
  id: string;
  label: string;
  icon: React.ElementType;
  count: number;
  color: string;
}

// Fonction utilitaire pour formater les dates
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'N/A';
  }
};

const UsersManagement = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Hooks pour récupérer les données
  const { 
    clients, 
    loading: clientsLoading, 
    error: clientsError, 
    fetchClients 
  } = useClientsAPI();

  const { 
    adminsplateforme, 
    loading: adminsLoading, 
    error: adminsError, 
    fetchAdminsPlateforme 
  } = useAdminsPlateforme();

  // États pour les autres types d'utilisateurs (à implémenter avec de vrais hooks)
  const [agentsSFD, setAgentsSFD] = useState([]);
  const [superviseursSFD, setSuperviseursSFD] = useState([]);
  const [adminsSFD, setAdminsSFD] = useState([]);

  // Données mockées pour les utilisateurs non encore intégrés
  const mockAgentsSFD = [
    {
      id: 'AGT001',
      nom: 'AHOYO',
      prenom: 'Bernadette',
      email: 'b.ahoyo@sfdportionovo.bj',
      telephone: '+229 97 23 45 67',
      adresse: 'Porto-Novo, Ouémé',
      profession: 'Agent SFD',
      statut: 'actif',
      dateCreation: '2023-01-10T09:00:00Z',
      derniere_connexion: '2025-06-12T14:20:00Z',
      clientsGeres: 45,
      performanceScore: 92
    },
    {
      id: 'AGT002',
      nom: 'KPADE',
      prenom: 'Michel',
      email: 'm.kpade@sfdportionovo.bj',
      telephone: '+229 94 56 78 90',
      adresse: 'Bohicon, Zou',
      profession: 'Agent SFD',
      statut: 'suspendu',
      dateCreation: '2023-11-05T11:20:00Z',
      derniere_connexion: '2025-05-28T09:15:00Z',
      clientsGeres: 32,
      performanceScore: 65
    }
  ];

  const mockSuperviseursSFD = [
    {
      id: 'SUP001',
      nom: 'DOSSA',
      prenom: 'Paulin',
      email: 'p.dossa@sfdportionovo.bj',
      telephone: '+229 96 34 56 78',
      adresse: 'Parakou, Borgou',
      profession: 'Superviseur SFD',
      statut: 'actif',
      dateCreation: '2022-08-20T14:15:00Z',
      derniere_connexion: '2025-06-12T13:10:00Z',
      pretsSupervises: 156,
      tauxApprobation: 91.0
    }
  ];

  const mockAdminsSFD = [
    {
      id: 'ASFD001',
      nom: 'HOUNSOU',
      prenom: 'Charles',
      email: 'c.hounsou@sfdportionovo.bj',
      telephone: '+229 95 11 22 33',
      adresse: 'Cotonou, Littoral',
      profession: 'Administrateur SFD',
      statut: 'actif',
      dateCreation: '2022-01-15T10:00:00Z',
      derniere_connexion: '2025-06-12T16:45:00Z',
      sfdGere: 'SFD Porto-Novo',
      permissions: ['gestion_tontines', 'validation_prets', 'gestion_agents']
    }
  ];

  // Configuration des onglets
  const tabs: UserTab[] = [
    {
      id: 'clients',
      label: 'Clients',
      icon: User,
      count: clients.length,
      color: 'blue'
    },
    {
      id: 'agents',
      label: 'Agents SFD',
      icon: UserCog,
      count: mockAgentsSFD.length,
      color: 'emerald'
    },
    {
      id: 'superviseurs',
      label: 'Superviseurs SFD',
      icon: Shield,
      count: mockSuperviseursSFD.length,
      color: 'purple'
    },
    {
      id: 'admins-sfd',
      label: 'Admins SFD',
      icon: Building,
      count: mockAdminsSFD.length,
      color: 'orange'
    },
    {
      id: 'admins-plateforme',
      label: 'Admins Plateforme',
      icon: Crown,
      count: adminsplateforme.length,
      color: 'red'
    }
  ];

  // Charger les données au montage du composant
  useEffect(() => {
    fetchClients();
    fetchAdminsPlateforme();
  }, []);

  // Fonction pour obtenir les données de l'onglet actif
  const getActiveTabData = () => {
    switch (activeTab) {
      case 'clients':
        return {
          data: clients,
          loading: clientsLoading,
          error: clientsError
        };
      case 'agents':
        return {
          data: mockAgentsSFD,
          loading: false,
          error: null
        };
      case 'superviseurs':
        return {
          data: mockSuperviseursSFD,
          loading: false,
          error: null
        };
      case 'admins-sfd':
        return {
          data: mockAdminsSFD,
          loading: false,
          error: null
        };
      case 'admins-plateforme':
        return {
          data: adminsplateforme,
          loading: adminsLoading,
          error: adminsError
        };
      default:
        return { data: [], loading: false, error: null };
    }
  };

  // Filtrer les données selon la recherche et le statut
  const getFilteredData = () => {
    const { data } = getActiveTabData();
    
    return data.filter((user: any) => {
      const matchesSearch = 
        user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telephone?.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || 
        user.statut === statusFilter || 
        user.est_actif === (statusFilter === 'actif');
      
      return matchesSearch && matchesStatus;
    });
  };

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (user: any) => {
    const statut = user.statut || (user.est_actif ? 'actif' : 'inactif');
    
    switch (statut) {
      case 'actif':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Actif</span>;
      case 'inactif':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Inactif</span>;
      case 'suspendu':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Suspendu</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Inconnu</span>;
    }
  };

  // Fonction pour rendre les informations spécifiques selon le type d'utilisateur
  const renderUserSpecificInfo = (user: any) => {
    switch (activeTab) {
      case 'clients':
        return (
          <div className="space-y-1 text-sm">
            <div>Score: {user.scorefiabilite || 'N/A'}/100</div>
            <div>Tontines: {user.tontines_count || 0}</div>
            <div className="text-xs text-gray-500">
              Inscrit le {formatDate(user.dateCreation)}
            </div>
          </div>
        );
      case 'agents':
        return (
          <div className="space-y-1 text-sm">
            <div>Clients gérés: {user.clientsGeres}</div>
            <div>Performance: {user.performanceScore}%</div>
            <div className="text-xs text-gray-500">
              Dernière connexion: {formatDate(user.derniere_connexion)}
            </div>
          </div>
        );
      case 'superviseurs':
        return (
          <div className="space-y-1 text-sm">
            <div>Prêts supervisés: {user.pretsSupervises}</div>
            <div>Taux approbation: {user.tauxApprobation}%</div>
            <div className="text-xs text-gray-500">
              Dernière connexion: {formatDate(user.derniere_connexion)}
            </div>
          </div>
        );
      case 'admins-sfd':
        return (
          <div className="space-y-1 text-sm">
            <div>SFD: {user.sfdGere}</div>
            <div>Permissions: {user.permissions?.length || 0}</div>
            <div className="text-xs text-gray-500">
              Dernière connexion: {formatDate(user.derniere_connexion)}
            </div>
          </div>
        );
      case 'admins-plateforme':
        return (
          <div className="space-y-1 text-sm">
            <div>Gestion comptes: {user.peut_gerer_comptes ? 'Oui' : 'Non'}</div>
            <div>Gestion SFD: {user.peut_gerer_sfd ? 'Oui' : 'Non'}</div>
            <div className="text-xs text-gray-500">
              Super administrateur
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Actions sur les utilisateurs
  const handleUserAction = async (userId: string, action: string) => {
    try {
      // Simulation d'action API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let message = '';
      switch (action) {
        case 'activate':
          message = 'Utilisateur activé avec succès';
          break;
        case 'deactivate':
          message = 'Utilisateur désactivé avec succès';
          break;
        case 'suspend':
          message = 'Utilisateur suspendu avec succès';
          break;
        case 'resetPassword':
          message = 'Mot de passe réinitialisé - Lien envoyé par SMS';
          break;
        default:
          message = 'Action effectuée avec succès';
      }
      
      toast.success(message);
    } catch (error) {
      toast.error('Erreur lors de l\'action');
    }
  };

  const { data: currentData, loading, error } = getActiveTabData();
  const filteredData = getFilteredData();

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation par onglets */}
        <GlassCard className="p-1">
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  activeTab === tab.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <GlassCard className="p-4 text-center border-l-4 border-l-blue-500">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {clients.length}
            </div>
            <div className="text-sm text-gray-600">Clients</div>
          </GlassCard>
          
          <GlassCard className="p-4 text-center border-l-4 border-l-emerald-500">
            <div className="text-2xl font-bold text-emerald-600 mb-1">
              {mockAgentsSFD.length}
            </div>
            <div className="text-sm text-gray-600">Agents SFD</div>
          </GlassCard>
          
          <GlassCard className="p-4 text-center border-l-4 border-l-purple-500">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {mockSuperviseursSFD.length}
            </div>
            <div className="text-sm text-gray-600">Superviseurs</div>
          </GlassCard>

          <GlassCard className="p-4 text-center border-l-4 border-l-orange-500">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {mockAdminsSFD.length}
            </div>
            <div className="text-sm text-gray-600">Admins SFD</div>
          </GlassCard>
          
          <GlassCard className="p-4 text-center border-l-4 border-l-red-500">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {adminsplateforme.length}
            </div>
            <div className="text-sm text-gray-600">Admins Plateforme</div>
          </GlassCard>
        </div>

        {/* Filtres et contrôles */}
        <div className="mt-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Barre de recherche */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white/60 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              {/* Filtre par statut */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-white/60">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="suspendu">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <GlassButton variant="outline" size="sm">
                <Download className="mr-2" size={16} />
                Exporter
              </GlassButton>
              
              <GlassButton size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-2" size={16} />
                Nouvel utilisateur
              </GlassButton>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-50/50 border-b border-emerald-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-emerald-800">Utilisateur</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Contact</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Statut</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Informations</th>
                  <th className="text-right p-4 font-semibold text-emerald-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((user: any) => (
                  <tr key={user.id} className="hover:bg-white/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {user.prenom} {user.nom}
                          </div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                          <div className="text-xs text-gray-500">{user.profession}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Phone size={12} className="text-gray-400" />
                          {user.telephone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail size={12} className="text-gray-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-gray-400" />
                          {user.adresse}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      {getStatusBadge(user)}
                    </td>
                    
                    <td className="p-4">
                      {renderUserSpecificInfo(user)}
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <GlassButton
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetails(true);
                          }}
                        >
                          <Eye size={14} className="mr-1" />
                          Voir
                        </GlassButton>
                        
                        <div className="relative group">
                          <GlassButton variant="outline" size="sm">
                            <MoreVertical size={14} />
                          </GlassButton>
                          
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="py-1">
                              <button 
                                onClick={() => handleUserAction(user.id, 'resetPassword')}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Key size={14} />
                                Réinitialiser mot de passe
                              </button>
                              <button 
                                onClick={() => handleUserAction(user.id, 'activate')}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <UserCheck size={14} />
                                Modifier statut
                              </button>
                              <hr className="my-1" />
                              <button 
                                onClick={() => handleUserAction(user.id, 'suspend')}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                              >
                                <Ban size={14} />
                                Suspendre
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 text-lg mb-2">Aucun utilisateur trouvé</p>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Essayez de modifier vos filtres' 
                  : 'Aucun utilisateur de ce type enregistré'
                }
              </p>
            </div>
          )}
        </div>

        {/* Modal de détails utilisateur */}
        {showDetails && selectedUser && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">
                  Profil de {selectedUser.prenom} {selectedUser.nom}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Informations personnelles</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Nom complet:</strong> {selectedUser.prenom} {selectedUser.nom}</div>
                      <div><strong>Email:</strong> {selectedUser.email}</div>
                      <div><strong>Téléphone:</strong> {selectedUser.telephone}</div>
                      <div><strong>Adresse:</strong> {selectedUser.adresse}</div>
                      <div><strong>Profession:</strong> {selectedUser.profession}</div>
                      <div><strong>Statut:</strong> {getStatusBadge(selectedUser)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Informations spécifiques</h4>
                    <div className="space-y-2 text-sm">
                      {activeTab === 'clients' && (
                        <>
                          <div><strong>Score de fiabilité:</strong> {selectedUser.scorefiabilite}/100</div>
                          <div><strong>Nombre de tontines:</strong> {selectedUser.tontines_count || 0}</div>
                          <div><strong>Email vérifié:</strong> {selectedUser.email_verifie ? 'Oui' : 'Non'}</div>
                        </>
                      )}
                      {activeTab === 'agents' && (
                        <>
                          <div><strong>Clients gérés:</strong> {selectedUser.clientsGeres}</div>
                          <div><strong>Score de performance:</strong> {selectedUser.performanceScore}%</div>
                        </>
                      )}
                      {activeTab === 'superviseurs' && (
                        <>
                          <div><strong>Prêts supervisés:</strong> {selectedUser.pretsSupervises}</div>
                          <div><strong>Taux d'approbation:</strong> {selectedUser.tauxApprobation}%</div>
                        </>
                      )}
                      {activeTab === 'admins-sfd' && (
                        <>
                          <div><strong>SFD géré:</strong> {selectedUser.sfdGere}</div>
                          <div><strong>Permissions:</strong> {selectedUser.permissions?.join(', ')}</div>
                        </>
                      )}
                      {activeTab === 'admins-plateforme' && (
                        <>
                          <div><strong>Gestion des comptes:</strong> {selectedUser.peut_gerer_comptes ? 'Autorisé' : 'Non autorisé'}</div>
                          <div><strong>Gestion des SFD:</strong> {selectedUser.peut_gerer_sfd ? 'Autorisé' : 'Non autorisé'}</div>
                        </>
                      )}
                      <div><strong>Date de création:</strong> {formatDateTime(selectedUser.dateCreation)}</div>
                      {selectedUser.derniere_connexion && (
                        <div><strong>Dernière connexion:</strong> {formatDateTime(selectedUser.derniere_connexion)}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t">
                <GlassButton variant="outline" onClick={() => setShowDetails(false)}>
                  Fermer
                </GlassButton>
                <GlassButton className="bg-emerald-600 hover:bg-emerald-700">
                  Modifier
                </GlassButton>
              </div>
            </div>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-red-600">Erreur: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;