// components/LoanTermsFormComponent.tsx
import React from 'react';
import { Calculator, Save, X } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface LoanTermsFormComponentProps {
  loanTermsForm: {
    taux_interet_annuel: string;
    taux_penalite_quotidien: string;
    jour_echeance_mensuelle: number;
  };
  setLoanTermsForm: React.Dispatch<React.SetStateAction<any>>;
  loanRequest?: {
    montant_souhaite?: string;
    duree_pret?: number;
  };
  setShowTermsForm: (show: boolean) => void;
  handleCreateLoanTerms: () => void;
  isCreatingTerms: boolean;
}

const LoanTermsForm: React.FC<LoanTermsFormComponentProps> = ({
  loanTermsForm,
  setLoanTermsForm,
  loanRequest,
  setShowTermsForm,
  handleCreateLoanTerms,
  isCreatingTerms,
}) => (
  <GlassCard className="p-6 mt-6" hover={false}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
        <Calculator className="mr-2 text-emerald-600" size={20} />
        Conditions de Remboursement
      </h3>
      <GlassButton
        variant="outline"
        size="sm"
        onClick={() => setShowTermsForm(false)}
      >
        <X size={16} />
      </GlassButton>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="taux_interet">Taux d'intérêt annuel (%)</Label>
        <Input
          id="taux_interet"
          type="text"
          value={loanTermsForm.taux_interet_annuel}
          onChange={(e) =>
            setLoanTermsForm((prev: any) => ({
              ...prev,
              taux_interet_annuel: e.target.value,
            }))
          }
          placeholder="12.50"
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Format: 12.50 (maximum 3 chiffres avant la virgule, 2 après)
        </p>
      </div>

      <div>
        <Label htmlFor="jour_echeance">Jour d'échéance mensuelle</Label>
        <Select
          value={loanTermsForm.jour_echeance_mensuelle.toString()}
          onValueChange={(value) =>
            setLoanTermsForm((prev: any) => ({
              ...prev,
              jour_echeance_mensuelle: parseInt(value),
            }))
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Sélectionner le jour" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <SelectItem key={day} value={day.toString()}>
                {day} du mois
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="taux_penalite">Taux de pénalité quotidien (%)</Label>
        <Input
          id="taux_penalite"
          type="text"
          value={loanTermsForm.taux_penalite_quotidien}
          onChange={(e) =>
            setLoanTermsForm((prev: any) => ({
              ...prev,
              taux_penalite_quotidien: e.target.value,
            }))
          }
          placeholder="0.10"
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Pénalité appliquée par jour de retard
        </p>
      </div>

      <div className="flex items-end">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Montant de la demande
          </p>
          <p className="text-lg font-bold text-emerald-600">
            {parseInt(loanRequest?.montant_souhaite || '0').toLocaleString()} FCFA
          </p>
          <p className="text-xs text-gray-500">
            Durée: {loanRequest?.duree_pret} mois
          </p>
        </div>
      </div>
    </div>

    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
      <GlassButton
        onClick={() => setShowTermsForm(false)}
        variant="outline"
        disabled={isCreatingTerms}
      >
        Annuler
      </GlassButton>
      <GlassButton
        onClick={handleCreateLoanTerms}
        disabled={isCreatingTerms}
        className="flex-1"
      >
        {isCreatingTerms ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Création...
          </>
        ) : (
          <>
            <Save className="mr-2" size={16} />
            Créer les conditions
          </>
        )}
      </GlassButton>
    </div>
  </GlassCard>
);

export default LoanTermsForm;
