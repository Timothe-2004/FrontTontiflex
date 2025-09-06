// app/dashboard-sfd-admin/tontines/create/page.tsx
'use client'
import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  DollarSign, 
  Users, 
  Calendar, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  Shield,
  Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CreateTontine = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  
  const [formData, setFormData] = useState({
    // Informations générales
    nom: '',
    type: '',
    description: '',
    
    // Configuration financière
    montantMin: '',
    montantMax: '',
    fraisAdhesion: '',
    periodicite: '',
    
    // Durée et cycles
    dureeType: 'mois', // 'mois' ou 'cycles'
    dureeValeur: '',
    cycleDuree: '31', // en jours
    
    // Règles de fonctionnement
    membresMin: '',
    membresMax: '',
    reglesRetrait: '',
    delaiRetrait: '',
    penaliteRetard: '',
    
    // Paramètres avancés
    autoValidation: false,
    notificationsSms: true,
    limiteDecouvert: '',
    
    // Statut
    statut: 'brouillon' // brouillon, active
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.nom && formData.type && formData.description;
      case 2:
        return formData.montantMin && formData.montantMax && formData.periodicite && formData.fraisAdhesion;
      case 3:
        return formData.dureeValeur && formData.membresMin && formData.membresMax;
      case 4:
        return formData.reglesRetrait && formData.delaiRetrait;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, 5));
    } else {
      toast.error('Veuillez remplir tous les champs obligatoires');
    }
  };

  const handlePrevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
  };

  const handleSave = async (publish: boolean = false) => {
    setIsLoading(true);
    
    try {
      // Simulation API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const finalData = {
        ...formData,
        statut: publish ? 'active' : 'brouillon'
      };
      
      console.log('Données de la tontine:', finalData);
      
      toast.success(publish ? 'Tontine créée et publiée avec succès!' : 'Tontine sauvegardée en brouillon!');
      
      setTimeout(() => {
        router.push('/dashboard-sfd-admin/tontines');
      }, 1500);
      
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Informations générales', icon: Info },
    { id: 2, title: 'Configuration financière', icon: DollarSign },
    { id: 3, title: 'Durée et membres', icon: Users },
    { id: 4, title: 'Règles de fonctionnement', icon: Settings },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboards/dashboard-adminsfd/tontines">
            <GlassButton variant="outline" size="sm">
              <ArrowLeft size={16} />
            </GlassButton>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-emerald-800">Créer une nouvelle tontine</h1>
            <p className="text-gray-600">Configurez les paramètres de votre tontine</p>
          </div>
        </div>

        {/* Stepper */}
        <GlassCard className="p-6" hover={false}>
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                  ${activeStep === step.id 
                    ? 'bg-emerald-600 border-emerald-600 text-white' 
                    : activeStep > step.id 
                      ? 'bg-emerald-100 border-emerald-600 text-emerald-600'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }
                `}>
                  <step.icon size={20} />
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    activeStep === step.id ? 'text-emerald-600' : 
                    activeStep > step.id ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    Étape {step.id}
                  </div>
                  <div className="text-xs text-gray-500">{step.title}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    activeStep > step.id ? 'bg-emerald-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Contenu du formulaire */}
        <GlassCard className="p-6" hover={false}>
          {/* Étape 1: Informations générales */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Informations générales</h2>
                <p className="text-gray-600">Définissez les informations de base de votre tontine</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom de la tontine *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    placeholder="Ex: Tontine des Entrepreneures"
                    className="bg-white/60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type de tontine *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="bg-white/60">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="épargne">Épargne</SelectItem>
                      <SelectItem value="crédit">Crédit rotatif</SelectItem>
                      <SelectItem value="mixte">Mixte (épargne + crédit)</SelectItem>
                      <SelectItem value="saisonnier">Saisonnier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez l'objectif et le fonctionnement de cette tontine..."
                  rows={4}
                  className="w-full p-3 bg-white/60 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Étape 2: Configuration financière */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuration financière</h2>
                <p className="text-gray-600">Définissez les montants et la fréquence des cotisations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="montantMin">Montant minimum (FCFA) *</Label>
                  <Input
                    id="montantMin"
                    type="number"
                    value={formData.montantMin}
                    onChange={(e) => handleInputChange('montantMin', e.target.value)}
                    placeholder="500"
                    className="bg-white/60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="montantMax">Montant maximum (FCFA) *</Label>
                  <Input
                    id="montantMax"
                    type="number"
                    value={formData.montantMax}
                    onChange={(e) => handleInputChange('montantMax', e.target.value)}
                    placeholder="5000"
                    className="bg-white/60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fraisAdhesion">Frais d'adhésion (FCFA) *</Label>
                  <Input
                    id="fraisAdhesion"
                    type="number"
                    value={formData.fraisAdhesion}
                    onChange={(e) => handleInputChange('fraisAdhesion', e.target.value)}
                    placeholder="500"
                    className="bg-white/60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="periodicite">Périodicité des cotisations *</Label>
                  <Select value={formData.periodicite} onValueChange={(value) => handleInputChange('periodicite', value)}>
                    <SelectTrigger className="bg-white/60">
                      <SelectValue placeholder="Fréquence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quotidien">Quotidien</SelectItem>
                      <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                      <SelectItem value="mensuel">Mensuel</SelectItem>
                      <SelectItem value="saisonnier">Saisonnier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="text-blue-600 mt-0.5" size={16} />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">Information importante</h4>
                    <p className="text-sm text-blue-700">
                      La première cotisation de chaque cycle sera automatiquement affectée comme commission SFD selon les règles BCEAO.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Durée et membres */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Durée et membres</h2>
                <p className="text-gray-600">Configurez la durée et le nombre de participants</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Type de durée</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="dureeType"
                        value="mois"
                        checked={formData.dureeType === 'mois'}
                        onChange={(e) => handleInputChange('dureeType', e.target.value)}
                        className="mr-2"
                      />
                      En mois
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="dureeType"
                        value="cycles"
                        checked={formData.dureeType === 'cycles'}
                        onChange={(e) => handleInputChange('dureeType', e.target.value)}
                        className="mr-2"
                      />
                      En cycles
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dureeValeur">
                    Durée ({formData.dureeType === 'mois' ? 'mois' : 'cycles'}) *
                  </Label>
                  <Input
                    id="dureeValeur"
                    type="number"
                    value={formData.dureeValeur}
                    onChange={(e) => handleInputChange('dureeValeur', e.target.value)}
                    placeholder={formData.dureeType === 'mois' ? '12' : '6'}
                    className="bg-white/60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="membresMin">Nombre minimum de membres *</Label>
                  <Input
                    id="membresMin"
                    type="number"
                    value={formData.membresMin}
                    onChange={(e) => handleInputChange('membresMin', e.target.value)}
                    placeholder="5"
                    className="bg-white/60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="membresMax">Nombre maximum de membres *</Label>
                  <Input
                    id="membresMax"
                    type="number"
                    value={formData.membresMax}
                    onChange={(e) => handleInputChange('membresMax', e.target.value)}
                    placeholder="30"
                    className="bg-white/60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cycleDuree">Durée d'un cycle (jours)</Label>
                <Select value={formData.cycleDuree} onValueChange={(value) => handleInputChange('cycleDuree', value)}>
                  <SelectTrigger className="bg-white/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 jours (semaine)</SelectItem>
                    <SelectItem value="15">15 jours</SelectItem>
                    <SelectItem value="30">30 jours</SelectItem>
                    <SelectItem value="31">31 jours (par défaut)</SelectItem>
                    <SelectItem value="60">60 jours</SelectItem>
                    <SelectItem value="90">90 jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Étape 4: Règles de fonctionnement */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Règles de fonctionnement</h2>
                <p className="text-gray-600">Définissez les règles de retrait</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="reglesRetrait">Règles de retrait *</Label>
                  <Select value={formData.reglesRetrait} onValueChange={(value) => handleInputChange('reglesRetrait', value)}>
                    <SelectTrigger className="bg-white/60">
                      <SelectValue placeholder="Sélectionner les règles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="libre">Retrait libre à tout moment</SelectItem>
                      <SelectItem value="delai_minimum">Après délai minimum</SelectItem>
                      <SelectItem value="tour_role">Tour de rôle</SelectItem>
                      <SelectItem value="fin_cycle">Uniquement en fin de cycle</SelectItem>
                      <SelectItem value="conditions_speciales">Conditions spéciales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="delaiRetrait">Délai minimum avant retrait (jours) *</Label>
                    <Input
                      id="delaiRetrait"
                      type="number"
                      value={formData.delaiRetrait}
                      onChange={(e) => handleInputChange('delaiRetrait', e.target.value)}
                      placeholder="90"
                      className="bg-white/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="limiteDecouvert">Limite de découvert (FCFA)</Label>
                    <Input
                      id="limiteDecouvert"
                      type="number"
                      value={formData.limiteDecouvert}
                      onChange={(e) => handleInputChange('limiteDecouvert', e.target.value)}
                      placeholder="0"
                      className="bg-white/60"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Options avancées</Label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.autoValidation}
                        onChange={(e) => handleInputChange('autoValidation', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm">Validation automatique des adhésions</span>
                    </label>
                    
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.notificationsSms}
                        onChange={(e) => handleInputChange('notificationsSms', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm">Notifications SMS automatiques</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 5: Révision et publication */}
          {activeStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Révision et publication</h2>
                <p className="text-gray-600">Vérifiez les informations avant de publier</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="p-4" hover={false}>
                  <h4 className="font-semibold text-emerald-800 mb-3 flex items-center">
                    <Info className="mr-2" size={16} />
                    Informations générales
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nom:</strong> {formData.nom || 'Non défini'}</div>
                    <div><strong>Type:</strong> {formData.type || 'Non défini'}</div>
                    <div><strong>Description:</strong> {formData.description ? `${formData.description.substring(0, 50)}...` : 'Non définie'}</div>
                  </div>
                </GlassCard>

                <GlassCard className="p-4" hover={false}>
                  <h4 className="font-semibold text-emerald-800 mb-3 flex items-center">
                    <DollarSign className="mr-2" size={16} />
                    Configuration financière
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Montants:</strong> {formData.montantMin || '0'} - {formData.montantMax || '0'} FCFA</div>
                    <div><strong>Frais d'adhésion:</strong> {formData.fraisAdhesion || '0'} FCFA</div>
                    <div><strong>Périodicité:</strong> {formData.periodicite || 'Non définie'}</div>
                  </div>
                </GlassCard>

                <GlassCard className="p-4" hover={false}>
                  <h4 className="font-semibold text-emerald-800 mb-3 flex items-center">
                    <Users className="mr-2" size={16} />
                    Durée et membres
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Durée:</strong> {formData.dureeValeur || '0'} {formData.dureeType}</div>
                    <div><strong>Membres:</strong> {formData.membresMin || '0'} - {formData.membresMax || '0'}</div>
                    <div><strong>Cycle:</strong> {formData.cycleDuree} jours</div>
                  </div>
                </GlassCard>

                <GlassCard className="p-4" hover={false}>
                  <h4 className="font-semibold text-emerald-800 mb-3 flex items-center">
                    <Settings className="mr-2" size={16} />
                    Règles
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Retrait:</strong> {formData.reglesRetrait || 'Non défini'}</div>
                    <div><strong>Délai minimum:</strong> {formData.delaiRetrait || '0'} jours</div>
                  </div>
                </GlassCard>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-600 mt-0.5" size={16} />
                  <div>
                    <h4 className="font-medium text-emerald-800 mb-1">Prêt à publier</h4>
                    <p className="text-sm text-emerald-700">
                      Votre tontine est correctement configurée et prête à être publiée. Les clients pourront immédiatement commencer à adhérer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div>
              {activeStep > 1 && (
                <GlassButton variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="mr-2" size={16} />
                  Précédent
                </GlassButton>
              )}
            </div>

            <div className="flex gap-3">
              {activeStep === 5 ? (
                <>
                  <GlassButton 
                    variant="outline" 
                    onClick={() => handleSave(false)}
                    disabled={isLoading}
                  >
                    <Save className="mr-2" size={16} />
                    Sauvegarder en brouillon
                  </GlassButton>
                  <GlassButton 
                    onClick={() => handleSave(true)}
                    disabled={isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Publication...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2" size={16} />
                        Publier la tontine
                      </>
                    )}
                  </GlassButton>
                </>
              ) : (
                <GlassButton onClick={handleNextStep}>
                  Suivant
                  <ArrowLeft className="ml-2 rotate-180" size={16} />
                </GlassButton>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default CreateTontine;