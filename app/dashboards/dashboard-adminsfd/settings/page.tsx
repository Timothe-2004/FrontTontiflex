// app/dashboard-sfd-admin/settings/page.tsx
'use client'
import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Settings, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  DollarSign, 
  Percent, 
  Clock, 
  Shield, 
  Bell, 
  FileText, 
  Save, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
  Upload,
  Download,
  Key,
  Smartphone,
  Users,
  Calendar,
  Target,
  Activity
} from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // État des paramètres
  const [generalSettings, setGeneralSettings] = useState({
    nomSFD: 'SFD Porto-Novo',
    sigle: 'SFDPN',
    adresse: 'Avenue Steinmetz, Porto-Novo, Bénin',
    telephone: '+229 20 21 22 23',
    email: 'contact@sfdportionovo.bj',
    siteWeb: 'www.sfdportionovo.bj',
    numeroAgrement: 'AGR-BCEAO-2018-001',
    dateAgrement: '2018-03-15',
    logo: null
  });

  const [financialSettings, setFinancialSettings] = useState({
    deviseParDefaut: 'FCFA',
    tauxCommissionDefaut: 2.5,
    fraisAdhesionMin: 500,
    fraisAdhesionMax: 5000,
    montantCotisationMin: 100,
    montantCotisationMax: 50000,
    limiteDecouvertDefaut: 0,
    tauxInteretDefaut: 12.0,
    penaliteRetardDefaut: 1.5,
    delaiGraceDefaut: 3
  });

  const [operationalSettings, setOperationalSettings] = useState({
    heuresOuverture: '08:00',
    heuresFermeture: '17:00',
    joursOuverture: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
    delaiTraitementAdhesion: 24,
    delaiTraitementRetrait: 48,
    delaiTraitementPret: 72,
    validationAutomatique: false,
    seuilValidationManuelle: 100000,
    nombreMaxTontinesClient: 5
  });

  const [securitySettings, setSecuritySettings] = useState({
    authentificationDouble: true,
    sessionTimeout: 30,
    tentativesConnexionMax: 5,
    dureeBloquageCompte: 30,
    notificationConnexionSuspecte: true,
    chiffrementDonnees: true,
    sauvegardeAutomatique: true,
    frequenceSauvegarde: 'quotidienne'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    smsActif: true,
    emailActif: true,
    notifAdhesion: true,
    notifCotisation: true,
    notifRetrait: true,
    notifPret: true,
    notifEcheance: true,
    notifInactivite: true,
    delaiRappelEcheance: 3,
    nombreRappelsMax: 3
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    mtnMobileMoneyActif: true,
    moovMoneyActif: true,
    apiKeyMTN: 'mtn_****_****_****',
    apiKeyMoov: 'moov_****_****_****',
    webhookUrl: 'https://api.tontiflexapp.onrender.com/api/payments/webhook',
    passerelleSSMS: 'provider_xyz',
    formatSMS: 'TontiFlex: {message}. Infos: {telephone}',
    langueDefaut: 'français'
  });

  const tabs = [
    { id: 'general', label: 'Informations générales', icon: Building },
    { id: 'financial', label: 'Paramètres financiers', icon: DollarSign },
    { id: 'operational', label: 'Fonctionnement', icon: Clock },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Intégrations', icon: Smartphone }
  ];

  const handleSave = async (section: string) => {
    setIsLoading(true);
    
    try {
      // Simulation API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Paramètres ${section} sauvegardés avec succès!`);
      console.log(`Sauvegarde section: ${section}`);
      
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (file: File, type: string) => {
    // Simulation upload
    toast.success(`${type} téléchargé avec succès`);
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomSFD">Nom du SFD *</Label>
            <Input
              id="nomSFD"
              value={generalSettings.nomSFD}
              onChange={(e) => setGeneralSettings({...generalSettings, nomSFD: e.target.value})}
              className="bg-white/60"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sigle">Sigle</Label>
            <Input
              id="sigle"
              value={generalSettings.sigle}
              onChange={(e) => setGeneralSettings({...generalSettings, sigle: e.target.value})}
              className="bg-white/60"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone *</Label>
            <Input
              id="telephone"
              value={generalSettings.telephone}
              onChange={(e) => setGeneralSettings({...generalSettings, telephone: e.target.value})}
              className="bg-white/60"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={generalSettings.email}
              onChange={(e) => setGeneralSettings({...generalSettings, email: e.target.value})}
              className="bg-white/60"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse complète *</Label>
            <textarea
              id="adresse"
              value={generalSettings.adresse}
              onChange={(e) => setGeneralSettings({...generalSettings, adresse: e.target.value})}
              rows={3}
              className="w-full p-3 bg-white/60 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteWeb">Site web</Label>
            <Input
              id="siteWeb"
              value={generalSettings.siteWeb}
              onChange={(e) => setGeneralSettings({...generalSettings, siteWeb: e.target.value})}
              className="bg-white/60"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroAgrement">Numéro d'agrément BCEAO</Label>
            <Input
              id="numeroAgrement"
              value={generalSettings.numeroAgrement}
              onChange={(e) => setGeneralSettings({...generalSettings, numeroAgrement: e.target.value})}
              className="bg-white/60"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateAgrement">Date d'agrément</Label>
            <Input
              id="dateAgrement"
              type="date"
              value={generalSettings.dateAgrement}
              onChange={(e) => setGeneralSettings({...generalSettings, dateAgrement: e.target.value})}
              className="bg-white/60"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="font-semibold mb-4">Logo du SFD</h4>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Building className="text-emerald-600" size={32} />
          </div>
          <div>
            <GlassButton variant="outline" size="sm">
              <Upload className="mr-2" size={16} />
              Télécharger logo
            </GlassButton>
            <p className="text-xs text-gray-500 mt-2">
              Formats acceptés: PNG, JPG. Taille max: 2MB. Recommandé: 200x200px
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-4">
          <h4 className="font-semibold mb-4 flex items-center">
            <DollarSign className="mr-2 text-emerald-600" size={20} />
            Frais et commissions
          </h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Taux de commission par défaut (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={financialSettings.tauxCommissionDefaut}
                onChange={(e) => setFinancialSettings({...financialSettings, tauxCommissionDefaut: parseFloat(e.target.value)})}
                className="bg-white/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frais adhésion min (FCFA)</Label>
                <Input
                  type="number"
                  value={financialSettings.fraisAdhesionMin}
                  onChange={(e) => setFinancialSettings({...financialSettings, fraisAdhesionMin: parseInt(e.target.value)})}
                  className="bg-white/60"
                />
              </div>
              <div className="space-y-2">
                <Label>Frais adhésion max (FCFA)</Label>
                <Input
                  type="number"
                  value={financialSettings.fraisAdhesionMax}
                  onChange={(e) => setFinancialSettings({...financialSettings, fraisAdhesionMax: parseInt(e.target.value)})}
                  className="bg-white/60"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <h4 className="font-semibold mb-4 flex items-center">
            <Target className="mr-2 text-emerald-600" size={20} />
            Limites de cotisation
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cotisation min (FCFA)</Label>
                <Input
                  type="number"
                  value={financialSettings.montantCotisationMin}
                  onChange={(e) => setFinancialSettings({...financialSettings, montantCotisationMin: parseInt(e.target.value)})}
                  className="bg-white/60"
                />
              </div>
              <div className="space-y-2">
                <Label>Cotisation max (FCFA)</Label>
                <Input
                  type="number"
                  value={financialSettings.montantCotisationMax}
                  onChange={(e) => setFinancialSettings({...financialSettings, montantCotisationMax: parseInt(e.target.value)})}
                  className="bg-white/60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Limite découvert par défaut (FCFA)</Label>
              <Input
                type="number"
                value={financialSettings.limiteDecouvertDefaut}
                onChange={(e) => setFinancialSettings({...financialSettings, limiteDecouvertDefaut: parseInt(e.target.value)})}
                className="bg-white/60"
              />
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-4">
        <h4 className="font-semibold mb-4 flex items-center">
          <Percent className="mr-2 text-emerald-600" size={20} />
          Paramètres de crédit
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Taux d'intérêt par défaut (%/an)</Label>
            <Input
              type="number"
              step="0.1"
              value={financialSettings.tauxInteretDefaut}
              onChange={(e) => setFinancialSettings({...financialSettings, tauxInteretDefaut: parseFloat(e.target.value)})}
              className="bg-white/60"
            />
          </div>
          <div className="space-y-2">
            <Label>Pénalité de retard (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={financialSettings.penaliteRetardDefaut}
              onChange={(e) => setFinancialSettings({...financialSettings, penaliteRetardDefaut: parseFloat(e.target.value)})}
              className="bg-white/60"
            />
          </div>
          <div className="space-y-2">
            <Label>Délai de grâce (jours)</Label>
            <Input
              type="number"
              value={financialSettings.delaiGraceDefaut}
              onChange={(e) => setFinancialSettings({...financialSettings, delaiGraceDefaut: parseInt(e.target.value)})}
              className="bg-white/60"
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );

  const renderOperationalTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-4">
          <h4 className="font-semibold mb-4 flex items-center">
            <Clock className="mr-2 text-emerald-600" size={20} />
            Horaires de fonctionnement
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heure d'ouverture</Label>
                <Input
                  type="time"
                  value={operationalSettings.heuresOuverture}
                  onChange={(e) => setOperationalSettings({...operationalSettings, heuresOuverture: e.target.value})}
                  className="bg-white/60"
                />
              </div>
              <div className="space-y-2">
                <Label>Heure de fermeture</Label>
                <Input
                  type="time"
                  value={operationalSettings.heuresFermeture}
                  onChange={(e) => setOperationalSettings({...operationalSettings, heuresFermeture: e.target.value})}
                  className="bg-white/60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Jours d'ouverture</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(jour => (
                  <label key={jour} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={operationalSettings.joursOuverture.includes(jour)}
                      onChange={(e) => {
                        const jours = e.target.checked 
                          ? [...operationalSettings.joursOuverture, jour]
                          : operationalSettings.joursOuverture.filter(j => j !== jour);
                        setOperationalSettings({...operationalSettings, joursOuverture: jours});
                      }}
                      className="mr-2"
                    />
                    {jour}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <h4 className="font-semibold mb-4 flex items-center">
            <Activity className="mr-2 text-emerald-600" size={20} />
            Délais de traitement
          </h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Adhésion tontine (heures)</Label>
              <Input
                type="number"
                value={operationalSettings.delaiTraitementAdhesion}
                onChange={(e) => setOperationalSettings({...operationalSettings, delaiTraitementAdhesion: parseInt(e.target.value)})}
                className="bg-white/60"
              />
            </div>
            <div className="space-y-2">
              <Label>Retrait (heures)</Label>
              <Input
                type="number"
                value={operationalSettings.delaiTraitementRetrait}
                onChange={(e) => setOperationalSettings({...operationalSettings, delaiTraitementRetrait: parseInt(e.target.value)})}
                className="bg-white/60"
              />
            </div>
            <div className="space-y-2">
              <Label>Prêt (heures)</Label>
              <Input
                type="number"
                value={operationalSettings.delaiTraitementPret}
                onChange={(e) => setOperationalSettings({...operationalSettings, delaiTraitementPret: parseInt(e.target.value)})}
                className="bg-white/60"
              />
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-4">
        <h4 className="font-semibold mb-4 flex items-center">
          <Settings className="mr-2 text-emerald-600" size={20} />
          Règles automatiques
        </h4>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={operationalSettings.validationAutomatique}
              onChange={(e) => setOperationalSettings({...operationalSettings, validationAutomatique: e.target.checked})}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span>Validation automatique des opérations</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Seuil validation manuelle (FCFA)</Label>
              <Input
                type="number"
                value={operationalSettings.seuilValidationManuelle}
                onChange={(e) => setOperationalSettings({...operationalSettings, seuilValidationManuelle: parseInt(e.target.value)})}
                className="bg-white/60"
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre max tontines/client</Label>
              <Input
                type="number"
                value={operationalSettings.nombreMaxTontinesClient}
                onChange={(e) => setOperationalSettings({...operationalSettings, nombreMaxTontinesClient: parseInt(e.target.value)})}
                className="bg-white/60"
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-4">
          <h4 className="font-semibold mb-4 flex items-center">
            <Shield className="mr-2 text-emerald-600" size={20} />
            Authentification et accès
          </h4>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={securitySettings.authentificationDouble}
                onChange={(e) => setSecuritySettings({...securitySettings, authentificationDouble: e.target.checked})}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Authentification à double facteur</span>
            </label>

            <div className="space-y-2">
              <Label>Durée session (minutes)</Label>
              <Input
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                className="bg-white/60"
              />
            </div>

            <div className="space-y-2">
              <Label>Tentatives de connexion max</Label>
              <Input
                type="number"
                value={securitySettings.tentativesConnexionMax}
                onChange={(e) => setSecuritySettings({...securitySettings, tentativesConnexionMax: parseInt(e.target.value)})}
                className="bg-white/60"
              />
            </div>

            <div className="space-y-2">
              <Label>Durée de blocage (minutes)</Label>
              <Input
                type="number"
                value={securitySettings.dureeBloquageCompte}
                onChange={(e) => setSecuritySettings({...securitySettings, dureeBloquageCompte: parseInt(e.target.value)})}
                className="bg-white/60"
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <h4 className="font-semibold mb-4 flex items-center">
            <Key className="mr-2 text-emerald-600" size={20} />
            Protection des données
          </h4>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={securitySettings.notificationConnexionSuspecte}
                onChange={(e) => setSecuritySettings({...securitySettings, notificationConnexionSuspecte: e.target.checked})}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Notification connexion suspecte</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={securitySettings.chiffrementDonnees}
                onChange={(e) => setSecuritySettings({...securitySettings, chiffrementDonnees: e.target.checked})}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Chiffrement des données sensibles</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={securitySettings.sauvegardeAutomatique}
                onChange={(e) => setSecuritySettings({...securitySettings, sauvegardeAutomatique: e.target.checked})}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Sauvegarde automatique</span>
            </label>

            <div className="space-y-2">
              <Label>Fréquence de sauvegarde</Label>
              <Select 
                value={securitySettings.frequenceSauvegarde} 
                onValueChange={(value) => setSecuritySettings({...securitySettings, frequenceSauvegarde: value})}
              >
                <SelectTrigger className="bg-white/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horaire">Horaire</SelectItem>
                  <SelectItem value="quotidienne">Quotidienne</SelectItem>
                  <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
          <div>
            <h4 className="font-medium text-yellow-800 mb-1">Conformité BCEAO</h4>
            <p className="text-sm text-yellow-700">
              Ces paramètres de sécurité sont configurés pour respecter les exigences réglementaires de la BCEAO. 
              Toute modification doit être validée par votre responsable conformité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-4">
          <h4 className="font-semibold mb-4 flex items-center">
            <Bell className="mr-2 text-emerald-600" size={20} />
            Canaux de notification
          </h4>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={notificationSettings.smsActif}
                onChange={(e) => setNotificationSettings({...notificationSettings, smsActif: e.target.checked})}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Notifications SMS</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={notificationSettings.emailActif}
                onChange={(e) => setNotificationSettings({...notificationSettings, emailActif: e.target.checked})}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Notifications Email</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Délai rappel échéance (jours)</Label>
                <Input
                  type="number"
                  value={notificationSettings.delaiRappelEcheance}
                  onChange={(e) => setNotificationSettings({...notificationSettings, delaiRappelEcheance: parseInt(e.target.value)})}
                  className="bg-white/60"
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre de rappels max</Label>
                <Input
                  type="number"
                  value={notificationSettings.nombreRappelsMax}
                  onChange={(e) => setNotificationSettings({...notificationSettings, nombreRappelsMax: parseInt(e.target.value)})}
                  className="bg-white/60"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <h4 className="font-semibold mb-4 flex items-center">
            <FileText className="mr-2 text-emerald-600" size={20} />
            Types de notifications
          </h4>
          <div className="space-y-3">
            {[
              { key: 'notifAdhesion', label: 'Adhésions tontines' },
              { key: 'notifCotisation', label: 'Cotisations' },
              { key: 'notifRetrait', label: 'Retraits' },
              { key: 'notifPret', label: 'Prêts' },
              { key: 'notifEcheance', label: 'Échéances' },
              { key: 'notifInactivite', label: 'Inactivité client' }
            ].map(notif => (
              <label key={notif.key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notificationSettings[notif.key as keyof typeof notificationSettings] as boolean}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings, 
                    [notif.key]: e.target.checked
                  })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-sm">{notif.label}</span>
              </label>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-4">
          <h4 className="font-semibold mb-4 flex items-center">
            <Smartphone className="mr-2 text-emerald-600" size={20} />
            Mobile Money
          </h4>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={integrationSettings.mtnMobileMoneyActif}
                onChange={(e) => setIntegrationSettings({...integrationSettings, mtnMobileMoneyActif: e.target.checked})}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>MTN Mobile Money</span>
            </label>

            <div className="space-y-2">
              <Label>Clé API MTN</Label>
              <div className="flex gap-2">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={integrationSettings.apiKeyMTN}
                  onChange={(e) => setIntegrationSettings({...integrationSettings, apiKeyMTN: e.target.value})}
                  className="bg-white/60"
                />
                <GlassButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </GlassButton>
              </div>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={integrationSettings.moovMoneyActif}
                onChange={(e) => setIntegrationSettings({...integrationSettings, moovMoneyActif: e.target.checked})}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Moov Money</span>
            </label>

            <div className="space-y-2">
              <Label>Clé API Moov</Label>
              <div className="flex gap-2">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={integrationSettings.apiKeyMoov}
                  onChange={(e) => setIntegrationSettings({...integrationSettings, apiKeyMoov: e.target.value})}
                  className="bg-white/60"
                />
                <GlassButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </GlassButton>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <h4 className="font-semibold mb-4 flex items-center">
            <Globe className="mr-2 text-emerald-600" size={20} />
            API et Webhooks
          </h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>URL Webhook</Label>
              <Input
                value={integrationSettings.webhookUrl}
                onChange={(e) => setIntegrationSettings({...integrationSettings, webhookUrl: e.target.value})}
                className="bg-white/60"
              />
            </div>

            <div className="space-y-2">
              <Label>Passerelle SMS</Label>
              <Input
                value={integrationSettings.passerelleSSMS}
                onChange={(e) => setIntegrationSettings({...integrationSettings, passerelleSSMS: e.target.value})}
                className="bg-white/60"
              />
            </div>

            <div className="space-y-2">
              <Label>Format SMS par défaut</Label>
              <textarea
                value={integrationSettings.formatSMS}
                onChange={(e) => setIntegrationSettings({...integrationSettings, formatSMS: e.target.value})}
                rows={3}
                className="w-full p-3 bg-white/60 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <p className="text-xs text-gray-500">
                Variables: {'{message}'}, {'{telephone}'}, {'{nom}'}, {'{montant}'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Langue par défaut</Label>
              <Select 
                value={integrationSettings.langueDefaut} 
                onValueChange={(value) => setIntegrationSettings({...integrationSettings, langueDefaut: value})}
              >
                <SelectTrigger className="bg-white/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="français">Français</SelectItem>
                  <SelectItem value="anglais">Anglais</SelectItem>
                  <SelectItem value="fon">Fon</SelectItem>
                  <SelectItem value="yoruba">Yoruba</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="text-blue-600 mt-0.5" size={16} />
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Test de connectivité</h4>
            <p className="text-sm text-blue-700 mb-3">
              Vérifiez que vos intégrations fonctionnent correctement.
            </p>
            <div className="flex gap-2">
              <GlassButton variant="outline" size="sm">
                <Activity className="mr-2" size={16} />
                Tester MTN
              </GlassButton>
              <GlassButton variant="outline" size="sm">
                <Activity className="mr-2" size={16} />
                Tester Moov
              </GlassButton>
              <GlassButton variant="outline" size="sm">
                <Bell className="mr-2" size={16} />
                Tester SMS
              </GlassButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation par onglets */}
        <GlassCard className="p-1">
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Contenu de l'onglet actif */}
        <GlassCard className="p-6">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'financial' && renderFinancialTab()}
          {activeTab === 'operational' && renderOperationalTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'integrations' && renderIntegrationsTab()}

          {/* Boutons d'action */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle size={16} className="text-green-500" />
              Dernière sauvegarde: Aujourd'hui à 14:30
            </div>
            
            <div className="flex gap-3">
              <GlassButton variant="outline">
                <RefreshCw className="mr-2" size={16} />
                Réinitialiser
              </GlassButton>
              
              <GlassButton
                onClick={() => handleSave(activeTab)}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={16} />
                    Sauvegarder
                  </>
                )}
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default SettingsPage;