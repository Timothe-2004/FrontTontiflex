'use client'
import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { mockTransactionHistory, mockTontines } from '@/data/mockData';
import Link from 'next/link';
import MyTontines from '@/components/tontines/MyTontines';
import { useTontines } from '@/hooks/useTontines';
import { MyTontine } from '@/types/tontines';
import MyTransactions from '@/components/tontines/MyTransactions';

const ModernDashboard = () => {
  // Données enrichies pour le dashboard
  const dashboardStats = {
    totalTontines: 4,
    comptesEpargne: 2,
    montantEpargne: 1500000,
    soldeTotal: 245000,
    cotisationsMois: 46500,
    prochaineCotisation: "Aujourd'hui",
    scoreFiabilite: 85,
    rangTontine: 3,
    derniereCotisation: "2025-06-12",
    prochaineCycle: "2025-07-15"
  };
  const [filterType, setFilterType] = useState("tous");
  const [filterStatus, setFilterStatus] = useState("tous");
  const [timeRange, setTimeRange] = useState("30j");

  const filteredTransactions = mockTransactionHistory.filter(transaction => {
      const typeMatch = filterType === "tous" || transaction.type.toLowerCase().includes(filterType.toLowerCase());
      const statusMatch = filterStatus === "tous" || transaction.statut.toLowerCase() === filterStatus.toLowerCase();
      return typeMatch && statusMatch;
  });
  const [myTontines, setMyTontines] = useState<MyTontine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchMyTontines } = useTontines();

  useEffect(() => {
    const loadTontines = async () => {
      try {
        setLoading(true);
        const data = await fetchMyTontines();
        setMyTontines(data);
      } catch (err) {
        setError('Failed to load tontines');
        console.error('Error loading tontines:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTontines();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Stats cards principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tontines actives</p>
                <p className="text-2xl font-bold text-blue-600">{myTontines.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-6 border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Comptes courant</p>
                <p className="text-2xl font-bold text-emerald-600">2</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <PiggyBank className="text-emerald-600" size={24} />
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-6 border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Prêts en cours</p>
                <p className="text-2xl font-bold text-purple-600">2</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <PiggyBank className="text-purple-600" size={24} />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Section principale en grille */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonnes principales */}
          <div className="lg:col-span-2 space-y-8">
            <MyTontines />
          </div>
          {/* Sidebar droite avec informations utiles */}
          <div className="space-y-6">
            {/* Actions rapides améliorées */}
            <GlassCard className="p-6" hover={false}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
            <div className="space-y-3">
              <Link href="/dashboards/dashboard-client/saving-accounts/new">
                  <GlassButton variant="outline" className="w-full h-12 text-left justify-start border-2">
                  <PiggyBank className="mr-3" size={20} />
                  <div>
                    <div className="font-medium">Épargner</div>
                    <div className="text-xs text-gray-500">Ouvrir un compte courant</div>
                  </div>
                </GlassButton>
              </Link>
              </div>
            </GlassCard>

            {/* Rappels et alertes */}
            <GlassCard className="p-6" hover={false}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bell className="mr-2 text-orange-600" size={20} />
                Rappels
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <AlertCircle className="text-orange-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Cotisation due</p>
                    <p className="text-xs text-orange-600">Tontine Femmes Entrepreneures - Aujourd'hui</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="text-blue-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Nouveau cycle</p>
                    <p className="text-xs text-blue-600">Débute le {format(new Date(dashboardStats.prochaineCycle), 'dd MMM', { locale: fr })}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="text-green-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium text-green-800">Score excellent</p>
                    <p className="text-xs text-green-600">Félicitations pour votre régularité!</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
        <div className='mt-8' >
                <div className="">
                <MyTransactions />
                </div>

                <div className="mt-6 text-center">
                    <Link href="/dashboards/dashboard-client/operations-history">
                        <GlassButton variant="outline">
                            Voir tout l'historique
                        </GlassButton>
                    </Link>
                </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;