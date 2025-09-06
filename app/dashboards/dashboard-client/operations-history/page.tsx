'use client'
import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    FileText,
    Filter,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useClientsAPI } from '@/hooks/useClients';

const Transactions= () => {
    const [filterType, setFilterType] = useState("tous");
    const [filterStatus, setFilterStatus] = useState("tous");
    const [timeRange, setTimeRange] = useState("30j");
    const { myTransactionHistory, loading: loadingTransactions, fetchMyTransactionHistory } = useClientsAPI();
    useEffect(() => {
        const loadTransactions = async () => {
            try {
                await fetchMyTransactionHistory();
            } catch (error) {
                console.error('Erreur lors du chargement des transactions:', error);
            }
        };
    
     loadTransactions();
    }, []);
    const filteredTransactions = myTransactionHistory
        .filter(transaction => {
            const typeMatch = filterType === "tous" || 
                (transaction.type_libelle?.toLowerCase() || '').includes(filterType.toLowerCase());
            const statusMatch = filterStatus === "tous" || 
                (transaction.statut_libelle?.toLowerCase() || '').includes(filterStatus.toLowerCase());
            return typeMatch && statusMatch;
        })
        .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());
    return (
        <div>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-black flex items-center">
                        Historique des Opérations
                    </h2>
                    <div className="flex gap-3">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[120px] bg-white/60">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7j">7 jours</SelectItem>
                                <SelectItem value="30j">30 jours</SelectItem>
                                <SelectItem value="90j">3 mois</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[140px] bg-white/60">
                                <Filter className="mr-2" size={16} />
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tous">Tous types</SelectItem>
                                <SelectItem value="contribution">Contribution</SelectItem>
                                <SelectItem value="retrait">Retrait</SelectItem>
                                <SelectItem value="dépôt">Dépôt Épargne</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    {loadingTransactions ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">
                            Aucune transaction trouvée
                        </div>
                    ) : (
                        filteredTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-sm transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${transaction.montant > 0 ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                    {transaction.montant > 0 ? (
                                        <ArrowUp className="text-green-600" size={20} />
                                    ) : (
                                        <ArrowDown className="text-red-600" size={20} />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{transaction.type_libelle || 'Transaction'}</p>
                                    <p className="font-medium text-sm text-gray-500 mb-">{transaction.description}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>
                                            {transaction.date_creation && !isNaN(new Date(transaction.date_creation).getTime()) ? (
                                                format(
                                                    new Date(transaction.date_creation),
                                                    'dd MMM yyyy à HH:mm',
                                                    { locale: fr }
                                                )
                                            ) : (
                                                'Date invalide'
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold text-lg ${transaction.montant > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {transaction.montant > 0 ? '+' : ''}{transaction.montant.toLocaleString()} FCFA
                                </p>
                                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                    transaction.statut === 'success' ? 'bg-green-100 text-green-700' :
                                    transaction.statut === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {transaction.statut_libelle || transaction.statut}
                                </div>
                            </div>
                        </div>
                    )))}
                </div>
            </div>
        </div>
    )
}

export default Transactions
                                