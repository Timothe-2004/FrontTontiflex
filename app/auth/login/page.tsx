'use client';
import React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GlassCard } from "@/components/GlassCard";
import { GlassButton } from "@/components/GlassButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { login, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    // Validation du domaine de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|bj)$/i;
    if (!emailRegex.test(formData.email)) {
      setError("Seuls les emails se terminant par .com ou .bj sont autorisés.");
      toast.error("Adresse email invalide. Utilisez un domaine .com ou .bj");
      setLoading(false);
      return;
    }
  
    try {
      const user = await login(formData.email, formData.password);
      if (user) {
        toast.success("Connexion réussie ! Bienvenue 🎉");
      } else {
        setError('Email ou mot de passe incorrect');
        toast.error('Échec de la connexion');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen items-center grid md:grid-cols-2 grid-cols-1">
      <div className="w-full h-full hidden md:block">
        <Image
          width={1200}
          height={1000}
          src="/images/img-6.jpeg"
          alt="Login illustration"
        className="w-full h-full object-cover"
      />
      </div>
      <div className="container m-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <GlassCard hover={false}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2">Connexion</h1>
              <p className="text-gray-600">Ravi de vous revoir. ✨</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-primary font-medium">
                  <Mail className="inline mr-2" size={16} />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white/50 border-primary/20"
                  disabled={loading || isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-primary font-medium">
                  <Lock className="inline mr-2" size={16} />
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="bg-white/50 border-primary/20 pr-10"
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
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-primary/20 text-primary focus:ring-primary"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-600">
                    Se souvenir de moi
                  </label>
                </div>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              
              <GlassButton
                type="submit"
                size="lg"
                className="w-full flex items-center justify-center"
                disabled={loading || isLoading}
              >
                {loading || isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2" size={16} />
                  </>
                )}
              </GlassButton>

              <div className="text-center">
                <p className="text-gray-600">
                  Pas encore de compte ?{" "}
                  <Link href={"/auth/register"}>
                    <button
                      type="button"
                      className="text-primary hover:underline font-medium"
                    >
                      S'inscrire gratuitement
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

export default Login;