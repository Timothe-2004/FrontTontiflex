import Link from "next/link";
import { GlassButton } from "../GlassButton";
import { Home, User, LogIn } from "lucide-react";

export const NavBar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-md transition-all duration-300 mx-4 mt-4 rounded-2xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo et titre */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-primary">TontiFlex</span>
          </Link>

          {/* Header desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-primary transition-colors">
              Accueil
            </Link>
            <Link href="/tontines" className="text-gray-700 hover:text-primary transition-colors">
              Tontines
            </Link>
            <Link href="/support" className="text-gray-700 hover:text-primary transition-colors">
              Contactez nous 
            </Link>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center space-x-3">
            <Link href="/auth/login">
              <GlassButton
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center space-x-2"
              >
                <LogIn size={16} />
                <span>Connexion</span>
              </GlassButton>
            </Link>
            <Link href="/auth/register">
              <GlassButton size="sm">
                S'inscrire
              </GlassButton>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;