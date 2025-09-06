// utils/auth.ts - Utilitaires pour JWT
import { jwtDecode } from 'jwt-decode';
import { AuthTokens, UserRole } from '@/types/auth';

interface JWTPayload {
  user_id: string;
  email: string;
  role: UserRole;
  sfd_id?: string;
  exp: number;
  iat: number;
}

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error('Erreur décodage JWT:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

// Storage des tokens
const ACCESS_TOKEN_KEY = 'tontiflex_access_token';
const REFRESH_TOKEN_KEY = 'tontiflex_refresh_token';

export const getTokensFromStorage = (): AuthTokens | null => {
  if (typeof window === 'undefined') return null;
  
  const access = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  if (!access || !refresh) return null;
  
  return { access, refresh };
};

export const setTokensInStorage = (tokens: AuthTokens): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  }
};

export const removeTokensFromStorage = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};