import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CreditCard } from "lucide-react";
import router from "next/router";

const LoanApplication = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Demande de crédit soumise avec succès !");
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-primary">Informations personnelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input className="bg-white/50" placeholder="Votre prénom" />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input className="bg-white/50" placeholder="Votre nom" />
              </div>
              <div className="space-y-2">
                <Label>Date de naissance</Label>
                <Input type="date" className="bg-white/50" />
              </div>
              <div className="space-y-2">
                <Label>État civil</Label>
                <Select>
                  <SelectTrigger className="bg-white/50">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Célibataire</SelectItem>
                    <SelectItem value="married">Marié(e)</SelectItem>
                    <SelectItem value="divorced">Divorcé(e)</SelectItem>
                    <SelectItem value="widowed">Veuf(ve)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-primary">Situation financière</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Revenus mensuels (FCFA)</Label>
                <Input type="number" className="bg-white/50" placeholder="50000" />
              </div>
              <div className="space-y-2">
                <Label>Dépenses mensuelles (FCFA)</Label>
                <Input type="number" className="bg-white/50" placeholder="30000" />
              </div>
              <div className="space-y-2">
                <Label>Historique bancaire</Label>
                <Select>
                  <SelectTrigger className="bg-white/50">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Bon</SelectItem>
                    <SelectItem value="fair">Moyen</SelectItem>
                    <SelectItem value="none">Aucun</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label>Montant demandé (FCFA)</Label>
                <Input type="number" className="bg-white/50" placeholder="100000" />
              </div>
              <div className="space-y-2">
                <Label>Durée (mois)</Label>
                <Select>
                  <SelectTrigger className="bg-white/50">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 mois</SelectItem>
                    <SelectItem value="12">12 mois</SelectItem>
                    <SelectItem value="18">18 mois</SelectItem>
                    <SelectItem value="24">24 mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Objet du crédit</Label>
                <Input className="bg-white/50" placeholder="Description du projet" />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-primary">Garanties et consentement</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type de garantie</Label>
                <Select>
                  <SelectTrigger className="bg-white/50">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Garantie personnelle</SelectItem>
                    <SelectItem value="collateral">Nantissement</SelectItem>
                    <SelectItem value="group">Garantie solidaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  En soumettant cette demande, j'accepte les conditions générales de crédit et 
                  consens au traitement de mes données personnelles conformément au RGPD.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <GlassCard>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2 flex items-center justify-center">
                <CreditCard className="mr-2" size={32} />
                Demande de Crédit
              </h1>
              <p className="text-gray-600">Étape {currentStep} sur {totalSteps}</p>
            </div>

            <div className="mb-8">
              <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
            </div>

            <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => e.preventDefault()}>
              {renderStep()}

              <div className="flex justify-between mt-8">
                <GlassButton
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center"
                >
                  <ArrowLeft className="mr-2" size={16} />
                  Précédent
                </GlassButton>

                {currentStep === totalSteps ? (
                  <GlassButton type="submit" className="flex items-center">
                    Soumettre
                    <ArrowRight className="ml-2" size={16} />
                  </GlassButton>
                ) : (
                  <GlassButton
                    type="button"
                    onClick={handleNext}
                    className="flex items-center"
                  >
                    Suivant
                    <ArrowRight className="ml-2" size={16} />
                  </GlassButton>
                )}
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default LoanApplication;
