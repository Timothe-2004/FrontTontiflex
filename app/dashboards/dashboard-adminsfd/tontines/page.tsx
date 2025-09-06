// app/dashboard-sfd-admin/tontines/page.tsx
'use client'
import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  DollarSign, 
  Calendar, 
  Filter,
  Search,
  MoreVertical,
  Pause,
  Play,
  Settings,
  Copy,
  Download,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

const TontinesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Données mockées des tontines
  const tontines = [
    {
      id: '1',
      name: 'Tontine ALAFIA',
      type: 'épargne',
      status: 'active',
      membres: 25,
      membresActifs: 23,
      montantMin: 500,
      montantMax: 5000,
      periodicite: 'quotidien',
      duree: '12 mois',
      dateCreation: '2024-01-15',
      fondsTotaux: 1250000,
      cotisationsMoyennes: 2500,
      fraisAdhesion: 500,
      reglesRetrait: 'Après 3 mois minimum'
    },
    {
      id: '2',
      name: 'Tontine des Commerçantes',
      type: 'crédit',
      status: 'active',
      membres: 15,
      membresActifs: 14,
      montantMin: 1000,
      montantMax: 10000,
      periodicite: 'hebdomadaire',
      duree: '6 mois',
      dateCreation: '2024-02-20',
      fondsTotaux: 750000,
      cotisationsMoyennes: 5500,
      fraisAdhesion: 1000,
      reglesRetrait: 'Tour de rôle'
    },
    {
      id: '3',
      name: 'Tontine Agricole Saisonnière',
      type: 'mixte',
      status: 'pause',
      membres: 30,
      membresActifs: 30,
      montantMin: 2000,
      montantMax: 15000,
      periodicite: 'mensuel',
      duree: '12 mois',
      dateCreation: '2023-08-10',
      fondsTotaux: 2000000,
      cotisationsMoyennes: 8000,
      fraisAdhesion: 500,
      reglesRetrait: 'Période de récolte uniquement'
    },
    {
      id: '4',
      name: 'Tontine Étudiantes',
      type: 'épargne',
      status: 'active',
      membres: 20,
      membresActifs: 18,
      montantMin: 300,
      montantMax: 2000,
      periodicite: 'quotidien',
      duree: '9 mois',
      dateCreation: '2024-03-01',
      fondsTotaux: 360000,
      cotisationsMoyennes: 1000,
      fraisAdhesion: 300,
      reglesRetrait: 'Après examens'
    }
  ];

  const filteredTontines = tontines.filter(tontine => {
    const matchesSearch = tontine.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tontine.status === statusFilter;
    const matchesType = typeFilter === 'all' || tontine.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>;
      case 'pause':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">En pause</span>;
      case 'terminee':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Terminée</span>;
      default:
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Brouillon</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'épargne':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Épargne</span>;
      case 'crédit':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Crédit</span>;
      case 'mixte':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Mixte</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Autre</span>;
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Filtres et actions */}
        <div className='my-8'>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Barre de recherche */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Rechercher une tontine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white/60 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              {/* Filtres */}
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-white/60">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pause">En pause</SelectItem>
                    <SelectItem value="terminee">Terminée</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32 bg-white/60">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="épargne">Épargne</SelectItem>
                    <SelectItem value="crédit">Crédit</SelectItem>
                    <SelectItem value="mixte">Mixte</SelectItem>
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
              
              <Link href="/dashboards/dashboard-adminsfd/tontines/create">
                <GlassButton size="sm" className="">
                  <Plus className="mr-2" size={16} />
                  Nouvelle tontine
                </GlassButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Liste des tontines */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-50/50 border-b border-emerald-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-emerald-800">Nom & Type</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Statut</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Membres</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Configuration</th>
                  <th className="text-left p-4 font-semibold text-emerald-800">Performance</th>
                  <th className="text-right p-4 font-semibold text-emerald-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTontines.map((tontine) => (
                  <tr key={tontine.id} className="hover:bg-white/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">{tontine.name}</div>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(tontine.type)}
                          <span className="text-xs text-gray-500">
                            Créée le {new Date(tontine.dateCreation).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4 text-nowrap">
                      {getStatusBadge(tontine.status)}
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        <span className="font-medium">{tontine.membresActifs}/{tontine.membres}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((tontine.membresActifs / tontine.membres) * 100).toFixed(0)}% actifs
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} className="text-gray-400" />
                          <span>{tontine.montantMin.toLocaleString()} - {tontine.montantMax.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="capitalize">{tontine.periodicite}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Durée: {tontine.duree}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="space-y-1 text-sm">
                        <div className="font-medium text-emerald-600">
                          {(tontine.fondsTotaux / 1000).toFixed(0)}K FCFA
                        </div>
                        <div className="text-xs text-gray-500">
                          Moy: {tontine.cotisationsMoyennes.toLocaleString()} FCFA
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 size={12} className="text-green-500" />
                          <span className="text-xs text-green-600">+8.5%</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/dashboard-sfd-admin/tontines/${tontine.id}`}>
                          <GlassButton variant="outline" size="sm">
                            <Eye size={14} className="mr-1" />
                            Voir
                          </GlassButton>
                        </Link>              
                        <div className="relative group">
                          <GlassButton variant="outline" size="sm">
                            <MoreVertical size={14} />
                          </GlassButton>
                          
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="py-1">
                              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                {tontine.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                                {tontine.status === 'active' ? 'Mettre en pause' : 'Réactiver'}
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                <Copy size={14} />
                                Dupliquer
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                <Settings size={14} />
                                Paramètres avancés
                              </button>
                              <hr className="my-1" />
                              <button className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
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
          
          {filteredTontines.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 text-lg mb-2">Aucune tontine trouvée</p>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Essayez de modifier vos filtres' 
                  : 'Créez votre première tontine pour commencer'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                <Link href="/dashboard-sfd-admin/tontines/create">
                  <GlassButton>
                    <Plus className="mr-2" size={16} />
                    Créer une tontine
                  </GlassButton>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TontinesManagement;