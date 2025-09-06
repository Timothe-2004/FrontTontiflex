export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://prod-backend-api.colismove.com/v1/api/";

export const getApiUrl = (endpoint: string): string => {
  // Gestion du cas où l'URL de base est undefined
  const baseUrl = API_BASE_URL;

  // Gestion correcte des slashs
  const formattedEndpoint = endpoint.startsWith("/")
    ? endpoint.substring(1)
    : endpoint;
  const separator = baseUrl.endsWith("/") ? "" : "/";

  return `${baseUrl}${separator}${formattedEndpoint}`;
};

export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  try {
    const url = getApiUrl(endpoint);

    // Log pour débogage en développement
    if (process.env.NODE_ENV === "development") {
      console.log(`API Call to: ${url}`);
    }

    const response = await fetch(url, options);

    // Gestion des erreurs HTTP
    if (!response.ok) {
      let errorMessage = `Erreur serveur : ${response.status}`;

      try {
        // Essayer de récupérer un message d'erreur JSON
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = `${errorMessage} - ${errorData.message}`;
        }
      } catch (e) {
        // Si ce n'est pas du JSON, essayer de récupérer le texte
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = `${errorMessage} - ${errorText}`;
          }
        } catch (e2) {
          // Si tout échoue, utiliser juste le statut
        }
      }

      throw new Error(errorMessage);
    }

    // Vérifier si la réponse contient des données JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    // Si ce n'est pas du JSON, retourner le texte
    return await response.text();
  } catch (error: any) {
    console.error(`Erreur API: ${error.message}`);
    throw error;
  }
};

export const authApiCall = async (
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<any> => {
  if (!token) {
    throw new Error("Utilisateur non authentifié");
  }

  const authOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  };

  return await apiCall(endpoint, authOptions);
};
