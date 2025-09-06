'use client'
import { useState, useEffect } from 'react';
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building,
  User,
  Phone,
  Mail,
  X,
  Loader2,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from '@/contexts/AuthContext';
import { useLoans } from '@/hooks/useLoans';
import LoanPaymentForm from '@/components/forms/LoanPaymentForm';
import type { LoanStatus } from '@/types/loans';

// Types pour les statuts d'échéance
type EcheanceStatus = 'prevu' | 'en_cours' | 'en_retard' | 'paye' | 'paye_partiel';

const LoanDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { 
    loan, 
    calendrierRemboursement, 
    loading, 
    error, 
    fetchLoanById, 
    fetchCalendrierRemboursement,
    createRepaymentForPayment,
    confirmRepaymentPayment
  } = useLoans();

  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);

  // Charger les données du prêt et du calendrier au montage
  useEffect(() => {
    const loadLoanData = async () => {
      if (id && typeof id === 'string') {
        try {
          // Charger les détails du prêt
          await fetchLoanById(id);
          // Charger le calendrier de remboursement
          await fetchCalendrierRemboursement(id);
        } catch (err) {
          console.error('Erreur lors du chargement des données du prêt:', err);
        }
      }
    };

    loadLoanData();
  }, []);

  // Fonction pour recharger les données
  const handleRefresh = async () => {
    if (id && typeof id === 'string') {
      try {
        await fetchLoanById(id);
        await fetchCalendrierRemboursement(id);
        toast.success('Données rechargées avec succès');
      } catch (err) {
        toast.error('Erreur lors du rechargement des données');
      }
    }
  };

  // 🆕 Fonction pour gérer le remboursement avec KKiaPay
  const handleRepaymentSubmit = async (repaymentData: any) => {
    try {
      console.log('📝 Soumission remboursement:', repaymentData);
      
      if (id && typeof id === 'string') {
        // Créer le remboursement (sans paiement pour l'instant)
        const response = await createRepaymentForPayment(id, repaymentData);
        
        console.log('✅ Réponse remboursement:', response);
        return response;
      }
      
      throw new Error('ID du prêt manquant');
      
    } catch (error) {
      console.error('❌ Erreur création remboursement:', error);
      throw error;
    }
  };

  // 🆕 Callback de succès de paiement KKiaPay
  const handlePaymentSuccess = async (kkiapayResponse: any, repaymentData: any) => {
    try {
      console.log('🎉 Paiement de remboursement réussi, confirmation en cours...', kkiapayResponse);
      
      // Confirmer le paiement auprès du backend
      await confirmRepaymentPayment({
        kkiapay_transaction_id: kkiapayResponse.transactionId,
        internal_transaction_id: loan?.id || '',
        reference: `REF-LOAN-${Date.now()}`,
        amount: parseFloat(selectedInstallment?.montant_total_du || '0'),
        phone: repaymentData.numero_telephone,
        status: 'success',
        timestamp: new Date().toISOString(),
        repayment_data: repaymentData,
        echeance_id: selectedInstallment?.id
      });

      // Rafraîchir les données du prêt
      if (id && typeof id === 'string') {
        await fetchLoanById(id);
        await fetchCalendrierRemboursement(id);
      }
      
      // 🎉 TOAST DE SUCCÈS PERSONNALISÉ POUR REMBOURSEMENT
      toast.success(
        `🎉 Remboursement réussi !`,
        {
          description: `Échéance du ${new Date(selectedInstallment?.date_echeance).toLocaleDateString('fr-FR')}}`,
          duration: 8000,
          action: {
            label: "Voir calendrier",
            onClick: () => {
              // Scroll vers le calendrier de remboursement
              document.querySelector('[data-calendrier]')?.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      );
      
    } catch (error) {
      console.error('❌ Erreur confirmation paiement remboursement:', error);
    }
  };

  // 🆕 Callback d'erreur de paiement KKiaPay
  const handlePaymentError = (error: any) => {
    console.log('❌ Erreur de paiement remboursement:', error);
    toast.error(`❌ Paiement échoué: ${error.message || 'Erreur inconnue'}`);
  };

  // Fonction pour formater la devise
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(numAmount);
  };

  // Fonction pour mapper les statuts d'échéance de l'API
  const mapEcheanceStatus = (status: string): EcheanceStatus => {
    switch (status.toLowerCase()) {
      case 'paye':
        return 'paye';
      case 'en_cours':
        return 'en_cours';
      case 'en_retard':
        return 'en_retard';
      case 'paye_partiel':
        return 'paye_partiel';
      case 'prevu':
      default:
        return 'prevu';
    }
  };

  // Fonction pour obtenir le badge de statut des échéances
  const getEcheanceStatusBadge = (status: EcheanceStatus) => {
    switch (status) {
      case "paye":
        return <Badge className="bg-green-100 text-green-800">Payé</Badge>;
      case "en_cours":
        return <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>;
      case "prevu":
        return <Badge className="bg-gray-100 text-gray-800">À venir</Badge>;
      case "en_retard":
        return <Badge className="bg-red-100 text-red-800">En retard</Badge>;
      case "paye_partiel":
        return <Badge className="bg-orange-100 text-orange-800">Paiement partiel</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Fonction pour obtenir l'icône de statut des échéances
  const getEcheanceStatusIcon = (status: EcheanceStatus) => {
    switch (status) {
      case "paye":
        return <CheckCircle className="text-green-600" size={16} />;
      case "en_cours":
        return <Clock className="text-yellow-600" size={16} />;
      case "en_retard":
        return <AlertTriangle className="text-red-600" size={16} />;
      case "paye_partiel":
        return <AlertTriangle className="text-orange-600" size={16} />;
      default:
        return <Clock className="text-gray-600" size={16} />;
    }
  };

  // Fonction pour obtenir le badge de statut du prêt
  const getLoanStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case "accorde":
        return <Badge className="bg-blue-100 text-blue-800">Accordé</Badge>;
      case "en_attente_decaissement":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente décaissement</Badge>;
      case "decaisse":
        return <Badge className="bg-green-100 text-green-800">Décaissé</Badge>;
      case "en_remboursement":
        return <Badge className="bg-purple-100 text-purple-800">En remboursement</Badge>;
      case "solde":
        return <Badge className="bg-gray-100 text-gray-800">Soldé</Badge>;
      case "en_defaut":
        return <Badge className="bg-red-100 text-red-800">En défaut</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Fonction pour ouvrir le formulaire de paiement
  const handlePayInstallment = (installment: any) => {
    setSelectedInstallment(installment);
    setIsPaymentFormOpen(true);
  };

  // Fonction pour fermer le formulaire
  const handleClosePaymentForm = () => {
    setIsPaymentFormOpen(false);
    setSelectedInstallment(null);
  };

  // Affichage du loading
  if (loading && !loan) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 animate-spin text-blue-600" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chargement des détails du prêt</h3>
              <p className="text-gray-600">Veuillez patienter...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error && !loan) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboards/dashboard-client/loans">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Retour
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <GlassCard className="p-8 text-center max-w-md">
              <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={handleRefresh} className="flex items-center gap-2">
                <RefreshCw size={16} />
                Réessayer
              </Button>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  // Affichage si aucun prêt trouvé
  if (!loan) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboards/dashboard-client/loans">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Retour
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <GlassCard className="p-8 text-center max-w-md">
              <CreditCard className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Prêt non trouvé</h3>
              <p className="text-gray-600 mb-4">Ce prêt n'existe pas ou vous n'avez pas l'autorisation de le consulter.</p>
              <Link href="/dashboards/dashboard-client/loans">
                <Button>Retour à mes prêts</Button>
              </Link>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête avec bouton retour */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboards/dashboard-client/loans">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-black">Détails du Prêt</h1>
              <p className="text-gray-600">Prêt N° {loan.id.slice(0, 8)}...</p>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </Button>
        </div>

        {/* Message d'information KKiaPay */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Paiements sécurisés avec KKiaPay
                </p>
                <p className="text-xs text-blue-600">
                  Payez vos échéances via Mobile Money (MTN, Moov, etc.)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations générales du prêt */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GlassCard hover={false}>
            <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
              <CreditCard size={24} />
              Informations du Prêt
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Montant emprunté :</span>
                <span className="font-semibold">
                  {formatCurrency(loan.montant_accorde)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant remboursé :</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(loan.montant_total_rembourse)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Solde restant dû :</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(loan.solde_restant_du)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Statut :</span>
                <div className="font-semibold">
                  {getLoanStatusBadge(loan.statut)}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SFD :</span>
                <span className="font-semibold">
                  {loan.sfd_nom}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taux d'intérêt :</span>
                <span className="font-semibold">
                  {loan.taux_interet_annuel}% /an
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durée :</span>
                <span className="font-semibold">
                  {loan.duree_pret_mois} mois
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mensualité :</span>
                <span className="font-semibold">
                  {formatCurrency(loan.montant_mensualite)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date de création :</span>
                <span className="font-semibold" title="Afficher en UTC">
                  {new Date(loan.date_creation).toLocaleDateString('fr-FR', { timeZone: 'UTC' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">En retard :</span>
                <span className={`font-semibold ${loan.est_en_retard === 'true' ? 'text-red-600' : 'text-green-600'}`}>
                  {loan.est_en_retard === 'true' ? 'Oui' : 'Non'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Progression du remboursement</span>
                <span className="text-sm font-medium">
                  {parseFloat(loan.progression_remboursement).toFixed(1)}%
                </span>
              </div>
              <Progress value={parseFloat(loan.progression_remboursement)} className="h-3" />
            </div>
          </GlassCard>

          <GlassCard hover={false}>
            <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
              <Building size={24} />
              Informations Client
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Client :</span>
                <span className="font-semibold">{loan.client_nom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Téléphone :</span>
                <span className="font-semibold">{user?.profile?.telephone || 'Non renseigné'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email :</span>
                <span className="font-semibold">{user?.profile?.email || 'Non renseigné'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Référence client :</span>
                <span className="font-semibold">{loan.client.slice(0, 8)}...</span>
              </div>
              {loan.date_decaissement && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date de décaissement :</span>
                  <span className="font-semibold">
                    {new Date(loan.date_decaissement).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              {loan.admin_decaisseur_nom && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Décaisseur :</span>
                  <span className="font-semibold">{loan.admin_decaisseur_nom}</span>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Échéancier de remboursement */}
        {calendrierRemboursement && (
          <div className="mb-8" data-calendrier>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
                <Calendar size={24} />
                Échéancier de Remboursement
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Total échéances : {calendrierRemboursement.echeances.length}</div>
                <div>Progression : {Math.round(parseFloat(loan.progression_remboursement))}%</div>
              </div>
            </div>

            {/* Résumé et statistiques */}
            {calendrierRemboursement.resume && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <GlassCard hover={false} className="p-4">
                  <h3 className="font-medium text-sm text-gray-600 mb-2">Résumé général</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Progression :</span>
                      <span className="font-semibold">{Math.round(parseFloat(loan.progression_remboursement))}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Montant accordé :</span>
                      <span className="font-semibold">{formatCurrency(loan.montant_accorde)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Déjà remboursé :</span>
                      <span className="font-semibold text-green-600">{formatCurrency(loan.montant_total_rembourse)}</span>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard hover={false} className="p-4">
                  <h3 className="font-medium text-sm text-gray-600 mb-2">Prochaine échéance</h3>
                  <div className="space-y-1 text-sm">
                    {calendrierRemboursement.statistiques?.prochaine_echeance_date ? (
                      <>
                        <div className="flex justify-between">
                          <span>Date :</span>
                          <span className="font-semibold">
                            {new Date(calendrierRemboursement.statistiques.prochaine_echeance_date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Montant :</span>
                          <span className="font-semibold">{formatCurrency(calendrierRemboursement.statistiques.prochaine_echeance_montant || '0')}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500">Aucune échéance à venir</div>
                    )}
                  </div>
                </GlassCard>

                {calendrierRemboursement.statistiques?.est_en_retard && (
                  <GlassCard hover={false} className="p-4 bg-red-50">
                    <h3 className="font-medium text-sm text-red-800 mb-2">⚠️ Retards</h3>
                    <div className="space-y-1 text-sm text-red-700">
                      {calendrierRemboursement.statistiques.retard_moyen_jours && (
                        <div className="flex justify-between">
                          <span>Retard moyen :</span>
                          <span className="font-semibold">{calendrierRemboursement.statistiques.retard_moyen_jours} jours</span>
                        </div>
                      )}
                      {calendrierRemboursement.statistiques.total_penalites && (
                        <div className="flex justify-between">
                          <span>Pénalités :</span>
                          <span className="font-semibold">{formatCurrency(calendrierRemboursement.statistiques.total_penalites)}</span>
                        </div>
                      )}
                      {calendrierRemboursement.statistiques.jours_retard_maximum && (
                        <div className="flex justify-between">
                          <span>Retard max :</span>
                          <span className="font-semibold">{calendrierRemboursement.statistiques.jours_retard_maximum} jours</span>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                )}
              </div>
            )}

            {/* Tableau des échéances */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Date d'échéance</TableHead>
                    <TableHead className="text-right">Capital</TableHead>
                    <TableHead className="text-right">Intérêts</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calendrierRemboursement.echeances.map((echeance, index) => {
                    const echeanceStatus = mapEcheanceStatus(echeance.statut);
                    return (
                      <TableRow key={echeance.id || index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date(echeance.date_echeance).toLocaleDateString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(echeance.montant_capital)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(echeance.montant_interet)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(echeance.montant_total_du)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {getEcheanceStatusIcon(echeanceStatus)}
                            {getEcheanceStatusBadge(echeanceStatus)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                            <Button
                              size="sm"
                              onClick={() => handlePayInstallment(echeance)}
                              className="flex items-center gap-1"
                            >
                              <CreditCard size={14} />
                              Payer
                            </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Légende */}
            <div className="mt-6 flex flex-wrap gap-6 justify-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={16} />
                <span>Échéance payée</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-yellow-600" size={16} />
                <span>En cours / À venir</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-600" size={16} />
                <span>En retard</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="text-blue-600" size={16} />
                <span>Paiement KKiaPay disponible</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal du formulaire de paiement avec KKiaPay */}
        <LoanPaymentForm
          id={id as string}
          isOpen={isPaymentFormOpen}
          onClose={handleClosePaymentForm}
          selectedInstallment={selectedInstallment}
          loanDetails={loan}
          loading={loading}
          onSubmit={handleRepaymentSubmit}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />

        {/* Indicateur de chargement pendant le rafraîchissement */}
        {loading && loan && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
              <Loader2 className="animate-spin text-blue-600" size={16} />
              <span className="text-sm text-gray-700">Actualisation en cours...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanDetail;