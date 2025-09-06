import { APIError, AuthTokens } from '@/types/auth';
import { getTokensFromStorage, setTokensInStorage, isTokenExpired, removeTokensFromStorage } from '@/utils/auth';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  // Refresh automatique du token
  private async refreshTokenIfNeeded(): Promise<string | null> {
    const tokens = getTokensFromStorage();
    if (!tokens) return null;

    // Si access token pas encore expiré, on l'utilise
    if (!isTokenExpired(tokens.access)) {
      return tokens.access;
    }

    // Si refresh token expiré aussi, déconnexion
    if (isTokenExpired(tokens.refresh)) {
      removeTokensFromStorage();
      window.location.href = '/login';
      return null;
    }

    // Refresh du token
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: tokens.refresh })
      });

      if (response.ok) {
        const newTokens: AuthTokens = await response.json();
        setTokensInStorage(newTokens);
        return newTokens.access;
      } else {
        removeTokensFromStorage();
        window.location.href = '/login';
        return null;
      }
    } catch (error) {
      console.error('Erreur refresh token:', error);
      removeTokensFromStorage();
      window.location.href = '/login';
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Récupérer le token valide
    const accessToken = await this.refreshTokenIfNeeded();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: APIError = {
          message: errorData.message || errorData.detail || `HTTP ${response.status}`,
          status: response.status,
          errors: errorData.errors || errorData,
        };
        
        if (response.status === 401) {
          removeTokensFromStorage();
          window.location.href = '/login';
        }
        
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  // Méthodes CRUD
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Pour l'inscription avec FormData
  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const accessToken = await this.refreshTokenIfNeeded();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        // Pas de Content-Type pour FormData (le navigateur le gère)
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: APIError = {
        message: errorData.message || errorData.detail || `HTTP ${response.status}`,
        status: response.status,
        errors: errorData.errors || errorData,
      };
      throw error;
    }

    return await response.json();
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new APIClient();
