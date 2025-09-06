'use client';
import React, { useState, useEffect } from 'react';
import { useParticipants } from '@/hooks/useParticipants';
import { useCarnetsCotisation } from '@/hooks/useCarnets';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Calendar, CheckCircle, Star, Clock, Target, X } from 'lucide-react';
import { Tabs, Tab, Card, CardBody } from "@heroui/react";
import { format, addDays, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import ContributionForm from "@/components/forms/ContributionsForm";
import WithdrawalForm from "@/components/forms/WithdrawalForm";
import {
    ArrowLeft, Building, TrendingUp, CreditCard, FileText, AlertCircle, Plus, Minus, Wallet, Activity, Loader2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from 'sonner';
import { useClientsAPI } from '@/hooks/useClients';
import { useRetraits } from '@/hooks/useWithdrawals';
import { CreateRetraitData } from '@/types/retraits';

const TontineDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const participantId = params.id as string;

    const { participantDetails, loading, error, fetchParticipantDetailsComplets, createCotisationForPayment, confirmPayment } = useParticipants();
    const { createRetrait } = useRetraits();
    const { loading: carnetLoading } = useCarnetsCotisation();
    const { myTransactionHistory, loading: loadingTransactions, fetchMyTransactionHistory } = useClientsAPI();
    const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
    const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
const [processing, setProcessing] = useState(false);
    useEffect(() => {
        if (participantId) {
            fetchParticipantDetailsComplets(participantId);
        }
    }, []);
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
    // 🆕 Fonction pour gérer la cotisation avec KKiaPay
    const handleCotisationSubmit = async (nombreMises: number, cotisationData: any) => {
        try {
            console.log('📝 Soumission cotisation:', { nombreMises, cotisationData });

            // Créer la cotisation (sans paiement pour l'instant)
            const response = await createCotisationForPayment(participantId, {
                nombre_mises: nombreMises,
                numero_telephone: cotisationData.numero_telephone,
                commentaire: cotisationData.commentaire || `Cotisation - ${nombreMises} mise(s)`
            });

            console.log('✅ Réponse cotisation:', response);
            return response;

        } catch (error) {
            console.error('❌ Erreur création cotisation:', error);
            throw error;
        }
    };

    // 🆕 Callback de succès de paiement KKiaPay
    const handlePaymentSuccess = async (kkiapayResponse: any, cotisationData: any) => {
        try {
            console.log('🎉 Paiement réussi, confirmation en cours...', kkiapayResponse);
            // Confirmer le paiement auprès du backend
            await confirmPayment({
                kkiapay_transaction_id: kkiapayResponse.transactionId,
                internal_transaction_id: participantDetails?.id || '',
                reference: `REF-${Date.now()}`,
                amount: cotisationData.nombre_mises * parseFloat(participantDetails?.montantMise || '0'),
                phone: cotisationData.numero_telephone,
                status: 'success',
                timestamp: new Date().toISOString(),
                cotisation_data: cotisationData
            });

            // Rafraîchir les détails du participant
            await fetchParticipantDetailsComplets(participantId);

            toast.success('🎉 Cotisation confirmée et enregistrée avec succès!', {
                position: 'top-center'
            });

        } catch (error) {
            console.error('❌ Erreur confirmation paiement:', error);
        }
    };

    // 🆕 Callback d'erreur de paiement KKiaPay
    const handlePaymentError = (error: any) => {
        console.log('❌ Erreur de paiement:', error);
        toast.error(`❌ Paiement échoué: ${error.message || 'Erreur inconnue'}`);
    };

    if (loading || carnetLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Chargement des détails...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-6">
                <GlassCard className="max-w-md w-full">
                    <div className="text-center py-8">
                        <AlertCircle className="mx-auto mb-4 text-red-500" size={64} />
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">Erreur de chargement</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <GlassButton
                            onClick={() => fetchParticipantDetailsComplets(participantId)}
                            size="lg"
                        >
                            Réessayer
                        </GlassButton>
                    </div>
                </GlassCard>
            </div>
        );
    }

    if (!participantDetails) {
        return (
            <div className="flex items-center justify-center p-6">
                <GlassCard className="max-w-md w-full">
                    <div className="text-center py-8">
                        <AlertCircle className="mx-auto mb-4 text-red-500" size={64} />
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">Participant introuvable</h2>
                        <p className="text-gray-600 mb-6">Les détails de participation demandés n'existent pas ou ne sont plus accessibles.</p>
                        <GlassButton onClick={() => router.push('/dashboard')} size="lg">
                            Retour au tableau de bord
                        </GlassButton>
                    </div>
                </GlassCard>
            </div>
        );
    }

 const handleWithdraw = async (withdrawData: CreateRetraitData) => {
     try {
       setProcessing(true);
       console.log('Processing withdrawal:', withdrawData);
       // Validation des données avant envoi
     if (!withdrawData.montant || parseFloat(withdrawData.montant) <= 0) {
       throw new Error('Le montant doit être supérieur à 0');
     }
 
     if (parseFloat(withdrawData.montant) > (Number(participantDetails?.solde_disponible) || 0)) {
       throw new Error('Solde insuffisant');
     }
     const retraitData = {
       participant: participantId,
       montant: withdrawData.montant.toString(),
     };
       // Appeler l'API pour effectuer le retrait
       const result = await createRetrait(retraitData);
 
       // 🎉 TOAST DE SUCCÈS POUR RETRAIT
       toast.success('🔄 Demande de retrait soumise !', {
         description: `${withdrawData.montant.toLocaleString()} FCFA. En attente de validation.`,
         duration: 5000,
       });
 
       setIsWithdrawalModalOpen(false);
 
       // Rafraîchir les données du compte
       await fetchParticipantDetailsComplets(participantId);
       
     } catch (error) {
       console.error('Error processing withdrawal:', error);
     
       // Toast d'erreur avec message spécifique
       if (error instanceof Error) {
         toast.error('❌ Erreur lors du retrait', {
           description: error.message,
           duration: 6000,
         });
       } else {
         toast.error('❌ Erreur lors du retrait', {
           description: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
           duration: 6000,
         });
       }
     } finally {
       setProcessing(false);
     }
   };
    const filteredTransactions = myTransactionHistory.filter(
        (transaction) => transaction.type === 'cotisation_tontine' || transaction.type === 'retrait_tontine'
    );
    return (
        <div className="">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header moderne */}
                <div className="mb-8 flex justify-between gap-16">
                    <div className="flex items-center mb-6">
                        <GlassButton
                            variant="outline"
                            onClick={() => router.back()}
                            className="mr-4 h-10 w-10 p-0 rounded-full"
                        >
                            <ArrowLeft size={18} />
                        </GlassButton>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">{participantDetails.tontine_nom}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Building className="mr-2" size={16} />
                                    {participantDetails.sfd_nom}
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="mr-2" size={16} />
                                    Adhéré le {format(new Date(participantDetails.dateAdhesion), 'dd MMM yyyy', { locale: fr })}
                                </div>
                                <div className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
                                    Participant actif
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <GlassButton
                            className="w-full h-12 text-left justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 cursor-pointer"
                            onClick={() => setIsContributionModalOpen(true)}
                        >
                            Cotiser
                        </GlassButton>

                        <GlassButton
                            variant="outline"
                            className="w-full h-12 text-left justify-start border-2 cursor-pointer"
                            onClick={() => setIsWithdrawalModalOpen(true)}
                        >
                            <div>
                                <div className="font-medium">Retirer</div>
                            </div>
                        </GlassButton>
                    </div>
                </div>

                {/* Stats cards modernes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Solde disponible</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {parseFloat(participantDetails.solde_disponible).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">FCFA</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Wallet className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total cotisé</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {parseFloat(participantDetails.total_cotise).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">FCFA</p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="text-green-600" size={24} />
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Mise journalière</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {parseFloat(participantDetails.montantMise).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">FCFA/mise</p>
                            </div>
                            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Target className="text-purple-600" size={24} />
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <div className="flex w-full flex-col">
                    <Tabs aria-label="Options" className="w-full">
                        <Tab key="Carnets" title="Carnets de Cotisation">
                            <Card>
                                <CardBody>
                                    <div className="space-y-6">
                                        {/* Message d'information KKiaPay */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-blue-800">
                                                        Paiements sécurisés avec KKiaPay
                                                    </p>
                                                    <p className="text-xs text-blue-600">
                                                        Payez vos cotisations via Mobile Money (MTN, Moov, etc.)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Grille des carnets */}
                                        <div className="grid grid-cols-3 gap-4">
                                            {participantDetails.carnets_cotisation.map(carnet => (
                                                <GlassCard
                                                    hover={false}
                                                    key={carnet.cycle_numero}
                                                    className={`p-4 ${carnet.carnet_complet ? 'bg-green-50 border-green-200' : ''}`}
                                                >
                                                    <div className="mb-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h5 className="text-base font-semibold text-gray-900">
                                                                Carnet #{carnet.cycle_numero}
                                                            </h5>
                                                        </div>
                                                        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                                                            <div>
                                                                <div className="text-base font-bold text-green-600">
                                                                    {carnet.jours_coches}
                                                                </div>
                                                                <div className="text-xs text-gray-500">Payées</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-base font-bold text-orange-600">
                                                                    {carnet.jours_manques}
                                                                </div>
                                                                <div className="text-xs text-gray-500">Restantes</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-base font-bold text-blue-600">
                                                                    {Math.round(carnet.jours_coches / 31 * 100)}%
                                                                </div>
                                                                <div className="text-xs text-gray-500">Complété</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Grille des mises (31 cases) */}
                                                    <div className="grid grid-cols-7 gap-1 mb-3">
                                                        {carnet.mises_cochees.map((estCoche: boolean, index: number) => {
                                                            const numeroCase = index + 1;
                                                            const estCommissionSfd = index === 0 && estCoche;
                                                            const estProchainLibre = carnet.prochaineCaseACocher === numeroCase;

                                                            return (
                                                                <div
                                                                    key={numeroCase}
                                                                    className={`w-4 h-4 rounded text-[8px] font-medium flex items-center justify-center transition-all ${estCommissionSfd
                                                                        ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                                                                        : estCoche
                                                                            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                                                                            : estProchainLibre
                                                                                ? 'bg-blue-200 text-blue-800 border border-blue-400 scale-110'
                                                                                : 'bg-gray-200 text-gray-600'
                                                                        }`}
                                                                >
                                                                    {numeroCase}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Actions selon l'état du carnet */}
                                                    {carnet.peutCotiser ? (
                                                        <div className="flex gap-2">
                                                            <GlassButton
                                                                onClick={() => setIsContributionModalOpen(true)}
                                                                disabled={loading}
                                                                className="flex-1 text-xs py-1"
                                                                size="sm"
                                                            >
                                                                <CreditCard className="h-3 w-3 mr-1" />
                                                                Payer
                                                            </GlassButton>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center">
                                                            <div className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                                                {carnet.carnet_complet
                                                                    ? '✅ Carnet terminé'
                                                                    : carnet.cycle_numero === participantDetails.carnets_cotisation.length
                                                                        ? '📋 Carnet en cours'
                                                                        : '🔒 Carnet fermé'}
                                                            </div>
                                                        </div>
                                                    )}
                                                </GlassCard>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Légende mise à jour */}
                                    <div className="mt-8 flex flex-wrap gap-6 justify-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded"></div>
                                            <span className="text-sm text-gray-700 font-medium">Contribution payée</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded"></div>
                                            <span className="text-sm text-gray-700 font-medium">Commission SFD</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded"></div>
                                            <span className="text-sm text-gray-700 font-medium">Prochaine case à payer</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                            <span className="text-sm text-gray-700 font-medium">Non payé</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm text-gray-700 font-medium">Paiement KKiaPay disponible</span>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Tab>
                        <Tab key="History" title="Historique des opérations">
                            <Card>
                                <CardBody>
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Historique des transactions</h3>

                                        {loadingTransactions || !myTransactionHistory ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                                            </div>
                                        ) : filteredTransactions.length > 0 ? (
                                            <div className="space-y-4">
                                                {filteredTransactions
                                                    .filter(tx => tx.type === 'cotisation_tontine') // Filtrer uniquement les cotisations de tontine
                                                    .map((transaction) => (
                                                        <div
                                                            key={transaction.id}
                                                            className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-sm transition-all"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${transaction.statut === 'success'
                                                                            ? 'bg-green-100 text-green-600'
                                                                            : transaction.statut === 'pending'
                                                                                ? 'bg-yellow-100 text-yellow-600'
                                                                                : 'bg-red-100 text-red-600'
                                                                        }`}>
                                                                        {transaction.statut === 'success' ? (
                                                                            <CheckCircle size={20} />
                                                                        ) : transaction.statut === 'pending' ? (
                                                                            <Clock size={20} />
                                                                        ) : (
                                                                            <X size={20} />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">
                                                                            {transaction.type_libelle}
                                                                        </p>
                                                                        <p className="text-sm text-gray-500">
                                                                            {format(new Date(transaction.date_creation), 'dd MMM yyyy à HH:mm', { locale: fr })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className={`font-bold ${transaction.statut === 'success'
                                                                            ? 'text-green-600'
                                                                            : transaction.statut === 'pending'
                                                                                ? 'text-yellow-600'
                                                                                : 'text-red-600'
                                                                        }`}>
                                                                        {transaction.montant.toLocaleString()} FCFA
                                                                    </p>
                                                                    <span className={`text-xs px-2 py-1 rounded-full ${transaction.statut === 'success'
                                                                            ? 'bg-green-100 text-green-700'
                                                                            : transaction.statut === 'pending'
                                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                                : 'bg-red-100 text-red-700'
                                                                        }`}>
                                                                        {transaction.statut_libelle}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {transaction.description && (
                                                                <p className="mt-2 text-sm text-gray-600">
                                                                    {transaction.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                                    <p className="mt-2 text-gray-500">Aucune transaction trouvée</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            </Tab>
                        </Tabs>
                    </div>
                </div>

                {/* Modal de cotisation avec KKiaPay */}
                {isContributionModalOpen && (
                    <ContributionForm
                        isOpen={isContributionModalOpen}
                        id={participantId}
                        onClose={() => setIsContributionModalOpen(false)}
                        participantDetails={participantDetails}
                        loading={loading}
                        onSubmit={handleCotisationSubmit}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                    />
                )}

                {/* Modal de retrait */}
                {isWithdrawalModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-full relative max-w-xl">
                            <button
                                onClick={() => setIsWithdrawalModalOpen(false)}
                                className="absolute top-5 right-5 text-black hover:text-gray-800 cursor-pointer"
                            >
                                ✕
                            </button>
                            <WithdrawalForm
                                isOpen={isWithdrawalModalOpen}
                                onClose={() => setIsWithdrawalModalOpen(false)}
                                details={participantDetails}
                                loading={loading}
                                onSubmit={handleWithdraw}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

export default TontineDetailsPage