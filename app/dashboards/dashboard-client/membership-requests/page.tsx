'use client'
import { JSX, useEffect, useState } from 'react'
import { GlassButton } from '@/components/GlassButton'
import { GlassCard } from '@/components/GlassCard'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import {
  Building,
  Calendar,
  Eye,
  Plus,
  Users,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  FileX,
  RefreshCw,
  ArrowRight,
  FileText,
  CalendarDays,
  MapPin
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// Types et interfaces
type ApplicationStatus = 'en_attente' | 'approuvee' | 'rejetee' | 'annulee' | 'expiree';

interface TontineApplication {
  id: string;
  tontine_id: string;
  tontine_nom: string;
  sfd_nom: string;
  status: ApplicationStatus;
  date_demande: string;
  date_reponse?: string;
  motif_rejet?: string;
  contribution_mensuelle: number;
  duree_mois: number;
  date_debut_prevue?: string;
  message_personnel?: string;
  admin_comments?: string;
}

interface ApplicationStats {
  total: number;
  en_attente: number;
  approuvees: number;
  rejetees: number;
  annulees: number;
  expirees: number;
}

interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

const MyTontineApplications: React.FC = () => {
  const [applications, setApplications] = useState<TontineApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<TontineApplication[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  });
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>('all');
  const [selectedSfd, setSelectedSfd] = useState<string>('all');

  // Données simulées
  const mockApplications: TontineApplication[] = [
    {
      id: "APP001",
      tontine_id: "TON001",
      tontine_nom: "Tontine des Commerçants",
      sfd_nom: "SFD Porto-Novo",
      status: "en_attente",
      date_demande: "2024-12-01",
      contribution_mensuelle: 25000,
      duree_mois: 12,
      date_debut_prevue: "2024-12-15",
    },
    {
      id: "APP002",
      tontine_id: "TON002",
      tontine_nom: "Épargne Agricole",
      sfd_nom: "SFD Cotonou",
      status: "approuvee",
      date_demande: "2024-11-20",
      date_reponse: "2024-11-22",
      contribution_mensuelle: 15000,
      duree_mois: 6,
      date_debut_prevue: "2024-12-01",
    },
    {
      id: "APP003",
      tontine_id: "TON003",
      tontine_nom: "Solidarité Femmes",
      sfd_nom: "SFD Abomey",
      status: "rejetee",
      date_demande: "2024-11-15",
      date_reponse: "2024-11-18",
      contribution_mensuelle: 20000,
      duree_mois: 24,
      motif_rejet: "Revenus insuffisants par rapport à la contribution demandée.",
    },
    {
      id: "APP004",
      tontine_id: "TON004",
      tontine_nom: "Investissement Jeunes",
      sfd_nom: "SFD Porto-Novo",
      status: "en_attente",
      date_demande: "2024-11-10",
      date_reponse: "2024-11-12",
      contribution_mensuelle: 30000,
      duree_mois: 18,
    }
  ];


  // Liste unique des SFD
  const sfdList: string[] = Array.from(new Set(applications.map(app => app.sfd_nom)));

  useEffect(() => {
    const loadApplications = async (): Promise<void> => {
      setLoadingState({ isLoading: true, error: null });
      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setApplications(mockApplications);
        console.log('Demandes chargées avec succès', mockApplications);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setLoadingState({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
        return;
      }
      setLoadingState({ isLoading: false, error: null });
    };

    loadApplications();
  }, []);

  // Filtrage des demandes
  useEffect(() => {
    let filtered = applications;

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.tontine_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.sfd_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    // Filtrage par SFD
    if (selectedSfd !== 'all') {
      filtered = filtered.filter(app => app.sfd_nom === selectedSfd);
    }

    setFilteredApplications(filtered);
  }, [applications, searchTerm, selectedStatus, selectedSfd]);

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };

  const getStatusIcon = (status: ApplicationStatus): JSX.Element => {
    switch (status) {
      case 'en_attente':
        return <Clock className="text-yellow-600" size={16} />;
      case 'approuvee':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'rejetee':
        return <XCircle className="text-red-600" size={16} />;
      default:
        return <Clock className="text-gray-600" size={16} />;
    }
  };

  const getStatusColor = (status: ApplicationStatus): string => {
    switch (status) {
      case 'en_attente':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'approuvee':
        return "bg-green-100 text-green-800 border-green-200";
      case 'rejetee':
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: ApplicationStatus): string => {
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'approuvee':
        return 'Approuvée';
      case 'rejetee':
        return 'Rejetée';
      default:
        return status;
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedStatus(e.target.value as ApplicationStatus | 'all');
  };

  const handleSfdChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedSfd(e.target.value);
  };

  if (loadingState.isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboards/dashboard-client/my-tontines">
              <GlassButton variant="outline" size="sm">
                <ArrowLeft size={16} />
              </GlassButton>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Mes Demandes d'Adhésion</h1>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (loadingState.error) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboards/dashboard-client/my-tontines">
              <GlassButton variant="outline" size="sm">
                <ArrowLeft size={16} />
              </GlassButton>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Mes Demandes d'Adhésion</h1>
          </div>
          <div className="text-center py-12 text-red-500">
            Erreur: {loadingState.error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboards/dashboard-client/my-tontines">
              <GlassButton variant="outline" size="sm">
                <ArrowLeft size={16} />
              </GlassButton>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Mes Demandes d'Adhésion</h1>
              <p className="text-gray-600">Suivez le statut de vos demandes d'adhésion aux tontines</p>
            </div>
            <Link href="/tontines">
              <GlassButton className="">
                <Plus size={16} className="mr-2" />
                Nouvelle demande
              </GlassButton>
            </Link>
          </div>

          {/* Filtres */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search" className="text-gray-700 font-medium mb-2 block">
                  <Search className="inline mr-2" size={16} />
                  Rechercher
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    id="search"
                    type="text"
                    placeholder="Nom de tontine, SFD ou ID..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status-filter" className="text-gray-700 font-medium mb-2 block">
                  <Filter className="inline mr-2" size={16} />
                  Statut
                </Label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="en_attente">En attente</option>
                  <option value="approuvee">Approuvées</option>
                  <option value="rejetee">Rejetées</option>
                </select>
              </div>

              <div>
                <Label htmlFor="sfd-filter" className="text-gray-700 font-medium mb-2 block">
                  <Building className="inline mr-2" size={16} />
                  SFD
                </Label>
                <select
                  id="sfd-filter"
                  value={selectedSfd}
                  onChange={handleSfdChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="all">Toutes les SFD</option>
                  {sfdList.map(sfd => (
                    <option key={sfd} value={sfd}>{sfd}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des demandes */}
        <div className="space-y-6">
          {filteredApplications.map((application) => (
            <GlassCard key={application.id} className="p-6" hover={false}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                      <Users className="text-emerald-600" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{application.tontine_nom}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Building className="mr-1" size={14} />
                          {application.sfd_nom}
                        </div>
                        <div className="flex items-center">
                          <FileText className="mr-1" size={14} />
                          {application.id}
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border",
                      getStatusColor(application.status)
                    )}>
                      {getStatusIcon(application.status)}
                      {getStatusLabel(application.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Contribution mensuelle:</span>
                      <p className="font-semibold text-emerald-600">{formatCurrency(application.contribution_mensuelle)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Durée:</span>
                      <p className="font-semibold text-blue-600">{application.duree_mois} mois</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Date de demande:</span>
                      <p className="font-semibold text-gray-900">
                        {format(new Date(application.date_demande), 'dd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                    {application.date_debut_prevue && (
                      <div>
                        <span className="text-gray-600">Début prévu:</span>
                        <p className="font-semibold text-purple-600">
                          {format(new Date(application.date_debut_prevue), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Messages et commentaires */}
                  {(application.motif_rejet) && (
                    <div className="">
                      {application.motif_rejet && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-xs text-red-600 mb-1">Motif du rejet:</p>
                          <p className="text-sm text-red-800">{application.motif_rejet}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  {application.date_reponse ? (
                    <>Réponse le {format(new Date(application.date_reponse), 'dd MMM yyyy', { locale: fr })}</>
                  ) : (
                    <>En attente de réponse...</>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {application.status === 'approuvee' && (
                    <Link href={`/dashboards/dashboard-client/my-tontines/${application.tontine_id}`}>
                      <GlassButton size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                        <Users size={14} className="mr-1" />
                        Accéder à la tontine
                        <ArrowRight size={12} className="ml-1" />
                      </GlassButton>
                    </Link>
                  )}
                  <Link href={`/dashboards/dashboard-client/my-tontines/applications/${application.id}`}>
                    <GlassButton variant="outline" size="sm" className="flex items-center gap-2">
                      <Eye size={14} />
                      Détails
                    </GlassButton>
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <GlassCard className="p-12 text-center">
            <FileText className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune demande trouvée
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedStatus !== 'all' || selectedSfd !== 'all'
                ? "Aucune demande ne correspond à vos critères de recherche."
                : "Vous n'avez pas encore fait de demande d'adhésion."
              }
            </p>
            <Link href="/tontines">
              <GlassButton>
                <Plus size={16} className="mr-2" />
                Faire une demande
              </GlassButton>
            </Link>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default MyTontineApplications;