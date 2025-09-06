// app/dashboards/dashboard-adminsfd/users/clients/page.tsx
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
  Filter, 
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
  PiggyBank,
  CreditCard,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useClientsAPI, Client, ClientsFilters } from '@/hooks/useClients';
import Link from 'next/link';

const ClientsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'actif' | 'inactif' | 'suspendu'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    clients,
    loading,
    error,
    fetchClients,
    fetchClientById
  } = useClientsAPI();

  // Charger les clients au montage du composant
  useEffect(() => {
    loadClients();
  }, [currentPage, statusFilter]);

  const loadClients = async () => {
    const filters: ClientsFilters = {
      page: currentPage,
      search: searchTerm || undefined,
      statut: statusFilter !== 'all' ? statusFilter : undefined,
    };

    try {
      await fetchClients(filters);
    } catch (err) {
      console.error('Erreur lors du chargement des clients:', err);
    }
  };

  // Fonction de recherche avec debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        setCurrentPage(1);
        loadClients();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleViewDetails = async (client: Client) => {
    try {
      const fullClient = await fetchClientById(client.id);
      if (fullClient) {
        setSelectedClient(fullClient);
        setShowDetails(true);
      }
    } catch (err) {
      toast.error('Erreur lors du chargement des détails du client');
    }
  };

  const handleUserAction = async (clientId: string, action: string) => {
    try {
      // Ici vous pouvez implémenter les actions selon votre API
      let message = '';
      switch (action) {
        case 'activate':
          message = 'Client activé avec succès';
          break;
        case 'deactivate':
          message = 'Client désactivé avec succès';
          break;
        case 'suspend':
          message = 'Client suspendu avec succès';
          break;
        case 'resetPassword':
          message = 'Mot de passe réinitialisé - Lien envoyé par SMS';
          break;
        case 'delete':
          message = 'Client supprimé avec succès';
          break;
        default:
          message = 'Action effectuée avec succès';
      }
      
      toast.success(message);
      console.log(`Action ${action} effectuée sur le client ${clientId}`);
      
      // Recharger la liste après action
      loadClients();
      
    } catch (error) {
      toast.error('Erreur lors de l\'exécution de l\'action');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'actif':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
          <CheckCircle size={12} />
          Actif
        </span>;
      case 'inactif':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1">
          <Clock size={12} />
          Inactif
        </span>;
      case 'suspendu':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1">
          <Ban size={12} />
          Suspendu
        </span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Inconnu</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading && clients.length === 0) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-2 text-emerald-600">Chargement des clients...</span>
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
            <h1 className="text-2xl font-bold text-emerald-800">Gestion des Clients</h1>
            <p className="text-gray-600">Gérez les clients de votre plateforme</p>
          </div>
          <div className="flex gap-2">
            <GlassButton variant="outline" size="sm" onClick={loadClients} disabled={loading}>
              <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} />
              Actualiser
            </GlassButton>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="p-4 text-center border-l-4 border-l-blue-500">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {clients.filter(c => c.statut === 'actif').length}
            </div>
            <div className="text-sm text-gray-600">Clients actifs</div>
          </GlassCard>
          
          <GlassCard className="p-4 text-center border-l-4 border-l-emerald-500">
            <div className="text-2xl font-bold text-emerald-600 mb-1">
              {clients.length}
            </div>
            <div className="text-sm text-gray-600">Total clients</div>
          </GlassCard>
          
          <GlassCard className="p-4 text-center border-l-4 border-l-purple-500">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {clients.filter(c => c.tontines_count && parseInt(c.tontines_count) > 0).length}
            </div>
            <div className="text-sm text-gray-600">Avec tontines</div>
          </GlassCard>
          
          <GlassCard className="p-4 text-center border-l-4 border-l-red-500">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {clients.filter(c => c.statut === 'inactif' || c.statut === 'suspendu').length}
            </div>
            <div className="text-sm text-gray-600">Inactifs/Suspendus</div>
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
                  placeholder="Rechercher un client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white/60 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              {/* Filtres */}
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
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

        {/* Liste des clients */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-50/50 border-b border-emerald-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-emerald-800">Client</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Contact</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Statut</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Activité</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Score</th>
                  <th className="text-right p-4 font-semibold text-emerald-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{client.prenom} {client.nom}</div>
                          <div className="text-sm text-gray-500">ID: {client.id.slice(0, 8)}...</div>
                          <div className="text-xs text-gray-500">{client.profession}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Phone size={12} className="text-gray-400" />
                          {client.telephone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail size={12} className="text-gray-400" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-gray-400" />
                          {client.adresse}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="space-y-2">
                        {getStatusBadge(client.statut || 'actif')}
                        {client.email_verifie && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle size={12} />
                            Email vérifié
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="space-y-1 text-sm">
                        <div>
                          <strong>Inscription:</strong> {client.dateCreation ? format(new Date(client.dateCreation), 'dd/MM/yyyy', { locale: fr }) : 'N/A'}
                        </div>
                        <div>
                          <strong>Dernière connexion:</strong> {client.derniere_connexion ? format(new Date(client.derniere_connexion), 'dd/MM/yyyy', { locale: fr }) : 'Jamais'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Tontines: {client.tontines_count || '0'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="space-y-1 text-sm">
                        <div className={`font-medium ${getScoreColor(parseFloat(client.scorefiabilite) || 0)}`}>
                          Score: {parseFloat(client.scorefiabilite || '0').toFixed(0)}/100
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Building size={12} className="text-gray-400" />
                          <span className="text-gray-500">Fiabilité</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <GlassButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(client)}
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
                                onClick={() => handleUserAction(client.id, 'resetPassword')}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Key size={14} />
                                Réinitialiser mot de passe
                              </button>
                              
                              {client.statut === 'actif' ? (
                                <button
                                  onClick={() => handleUserAction(client.id, 'deactivate')}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <UserX size={14} />
                                  Désactiver
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserAction(client.id, 'activate')}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <UserCheck size={14} />
                                  Activer
                                </button>
                              )}
                              
                              {client.statut !== 'suspendu' ? (
                                <button
                                  onClick={() => handleUserAction(client.id, 'suspend')}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-yellow-50 text-yellow-600 flex items-center gap-2"
                                >
                                  <Ban size={14} />
                                  Suspendre
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserAction(client.id, 'activate')}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 text-green-600 flex items-center gap-2"
                                >
                                  <Unlock size={14} />
                                  Lever suspension
                                </button>
                              )}
                              
                              <hr className="my-1" />
                              <button
                                onClick={() => handleUserAction(client.id, 'delete')}
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
          
          {clients.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 text-lg mb-2">Aucun client trouvé</p>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Essayez de modifier vos filtres' 
                  : 'Aucun client enregistré'
                }
              </p>
            </div>
          )}
        </div>

        {/* Modal de détails client */}
        {showDetails && selectedClient && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">
                  Profil de {selectedClient.prenom} {selectedClient.nom}
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
                      <div><strong>Nom complet:</strong> {selectedClient.prenom} {selectedClient.nom}</div>
                      <div><strong>Email:</strong> {selectedClient.email}</div>
                      <div><strong>Téléphone:</strong> {selectedClient.telephone}</div>
                      <div><strong>Adresse:</strong> {selectedClient.adresse}</div>
                      <div><strong>Profession:</strong> {selectedClient.profession}</div>
                      <div><strong>Statut:</strong> {selectedClient.statut}</div>
                      <div><strong>Email vérifié:</strong> {selectedClient.email_verifie ? 'Oui' : 'Non'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Activity size={16} className="text-emerald-600" />
                      Activité sur la plateforme
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Date d'inscription:</strong> {selectedClient.dateCreation ? format(new Date(selectedClient.dateCreation), 'dd MMMM yyyy', { locale: fr }) : 'N/A'}</div>
                      <div><strong>Dernière connexion:</strong> {selectedClient.derniere_connexion ? format(new Date(selectedClient.derniere_connexion), 'dd MMMM yyyy à HH:mm', { locale: fr }) : 'Jamais'}</div>
                      <div><strong>Nombre de tontines:</strong> {selectedClient.tontines_count || '0'}</div>
                      <div><strong>Score de fiabilité:</strong> {parseFloat(selectedClient.scorefiabilite || '0').toFixed(0)}/100</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <Link href={`/dashboards/dashboard-adminsfd/users/clients/${selectedClient.id}`}>
                    <GlassButton>
                      <FileText className="mr-2" size={16} />
                      Voir le profil complet
                    </GlassButton>
                  </Link>
                  <GlassButton variant="outline">
                    <CreditCard className="mr-2" size={16} />
                    Historique transactions
                  </GlassButton>
                  <GlassButton variant="outline">
                    <PiggyBank className="mr-2" size={16} />
                    Mes tontines
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

export default ClientsManagement;