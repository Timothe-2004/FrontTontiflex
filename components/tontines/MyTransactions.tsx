'use client';

import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useClientsAPI } from '@/hooks/useClients';

const MyTransactions = () => {
    const {
        myTransactionHistory,
        loading: loadingTransactions,
        fetchMyTransactionHistory
    } = useClientsAPI();

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

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-black flex items-center">
                    Historique des Opérations
                </h2>
            </div>

            <div className="space-y-3">
                {loadingTransactions ? (
                    <div className="text-center py-10 text-gray-500">Chargement des transactions...</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {myTransactionHistory.length === 0 ? (
                            <p className="text-gray-500 text-center">Aucune transaction à afficher.</p>
                        ) : (
                            myTransactionHistory.slice(0, 5).map((transaction, index) => (
                                <div
                                    key={`${transaction.id}-${index}`}
                                    className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${transaction.montant > 0 ? 'bg-green-100' : 'bg-red-100'
                                                }`}
                                        >
                                            {transaction.montant > 0 ? (
                                                <ArrowUp className="text-green-600" size={20} />
                                            ) : (
                                                <ArrowDown className="text-red-600" size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {transaction.type_libelle || 'Transaction'}
                                            </p>
                                            <p className="font-medium text-sm text-gray-500">
                                                {transaction.description}
                                            </p>
                                            <div className="text-sm text-gray-500">
                                                <div className="text-sm text-gray-500">
                                                {transaction.date_creation && !isNaN(new Date(transaction.date_creation).getTime()) ? (
  format(
    new Date(transaction.date_creation),
    'dd MMM yyyy à HH:mm',
    { locale: fr }
  )
) : (
  'Date invalide'
)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className={`font-bold text-lg ${transaction.montant > 0
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                }`}
                                        >
                                            {transaction.montant > 0 ? '+' : ''}
                                            {transaction.montant.toLocaleString()} FCFA
                                        </p>
                                        <div
                                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${transaction.statut === 'success'
                                                    ? 'bg-green-100 text-green-700'
                                                    : transaction.statut === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {transaction.statut_libelle || transaction.statut}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTransactions;
