'use client'
import { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Filter,
  Users,
  PiggyBank,
  CreditCard,
  TrendingUp,
  Calendar,
  Target,
  Wallet,
  Activity,
  AlertCircle,
  CheckCircle,
  Plus,
  Eye,
  ArrowUp,
  ArrowDown,
  Clock,
  Smartphone,
  Building,
  Award,
  BarChart3,
  Bell,
  Settings,
  Download,
  UserCheck,
  UserX,
  Search,
  DollarSign,
  FileCheck,
  History,
  XCircle,
  Ban
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Données mockées pour l'agent SFD
const agentSFDData = {
  sfdName: "SFD Porto-Novo",
  agentName: "Marie ADJOVI",
  stats: {
    demandesEnAttente: 12,
    demandesValidees: 6,
    retraitsEnAttente: 8,
    comptesEpargneEnAttente: 5,
    montantEnAttente: 24,
    tauxValidation: 94
  }
};

const pendingMemberships = [
  {
    id: 1,
    clientName: "Fatou KONE",
    tontine: "Tontine ALAFIA",
    montantMise: 1500,
    datedemande: "2025-06-20",
    telephone: "+229 97 12 34 56",
    pieceIdentite: "CNI_123456789.pdf",
    status: "en_attente"
  },
  {
    id: 2,
    clientName: "Aminata DIALLO",
    tontine: "Tontine Entrepreneures",
    montantMise: 2000,
    datedemande: "2025-06-19",
    telephone: "+229 96 78 90 12",
    pieceIdentite: "CNI_987654321.pdf",
    status: "en_attente"
  },
  {
    id: 3,
    clientName: "Ramatou BAKO",
    tontine: "Tontine Commerce",
    montantMise: 1200,
    datedemande: "2025-06-18",
    telephone: "+229 95 45 67 89",
    pieceIdentite: "CNI_456789123.pdf",
    status: "en_attente"
  }
];

const pendingWithdrawals = [
  {
    id: 1,
    clientName: "Fatoumata SAGNA",
    tontine: "Tontine ALAFIA",
    montant: 15000,
    soldeClient: 25000,
    datedemande: "2025-06-20",
    numeroMobileMoney: "+229 97 11 22 33",
    status: "en_attente"
  },
  {
    id: 2,
    clientName: "Mariam TRAORE",
    tontine: "Tontine Entrepreneures",
    montant: 8000,
    soldeClient: 12000,
    datedemande: "2025-06-19",
    numeroMobileMoney: "+229 96 44 55 66",
    status: "en_attente"
  }
];

const pendingSavingsAccounts = [
  {
    id: 1,
    clientName: "Aicha BARRY",
    datedemande: "2025-06-20",
    telephone: "+229 97 33 44 55",
    pieceIdentiteRecto: "CNI_Recto_111.jpg",
    pieceIdentiteVerso: "CNI_Verso_111.jpg",
    photoIdentite: "Photo_ID_111.jpg",
    status: "en_attente"
  },
  {
    id: 2,
    clientName: "Kadidja CAMARA",
    datedemande: "2025-06-19",
    telephone: "+229 96 66 77 88",
    pieceIdentiteRecto: "CNI_Recto_222.jpg",
    pieceIdentiteVerso: "CNI_Verso_222.jpg",
    photoIdentite: "Photo_ID_222.jpg",
    status: "en_attente"
  }
];

const recentActions = [
  {
    id: 1,
    action: "Validation adhésion",
    client: "Zeinab OUEDRAOGO",
    tontine: "Tontine ALAFIA",
    date: "2025-06-20",
    type: "validation"
  },
  {
    id: 2,
    action: "Rejet retrait",
    client: "Salimata CISSE",
    montant: 50000,
    raison: "Fonds insuffisants SFD",
    date: "2025-06-19",
    type: "rejet"
  },
  {
    id: 3,
    action: "Validation compte épargne",
    client: "Rokiatou FALL",
    date: "2025-06-18",
    type: "validation"
  }
];

const AgentSFDDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'adhesions' | 'retraits' | 'epargne' | 'historique'>('adhesions');

  const handleValidateAdhesion = (id: number) => {
    console.log(`Validation adhésion ID: ${id}`);
    // Ici vous ajouteriez la logique pour valider l'adhésion
  };

  const handleRejectAdhesion = (id: number) => {
    console.log(`Rejet adhésion ID: ${id}`);
    // Ici vous ajouteriez la logique pour rejeter l'adhésion
  };

  const handleValidateWithdrawal = (id: number) => {
    console.log(`Validation retrait ID: ${id}`);
    // Ici vous ajouteriez la logique pour valider le retrait
  };

  const handleRejectWithdrawal = (id: number) => {
    console.log(`Rejet retrait ID: ${id}`);
    // Ici vous ajouteriez la logique pour rejeter le retrait
  };

  const handleValidateSavingsAccount = (id: number) => {
    console.log(`Validation compte épargne ID: ${id}`);
    // Ici vous ajouteriez la logique pour valider le compte épargne
  };

  const handleRejectSavingsAccount = (id: number) => {
    console.log(`Rejet compte épargne ID: ${id}`);
    // Ici vous ajouteriez la logique pour rejeter le compte épargne
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6 border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Demandes d'adhésion en attente</p>
                <p className="text-2xl font-bold text-orange-600">{agentSFDData.stats.demandesEnAttente}</p>
                <p className="text-xs text-gray-500">À traiter</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="text-orange-600" size={24} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Demandes de retraits en attente</p>
                <p className="text-2xl font-bold text-green-600">{agentSFDData.stats.demandesValidees}</p>
                <p className="text-xs text-gray-500">À traiter</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Demandes de création de comptes en attente</p>
                <p className="text-2xl font-bold text-blue-600">{agentSFDData.stats.comptesEpargneEnAttente}</p>
                <p className="text-xs text-gray-500">À traiter</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="text-blue-600" size={24} />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Navigation par onglets */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            {[
              { id: 'adhesions', label: 'Demandes d\'adhésion', icon: UserCheck },
              { id: 'retraits', label: 'Demandes de retrait', icon: ArrowDown },
              { id: 'epargne', label: 'Comptes épargne', icon: PiggyBank },
              { id: 'historique', label: 'Historique', icon: History }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium text-sm transition-all",
                  activeTab === tab.id
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <tab.icon size={16} className="mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/60"
            />
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'adhesions' && (
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <UserCheck className="mr-3 text-emerald-600" size={24} />
                    Demandes d'adhésion ({pendingMemberships.length})
                  </h2>
                </div>

                <div className="space-y-4">
                  {pendingMemberships.map((demande) => (
                    <div key={demande.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{demande.clientName}</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Tontine:</span> {demande.tontine}
                            </div>
                            <div>
                              <span className="font-medium">Mise:</span> {demande.montantMise.toLocaleString()} FCFA
                            </div>
                            <div>
                              <span className="font-medium">Téléphone:</span> {demande.telephone}
                            </div>
                            <div>
                              <span className="font-medium">Date:</span> {format(new Date(demande.datedemande), 'dd/MM/yyyy', { locale: fr })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <GlassButton
                          size="sm"
                          variant="outline"
                          onClick={() => console.log(`Voir pièce: ${demande.pieceIdentite}`)}
                        >
                          <Eye size={16} className="mr-1" />
                          Voir pièce
                        </GlassButton>
                        <GlassButton
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleValidateAdhesion(demande.id)}
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Valider
                        </GlassButton>
                        <GlassButton
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleRejectAdhesion(demande.id)}
                        >
                          <XCircle size={16} className="mr-1" />
                          Rejeter
                        </GlassButton>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {activeTab === 'retraits' && (
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <ArrowDown className="mr-3 text-emerald-600" size={24} />
                    Demandes de retrait ({pendingWithdrawals.length})
                  </h2>
                </div>

                <div className="space-y-4">
                  {pendingWithdrawals.map((retrait) => (
                    <div key={retrait.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{retrait.clientName}</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Tontine:</span> {retrait.tontine}
                            </div>
                            <div>
                              <span className="font-medium">Montant demandé:</span> {retrait.montant.toLocaleString()} FCFA
                            </div>
                            <div>
                              <span className="font-medium">Solde client:</span> {retrait.soldeClient.toLocaleString()} FCFA
                            </div>
                            <div>
                              <span className="font-medium">Mobile Money:</span> {retrait.numeroMobileMoney}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <p className="text-sm text-blue-700">
                          <strong>Vérification:</strong> Assurez-vous que le SFD dispose de fonds suffisants sur Mobile Money pour effectuer ce retrait.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <GlassButton
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleValidateWithdrawal(retrait.id)}
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Approuver retrait
                        </GlassButton>
                        <GlassButton
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleRejectWithdrawal(retrait.id)}
                        >
                          <Ban size={16} className="mr-1" />
                          Rejeter
                        </GlassButton>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {activeTab === 'epargne' && (
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <PiggyBank className="mr-3 text-emerald-600" size={24} />
                    Comptes épargne en attente ({pendingSavingsAccounts.length})
                  </h2>
                </div>

                <div className="space-y-4">
                  {pendingSavingsAccounts.map((compte) => (
                    <div key={compte.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{compte.clientName}</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Téléphone:</span> {compte.telephone}
                            </div>
                            <div>
                              <span className="font-medium">Date demande:</span> {format(new Date(compte.datedemande), 'dd/MM/yyyy', { locale: fr })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <GlassButton
                          size="sm"
                          variant="outline"
                          onClick={() => console.log(`Voir recto: ${compte.pieceIdentiteRecto}`)}
                        >
                          <Eye size={16} className="mr-1" />
                          Recto CNI
                        </GlassButton>
                        <GlassButton
                          size="sm"
                          variant="outline"
                          onClick={() => console.log(`Voir verso: ${compte.pieceIdentiteVerso}`)}
                        >
                          <Eye size={16} className="mr-1" />
                          Verso CNI
                        </GlassButton>
                        <GlassButton
                          size="sm"
                          variant="outline"
                          onClick={() => console.log(`Voir photo: ${compte.photoIdentite}`)}
                        >
                          <Eye size={16} className="mr-1" />
                          Photo ID
                        </GlassButton>
                      </div>

                      <div className="flex items-center gap-3">
                        <GlassButton
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleValidateSavingsAccount(compte.id)}
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Valider compte
                        </GlassButton>
                        <GlassButton
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleRejectSavingsAccount(compte.id)}
                        >
                          <XCircle size={16} className="mr-1" />
                          Rejeter
                        </GlassButton>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {activeTab === 'historique' && (
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <History className="mr-3 text-emerald-600" size={24} />
                    Historique des actions
                  </h2>
                </div>

                <div className="space-y-3">
                  {recentActions.map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.type === 'validation' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                          {action.type === 'validation' ? (
                            <CheckCircle className="text-green-600" size={20} />
                          ) : (
                            <XCircle className="text-red-600" size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{action.action}</p>
                          <div className="text-sm text-gray-500">
                            <span>Client: {action.client}</span>
                            {action.tontine && <span> • Tontine: {action.tontine}</span>}
                            {action.montant && <span> • Montant: {action.montant.toLocaleString()} FCFA</span>}
                            {action.raison && <span> • Raison: {action.raison}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{format(new Date(action.date), 'dd/MM/yyyy', { locale: fr })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

          {/* Sidebar droite */}
          <div className="space-y-6">
            {/* Alertes */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bell className="mr-2 text-orange-600" size={20} />
                Alertes
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <AlertCircle className="text-orange-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Demandes urgentes</p>
                    <p className="text-xs text-orange-600">5 demandes en attente depuis plus de 24h</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="text-blue-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Délai de traitement</p>
                    <p className="text-xs text-blue-600">Temps moyen: 2h 15min</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentSFDDashboard;