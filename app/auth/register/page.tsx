'use client';
import React from "react";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Phone, Mail, MapPin, Briefcase, Lock, FileText, Camera, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
    const router = useRouter();
    const { inscription, isLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        address: "",
        profession: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false
    });

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Validation des champs requis
        if (!formData.firstName.trim()) newErrors.firstName = "Le prénom est requis";
        if (!formData.lastName.trim()) newErrors.lastName = "Le nom est requis";
        if (!formData.phone.trim()) newErrors.phone = "Le téléphone est requis";
        if (!formData.email.trim()) newErrors.email = "L'email est requis";
        if (!formData.address.trim()) newErrors.address = "L'adresse est requise";
        if (!formData.profession.trim()) newErrors.profession = "La profession est requise";
        
        // Validation renforcée du mot de passe
        if (formData.password.length < 8) {
            newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
            newErrors.password = "Le mot de passe doit contenir: 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial (@$!%*?&)";
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
        }
        
        if (!formData.acceptTerms) {
            newErrors.acceptTerms = "Vous devez accepter les conditions d'utilisation";
        }

        // Validation format téléphone (Bénin: +229XXXXXXXX)
        if (formData.phone && !formData.phone.match(/^\+229[0-9]{8}$/)) {
            newErrors.phone = "Format requis: +229XXXXXXXX (ex: +22901234567)";
        }

        // Validation format email
        if (formData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.(com|bj)$/i;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = "Seuls les emails avec un domaine .com ou .bj sont autorisés.";
            }
        }
        // Validation longueur des champs
        if (formData.firstName.length > 50) {
            newErrors.firstName = "Le prénom ne peut pas dépasser 50 caractères";
        }
        if (formData.lastName.length > 50) {
            newErrors.lastName = "Le nom ne peut pas dépasser 50 caractères";
        }
        if (formData.profession.length > 100) {
            newErrors.profession = "La profession ne peut pas dépasser 100 caractères";
        }
        if (formData.address.length > 200) {
            newErrors.address = "L'adresse ne peut pas dépasser 200 caractères";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Veuillez corriger les erreurs dans le formulaire");
            return;
        }

        setLoading(true);

        try {
            // Nettoyage des données avant envoi
            const inscriptionData = {
                nom: formData.lastName.trim(),
                prenom: formData.firstName.trim(),
                telephone: formData.phone.trim(),
                email: formData.email.toLowerCase().trim(),
                adresse: formData.address.trim(),
                profession: formData.profession.trim(),
                motDePasse: formData.password,
            };

            console.log('Données envoyées:', inscriptionData); // Pour débugger

            const result = await inscription(inscriptionData);

            if (result.success) {
                toast.success("Inscription réussie ! 🎉");
                toast.success("Vous pouvez maintenant vous connecter");
                
                // Nettoyer le formulaire
                setFormData({
                    firstName: "",
                    lastName: "",
                    phone: "",
                    email: "",
                    address: "",
                    profession: "",
                    password: "",
                    confirmPassword: "",
                    acceptTerms: false
                });
                
                setTimeout(() => {
                    router.push("/auth/login");
                }, 2000);
            } else {
                toast.error(result.message || "Erreur lors de l'inscription");
                
                // Si l'erreur concerne un champ spécifique, l'afficher
                if (result.message?.includes('email')) {
                    setErrors(prev => ({ ...prev, email: result.message || 'Email déjà utilisé' }));
                }
                if (result.message?.includes('téléphone') || result.message?.includes('telephone')) {
                    setErrors(prev => ({ ...prev, phone: result.message || 'Téléphone déjà utilisé' }));
                }
            }
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            toast.error("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Nettoyer l'erreur du champ modifié
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }

        // Formatage automatique du téléphone
        if (field === 'phone' && typeof value === 'string') {
            let formatted = value.replace(/[^\d+]/g, ''); // Garder seulement les chiffres et +
            
            // Auto-ajouter +229 si l'utilisateur commence à taper des chiffres
            if (formatted.length > 0 && !formatted.startsWith('+')) {
                formatted = '+229' + formatted;
            }
            
            // Limiter à 12 caractères (+229 + 8 chiffres)
            if (formatted.length > 12) {
                formatted = formatted.substring(0, 12);
            }
            
            setFormData(prev => ({ ...prev, [field]: formatted }));
            return;
        }
    };

    return (
        <div className="h-auto items-center grid md:grid-cols-2 grid-cols-1">
          <div className="w-full h-full hidden md:block">
              <Image
                width={1200}
                height={1000}
                src="/images/img-6.jpeg"
                alt="Register illustration"
                className="w-full h-full object-cover"
            />
          </div>
            <div className="container m-auto px-4 py-16">
                <div className="max-w-md mx-auto">
                    <GlassCard hover={false}>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-primary mb-2">Créer un compte</h1>
                            <p className="text-gray-600">Rejoignez la communauté TontiFlex</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-primary font-medium">
                                        <User className="inline mr-2" size={16} />
                                        Prénom *
                                    </Label>
                                    <Input
                                        id="firstName"
                                        type="text"
                                        name="firstName"
                                        placeholder="Votre prénom"
                                        value={formData.firstName}
                                        onChange={(e) => handleChange("firstName", e.target.value)}
                                        required
                                        maxLength={50}
                                        className={`bg-white/50 border-primary/20 ${errors.firstName ? 'border-red-500' : ''}`}
                                        disabled={loading || isLoading}
                                    />
                                    {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-primary font-medium">
                                        <User className="inline mr-2" size={16} />
                                        Nom de famille *
                                    </Label>
                                    <Input
                                        id="lastName"
                                        type="text"
                                        name="lastName"
                                        placeholder="Votre nom"
                                        value={formData.lastName}
                                        onChange={(e) => handleChange("lastName", e.target.value)}
                                        required
                                        maxLength={50}
                                        className={`bg-white/50 border-primary/20 ${errors.lastName ? 'border-red-500' : ''}`}
                                        disabled={loading || isLoading}
                                    />
                                    {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-primary font-medium">
                                        <Phone className="inline mr-2" size={16} />
                                        Téléphone *
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        placeholder="+229XXXXXXXX"
                                        value={formData.phone}
                                        onChange={(e) => handleChange("phone", e.target.value)}
                                        required
                                        className={`bg-white/50 border-primary/20 ${errors.phone ? 'border-red-500' : ''}`}
                                        disabled={loading || isLoading}
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                                    <p className="text-xs text-gray-500">Format: +229 suivi de 8 chiffres</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-primary font-medium">
                                        <Mail className="inline mr-2" size={16} />
                                        Email *
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="votre@email.com"
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        required
                                        className={`bg-white/50 border-primary/20 ${errors.email ? 'border-red-500' : ''}`}
                                        disabled={loading || isLoading}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-primary font-medium">
                                    <MapPin className="inline mr-2" size={16} />
                                    Adresse *
                                </Label>
                                <Input
                                    id="address"
                                    type="text"
                                    name="address"
                                    placeholder="Votre adresse complète"
                                    value={formData.address}
                                    onChange={(e) => handleChange("address", e.target.value)}
                                    required
                                    maxLength={200}
                                    className={`bg-white/50 border-primary/20 ${errors.address ? 'border-red-500' : ''}`}
                                    disabled={loading || isLoading}
                                />
                                {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="profession" className="text-primary font-medium">
                                    <Briefcase className="inline mr-2" size={16} />
                                    Profession *
                                </Label>
                                <Input
                                    id="profession"
                                    type="text"
                                    name="profession"
                                    placeholder="Votre profession"
                                    value={formData.profession}
                                    onChange={(e) => handleChange("profession", e.target.value)}
                                    required
                                    maxLength={100}
                                    className={`bg-white/50 border-primary/20 ${errors.profession ? 'border-red-500' : ''}`}
                                    disabled={loading || isLoading}
                                />
                                {errors.profession && <p className="text-red-500 text-xs">{errors.profession}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-primary font-medium">
                                        <Lock className="inline mr-2" size={16} />
                                        Mot de passe *
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Votre mot de passe"
                                            value={formData.password}
                                            onChange={(e) => handleChange("password", e.target.value)}
                                            required
                                            className={`bg-white/50 border-primary/20 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                                            disabled={loading || isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                                    <p className="text-xs text-gray-500">
                                        Min 8 caractères avec majuscule, minuscule, chiffre et caractère spécial
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-primary font-medium">
                                        <Lock className="inline mr-2" size={16} />
                                        Confirmer *
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            placeholder="Confirmer mot de passe"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                            required
                                            className={`bg-white/50 border-primary/20 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                            disabled={loading || isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-2">
                                    <input
                                        type="checkbox"
                                        id="acceptTerms"
                                        name="acceptTerms"
                                        checked={formData.acceptTerms}
                                        onChange={(e) => handleChange("acceptTerms", e.target.checked)}
                                        className="w-4 h-4 mt-1 rounded border-primary/20 text-primary focus:ring-primary"
                                        disabled={loading || isLoading}
                                        required
                                    />
                                    <label
                                        htmlFor="acceptTerms"
                                        className="text-sm text-gray-700 cursor-pointer"
                                    >
                                        J'accepte les conditions d'utilisation et la politique de confidentialité conforme aux normes BCEAO/UEMOA. *
                                    </label>
                                </div>
                                {errors.acceptTerms && <p className="text-red-500 text-xs">{errors.acceptTerms}</p>}
                            </div>

                            <GlassButton
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={loading || isLoading}
                            >
                                {loading || isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Création du compte...
                                    </>
                                ) : (
                                    "Créer mon compte"
                                )}
                            </GlassButton>

                            <div className="text-center">
                                <p className="text-gray-600">
                                    Déjà inscrit ?{" "}
                                    <Link href={"/auth/login"}>
                                        <button
                                            type="button"
                                            className="text-primary hover:underline font-medium"
                                        >
                                            Se connecter
                                        </button>
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default Register;