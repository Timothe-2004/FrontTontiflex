'use client'
import React, { useState } from 'react';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Settings, 
  Activity,
  Database,
  Globe,
  ArrowLeft,
  Save,
  Upload,
  MapPin,
  Phone,
  Mail,
  FileText,
  DollarSign,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Calendar,
  User,
  Building,
  CreditCard,
  Percent,
  LucideIcon
} from 'lucide-react';

// Types et interfaces
type SFDType = 'cooperative' | 'microfinance' | 'federation' | 'mutual';

type Region = 'Alibori' | 'Atacora' | 'Atlantique' | 'Borgou' | 'Collines' | 
              'Couffo' | 'Donga' | 'Littoral' | 'Mono' | 'Ouémé' | 'Plateau' | 'Zou';

type ReportFrequency = 'weekly' | 'monthly' | 'quarterly';

interface Tontine {
  name: string;
  description: string;
  minContribution: number;
  maxContribution: number;
  cycleDuration: number;
  memberLimit: number;
}

interface Documents {
  license: File | null;
  registration: File | null;
  authorization: File | null;
  adminId: File | null;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  reportFrequency: ReportFrequency;
}

interface SFDData {
  // Informations générales
  name: string;
  fullName: string;
  description: string;
  type: SFDType;
  establishedDate: string;
  registrationNumber: string;
  
  // Contact et localisation
  address: string;
  city: string;
  region: Region | '';
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  
  // Administrateur principal
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  adminPosition: string;
  
  // Documents
  documents: Documents;
}

interface ValidationErrors {
  [key: string]: string;
}

interface Step {
  id: number;
  title: string;
  icon: LucideIcon;
}

interface SFDTypeOption {
  value: SFDType;
  label: string;
}

interface RegionOption {
  value: Region;
  label: Region;
}

interface ReportFrequencyOption {
  value: ReportFrequency;
  label: string;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

interface DocumentConfig {
  key: keyof Documents;
  label: string;
}

// Props des composants
interface InputFieldProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  required?: boolean;
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
  required?: boolean;
}

