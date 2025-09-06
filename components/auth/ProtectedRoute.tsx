'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES, DEFAULT_ROUTES, RoleKey } from '@/constants/roles';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [] 
}) => {
  const router = useRouter();
  const { isAuthenticated, user, userType, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Rediriger vers la page de connexion si non authentifié
      router.push('/auth/login');
    } else if (!isLoading && isAuthenticated && userType) {
      // Vérifier si l'utilisateur a accès à la route actuelle
      if (allowedRoles.length > 0 && !allowedRoles.includes(userType as RoleKey)) {
        // Rediriger vers le tableau de bord par défaut du rôle de l'utilisateur
        const userRole = userType as RoleKey;
        const defaultRoute = DEFAULT_ROUTES[userRole] || '/';
        router.push(defaultRoute);
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  // Afficher un loader pendant le chargement
  if (isLoading || (!isAuthenticated && !isLoading) || 
      (isAuthenticated && allowedRoles.length > 0 && user && !allowedRoles.includes(userType as RoleKey))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated || !user) {
    return <Link href="/login" />;
  }

  // Vérifier si l'utilisateur a le rôle requis (si des rôles sont spécifiés)
  if (allowedRoles.length > 0 && userType && !allowedRoles.includes(userType as RoleKey)) {
    console.log("Rôle utilisateur:", userType);
    console.log("Rôles autorisés:", allowedRoles);
    
    // Rediriger vers le tableau de bord par défaut du rôle de l'utilisateur
    const userRole = userType as RoleKey;
    const defaultRoute = DEFAULT_ROUTES[userRole] || '/';
    return <Link href={defaultRoute} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;