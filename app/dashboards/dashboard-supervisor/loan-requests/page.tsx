'use client'
import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Filter,
  Search,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  User,
  DollarSign,
  Calendar,
  Send,
  Download,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLoansApplications } from '@/hooks/useLoansApplications';

const LoanRequestsPage = () => {
  const [filterStatus, setFilterStatus] = useState("tous");
  const [filterUrgency, setFilterUrgency] = useState("tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

const { applications, fetchApplications } = useLoansApplications();
useEffect(() => {
  fetchApplications({ statut: 'soumis' });
}, []);
  const filteredRequests = applications
    .filter(request => {
      const statusMatch = filterStatus === "tous" || request.statut === filterStatus;
      const urgencyMatch = filterUrgency === "tous" || request.type_pret === filterUrgency;
      const searchMatch = searchTerm === "" ||
        request.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.id.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && urgencyMatch && searchMatch;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = new Date(a.date_soumission).getTime() - new Date(b.date_soumission).getTime();
          break;
        case "amount":
          comparison = Number(a.montant_souhaite) - Number(b.montant_souhaite);
          break;
        case "score":
          comparison = Number(a.ratio_endettement) - Number(b.ratio_endettement);
          break;
        case "name":
          comparison = a.nom.localeCompare(b.nom);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'soumis':
        return <Clock className="text-orange-600" size={16} />;
      case 'en_cours_examen':
        return <Eye className="text-blue-600" size={16} />;
      case 'transfere_admin':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'rejected':
        return <XCircle className="text-red-600" size={16} />;
      case 'transferred':
        return <Send className="text-purple-600" size={16} />;
      default:
        return <Clock className="text-gray-600" size={16} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'soumis':
        return 'En attente';
      case 'en_cours_examen':
        return 'En cours d\'examen';
      case 'transfere_admin':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      case 'transferred':
        return 'Transféré';
      default:
        return status;
    }
  };


  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Demandes de Prêt</h1>
            <p className="text-gray-600">Examinez et gérez les demandes de financement</p>
          </div>
          <div className="flex items-center gap-3">
            <GlassButton variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Exporter
            </GlassButton>
            <GlassButton variant="outline" size="sm">
              <RefreshCw size={16} className="mr-2" />
              Actualiser
            </GlassButton>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total demandes</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
              <FileText className="text-emerald-600" size={24} />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {applications.filter(r => r.statut === 'soumis').length}
                </p>
              </div>
              <Clock className="text-orange-600" size={24} />
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Montant total</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {(applications.reduce((sum, r) => Number(sum) + Number(r.montant_souhaite), 0) / 1000000).toFixed(1)}
                </p>
              </div>
              <DollarSign className="text-emerald-600" size={24} />
            </div>
          </GlassCard>
        </div>

        {/* Filtres et recherche */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="text-emerald-600" size={20} />
              <span className="text-emerald-600 font-medium">Filtres :</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Recherche */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Rechercher par nom, profession ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/60"
                />
              </div>

              {/* Filtre par statut */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 bg-white/60">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous statuts</SelectItem>
                  <SelectItem value="soumis">En attente</SelectItem>
                  <SelectItem value="en_cours_examen">En cours</SelectItem>
                  <SelectItem value="transfere_admin">Approuvé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                  <SelectItem value="transferred">Transféré</SelectItem>
                </SelectContent>
              </Select>

              {/* Tri */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-white/60">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date de demande</SelectItem>
                  <SelectItem value="amount">Montant</SelectItem>
                  <SelectItem value="score">Score fiabilité</SelectItem>
                  <SelectItem value="name">Nom client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Liste des demandes */}
        <GlassCard className="p-6" hover={false}>
          <div className="space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <div key={request.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Informations client */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{request.nom} {request.prenom}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <User className="mr-1" size={14} />
                              {request.situation_professionnelle}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="mr-1" size={14} />
                              {format(new Date(request.date_soumission), 'dd MMM yyyy', { locale: fr })}
                            </div>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium text-nowrap ${getScoreColor(Number(request.ratio_endettement))}`}>
                            Score: {request.ratio_endettement}/100
                          </span>
                        </div>
                      </div>

                      {/* Détails de la demande */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-emerald-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Montant demandé</p>
                          <p className="font-bold text-emerald-600">{request.montant_souhaite.toLocaleString()} FCFA</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Durée</p>
                          <p className="font-bold text-blue-600">{request.duree_pret} mois</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Revenus mensuels</p>
                          <p className="font-bold text-purple-600">{request.revenu_mensuel.toLocaleString()} FCFA</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Objet du prêt:</p>
                        <p className="text-gray-900">{request.objet_pret}</p>
                      </div>

                      {/* Documents et historique */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Documents fournis:</p>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${request.justificatif_identite ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              Identité
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${request.revenu_mensuel ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              Revenus
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${request.details_garantie ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              Garantie
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Historique épargne: - </p>
                          <div className="text-sm text-gray-700">
                            <span>Score régularité: {request.ratio_endettement}/100</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Statut et actions */}
                    <div className="lg:w-64 lg:text-right">
                      <div className="flex lg:flex-col items-center lg:items-end gap-4">
                        {/* Statut */}
                        <div className="flex items-center gap-2 mb-3">
                          {getStatusIcon(request.statut)}
                          <span className="font-medium text-gray-900">
                            {getStatusLabel(request.statut)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 w-full lg:w-auto">
                          <Link href={`/dashboards/dashboard-supervisor/loan-requests/${request.id}`}>
                            <GlassButton
                              size="sm"
                              className="w-full lg:w-auto bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Eye className="mr-1" size={14} />
                              Examiner
                            </GlassButton>
                          </Link>

                          {request.statut === 'soumis' && (
                            <Link href={`/dashboards/dashboard-supervisor/loan-requests/${request.id}?tab=decision&action=process`}>
                              <GlassButton
                                variant="outline"
                                size="sm"
                                className="w-full lg:w-auto border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                              >
                                <Edit className="mr-1" size={14} />
                                Traiter
                              </GlassButton>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto mb-4 text-gray-400" size={64} />
                <p className="text-gray-600 text-lg mb-4">Aucune demande trouvée</p>
                <p className="text-gray-500">Essayez de modifier les filtres de recherche</p>
              </div>
            )}
          </div>

          {filteredRequests.length > 0 && (
            <div className="mt-6 text-sm text-gray-600 text-center">
              {filteredRequests.length} demande(s) trouvée(s) sur {applications.length} au total
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default LoanRequestsPage;