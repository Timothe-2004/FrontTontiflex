'use client'
import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { 
  History, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Calendar,
  RefreshCw,
  AlertTriangle,
  User,
  Activity,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSuperviseursSFD, SuperviseurSFDAction } from '@/hooks/gestion-users/useSuperviseursSFD';
import { useAuth } from '@/contexts/AuthContext';

const SuperviseurActionsHistoryComponent = () => {
  const { 
    superviseurActions, 
    loading, 
    error, 
    fetchSuperviseurSFDActions 
  } = useSuperviseursSFD();

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.profile.id) {
      loadActions();
    }
  }, []);

  const loadActions = async () => {
    try {
      await fetchSuperviseurSFDActions(user?.profile.id as string);
    } catch (err) {
      console.error('Erreur lors du chargement des actions:', err);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'validation_pret':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'rejet_pret':
        return <XCircle size={16} className="text-red-600" />;
      case 'etude_pret':
        return <FileText size={16} className="text-blue-600" />;
      case 'modification_pret':
        return <FileText size={16} className="text-orange-600" />;
      default:
        return <Activity size={16} className="text-gray-600" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'validation_pret':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejet_pret':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'etude_pret':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'modification_pret':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'validation_pret':
        return 'Validation de prêt';
      case 'rejet_pret':
        return 'Rejet de prêt';
      case 'etude_pret':
        return 'Étude de prêt';
      case 'modification_pret':
        return 'Modification de prêt';
      default:
        return type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const filteredAndSortedActions = superviseurActions
    ? superviseurActions
        .filter(action => filterType === 'all' || action.type === filterType)
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        })
    : [];

  const uniqueActionTypes = superviseurActions
    ? [...new Set(superviseurActions.map(action => action.type))]
    : [];

  const getActionStats = () => {
    if (!superviseurActions) return null;
    
    const stats = superviseurActions.reduce((acc, action) => {
      acc[action.type] = (acc[action.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return stats;
  };

  if (loading && !superviseurActions) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="animate-spin mr-2" size={20} />
          <span>Chargement de l'historique...</span>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6 border-l-4 border-l-red-500">
        <div className="flex items-center">
          <AlertTriangle className="text-red-500 mr-2" size={20} />
          <div>
            <p className="font-medium text-red-700">Erreur</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
        <GlassButton 
          size="sm" 
          className="mt-4"
          onClick={loadActions}
        >
          <RefreshCw size={14} className="mr-2" />
          Réessayer
        </GlassButton>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <History className="mr-3 text-emerald-600" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Historique des Actions
              </h2>
            </div>
          </div>
          <GlassButton 
            variant="outline" 
            size="sm"
            onClick={loadActions}
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </GlassButton>
        </div>

        {/* Statistiques rapides */}
        {superviseurActions && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total actions</p>
              <p className="text-xl font-bold text-blue-600">
                {superviseurActions.length}
              </p>
            </div>
            {Object.entries(getActionStats() || {}).slice(0, 3).map(([type, count]) => (
              <div key={type} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">{getActionLabel(type)}</p>
                <p className="text-xl font-bold text-gray-700">{count}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filtres */}
      <div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filtrer par type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white"
            >
              <option value="all">Tous les types</option>
              {uniqueActionTypes.map(type => (
                <option key={type} value={type}>
                  {getActionLabel(type)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Trier par date:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white"
            >
              <option value="desc">Plus récent d'abord</option>
              <option value="asc">Plus ancien d'abord</option>
            </select>
          </div>
          
          <div className="ml-auto text-sm text-gray-500">
            {filteredAndSortedActions.length} action(s) trouvée(s)
          </div>
        </div>
      </div>

      {/* Liste des actions */}
      <GlassCard className="p-6" hover={false}>
        {filteredAndSortedActions.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedActions.map((action, index) => (
              <div 
                key={`${action.date}-${action.type}-${index}`}
                className="flex items-start gap-4 p-4 bg-white/60 rounded-lg border border-white/20 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(action.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(action.type)}`}>
                      {getActionLabel(action.type)}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-1" />
                      {format(new Date(action.date), 'dd MMM yyyy', { locale: fr })}
                    </div>
                  </div>
                  
                  <p className="text-gray-900 text-sm">
                    {action.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <History className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 text-lg mb-2">Aucune action trouvée</p>
            <p className="text-gray-500 text-sm">
              {filterType === 'all' 
                ? "Ce superviseur n'a encore effectué aucune action."
                : "Aucune action trouvée pour le filtre sélectionné."
              }
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default SuperviseurActionsHistoryComponent;