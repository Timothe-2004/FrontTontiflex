'use client'
import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { 
  Bell, 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  X,
  Filter,
  Search,
  MoreVertical,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Archive,
  Settings,
  Smartphone,
  Building,
  ArrowUp,
  ArrowDown,
  Plus,
  Calendar,
  DollarSign,
  Info
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Types pour les notifications
interface Notification {
  id: string;
  type: 'cotisation' | 'retrait' | 'pret' | 'systeme' | 'tontine' | 'epargne' | 'securite';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  priority: 'high' | 'medium' | 'low';
  actionRequired?: boolean;
  relatedEntity?: {
    type: 'tontine' | 'account' | 'transaction';
    id: string;
    name: string;
  };
  metadata?: {
    amount?: number;
    currency?: string;
    status?: string;
    reference?: string;
  };
}

// Mock des notifications
const mockNotifications: Notification[] = [
  {
    id: 'notif_001',
    type: 'cotisation',
    title: 'Cotisation due aujourd\'hui',
    message: 'Votre cotisation de 1 500 FCFA pour la tontine "Espoir Collectif" est due aujourd\'hui. N\'oubliez pas de cotiser avant 18h.',
    date: '2025-06-16T08:00:00Z',
    isRead: false,
    isStarred: true,
    priority: 'high',
    actionRequired: true,
    relatedEntity: {
      type: 'tontine',
      id: '1',
      name: 'Espoir Collectif'
    },
    metadata: {
      amount: 1500,
      currency: 'FCFA'
    }
  },
  {
    id: 'notif_002',
    type: 'retrait',
    title: 'Retrait approuvé',
    message: 'Votre demande de retrait de 25 000 FCFA a été approuvée par l\'agent SFD. Les fonds seront transférés sur votre Mobile Money dans les prochaines minutes.',
    date: '2025-06-16T07:30:00Z',
    isRead: false,
    isStarred: false,
    priority: 'medium',
    actionRequired: false,
    relatedEntity: {
      type: 'transaction',
      id: 'tx_001',
      name: 'Retrait'
    },
    metadata: {
      amount: 25000,
      currency: 'FCFA',
      status: 'approuvé',
      reference: 'TF-RT-160616'
    }
  },
  {
    id: 'notif_003',
    type: 'tontine',
    title: 'Nouvelle tontine disponible',
    message: 'Une nouvelle tontine "Solidarité Femmes" vient d\'ouvrir chez FINADEV. Mise journalière: 2 000 FCFA, durée: 30 jours.',
    date: '2025-06-15T16:45:00Z',
    isRead: true,
    isStarred: false,
    priority: 'medium',
    actionRequired: true,
    relatedEntity: {
      type: 'tontine',
      id: '5',
      name: 'Solidarité Femmes'
    },
    metadata: {
      amount: 2000,
      currency: 'FCFA'
    }
  },
  {
    id: 'notif_004',
    type: 'systeme',
    title: 'Maintenance programmée',
    message: 'Une maintenance système est prévue dimanche de 2h à 4h du matin. Les services seront temporairement indisponibles.',
    date: '2025-06-15T14:20:00Z',
    isRead: true,
    isStarred: false,
    priority: 'low',
    actionRequired: false
  },
  {
    id: 'notif_005',
    type: 'cotisation',
    title: 'Cotisation confirmée',
    message: 'Votre cotisation de 1 500 FCFA pour "Espoir Collectif" a été confirmée. Solde actuel: 47 500 FCFA.',
    date: '2025-06-15T12:10:00Z',
    isRead: true,
    isStarred: false,
    priority: 'medium',
    actionRequired: false,
    relatedEntity: {
      type: 'tontine',
      id: '1',
      name: 'Espoir Collectif'
    },
    metadata: {
      amount: 1500,
      currency: 'FCFA',
      reference: 'TF-CT-150615'
    }
  },
  {
    id: 'notif_006',
    type: 'securite',
    title: 'Connexion depuis un nouvel appareil',
    message: 'Une connexion à votre compte a été détectée depuis un nouvel appareil. Si ce n\'était pas vous, changez immédiatement votre mot de passe.',
    date: '2025-06-14T20:30:00Z',
    isRead: false,
    isStarred: true,
    priority: 'high',
    actionRequired: true
  },
  {
    id: 'notif_007',
    type: 'epargne',
    title: 'Objectif d\'épargne atteint',
    message: 'Félicitations ! Vous avez atteint votre objectif d\'épargne de 100 000 FCFA sur votre compte "Projet Personnel".',
    date: '2025-06-14T15:45:00Z',
    isRead: true,
    isStarred: true,
    priority: 'medium',
    actionRequired: false,
    relatedEntity: {
      type: 'account',
      id: 'acc_001',
      name: 'Projet Personnel'
    },
    metadata: {
      amount: 100000,
      currency: 'FCFA'
    }
  },
  {
    id: 'notif_008',
    type: 'pret',
    title: 'Demande de prêt en cours',
    message: 'Votre demande de prêt de 50 000 FCFA est en cours d\'évaluation. Vous recevrez une réponse dans les 48h.',
    date: '2025-06-13T11:20:00Z',
    isRead: true,
    isStarred: false,
    priority: 'medium',
    actionRequired: false,
    metadata: {
      amount: 50000,
      currency: 'FCFA',
      status: 'en_cours'
    }
  }
];

const ClientNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'action_required'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Statistiques des notifications
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    starred: notifications.filter(n => n.isStarred).length,
    actionRequired: notifications.filter(n => n.actionRequired).length
  };

  // Filtrage des notifications
  const filteredNotifications = notifications.filter(notification => {
    // Filtre par statut
    if (filter === 'unread' && notification.isRead) return false;
    if (filter === 'starred' && !notification.isStarred) return false;
    if (filter === 'action_required' && !notification.actionRequired) return false;

    // Filtre par type
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;

    // Filtre par recherche
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    return true;
  });

  // Gestion des actions sur les notifications
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const toggleStar = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isStarred: !n.isStarred } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
  };

  const toggleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  // Icônes et couleurs par type de notification
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'cotisation': return Users;
      case 'retrait': return ArrowDown;
      case 'pret': return TrendingUp;
      case 'tontine': return DollarSign;
      case 'epargne': return Plus;
      case 'securite': return AlertCircle;
      case 'systeme': return Settings;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600 bg-red-100';
    
    switch (type) {
      case 'cotisation': return 'text-blue-600 bg-blue-100';
      case 'retrait': return 'text-green-600 bg-green-100';
      case 'pret': return 'text-purple-600 bg-purple-100';
      case 'tontine': return 'text-orange-600 bg-orange-100';
      case 'epargne': return 'text-emerald-600 bg-emerald-100';
      case 'securite': return 'text-red-600 bg-red-100';
      case 'systeme': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">Restez informé de toutes vos activités TontiFlex</p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <GlassButton
                onClick={markAllAsRead}
                variant="outline"
                disabled={stats.unread === 0}
              >
                <CheckCircle size={16} className="mr-2" />
                Tout marquer lu
              </GlassButton>
              
              <GlassButton
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
              >
                <Filter size={16} className="mr-2" />
                Filtres
              </GlassButton>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="space-y-4">
            {/* Filtres rapides */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Toutes', count: stats.total },
                { id: 'unread', label: 'Non lues', count: stats.unread },
                { id: 'starred', label: 'Favorites', count: stats.starred },
                { id: 'action_required', label: 'Action requise', count: stats.actionRequired }
              ].map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id as any)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    filter === filterOption.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white/60 text-gray-700 hover:bg-white/80 border border-white/20"
                  )}
                >
                  {filterOption.label}
                  {filterOption.count > 0 && (
                    <span className={cn(
                      "ml-2 px-2 py-0.5 rounded-full text-xs",
                      filter === filterOption.id
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-600"
                    )}>
                      {filterOption.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Filtres avancés */}
            {showFilters && (
              <GlassCard className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rechercher
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Rechercher dans les notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de notification
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tous les types</option>
                      <option value="cotisation">Cotisations</option>
                      <option value="retrait">Retraits</option>
                      <option value="tontine">Tontines</option>
                      <option value="epargne">Épargne</option>
                      <option value="pret">Prêts</option>
                      <option value="securite">Sécurité</option>
                      <option value="systeme">Système</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <GlassButton
                      onClick={() => {
                        setSearchTerm('');
                        setTypeFilter('all');
                        setFilter('all');
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Réinitialiser
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>

          {/* Actions groupées */}
          {selectedNotifications.length > 0 && (
            <GlassCard className="p-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedNotifications.length} notification(s) sélectionnée(s)
                </span>
                <div className="flex gap-2">
                  <GlassButton
                    onClick={() => {
                      selectedNotifications.forEach(id => markAsRead(id));
                      setSelectedNotifications([]);
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <Eye size={16} className="mr-2" />
                    Marquer lues
                  </GlassButton>
                  <GlassButton
                    onClick={deleteSelected}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Supprimer
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Liste des notifications */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type, notification.priority);
              
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "p-5 transition-all duration-200 hover:shadow-lg cursor-pointer bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-lg",
                    !notification.isRead && "border-l-4 border-l-blue-500 bg-blue-50/30",
                    selectedNotifications.includes(notification.id) && "ring-2 ring-blue-200 bg-blue-50/50"
                  )}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    
                    {/* Checkbox de sélection */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleSelectNotification(notification.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Icône de type */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      colorClass
                    )}>
                      <IconComponent size={24} />
                    </div>

                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={cn(
                            "font-semibold text-gray-900",
                            !notification.isRead && "font-bold"
                          )}>
                            {notification.title}
                          </h3>
                          
                          {/* Badge de priorité */}
                          {notification.priority === 'high' && (
                            <span className={cn(
                              "px-2 py-1 text-xs font-medium rounded-full border",
                              getPriorityBadge(notification.priority)
                            )}>
                              Urgent
                            </span>
                          )}
                          
                          {/* Badge action requise */}
                          {notification.actionRequired && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                              Action requise
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(notification.id);
                            }}
                            className={cn(
                              "p-1.5 rounded-lg transition-colors",
                              notification.isStarred
                                ? "text-yellow-500 hover:bg-yellow-50"
                                : "text-gray-400 hover:bg-gray-100 hover:text-yellow-500"
                            )}
                          >
                            <Star size={16} className={notification.isStarred ? "fill-current" : ""} />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Message */}
                      <p className="text-gray-700 mb-3 leading-relaxed">
                        {notification.message}
                      </p>

                      {/* Métadonnées */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatDistanceToNow(new Date(notification.date), { 
                              addSuffix: true, 
                              locale: fr 
                            })}
                          </span>
                          
                          {notification.relatedEntity && (
                            <span className="flex items-center gap-1">
                              <Building size={14} />
                              {notification.relatedEntity.name}
                            </span>
                          )}
                          
                          {notification.metadata?.reference && (
                            <span className="flex items-center gap-1 font-mono text-xs">
                              <Info size={14} />
                              {notification.metadata.reference}
                            </span>
                          )}
                        </div>

                        {/* Montant si présent */}
                        {notification.metadata?.amount && (
                          <span className="font-semibold text-gray-900">
                            {notification.metadata.amount.toLocaleString()} {notification.metadata.currency}
                          </span>
                        )}
                      </div>

                      {/* Actions contextuelles */}
                      {notification.actionRequired && (
                        <div className="mt-4 flex gap-2">
                          {notification.type === 'cotisation' && (
                            <GlassButton size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <CreditCard size={16} className="mr-2" />
                              Cotiser maintenant
                            </GlassButton>
                          )}
                          
                          {notification.type === 'tontine' && (
                            <GlassButton size="sm" variant="outline">
                              <Users size={16} className="mr-2" />
                              Voir la tontine
                            </GlassButton>
                          )}
                          
                          {notification.type === 'securite' && (
                            <GlassButton size="sm" className="bg-red-600 hover:bg-red-700">
                              <AlertCircle size={16} className="mr-2" />
                              Sécuriser mon compte
                            </GlassButton>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <GlassCard className="p-12 text-center">
              <Bell className="mx-auto mb-4 text-gray-400" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune notification</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "Vous n'avez aucune notification pour le moment."
                  : `Aucune notification ne correspond au filtre "${filter}".`
                }
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientNotifications;