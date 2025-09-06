'use client';
import React, { useState } from 'react';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Shield, 
  Settings, 
  Activity,
  Database,
  Search,
  Filter,
  MoreVertical,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  Globe,
  CreditCard,
  PiggyBank,
  FileText,
  MapPin,
  Phone,
  Mail,
  LucideIcon
} from 'lucide-react';
import Link from 'next/link';
// Types et interfaces
type SFDStatus = 'active' | 'pending' | 'suspended' | 'maintenance';

type SFDRegion = 'Littoral' | 'Atlantique' | 'Ouémé' | 'Zou' | 'Borgou';

interface SFD {
  id: number;
  name: string;
  fullName: string;
  status: SFDStatus;
  region: SFDRegion;
  address: string;
  phone: string;
  email: string;
  adminName: string;
  adminPhone: string;
  joinDate: string;
  lastActivity: string;
  tontinesCount: number;
  membersCount: number;
  totalVolume: number;
  transactionsCount: number;
  savingsAccounts: number;
  activeLoans: number;
  description: string;
}

interface Stats {
  totalSFDs: number;
  activeSFDs: number;
  pendingSFDs: number;
  suspendedSFDs: number;
}

type StatusLabels = {
  [key in SFDStatus]: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: 'primary' | 'secondary' | 'warning' | 'destructive';
  trend?: number;
}

interface SFDCardProps {
  sfd: SFD;
  onViewDetails: (sfd: SFD) => void;
}

interface SFDDetailModalProps {
  sfd: SFD | null;
  onClose: () => void;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

const SFDManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedSFD, setSelectedSFD] = useState<SFD | null>(null);

  // Données simulées des SFD
  const sfds: SFD[] = [
    {
      id: 1,
      name: "CLCAM",
      fullName: "Caisse Locale de Crédit Agricole Mutuel",
      status: "active",
      region: "Littoral",
      address: "Cotonou, Akpakpa",
      phone: "+229 21 30 45 67",
      email: "contact@clcam.bj",
      adminName: "Adjovi Mensah",
      adminPhone: "+229 97 12 34 56",
      joinDate: "2023-01-15",
      lastActivity: "2024-12-01T15:30:00",
      tontinesCount: 12,
      membersCount: 3247,
      totalVolume: 45678900,
      transactionsCount: 12456,
      savingsAccounts: 1890,
      activeLoans: 234,
      description: "Coopérative financière spécialisée dans l'agriculture et les services financiers ruraux."
    },
    {
      id: 2,
      name: "Coopec Atlantique",
      fullName: "Coopérative d'Épargne et de Crédit Atlantique",
      status: "active",
      region: "Atlantique",
      address: "Allada, Centre-ville",
      phone: "+229 21 40 55 78",
      email: "info@coopec-atlantique.bj",
      adminName: "Rosine Dossou",
      adminPhone: "+229 96 45 67 89",
      joinDate: "2023-03-22",
      lastActivity: "2024-12-01T14:20:00",
      tontinesCount: 8,
      membersCount: 2156,
      totalVolume: 32145600,
      transactionsCount: 8234,
      savingsAccounts: 1245,
      activeLoans: 156,
      description: "Coopérative d'épargne et de crédit au service des communautés locales."
    },
    {
      id: 3,
      name: "Fescoop",
      fullName: "Fédération des Coopératives d'Épargne et de Crédit",
      status: "pending",
      region: "Zou",
      address: "Bohicon, Quartier Gare",
      phone: "+229 21 50 60 89",
      email: "admin@fescoop.bj",
      adminName: "Kodjo Ahomadegbé",
      adminPhone: "+229 95 78 90 12",
      joinDate: "2024-11-28",
      lastActivity: "2024-11-30T10:15:00",
      tontinesCount: 5,
      membersCount: 890,
      totalVolume: 12450000,
      transactionsCount: 2345,
      savingsAccounts: 456,
      activeLoans: 67,
      description: "Fédération regroupant plusieurs coopératives de la région du Zou."
    },
    {
      id: 4,
      name: "Vital Finance",
      fullName: "Institution de Microfinance Vital Finance",
      status: "maintenance",
      region: "Ouémé",
      address: "Porto-Novo, Quartier Tokpota",
      phone: "+229 21 60 70 90",
      email: "support@vitalfinance.bj",
      adminName: "Espérance Kpohomou",
      adminPhone: "+229 94 23 45 67",
      joinDate: "2023-07-10",
      lastActivity: "2024-11-29T08:45:00",
      tontinesCount: 6,
      membersCount: 1654,
      totalVolume: 25432100,
      transactionsCount: 5678,
      savingsAccounts: 987,
      activeLoans: 123,
      description: "Institution de microfinance axée sur le développement économique local."
    },
    {
      id: 5,
      name: "PADME Microfinance",
      fullName: "Programme d'Appui au Développement des Micro-Entreprises",
      status: "suspended",
      region: "Borgou",
      address: "Parakou, Centre commercial",
      phone: "+229 21 70 80 01",
      email: "contact@padme.bj",
      adminName: "Ibrahim Moumouni",
      adminPhone: "+229 93 56 78 90",
      joinDate: "2023-05-18",
      lastActivity: "2024-11-20T16:00:00",
      tontinesCount: 3,
      membersCount: 1234,
      totalVolume: 18765400,
      transactionsCount: 3456,
      savingsAccounts: 678,
      activeLoans: 89,
      description: "Microfinance spécialisée dans l'accompagnement des micro-entreprises."
    }
  ];

  const stats: Stats = {
    totalSFDs: 23,
    activeSFDs: 18,
    pendingSFDs: 3,
    suspendedSFDs: 2
  };

  const statusLabels: StatusLabels = {
    active: 'Actif',
    pending: 'En attente',
    suspended: 'Suspendu',
    maintenance: 'Maintenance'
  };

  const regions: (SFDRegion | 'all')[] = ['all', 'Littoral', 'Atlantique', 'Ouémé', 'Zou', 'Borgou'];
  const statuses: (SFDStatus | 'all')[] = ['all', 'active', 'pending', 'suspended', 'maintenance'];

  const filteredSFDs: SFD[] = sfds.filter(sfd => {
    const matchesSearch = sfd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sfd.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sfd.adminName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || sfd.status === selectedStatus;
    const matchesRegion = selectedRegion === 'all' || sfd.region === selectedRegion;
    
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedStatus(e.target.value);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedRegion(e.target.value);
  };

  const handleViewDetails = (sfd: SFD): void => {
    setSelectedSFD(sfd);
  };

  const handleCloseModal = (): void => {
    setSelectedSFD(null);
  };

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color = "primary", trend }) => (
    <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-archivo text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={`text-xs font-archivo mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend}% ce mois
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color === 'primary' ? 'bg-primary/10' : color === 'secondary' ? 'bg-accent/20' : color === 'warning' ? 'bg-yellow-100' : 'bg-destructive/10'}`}>
          <Icon className={`w-6 h-6 ${color === 'primary' ? 'text-primary' : color === 'secondary' ? 'text-accent-foreground' : color === 'warning' ? 'text-yellow-600' : 'text-destructive'}`} />
        </div>
      </div>
    </div>
  );

  const SFDCard: React.FC<SFDCardProps> = ({ sfd, onViewDetails }) => {
    const getStatusBadge = (status: SFDStatus): React.ReactElement => {
      const styles: Record<SFDStatus, string> = {
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        suspended: 'bg-red-100 text-red-800',
        maintenance: 'bg-blue-100 text-blue-800'
      };
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-archivo font-medium ${styles[status]}`}>
          {statusLabels[status]}
        </span>
      );
    };

    const getStatusIcon = (status: SFDStatus): React.ReactElement => {
      const icons: Record<SFDStatus, React.ReactElement> = {
        active: <CheckCircle className="w-4 h-4 text-green-500" />,
        pending: <Clock className="w-4 h-4 text-yellow-500" />,
        suspended: <XCircle className="w-4 h-4 text-red-500" />,
        maintenance: <AlertTriangle className="w-4 h-4 text-blue-500" />
      };
      
      return icons[status];
    };

    return (
      <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{sfd.name}</h3>
              <p className="text-sm font-archivo text-muted-foreground">{sfd.region}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(sfd.status)}
            {getStatusBadge(sfd.status)}
          </div>
        </div>

        <p className="text-sm font-archivo text-muted-foreground mb-4 line-clamp-2">
          {sfd.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs font-archivo text-muted-foreground">Membres</p>
              <p className="text-sm font-archivo font-medium">{sfd.membersCount.toLocaleString('fr-FR')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <PiggyBank className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs font-archivo text-muted-foreground">Tontines</p>
              <p className="text-sm font-archivo font-medium">{sfd.tontinesCount}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs font-archivo text-muted-foreground">Transactions</p>
              <p className="text-sm font-archivo font-medium">{sfd.transactionsCount.toLocaleString('fr-FR')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs font-archivo text-muted-foreground">Volume (FCFA)</p>
              <p className="text-sm font-archivo font-medium">{(sfd.totalVolume / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-archivo text-muted-foreground">Administrateur</span>
            <span className="text-xs font-archivo font-medium">{sfd.adminName}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-archivo text-muted-foreground">Dernière activité</span>
            <span className="text-xs font-archivo font-medium">
              {new Date(sfd.lastActivity).toLocaleDateString('fr-FR')}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onViewDetails(sfd)}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="font-archivo text-sm">Détails</span>
            </button>
            <button className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Edit className="w-4 h-4 text-primary" />
            </button>
            <button className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SFDDetailModal: React.FC<SFDDetailModalProps> = ({ sfd, onClose }) => {
    if (!sfd) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{sfd.name}</h2>
                  <p className="text-sm font-archivo text-muted-foreground">{sfd.fullName}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations générales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Informations générales</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-archivo text-muted-foreground">Adresse</p>
                      <p className="text-sm font-archivo">{sfd.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-archivo text-muted-foreground">Téléphone</p>
                      <p className="text-sm font-archivo">{sfd.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-archivo text-muted-foreground">Email</p>
                      <p className="text-sm font-archivo">{sfd.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-archivo text-muted-foreground">Date d'inscription</p>
                      <p className="text-sm font-archivo">{new Date(sfd.joinDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Administrateur */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Administrateur</h3>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-archivo font-medium">{sfd.adminName}</p>
                      <p className="text-sm font-archivo text-muted-foreground">Administrateur SFD</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3 h-3 text-gray-500" />
                      <span className="text-sm font-archivo">{sfd.adminPhone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Statistiques</h3>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-700">{sfd.membersCount.toLocaleString('fr-FR')}</p>
                  <p className="text-xs font-archivo text-blue-600">Membres</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <PiggyBank className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-700">{sfd.tontinesCount}</p>
                  <p className="text-xs font-archivo text-green-600">Tontines</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <CreditCard className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-700">{sfd.savingsAccounts.toLocaleString('fr-FR')}</p>
                  <p className="text-xs font-archivo text-purple-600">Comptes épargne</p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <FileText className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-700">{sfd.activeLoans}</p>
                  <p className="text-xs font-archivo text-orange-600">Prêts actifs</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-archivo text-sm">
                  Modifier
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-archivo text-sm">
                  Activer
                </button>
                <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-archivo text-sm">
                  Suspendre
                </button>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-archivo text-sm">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const navItems: NavItem[] = [
    { icon: Activity, label: 'Vue d\'ensemble' },
    { icon: Users, label: 'Gestion utilisateurs' },
    { icon: Building2, label: 'Gestion SFD', active: true },
    { icon: TrendingUp, label: 'Analytics' },
    { icon: Database, label: 'Logs & Audit' },
    { icon: Globe, label: 'Intégrations' },
    { icon: Settings, label: 'Paramètres' },
  ];

  return (
    <div className="min-h-screen">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Gestion des SFD
                </h1>
                <p className="font-archivo text-muted-foreground">
                  Gérez les Systèmes Financiers Décentralisés partenaires
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="font-archivo text-sm">Rapport</span>
                </button>
                <Link href="/dashboards/dashboard-admin_tontiflex/sfd/new-sfd">
                <button 
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-archivo text-sm">Nouveau SFD</span>
                </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total SFD"
              value={stats.totalSFDs}
              icon={Building2}
              trend={5}
            />
            <StatCard
              title="SFD actifs"
              value={stats.activeSFDs}
              icon={CheckCircle}
              color="secondary"
              trend={8}
            />
            <StatCard
              title="En attente"
              value={stats.pendingSFDs}
              icon={Clock}
              color="warning"
            />
            <StatCard
              title="Suspendus"
              value={stats.suspendedSFDs}
              icon={XCircle}
              color="destructive"
              trend={-2}
            />
          </div>

          {/* Filtres et recherche */}
          <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-lg p-6 shadow-lg mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher un SFD..."
                    className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                
                <select
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedStatus}
                  onChange={handleStatusChange}
                >
                  <option value="all">Tous les statuts</option>
                  {statuses.filter(status => status !== 'all').map(status => (
                    <option key={status} value={status}>
                      {statusLabels[status as SFDStatus]}
                    </option>
                  ))}
                </select>
                
                <select
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedRegion}
                  onChange={handleRegionChange}
                >
                  <option value="all">Toutes les régions</option>
                  {regions.filter(region => region !== 'all').map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-archivo text-sm text-muted-foreground">
                  {filteredSFDs.length} SFD{filteredSFDs.length > 1 ? 's' : ''}
                </span>
                <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4 text-primary" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid des SFD */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredSFDs.map((sfd) => (
              <SFDCard key={sfd.id} sfd={sfd} onViewDetails={handleViewDetails} />
            ))}
          </div>

          {filteredSFDs.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun SFD trouvé</h3>
              <p className="font-archivo text-gray-500">Essayez de modifier vos critères de recherche</p>
            </div>
          )}

          {/* Modal de détails */}
          <SFDDetailModal sfd={selectedSFD} onClose={handleCloseModal} />
        </div>
      </div>
    </div>
  );
};

export default SFDManagement;