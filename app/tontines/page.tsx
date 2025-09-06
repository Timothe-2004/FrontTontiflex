'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTontines } from "@/hooks/useTontines";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Calendar, Coins, Filter, Loader2, RefreshCw } from "lucide-react";
import { Tontine } from "@/types/tontines";
import JoinTontineModal from "@/components/forms/JoinTontine";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Types et interfaces
type TontineStatus = 'active' | 'fermee' | 'en_attente';
type AmountFilter = 'all' | '500-1000' | '1000-5000' | '5000+';

interface TontineStats {
  total: number;
  active: number;
  participants: number;
  averageContribution: number;
}

interface FilterState {
  selectedAmount: AmountFilter;
}

const AvailableTontines: React.FC = () => {
  const { fetchTontines, loading, error } = useTontines();
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [filterState, setFilterState] = useState<FilterState>({
    selectedAmount: 'all'
  });
  const [selectedTontine, setSelectedTontine] = useState<Tontine | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { accessToken } = useAuth();
  const router = useRouter();

  // Calcul des statistiques
  const stats: TontineStats = {
    total: tontines.length,
    active: tontines.filter(t => t.statut === 'active').length,
    participants: tontines.reduce((sum, t) => sum + (t.participants?.length || 0), 0),
    averageContribution: tontines.length > 0 
      ? tontines.reduce((sum, t) => sum + (parseFloat(t.montantMinMise) + parseFloat(t.montantMaxMise)) / 2, 0) / tontines.length 
      : 0
  };

  // Chargement initial des tontines disponibles
  useEffect(() => {
    const loadTontines = async (): Promise<void> => {
      try {
        const availableTontines = await fetchTontines();
        setTontines(availableTontines);
        console.log("availableTontines", availableTontines);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        toast.error('Erreur lors du chargement des tontines disponibles');
      }
    };

    loadTontines();
  }, [fetchTontines]);

  // Filtrage local basé sur les montants
  const getFilteredTontines = (): Tontine[] => {
    return tontines.filter(tontine => {
      const minAmount = parseFloat(tontine.montantMinMise);
      const maxAmount = parseFloat(tontine.montantMaxMise);
      
      const amountMatch = filterState.selectedAmount === "all" || 
        (filterState.selectedAmount === "500-1000" && minAmount >= 500 && maxAmount <= 1000) ||
        (filterState.selectedAmount === "1000-5000" && minAmount >= 1000 && maxAmount <= 5000) ||
        (filterState.selectedAmount === "5000+" && maxAmount > 5000);
      
      return amountMatch;
    });
  };

  const filteredTontines = getFilteredTontines();

  const handleReload = async (): Promise<void> => {
    try {
      const availableTontines = await fetchTontines();
      setTontines(availableTontines);
    } catch (error) {
      console.error('Erreur lors du rechargement:', error);
      toast.error('Erreur lors du rechargement des tontines disponibles');
    }
  };

  const handleAmountFilterChange = (value: string): void => {
    setFilterState(prev => ({
      ...prev,
      selectedAmount: value as AmountFilter
    }));
  };

  const handleResetFilters = (): void => {
    setFilterState({
      selectedAmount: 'all'
    });
  };

  const handleJoinTontine = (tontine: Tontine): void => {
    if (!accessToken) {
      // Rediriger vers la page de connexion avec un paramètre de retour
      router.push(`/auth/login`);
      return;
    }
    setSelectedTontine(tontine);
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedTontine(null);
  };

  const handleJoinSuccess = (): void => {
    setIsModalOpen(false);
    setSelectedTontine(null);
    // Optionnel: recharger les tontines pour mettre à jour les données
    handleReload();
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('fr-FR');
  };

  const getStatusColor = (status: TontineStatus): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'fermee':
        return 'bg-red-100 text-red-800';
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: TontineStatus): string => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'fermee':
        return 'Fermée';
      case 'en_attente':
        return 'En attente';
      default:
        return status;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto md:px-20 sm:px-10 px-5 py-16">
        <GlassCard>
          <div className="text-center py-8">
            <p className="text-red-600 text-lg">Erreur lors du chargement des tontines disponibles</p>
            <p className="text-gray-600 mt-2">{error}</p>
            <GlassButton 
              onClick={handleReload}
              className="mt-4 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Réessayer
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-green-50 min-h-screen">   
      <div className="container mx-auto md:px-20 sm:px-10 px-5 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Tontines Disponibles</h1>
          <p className="text-xl text-gray-700">Choisissez la tontine qui correspond à vos besoins</p>
        </div>
        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="text-primary" size={20} />
              <span className="text-primary font-medium">Filtres :</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Montant (FCFA)</label>
                <Select value={filterState.selectedAmount} onValueChange={handleAmountFilterChange}>
                  <SelectTrigger className="w-48 bg-white/50">
                    <SelectValue placeholder="Tous les montants" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">Tous les montants</SelectItem>
                    <SelectItem value="500-1000">500 - 1 000</SelectItem>
                    <SelectItem value="1000-5000">1 000 - 5 000</SelectItem>
                    <SelectItem value="5000+">5 000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span className="ml-2 text-primary">Chargement des tontines...</span>
          </div>
        )}

        {/* Tontines Grid */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTontines.map((tontine) => (
                <GlassCard key={tontine.id} className="hover:shadow-xl transition-all duration-300">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-primary mb-2">{tontine.nom}</h3>
                      {tontine.description && (
                        <p className="text-sm text-gray-600">{tontine.description}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Statut:</span>
                        <span className={`capitalize font-medium px-3 py-1 rounded-full text-xs ${getStatusColor(tontine.statut as TontineStatus)}`}>
                          {getStatusLabel(tontine.statut as TontineStatus)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Contribution:</span>
                        <span className="font-medium">
                          {formatCurrency(parseFloat(tontine.montantMinMise))} - {formatCurrency(parseFloat(tontine.montantMaxMise))} FCFA
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Coins className="mr-1" size={16} />
                          Frais d'adhésion:
                        </span>
                        <span className="font-medium">{formatCurrency(parseFloat(tontine.fraisAdhesion))} FCFA</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Users className="mr-1" size={16} />
                          Participants:
                        </span>
                        <span className="font-medium">{tontine.participants?.length || 0}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Calendar className="mr-1" size={16} />
                          Créée le:
                        </span>
                        <span className="font-medium text-sm">
                          {new Date(tontine.dateCreation).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4">
                      {tontine.statut === 'active' ? (
                        <GlassButton 
                          className="w-full"
                          onClick={() => handleJoinTontine(tontine)}
                        >
                          <Coins className="mr-2" size={16} />
                          Rejoindre cette tontine
                        </GlassButton>
                      ) : (
                        <GlassButton className="w-full" disabled variant="outline">
                          Tontine non disponible
                        </GlassButton>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Empty State */}
            {filteredTontines.length === 0 && !loading && (
              <div className="text-center py-4">
                <GlassCard className="p-12" hover={false}>
                  <Coins className="mx-auto mb-4 text-gray-400" size={64} />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Aucune tontine trouvée
                  </h3>
                  <p className="text-gray-600 text-lg mb-6">
                    {filterState.selectedAmount !== 'all' 
                      ? "Aucune tontine ne correspond à vos critères de recherche."
                      : "Aucune tontine disponible pour le moment."
                    }
                  </p>
                  {filterState.selectedAmount !== 'all' && (
                     <GlassButton
                     variant="outline"
                     size="sm"
                     onClick={handleResetFilters}
                     className="m-auto bg-white"
                   >
                     Réinitialiser
                   </GlassButton>
                  )}
                </GlassCard>
              </div>
            )}
          </>
        )}

        {/* Modal de rejoindre une tontine */}
        <JoinTontineModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          tontine={selectedTontine}
          onSuccess={handleJoinSuccess}
        />
      </div>
    </div>
  );
};

export default AvailableTontines;