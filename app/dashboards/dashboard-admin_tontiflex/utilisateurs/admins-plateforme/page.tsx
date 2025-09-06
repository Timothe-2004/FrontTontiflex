// app/dashboards/dashboard-adminsfd/users/admins-plateforme/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Users, 
  User, 
  Search, 
  Download, 
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Shield,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  Key,
  Ban,
  Unlock,
  RefreshCw,
  FileText,
  Crown,
  Settings,
  X
} from 'lucide-react';
import { 
  useAdminsPlateforme, 
  AdminPlateformeAdmin, 
  CreateAdminPlateformeData,
  AdminPlateformeFilters 
} from '@/hooks/gestion-users/useAdminsPlateforme';

const AdminsPlateformeManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminPlateformeAdmin | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    adminsplateforme,
    loading,
    error,
    fetchAdminsPlateforme,
    createAdminPlateforme,
    updateAdminPlateformePartial,
    deleteAdminPlateforme
  } = useAdminsPlateforme();

  // État du formulaire de création
  const [createForm, setCreateForm] = useState<CreateAdminPlateformeData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    motDePasse: '',
    adresse: '',
    profession: '',
  });

  // Charger les admins au montage du composant
  useEffect(() => {
    loadAdmins();
  }, [currentPage, activeFilter]);

  const loadAdmins = async () => {
    const filters: AdminPlateformeFilters = {
      page: currentPage,
      search: searchTerm || undefined,
      est_actif: activeFilter !== 'all' ? activeFilter === 'true' : undefined,
    };

    try {
      await fetchAdminsPlateforme(filters);
    } catch (err) {
      console.error('Erreur lors du chargement des administrateurs:', err);
    }
  };

  // Fonction de recherche avec debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        setCurrentPage(1);
        loadAdmins();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        
      await createAdminPlateforme(createForm);
      setShowCreateForm(false);
      setCreateForm({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        motDePasse: '',
        adresse: '',
        profession: '',
      });
      loadAdmins();
    } catch (err) {
      console.error('Erreur lors de la création:', err);
    }
  };

  const handleAdminAction = async (adminId: string, action: string) => {
    try {
      // Trouver l'admin par son ID
      const admin = adminsplateforme.find(admin => admin.id === adminId);
      if (!admin) return;

      let message = '';
      switch (action) {
        case 'activate':
          await updateAdminPlateformePartial(adminId, { est_actif: true });
          message = 'Administrateur activé avec succès';
          break;
        case 'deactivate':
          await updateAdminPlateformePartial(adminId, { est_actif: false });
          message = 'Administrateur désactivé avec succès';
          break;
        case 'delete':
          await deleteAdminPlateforme(adminId);
          message = 'Administrateur supprimé avec succès';
          break;
        default:
          message = 'Action effectuée avec succès';
      }
      
      toast.success(message);
      loadAdmins();
    } catch (error) {
      toast.error('Erreur lors de l\'exécution de l\'action');
    }
  };

  const getStatusBadge = (estActif: boolean) => {
    return estActif ? (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
        <CheckCircle size={12} />
        Actif
      </span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1">
        <Ban size={12} />
        Inactif
      </span>
    );
  };

  const getPermissionsBadge = (admin: AdminPlateformeAdmin) => {
    const permissions = [];
    if (admin.peut_gerer_comptes) permissions.push('Comptes');
    if (admin.peut_gerer_sfd) permissions.push('SFD');
    
    return (
      <div className="flex flex-wrap gap-1">
        {permissions.map(perm => (
          <span key={perm} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            {perm}
          </span>
        ))}
      </div>
    );
  };

  if (loading && adminsplateforme.length === 0) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-2 text-emerald-600">Chargement des administrateurs...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-800">Administrateurs de Plateforme</h1>
            <p className="text-gray-600">Gérez les administrateurs avec accès complet à la plateforme</p>
          </div>
          <div className="flex gap-2">
            <GlassButton variant="outline" size="sm" onClick={loadAdmins} disabled={loading}>
              <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} />
              Actualiser
            </GlassButton>
            <GlassButton size="sm" onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2" size={16} />
              Nouvel Admin
            </GlassButton>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="p-4 text-center border-l-4 border-l-purple-500">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {adminsplateforme.filter(a => a.est_actif).length}
            </div>
            <div className="text-sm text-gray-600">Actifs</div>
          </GlassCard>
          
          <GlassCard className="p-4 text-center border-l-4 border-l-emerald-500">
            <div className="text-2xl font-bold text-emerald-600 mb-1">
              {adminsplateforme.length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </GlassCard>
          
          <GlassCard className="p-4 text-center border-l-4 border-l-blue-500">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {adminsplateforme.filter(a => a.peut_gerer_sfd).length}
            </div>
            <div className="text-sm text-gray-600">Gestion SFD</div>
          </GlassCard>
          
          <GlassCard className="p-4 text-center border-l-4 border-l-orange-500">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {adminsplateforme.filter(a => a.peut_gerer_comptes).length}
            </div>
            <div className="text-sm text-gray-600">Gestion Comptes</div>
          </GlassCard>
        </div>

        {/* Filtres et contrôles */}
        <div className="my-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Barre de recherche */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Rechercher un admin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white/60 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              {/* Filtres */}
              <div className="flex gap-2">
                <Select value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)}>
                  <SelectTrigger className="w-32 bg-white/60">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="true">Actifs</SelectItem>
                    <SelectItem value="false">Inactifs</SelectItem>
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

        {/* Affichage des erreurs */}
        {error && (
          <GlassCard className="p-4 border-l-4 border-l-red-500 bg-red-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-600" size={16} />
              <span className="text-red-700">{error}</span>
            </div>
          </GlassCard>
        )}

        {/* Liste des administrateurs */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-50/50 border-b border-emerald-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-emerald-800">Administrateur</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Contact</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Statut</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Permissions</th>
                  <th className="text-right p-4 font-semibold text-emerald-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {adminsplateforme.map((admin, index) => (
                  <tr key={admin.id} className="hover:bg-white/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Crown size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{admin.prenom} {admin.nom}</div>
                          <div className="text-sm text-gray-500">{admin.profession}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Phone size={12} className="text-gray-400" />
                          {admin.telephone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail size={12} className="text-gray-400" />
                          {admin.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-gray-400" />
                          {admin.adresse}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="space-y-2">
                        {getStatusBadge(admin.est_actif)}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      {getPermissionsBadge(admin)}
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <GlassButton
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAdmin(admin);
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
                              {admin.est_actif ? (
                                <button
                                  onClick={() => handleAdminAction(admin.id, 'deactivate')}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <UserX size={14} />
                                  Désactiver
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAdminAction(admin.id, 'activate')}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <UserCheck size={14} />
                                  Activer
                                </button>
                              )}
                              
                              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                <Edit size={14} />
                                Modifier
                              </button>
                              
                              <hr className="my-1" />
                              <button
                                onClick={() => handleAdminAction(admin.id, 'delete')}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 size={14} />
                                Supprimer
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
          
          {adminsplateforme.length === 0 && !loading && (
            <div className="text-center py-12">
              <Crown className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 text-lg mb-2">Aucun administrateur trouvé</p>
              <p className="text-gray-500">
                {searchTerm || activeFilter !== 'all' 
                  ? 'Essayez de modifier vos filtres' 
                  : 'Aucun administrateur enregistré'
                }
              </p>
            </div>
          )}
        </div>

        {/* Modal de création d'admin */}
        {showCreateForm && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">Créer un Administrateur Plateforme</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateAdmin} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      value={createForm.nom}
                      onChange={(e) => setCreateForm({...createForm, nom: e.target.value})}
                      required
                      className="bg-white/60"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      value={createForm.prenom}
                      onChange={(e) => setCreateForm({...createForm, prenom: e.target.value})}
                      required
                      className="bg-white/60"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                      required
                      className="bg-white/60"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone *</Label>
                    <Input
                      id="telephone"
                      value={createForm.telephone}
                      onChange={(e) => setCreateForm({...createForm, telephone: e.target.value})}
                      required
                      className="bg-white/60"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="motDePasse">Mot de passe *</Label>
                    <Input
                      id="motDePasse"
                      type="password"
                      value={createForm.motDePasse}
                      onChange={(e) => setCreateForm({...createForm, motDePasse: e.target.value})}
                      required
                      className="bg-white/60"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="profession">Profession</Label>
                    <Input
                      id="profession"
                      value={createForm.profession}
                      onChange={(e) => setCreateForm({...createForm, profession: e.target.value})}
                      className="bg-white/60"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <Label htmlFor="adresse">Adresse</Label>
                  <textarea
                    id="adresse"
                    value={createForm.adresse}
                    onChange={(e) => setCreateForm({...createForm, adresse: e.target.value})}
                    rows={3}
                    className="w-full p-3 bg-white/60 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
                
                <div className="flex gap-3">
                  <GlassButton
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1"
                  >
                    Annuler
                  </GlassButton>
                  <GlassButton
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {loading ? 'Création...' : 'Créer Admin'}
                  </GlassButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de détails admin */}
        {showDetails && selectedAdmin && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">
                  Profil de {selectedAdmin.prenom} {selectedAdmin.nom}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <User size={16} className="text-emerald-600" />
                      Informations personnelles
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Nom complet:</strong> {selectedAdmin.prenom} {selectedAdmin.nom}</div>
                      <div><strong>Email:</strong> {selectedAdmin.email}</div>
                      <div><strong>Téléphone:</strong> {selectedAdmin.telephone}</div>
                      <div><strong>Adresse:</strong> {selectedAdmin.adresse}</div>
                      <div><strong>Profession:</strong> {selectedAdmin.profession}</div>
                      <div><strong>Statut:</strong> {selectedAdmin.est_actif ? 'Actif' : 'Inactif'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield size={16} className="text-emerald-600" />
                      Permissions
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={selectedAdmin.peut_gerer_comptes ? 'text-green-500' : 'text-gray-400'} size={16} />
                        <span className={selectedAdmin.peut_gerer_comptes ? 'text-green-700' : 'text-gray-500'}>
                          Gestion des comptes
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={selectedAdmin.peut_gerer_sfd ? 'text-green-500' : 'text-gray-400'} size={16} />
                        <span className={selectedAdmin.peut_gerer_sfd ? 'text-green-700' : 'text-gray-500'}>
                          Gestion des SFD
                        </span>
                      </div>
                    </div>
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

export default AdminsPlateformeManagement;