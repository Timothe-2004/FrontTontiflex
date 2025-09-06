import React from 'react';
import { XCircle, User, DollarSign, TrendingUp, Award, Shield, FileCheck } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { RapportDemande } from '@/types/loans-applications';

interface RapportModalProps {
    show: boolean;
    onClose: () => void;
    rapport: RapportDemande | null;
}
function getTypeLabel(type: string | undefined): string {
    if (!type) return '—';
    switch (type.toLowerCase()) {
        case 'consommation':
            return 'Prêt à la consommation';
        case 'immobilier':
            return 'Prêt immobilier';
        case 'vehicule':
        case 'voiture':
            return 'Prêt véhicule';
        case 'equipement':
            return 'Prêt équipement';
        default:
            return type.charAt(0).toUpperCase() + type.slice(1); // fallback: capitalise
    }
}

export function getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600';    // Bon score => vert
    if (score >= 60) return 'text-yellow-600';   // Moyen => jaune
    if (score >= 40) return 'text-orange-600';   // Faible => orange
    return 'text-red-600';                        // Très faible => rouge
}


const RapportModal: React.FC<RapportModalProps> = ({ show, onClose, rapport }) => {
    if (!show || !rapport) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto w-full">
                <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <FileCheck className="text-blue-600" size={24} />
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">Rapport d'Analyse</h3>
                            <p className="text-sm text-gray-600">
                                Demande {rapport.demande_id} - {rapport.client.nom}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <XCircle size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <GlassCard className="p-4" hover={false}>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-700">
                            <User size={16} />
                            Informations Client
                        </h4>
                        <div className="text-sm space-y-2">
                            <div><strong>Nom:</strong> {rapport?.client.nom}</div>
                            <div><strong>Âge:</strong> {rapport?.client.age || 'Non renseigné'}</div>
                            <div><strong>Situation familiale:</strong> {rapport?.client.situation_familiale}</div>
                            <div><strong>Profession:</strong> {rapport?.client.profession}</div>
                        </div>
                    </GlassCard>

                    {/* Détails prêt */}
                    <GlassCard className="p-4" hover={false}>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                            <DollarSign size={16} />
                            Détails du Prêt
                        </h4>
                        <div className="text-sm space-y-2">
                            <div><strong>Montant:</strong> {rapport?.pret_demande.montant} FCFA</div>
                            <div><strong>Durée:</strong> {rapport?.pret_demande.duree} mois</div>
                            <div><strong>Type:</strong> {getTypeLabel(rapport?.pret_demande.type)}</div>
                            <div><strong>Objet:</strong> {rapport?.pret_demande.objet}</div>
                        </div>
                    </GlassCard>

                    {/* Situation financière */}
                    <GlassCard className="p-4" hover={false}>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-700">
                            <TrendingUp size={16} />
                            Situation Financière
                        </h4>
                        <div className="text-sm space-y-2">
                            <div><strong>Revenus mensuels:</strong> {rapport?.situation_financiere.revenu_mensuel} FCFA</div>
                            <div><strong>Charges mensuelles:</strong> {rapport?.situation_financiere.charges_mensuelles} FCFA</div>
                            <div>
                                <strong>Ratio endettement:</strong>
                                <span className={`ml-2 font-semibold ${rapport?.situation_financiere.ratio_endettement > 40 ? 'text-red-600' : 'text-green-600'}`}>
                                    {rapport?.situation_financiere.ratio_endettement}%
                                </span>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Score de fiabilité */}
                    <GlassCard className="p-4" hover={false}>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-indigo-700">
                            <Award size={16} />
                            Score de Fiabilité
                        </h4>
                        <div className="text-sm space-y-2">
                            <div>
                                <strong>Score:</strong>{' '}
                                <span className={`font-bold ${getScoreColor(rapport?.score_fiabilite.score)}`}>
                                    {rapport?.score_fiabilite.score.toFixed(2)}/100
                                </span>
                            </div>
                            <div><strong>Évaluation:</strong> {rapport?.score_fiabilite.evaluation}</div>
                            <div>
                                <strong>Détails:</strong>
                                <pre className="bg-indigo-50 p-3 rounded-lg text-xs whitespace-pre-wrap text-gray-700">
                                    {JSON.stringify(rapport?.score_fiabilite.details, null, 2)}
                                </pre>
                            </div>
                            {rapport?.score_fiabilite.recommandations?.length > 0 && (
                                <div className="space-y-2">
                                    <strong>Recommandations:</strong>
                                    {rapport.score_fiabilite.recommandations.map((rec, idx) => (
                                        <div key={idx} className="bg-orange-50 p-2 text-sm rounded border-l-4 border-orange-400">
                                            {rec}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* Analyse capacité */}
                    <GlassCard className="p-4" hover={false}>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-teal-700">
                            <Shield size={16} />
                            Analyse de la Capacité de Remboursement
                        </h4>
                        <div className="text-sm space-y-2">
                            <div><strong>Mensualité simulée:</strong> {rapport?.analyse_capacite.mensualite_pret} FCFA</div>
                            <div><strong>Nouveau ratio endettement:</strong> {rapport?.analyse_capacite.nouveau_ratio_endettement.toFixed(2)}%</div>
                            <div><strong>Reste à vivre après prêt:</strong> {rapport?.analyse_capacite.reste_apres_pret} FCFA</div>
                            <div><strong>Analyse favorable ?</strong> {rapport?.analyse_capacite.analyse_favorable ? 'Oui' : 'Non'}</div>
                            <div><strong>Niveau de risque:</strong> {rapport?.analyse_capacite.niveau_risque}</div>

                            {rapport?.analyse_capacite.commentaires?.length > 0 && (
                                <div className="space-y-2 mt-2">
                                    <strong>Commentaires:</strong>
                                    {rapport.analyse_capacite.commentaires.map((cmt, idx) => (
                                        <div key={idx} className="bg-red-50 text-red-700 p-2 rounded border-l-4 border-red-400 text-sm">
                                            {cmt}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* Décision finale */}
                    <GlassCard className="p-4" hover={false}>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-700">
                            <XCircle size={16} />
                            Décision Recommandée
                        </h4>
                        <div className="text-sm">
                            <p><strong>Niveau de risque global:</strong> {rapport?.niveau_risque_global}</p>
                            <p><strong>Décision recommandée:</strong> {rapport?.decision_recommandee}</p>
                        </div>
                    </GlassCard>

                </div>
            </div>
        </div>
    );
};

export default RapportModal;
