'use client';
import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CreditCard, Upload, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useLoansApplications } from "@/hooks/useLoansApplications";
import { CreateLoanApplicationData } from "@/types/loans-applications";

interface FormData {
    compte_epargne: string;
    // Informations personnelles
    date_naissance: string;
    adresse_domicile: string;
    adresse_bureau: string;
    situation_familiale: 'celibataire' | 'marie' | 'divorce' | 'veuf' | 'union_libre' | '';
    
    // Situation professionnelle et financière
    situation_professionnelle: string;
    justificatif_identite: string;
    revenu_mensuel: string;
    charges_mensuelles: string;
    historique_prets_anterieurs: string;
    
    // Détails du prêt
    montant_souhaite: string;
    duree_pret: string;
    type_pret: 'consommation' | 'immobilier' | 'professionnel' | 'urgence' | '';
    objet_pret: string;
    plan_affaires: string;
    
    // Garanties et documents
    type_garantie: 'bien_immobilier' | 'garant_physique' | 'depot_garantie' | 'aucune' | '';
    details_garantie: string;
    signature_caution: boolean;
    signature_collecte_donnees: boolean;
    document_complet: File | null;
}

const LoanApplication = () => {
    const params = useParams();
    const tontineId = params.tontineId;
    const router = useRouter();
    const { createApplication, loading } = useLoansApplications();
    
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;

    const [formData, setFormData] = useState<FormData>({
        compte_epargne: tontineId as string,
        // Informations personnelles
        date_naissance: '',
        adresse_domicile: '',
        adresse_bureau: '',
        situation_familiale: '',
        
        // Situation professionnelle et financière
        situation_professionnelle: '',
        justificatif_identite: '',
        revenu_mensuel: '',
        charges_mensuelles: '',
        historique_prets_anterieurs: '',
        
        // Détails du prêt
        montant_souhaite: '',
        duree_pret: '',
        type_pret: '',
        objet_pret: '',
        plan_affaires: '',
        
        // Garanties et documents
        type_garantie: '',
        details_garantie: '',
        signature_caution: false,
        signature_collecte_donnees: false,
        document_complet: null,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: keyof FormData, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error('Veuillez sélectionner un fichier PDF');
                return;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB
                toast.error('Le fichier ne doit pas dépasser 10MB');
                return;
            }
            setFormData(prev => ({ ...prev, document_complet: file }));
        }
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                if (!formData.date_naissance || !formData.adresse_domicile || !formData.situation_familiale) {
                    toast.error('Veuillez remplir tous les champs obligatoires');
                    return false;
                }
                break;
            case 2:
                if (!formData.situation_professionnelle || !formData.justificatif_identite || !formData.revenu_mensuel || !formData.charges_mensuelles) {
                    toast.error('Veuillez remplir tous les champs obligatoires');
                    return false;
                }
                break;
            case 3:
                if (!formData.montant_souhaite || !formData.duree_pret || !formData.type_pret || !formData.objet_pret) {
                    toast.error('Veuillez remplir tous les champs obligatoires');
                    return false;
                }
                break;
            case 4:
                if (!formData.type_garantie || !formData.details_garantie) {
                    toast.error('Veuillez remplir tous les champs obligatoires');
                    return false;
                }
                break;
            case 5:
                if (!formData.document_complet || !formData.signature_collecte_donnees) {
                    toast.error('Veuillez fournir le document PDF et accepter les conditions');
                    return false;
                }
                break;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep) && currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateStep(currentStep)) return;

        try {
            const applicationData: CreateLoanApplicationData = {
                compte_epargne: tontineId as string,
                date_naissance: formData.date_naissance,
                adresse_domicile: formData.adresse_domicile,
                adresse_bureau: formData.adresse_bureau || undefined,
                situation_familiale: formData.situation_familiale as any,
                situation_professionnelle: formData.situation_professionnelle,
                justificatif_identite: formData.justificatif_identite,
                revenu_mensuel: formData.revenu_mensuel,
                charges_mensuelles: formData.charges_mensuelles,
                historique_prets_anterieurs: formData.historique_prets_anterieurs || undefined,
                plan_affaires: formData.plan_affaires || undefined,
                montant_souhaite: formData.montant_souhaite,
                duree_pret: parseInt(formData.duree_pret),
                type_pret: formData.type_pret as any,
                objet_pret: formData.objet_pret,
                type_garantie: formData.type_garantie as any,
                details_garantie: formData.details_garantie,
                signature_caution: formData.signature_caution,
                signature_collecte_donnees: formData.signature_collecte_donnees,
                document_complet: formData.document_complet!,
            };

            await createApplication(applicationData);
            toast.success("Demande de crédit soumise avec succès !");
            setTimeout(() => {
                router.push("/dashboards/dashboard-client/loans");
            }, 2000);
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-primary">Informations personnelles</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label>Date de naissance *</Label>
                                <Input 
                                    type="date" 
                                    className="bg-white/50" 
                                    name="date_naissance" 
                                    value={formData.date_naissance} 
                                    onChange={handleInputChange} 
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Adresse complète du domicile *</Label>
                                <Textarea 
                                    className="bg-white/50" 
                                    name="adresse_domicile" 
                                    value={formData.adresse_domicile} 
                                    onChange={handleInputChange} 
                                    placeholder="Adresse complète de votre domicile"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Adresse du bureau/travail</Label>
                                <Textarea 
                                    className="bg-white/50" 
                                    name="adresse_bureau" 
                                    value={formData.adresse_bureau} 
                                    onChange={handleInputChange} 
                                    placeholder="Adresse de votre lieu de travail (optionnel)"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Situation familiale *</Label>
                                <Select value={formData.situation_familiale} onValueChange={(v) => handleSelectChange('situation_familiale', v)}>
                                    <SelectTrigger className="bg-white/50">
                                        <SelectValue placeholder="Choisir votre situation familiale" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="celibataire">Célibataire</SelectItem>
                                        <SelectItem value="marie">Marié(e)</SelectItem>
                                        <SelectItem value="divorce">Divorcé(e)</SelectItem>
                                        <SelectItem value="veuf">Veuf/Veuve</SelectItem>
                                        <SelectItem value="union_libre">Union libre</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-primary">Situation professionnelle et financière</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Description professionnelle détaillée *</Label>
                                <Textarea 
                                    className="bg-white/50" 
                                    name="situation_professionnelle" 
                                    value={formData.situation_professionnelle} 
                                    onChange={handleInputChange} 
                                    placeholder="Emploi, entreprise, fonction, etc."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Type de justificatif d'identité *</Label>
                                <Input 
                                    className="bg-white/50" 
                                    name="justificatif_identite" 
                                    value={formData.justificatif_identite} 
                                    onChange={handleInputChange} 
                                    placeholder="CNI, Passeport, etc."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Revenus mensuels (FCFA) *</Label>
                                <Input 
                                    type="number" 
                                    className="bg-white/50" 
                                    name="revenu_mensuel" 
                                    value={formData.revenu_mensuel} 
                                    onChange={handleInputChange} 
                                    placeholder="50000"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Charges mensuelles (FCFA) *</Label>
                                <Input 
                                    type="number" 
                                    className="bg-white/50" 
                                    name="charges_mensuelles" 
                                    value={formData.charges_mensuelles} 
                                    onChange={handleInputChange} 
                                    placeholder="30000"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Historique des prêts antérieurs</Label>
                                <Textarea 
                                    className="bg-white/50" 
                                    name="historique_prets_anterieurs" 
                                    value={formData.historique_prets_anterieurs} 
                                    onChange={handleInputChange} 
                                    placeholder="Décrivez vos prêts précédents et leur statut (optionnel)"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-primary">Détails du crédit</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Montant demandé (FCFA) *</Label>
                                <Input 
                                    type="number" 
                                    className="bg-white/50" 
                                    name="montant_souhaite" 
                                    value={formData.montant_souhaite} 
                                    onChange={handleInputChange} 
                                    placeholder="100000"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Durée (mois) *</Label>
                                <Select value={formData.duree_pret} onValueChange={(v) => handleSelectChange('duree_pret', v)}>
                                    <SelectTrigger className="bg-white/50">
                                        <SelectValue placeholder="Choisir la durée" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white" >
                                        <SelectItem value="6">6 mois</SelectItem>
                                        <SelectItem value="12">12 mois</SelectItem>
                                        <SelectItem value="18">18 mois</SelectItem>
                                        <SelectItem value="24">24 mois</SelectItem>
                                        <SelectItem value="36">36 mois</SelectItem>
                                        <SelectItem value="48">48 mois</SelectItem>
                                        <SelectItem value="60">60 mois</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Type de prêt *</Label>
                                <Select value={formData.type_pret} onValueChange={(v) => handleSelectChange('type_pret', v)}>
                                    <SelectTrigger className="bg-white/50">
                                        <SelectValue placeholder="Choisir le type de prêt" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="consommation">Prêt à la consommation</SelectItem>
                                        <SelectItem value="immobilier">Prêt immobilier</SelectItem>
                                        <SelectItem value="professionnel">Prêt professionnel</SelectItem>
                                        <SelectItem value="urgence">Prêt d'urgence</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Objet du crédit *</Label>
                                <Textarea 
                                    className="bg-white/50" 
                                    name="objet_pret" 
                                    value={formData.objet_pret} 
                                    onChange={handleInputChange} 
                                    placeholder="Description détaillée de l'utilisation des fonds"
                                    required
                                />
                            </div>
                            {formData.type_pret === 'professionnel' && (
                                <div className="space-y-2">
                                    <Label>Plan d'affaires</Label>
                                    <Textarea 
                                        className="bg-white/50" 
                                        name="plan_affaires" 
                                        value={formData.plan_affaires} 
                                        onChange={handleInputChange} 
                                        placeholder="Décrivez votre plan d'affaires (requis pour les prêts professionnels)"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-primary">Garanties</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Type de garantie *</Label>
                                <Select value={formData.type_garantie} onValueChange={(v) => handleSelectChange('type_garantie', v)}>
                                    <SelectTrigger className="bg-white/50">
                                        <SelectValue placeholder="Choisir le type de garantie" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="bien_immobilier">Bien immobilier</SelectItem>
                                        <SelectItem value="garant_physique">Garant physique</SelectItem>
                                        <SelectItem value="depot_garantie">Dépôt de garantie</SelectItem>
                                        <SelectItem value="aucune">Aucune garantie</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Détails de la garantie *</Label>
                                <Textarea 
                                    className="bg-white/50" 
                                    name="details_garantie" 
                                    value={formData.details_garantie} 
                                    onChange={handleInputChange} 
                                    placeholder="Description, valeur, localisation, etc."
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="signature_caution"
                                    checked={formData.signature_caution}
                                    onCheckedChange={(checked: boolean) => handleCheckboxChange('signature_caution', checked as boolean)}
                                />
                                <Label htmlFor="signature_caution">Signature de caution fournie</Label>
                            </div>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-primary">Documents et consentement</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Document PDF consolidé *</Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="document-upload"
                                    />
                                    <label htmlFor="document-upload" className="cursor-pointer">
                                        <span className="text-blue-600 hover:text-blue-500">
                                            Cliquez pour sélectionner un fichier PDF
                                        </span>
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Justificatifs de revenus, garanties, plan d'utilisation, références (Max 10MB)
                                    </p>
                                    {formData.document_complet && (
                                        <p className="text-green-600 mt-2">
                                            ✓ {formData.document_complet.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="bg-primary/10 p-4 rounded-lg space-y-4">
                                <div className="flex items-start space-x-2">
                                    <Checkbox 
                                        id="signature_collecte_donnees"
                                        checked={formData.signature_collecte_donnees}
                                        onCheckedChange={(checked: boolean) => handleCheckboxChange('signature_collecte_donnees', checked)}
                                        required
                                    />
                                    <Label htmlFor="signature_collecte_donnees" className="text-sm leading-relaxed">
                                        J'accepte les conditions générales de crédit et consens au traitement de mes 
                                        données personnelles conformément au RGPD et aux réglementations UEMOA/BCEAO. *
                                    </Label>
                                </div>
                                
                                <div className="text-xs text-gray-600 space-y-2">
                                    <p>
                                        <strong>Processus de traitement :</strong>
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Vérification automatique d'éligibilité</li>
                                        <li>Calcul du score de fiabilité</li>
                                        <li>Examen par superviseur SFD</li>
                                        <li>Validation finale par admin SFD</li>
                                        <li>Décaissement en personne après accord</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto">
                    <GlassCard hover={false}>
                        <form onSubmit={handleSubmit}>
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-primary mb-2 flex items-center justify-center">
                                    <CreditCard className="mr-2" size={32} />
                                    Demande de Crédit TontiFlex
                                </h1>
                                <p className="text-gray-600">Étape {currentStep} sur {totalSteps}</p>
                            </div>

                            <div className="mb-8">
                                <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
                            </div>

                            <div>
                                {renderStep()}
                                <div className="flex justify-between mt-8">
                                    <GlassButton
                                        type="button"
                                        variant="outline"
                                        onClick={handlePrevious}
                                        disabled={currentStep === 1 || loading}
                                        className="flex items-center"
                                    >
                                        <ArrowLeft className="mr-2" size={16} />
                                        Précédent
                                    </GlassButton>

                                    {currentStep === totalSteps ? (
                                        <GlassButton 
                                            type="submit" 
                                            className="flex items-center"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Soumission...
                                                </>
                                            ) : (
                                                <>
                                                    Soumettre la demande
                                                    <ArrowRight className="ml-2" size={16} />
                                                </>
                                            )}
                                        </GlassButton>
                                    ) : (
                                        <GlassButton 
                                            type="button" 
                                            onClick={handleNext} 
                                            className="flex items-center"
                                            disabled={loading}
                                        >
                                            Suivant
                                            <ArrowRight className="ml-2" size={16} />
                                        </GlassButton>
                                    )}
                                </div>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default LoanApplication;