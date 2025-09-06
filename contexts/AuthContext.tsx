'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_ROUTES, RoleKey } from '@/constants/roles';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface User {
  id: number;
  email: string;
  numero_telephone: string;
  is_active: boolean;
}

interface loginResponse {
  access: string;
  refresh: string;
  user: User;
  user_type: string;
  profile_id: string;
}


interface InscriptionData {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string;
  profession: string; 
  motDePasse: string;
}

interface UserMe {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  last_login: string;
  date_joined: string;
  profile: {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    adresse: string;
    profession: string;
    statut: string;
    scorefiabilite: number;
    email_verifie: boolean;
    dateCreation: string;
    derniere_connexion: string;
    nom_complet: string;
    est_actif: boolean;
    tontines_count: number;
  };
  sfd: {
    id: string;
    nom: string;
  };
}

interface AuthContextType {
  login: (email: string, password: string) => Promise<loginResponse>;
  inscription: (data: InscriptionData) => Promise<{ success: boolean; message?: string; errors?: any }>;
  logout: () => void;
  isAuthenticated: boolean;
  accessToken: string | null;
  user: UserMe | null;
  userType: string | null;
  isLoading: boolean;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
const [userType, setUserType] = useState<string | null>(null);
  const BASE_URL = "https://tontiflexapp.onrender.com";

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenStored = localStorage.getItem('refreshToken');
      if (!refreshTokenStored) {
        logout();
        return false;
      }

      const response = await fetch(`${BASE_URL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ refresh: refreshTokenStored }),
      });

      if (response.ok) {
        const tokenData = await response.json();
        const newAccessToken = tokenData.access;
        const newRefreshToken = tokenData.refresh;

        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        setAccessToken(newAccessToken);
        return true;
      } else {
        console.warn('Échec du renouvellement du token');
        logout();
        return false;
      }
    } catch (error) {
      console.error('Erreur lors du refresh :', error);
      logout();
      return false;
    }
  };

  const fetchUserData = async (): Promise<UserMe | null> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      const response = await fetch(`${BASE_URL}/api/users/me/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("✅ Données utilisateur récupérées :", userData);
        return userData;
      } else {
        console.warn("❌ Impossible de récupérer l'utilisateur");
        return null;
      }
    } catch (error) {
      console.error("❌ Erreur fetchUserData :", error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const userData = await fetchUserData();
        if (userData) {
          setAccessToken(token);
          setUser(userData);
          setIsAuthenticated(true);

          const userType = localStorage.getItem('userType') as RoleKey;
          const defaultRoute = DEFAULT_ROUTES[userType] || '/';
          router.push(defaultRoute);
        } else {
          const refreshSuccess = await refreshToken();
          if (refreshSuccess) {
            const newUserData = await fetchUserData();
            if (newUserData) {
              setAccessToken(localStorage.getItem('accessToken'));
              setUser(newUserData);
              setIsAuthenticated(true);

              const userType = localStorage.getItem('userType') as RoleKey;
              const defaultRoute = DEFAULT_ROUTES[userType] || '/';
              router.push(defaultRoute);
            }
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const inscription = async (data: InscriptionData) => {
    try {
      console.log('🚀 Tentative d\'inscription avec:', {
        ...data,
        motDePasse: '[MASQUÉ]'
      });

      const response = await fetch(`${BASE_URL}/api/auth/inscription/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });

      console.log('📊 Status de la réponse:', response.status);
      console.log('📋 Headers de la réponse:', Object.fromEntries(response.headers.entries()));

      if (response.status === 201) {
        const successData = await response.json();
        console.log('✅ Inscription réussie:', successData);
        return { 
          success: true, 
          message: successData.detail || 'Inscription réussie !' 
        };
      }

      // Gestion des erreurs détaillée
      let errorData;
      try {
        errorData = await response.json();
        console.log('❌ Erreur détaillée:', errorData);
      } catch (parseError) {
        console.error('❌ Impossible de parser la réponse d\'erreur:', parseError);
        return { 
          success: false, 
          message: 'Erreur serveur: réponse invalide'
        };
      }

      // Construction du message d'erreur basé sur les détails de l'API
      let message = 'Erreur pendant l\'inscription.';
      
      // Gestion des erreurs spécifiques de champs
      if (errorData.email) {
        const emailError = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
        message = `Email: ${emailError}`;
      } else if (errorData.telephone) {
        const phoneError = Array.isArray(errorData.telephone) ? errorData.telephone[0] : errorData.telephone;
        message = `Téléphone: ${phoneError}`;
      } else if (errorData.motDePasse) {
        const passwordError = Array.isArray(errorData.motDePasse) ? errorData.motDePasse[0] : errorData.motDePasse;
        message = `Mot de passe: ${passwordError}`;
      } else if (errorData.nom) {
        const nomError = Array.isArray(errorData.nom) ? errorData.nom[0] : errorData.nom;
        message = `Nom: ${nomError}`;
      } else if (errorData.prenom) {
        const prenomError = Array.isArray(errorData.prenom) ? errorData.prenom[0] : errorData.prenom;
        message = `Prénom: ${prenomError}`;
      } else if (errorData.adresse) {
        const adresseError = Array.isArray(errorData.adresse) ? errorData.adresse[0] : errorData.adresse;
        message = `Adresse: ${adresseError}`;
      } else if (errorData.profession) {
        const professionError = Array.isArray(errorData.profession) ? errorData.profession[0] : errorData.profession;
        message = `Profession: ${professionError}`;
      } else if (errorData.detail) {
        message = errorData.detail;
      } else if (errorData.non_field_errors) {
        const nonFieldError = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors;
        message = nonFieldError;
      } else if (typeof errorData === 'string') {
        message = errorData;
      } else {
        // Si aucun pattern connu, essayer d'extraire le premier message d'erreur
        const firstKey = Object.keys(errorData)[0];
        if (firstKey && errorData[firstKey]) {
          const firstError = Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey];
          message = `${firstKey}: ${firstError}`;
        }
      }

      return { 
        success: false, 
        message,
        errors: errorData
      };

    } catch (error) {
      console.error('❌ Erreur réseau lors de l\'inscription:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { 
          success: false, 
          message: 'Erreur de connexion. Vérifiez votre internet.' 
        };
      }
      
      return { 
        success: false, 
        message: 'Erreur technique. Veuillez réessayer.' 
      };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔑 Tentative de connexion pour:', email);

      const response = await fetch(`${BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ email, motDePasse: password }),
      });

      console.log('📊 Status de connexion:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ Erreur de connexion:', errorData);
        throw new Error(errorData.detail || 'Échec de la connexion');
      }

      const data: loginResponse = await response.json();
      console.log('✅ Connexion réussie:', {
        ...data,
        access: '[TOKEN]',
        refresh: '[TOKEN]'
      });

      setAccessToken(data.access);
      setIsAuthenticated(true);

      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('userType', data.user_type);

      const userData = await fetchUserData();
      if (userData) setUser(userData);
      const defaultRoute = DEFAULT_ROUTES[data.user_type as RoleKey] || '/';
      setUserType(data.user_type);
      setTimeout(() => {
        router.push(defaultRoute);
      }, 2000);

      return data;
    } catch (error) {
      console.error('❌ Erreur login:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log("🔒 Déconnexion...");
    setAccessToken(null);
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userType');
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{
      login,
      inscription,
      logout,
      isAuthenticated,
      accessToken,
      user,
      isLoading,
      refreshToken,
      userType,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};