const CreateSFD: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [sfdData, setSfdData] = useState<SFDData>({
    // Informations générales
    name: '',
    fullName: '',
    description: '',
    type: 'cooperative',
    establishedDate: '',
    registrationNumber: '',
    
    // Contact et localisation
    address: '',
    city: '',
    region: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    
    // Administrateur principal
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: '',
    adminPosition: '',
    
    // Documents
    documents: {
      license: null,
      registration: null,
      authorization: null,
      adminId: null
    }
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const steps: Step[] = [
    { id: 1, title: 'Informations générales', icon: Building2 },
    { id: 2, title: 'Localisation & Contact', icon: MapPin },
    { id: 3, title: 'Administrateur', icon: User },
    { id: 4, title: 'Documents & Validation', icon: FileText }
  ];

  const regions: Region[] = [
    'Alibori', 'Atacora', 'Atlantique', 'Borgou', 'Collines',
    'Couffo', 'Donga', 'Littoral', 'Mono', 'Ouémé', 'Plateau', 'Zou'
  ];

  const sfdTypes: SFDTypeOption[] = [
    { value: 'cooperative', label: 'Coopérative d\'épargne et de crédit' },
    { value: 'microfinance', label: 'Institution de microfinance' },
    { value: 'federation', label: 'Fédération de coopératives' },
    { value: 'mutual', label: 'Société mutuelle' }
  ];

  const reportFrequencyOptions: ReportFrequencyOption[] = [
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' },
    { value: 'quarterly', label: 'Trimestriel' }
  ];

  const documentConfigs: DocumentConfig[] = [
    { key: 'license', label: 'Licence d\'exploitation' },
    { key: 'registration', label: 'Certificat d\'enregistrement' },
    { key: 'authorization', label: 'Autorisation BCEAO' },
    { key: 'adminId', label: 'Pièce d\'identité administrateur' }
  ];

  const navItems: NavItem[] = [
    { icon: Activity, label: 'Vue d\'ensemble' },
    { icon: Users, label: 'Gestion utilisateurs' },
    { icon: Building2, label: 'Gestion SFD', active: true },
    { icon: TrendingUp, label: 'Analytics' },
    { icon: Database, label: 'Logs & Audit' },
    { icon: Globe, label: 'Intégrations' },
    { icon: Settings, label: 'Paramètres' },
  ];

  const updateField = <K extends keyof SFDData>(field: K, value: SFDData[K]): void => {
    setSfdData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };


  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};
    
    switch(step) {
      case 1:
        if (!sfdData.name) newErrors.name = 'Le nom est requis';
        if (!sfdData.fullName) newErrors.fullName = 'Le nom complet est requis';
        if (!sfdData.description) newErrors.description = 'La description est requise';
        if (!sfdData.registrationNumber) newErrors.registrationNumber = 'Le numéro d\'enregistrement est requis';
        break;
      case 2:
        if (!sfdData.address) newErrors.address = 'L\'adresse est requise';
        if (!sfdData.city) newErrors.city = 'La ville est requise';
        if (!sfdData.region) newErrors.region = 'La région est requise';
        if (!sfdData.phone) newErrors.phone = 'Le téléphone est requis';
        if (!sfdData.email) newErrors.email = 'L\'email est requis';
        break;
      case 3:
        if (!sfdData.adminFirstName) newErrors.adminFirstName = 'Le prénom est requis';
        if (!sfdData.adminLastName) newErrors.adminLastName = 'Le nom est requis';
        if (!sfdData.adminEmail) newErrors.adminEmail = 'L\'email administrateur est requis';
        if (!sfdData.adminPhone) newErrors.adminPhone = 'Le téléphone administrateur est requis';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = (): void => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = (): void => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    // Simulation d'envoi
    setTimeout(() => {
      setIsSubmitting(false);
      alert('SFD créé avec succès !');
    }, 2000);
  };

  const handleNumberChange = (value: string): number => parseFloat(value) || 0;
  const handleIntChange = (value: string): number => parseInt(value) || 0;

  const InputField: React.FC<InputFieldProps> = ({ 
    label, 
    type = "text", 
    value, 
    onChange, 
    placeholder, 
    error, 
    required = false 
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-archivo font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-white border rounded-lg font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${
          error ? 'border-red-300' : 'border-gray-200'
        }`}
      />
      {error && (
        <p className="text-xs font-archivo text-red-600">{error}</p>
      )}
    </div>
  );

  const SelectField: React.FC<SelectFieldProps> = ({ 
    label, 
    value, 
    onChange, 
    options, 
    error, 
    required = false 
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-archivo font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 bg-white border rounded-lg font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${
          error ? 'border-red-300' : 'border-gray-200'
        }`}
      >
        <option value="">Sélectionner...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs font-archivo text-red-600">{error}</p>
      )}
    </div>
  );

  const TextAreaField: React.FC<TextAreaFieldProps> = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    rows = 3, 
    error, 
    required = false 
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-archivo font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 bg-white border rounded-lg font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${
          error ? 'border-red-300' : 'border-gray-200'
        }`}
      />
      {error && (
        <p className="text-xs font-archivo text-red-600">{error}</p>
      )}
    </div>
  );

  const renderStep = (): React.ReactElement | null => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Nom du SFD"
                value={sfdData.name}
                onChange={(value) => updateField('name', value)}
                placeholder="Ex: CLCAM"
                error={errors.name}
                required
              />
              <InputField
                label="Nom complet"
                value={sfdData.fullName}
                onChange={(value) => updateField('fullName', value)}
                placeholder="Ex: Caisse Locale de Crédit Agricole Mutuel"
                error={errors.fullName}
                required
              />
              <SelectField
                label="Type d'institution"
                value={sfdData.type}
                onChange={(value) => updateField('type', value as SFDType)}
                options={sfdTypes}
                required
              />
              <InputField
                label="Date de création"
                type="date"
                value={sfdData.establishedDate}
                onChange={(value) => updateField('establishedDate', value)}
              />
              <InputField
                label="Numéro d'enregistrement"
                value={sfdData.registrationNumber}
                onChange={(value) => updateField('registrationNumber', value)}
                placeholder="Ex: REG-2023-001"
                error={errors.registrationNumber}
                required
              />
            </div>
            <TextAreaField
              label="Description"
              value={sfdData.description}
              onChange={(value) => updateField('description', value)}
              placeholder="Décrivez l'activité et la mission du SFD..."
              rows={4}
              error={errors.description}
              required
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Adresse"
                value={sfdData.address}
                onChange={(value) => updateField('address', value)}
                placeholder="Adresse complète"
                error={errors.address}
                required
              />
              <InputField
                label="Ville"
                value={sfdData.city}
                onChange={(value) => updateField('city', value)}
                placeholder="Ex: Cotonou"
                error={errors.city}
                required
              />
              <SelectField
                label="Région"
                value={sfdData.region}
                onChange={(value) => updateField('region', value as Region)}
                options={regions.map(region => ({ value: region, label: region }))}
                error={errors.region}
                required
              />
              <InputField
                label="Code postal"
                value={sfdData.postalCode}
                onChange={(value) => updateField('postalCode', value)}
                placeholder="Ex: 01BP123"
              />
              <InputField
                label="Téléphone"
                type="tel"
                value={sfdData.phone}
                onChange={(value) => updateField('phone', value)}
                placeholder="+229 XX XX XX XX"
                error={errors.phone}
                required
              />
              <InputField
                label="Email"
                type="email"
                value={sfdData.email}
                onChange={(value) => updateField('email', value)}
                placeholder="contact@sfd.bj"
                error={errors.email}
                required
              />
              <InputField
                label="Site web"
                type="url"
                value={sfdData.website}
                onChange={(value) => updateField('website', value)}
                placeholder="https://www.sfd.bj"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-4 h-4 text-blue-600" />
                <p className="font-archivo text-sm font-medium text-blue-800">Administrateur principal</p>
              </div>
              <p className="font-archivo text-xs text-blue-600">
                Cette personne aura accès complet à la gestion du SFD dans TontiFlex
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Prénom"
                value={sfdData.adminFirstName}
                onChange={(value) => updateField('adminFirstName', value)}
                error={errors.adminFirstName}
                required
              />
              <InputField
                label="Nom"
                value={sfdData.adminLastName}
                onChange={(value) => updateField('adminLastName', value)}
                error={errors.adminLastName}
                required
              />
              <InputField
                label="Email"
                type="email"
                value={sfdData.adminEmail}
                onChange={(value) => updateField('adminEmail', value)}
                placeholder="admin@sfd.bj"
                error={errors.adminEmail}
                required
              />
              <InputField
                label="Téléphone"
                type="tel"
                value={sfdData.adminPhone}
                onChange={(value) => updateField('adminPhone', value)}
                placeholder="+229 XX XX XX XX"
                error={errors.adminPhone}
                required
              />
              <InputField
                label="Poste/Fonction"
                value={sfdData.adminPosition}
                onChange={(value) => updateField('adminPosition', value)}
                placeholder="Ex: Directeur Général"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <p className="font-archivo text-sm font-medium text-yellow-800">Documents requis</p>
              </div>
              <p className="font-archivo text-xs text-yellow-600">
                Veuillez télécharger tous les documents requis pour valider l'enregistrement du SFD
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-archivo font-medium text-foreground">Documents officiels</h4>
                
                {documentConfigs.map((doc) => (
                  <div key={doc.key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-archivo text-sm font-medium text-foreground">{doc.label}</p>
                      <button className="flex items-center space-x-2 px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                        <Upload className="w-3 h-3" />
                        <span className="font-archivo text-xs">Télécharger</span>
                      </button>
                    </div>
                    {sfdData.documents[doc.key] ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-archivo text-sm">Document téléchargé</span>
                      </div>
                    ) : (
                      <p className="font-archivo text-xs text-muted-foreground">Aucun fichier sélectionné</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-accent/20">
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-primary" />
              </button>
              <div>
                <h1 className="text-3xl font-chillax font-bold text-foreground">
                  Créer un nouveau SFD
                </h1>
                <p className="font-archivo text-muted-foreground">
                  Configuration d'un nouveau Système Financier Décentralisé
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-lg p-6 shadow-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    step.id === currentStep 
                      ? 'bg-primary border-primary text-white' 
                      : step.id < currentStep 
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    {step.id < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-archivo font-medium ${
                      step.id === currentStep 
                        ? 'text-primary' 
                        : step.id < currentStep 
                          ? 'text-green-600'
                          : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`mx-4 h-0.5 w-12 ${
                      step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-lg p-6 shadow-lg">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {steps[currentStep - 1].title}
              </h2>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {renderStep()}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-archivo text-sm transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Précédent</span>
              </button>

              {currentStep === steps.length ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Création...' : 'Créer le SFD'}</span>
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <span>Suivant</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSFD;