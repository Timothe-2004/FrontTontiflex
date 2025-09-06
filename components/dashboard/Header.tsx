import { useAuth } from "@/contexts/AuthContext";
import { Bell, ChevronRight, LogOut, Menu } from "lucide-react";
import { useEffect, useState } from "react";

// Header.tsx - Header moderne et responsive
interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header = ({ onMenuToggle}: HeaderProps) => {
   const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const userType = localStorage.getItem('userType');
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const getMessageByRole = () => {
    switch (userType) {
      case "CLIENT":
        return "Voici un aperçu de vos finances personnelles";
      case "AGENT_SFD":
        return "Suivez les dossiers de vos clients ici";
      case "SUPERVISEUR_SFD":
        return "Supervisez les opérations de votre équipe";
      case "ADMIN_SFD":
        return "Gérez les activités de votre institution SFD";
      case "ADMIN_PLATEFORME":
        return "Contrôlez la plateforme à l'échelle globale";
      default:
        return "Bienvenue sur votre tableau de bord";
    }
  };
  const getRoleByUserType = () => {
    switch (userType) {
      case "CLIENT":
        return "Client";
      case "AGENT_SFD":
        return "Agent de Terrain";
      case "SUPERVISEUR_SFD":
        return "Superviseur SFD";
      case "ADMIN_SFD":
        return "Administrateur SFD";
      case "ADMIN_PLATEFORME":
        return "Administrateur Plateforme";
      default:
        return "";
    }
  };
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-30">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Section gauche - Menu mobile + Salutation */}
          <div className="flex items-center gap-4">
            {/* Bouton menu mobile */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-gray-600" />
            </button>

            {/* Salutation et heure */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {greeting()}, <span className="text-emerald-600">{user?.profile.prenom}</span> !
              </h1>
              <div className="flex items-center gap-4 mt-1">
              <p className="text-gray-600 text-sm lg:text-base">{getMessageByRole()}</p>
                <div className="hidden sm:flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  <span>
                    {currentTime.toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section droite - Actions et profil */}
          <div className="flex items-center gap-3">

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-gray-300" />

            {/* Profil utilisateur */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium items-start flex flex-col text-gray-900">
                  <span>{user?.profile.prenom + " " + user?.profile.nom}</span>
                  <span className="text-xs text-gray-500">{getRoleByUserType()}</span>
                </p>

              </div>

              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-semibold text-lg">
                  {user?.profile.prenom.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;