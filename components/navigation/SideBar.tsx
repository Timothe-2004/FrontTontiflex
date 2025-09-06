'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { redirect, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  PiggyBank, 
  FileText, 
  User, 
  Bell, 
  Menu, 
  X,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { sidebarItemsByRole } from '@/lib/sidebar-items';
import { RoleKey } from '@/constants/roles';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SideBarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onCollapseChange?: (collapsed: boolean) => void; 
  role: RoleKey;
}


const SideBar: React.FC<SideBarProps> = ({
  isOpen = true,
  onToggle,
  onCollapseChange,
  role,
}) => {
  const router = useRouter();
  const { logout } = useAuth();
  const [openSubmenus,setOpenSubmenus] = useState<Record<number, boolean>>({});
  const sidebarItems = sidebarItemsByRole[role] || [];
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

const toggleCollapse = () => {
  if (!isMobile) {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (onCollapseChange) onCollapseChange(next); // <- on informe le parent
  }
};

const toggleSubmenu = (id: number) => {
  setOpenSubmenus(prev => ({
    ...prev,
    [id]: !prev[id]
  }));
};
const handleLogout = async () => {
  try {
    await logout();
    router.push('/auth/login');
  } catch (error) {
    toast.error('Une erreur est survenue lors de la déconnexion');
  }
};

  return (
    <>
      {/* Overlay pour mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-screen bg-primary text-white transition-all duration-300 z-50 overflow-y-auto scrollbar-hide",
        isMobile ? (
          isOpen ? "w-64" : "-translate-x-full"
        ) : (
          isCollapsed ? "w-full" : "w-64"
        )
      )}>
        {/* Header de la sidebar */}
        <div className="p-4 border-b border-emerald-500/30">
          <div className="flex items-center justify-between">
            {(!isCollapsed || isMobile) && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                  TontiFlex
                </h1>
                <p className="text-xs text-emerald-200 mt-1">Plateforme digitale</p>
              </div>
            )}
            
            {/* Bouton collapse pour desktop */}
            {!isMobile && (
              <button
                onClick={toggleCollapse}
                className="p-1.5 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <ChevronRight 
                  size={16} 
                  className={cn(
                    "transition-transform duration-300",
                    isCollapsed ? "rotate-0" : "rotate-180"
                  )}
                />
              </button>
            )}

            {/* Bouton close pour mobile */}
            {isMobile && (
              <button
                onClick={onToggle}
                className="p-1.5 hover:bg-emerald-700 rounded-lg transition-colors lg:hidden"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
      
        <nav className="flex-1 p-4 space-y-2">
  {sidebarItems.map((item) => {
    const isActive = pathname === item.link;
    const hasItems = item.items && item.items.length > 0;
    const isSubmenuOpen = openSubmenus[item.id] || false;
    const IconComponent = item.icon;
    
    return (
      <div key={item.id} className="space-y-1">
        <div 
          className={cn(
            "group relative flex items-center p-3 rounded-xl transition-all duration-200 cursor-pointer",
            isActive && !hasItems 
              ? "bg-white/20 shadow-lg backdrop-blur-sm" 
              : "hover:bg-white/10",
            hasItems ? "justify-between" : ""
          )}
          onClick={() => hasItems ? toggleSubmenu(item.id) : router.push(item.link || '#')}
        >
          <div className="flex items-center flex-1">
            {/* Icône */}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg transition-all",
              isActive && !hasItems
                ? "bg-white/20 text-white" 
                : "text-emerald-100 group-hover:text-white group-hover:bg-white/10"
            )}>
              <IconComponent size={20} />
            </div>

            {/* Label et description */}
            {(!isCollapsed || isMobile) && (
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "font-medium transition-colors",
                    isActive && !hasItems ? "text-white" : "text-emerald-100 group-hover:text-white"
                  )}>
                    {item.label}
                  </span>
                  
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      {item.badge}
                    </span>
                  )}
                </div>
                
                <p className={cn(
                  "text-xs mt-0.5 transition-colors",
                  isActive && !hasItems ? "text-emerald-100" : "text-emerald-300"
                )}>
                  {item.description}
                </p>
              </div>
            )}
          </div>

          {/* Flèche pour les sous-menus */}
          {hasItems && (!isCollapsed || isMobile) && (
            <div className="ml-2">
              {isSubmenuOpen ? (
                <ChevronUp size={16} className="text-emerald-200" />
              ) : (
                <ChevronDown size={16} className="text-emerald-200" />
              )}
            </div>
          )}

          {/* Indicateur actif */}
          {isActive && !hasItems && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
          )}
        </div>

        {/* Sous-menus */}
        {hasItems && isSubmenuOpen && (!isCollapsed || isMobile) && (
          <div className="ml-8 mt-1 space-y-1">
            {item.items?.map((subItem) => {
              const isSubItemActive = pathname === subItem.link;
              const SubIcon = subItem.icon;
              
              return (
                <Link key={subItem.id} href={subItem.link || '#'}>
                  <div className={cn(
                    "flex items-center p-2 rounded-lg transition-colors",
                    isSubItemActive
                      ? "bg-white/10 text-white"
                      : "text-emerald-100 hover:bg-white/5"
                  )}>
                    <SubIcon size={16} className="mr-2" />
                    <span className="text-sm">{subItem.label}</span>
                    {isSubItemActive && (
                      <div className="ml-2 w-1 h-4 bg-white rounded-full" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  })}
</nav>
        {/* Footer de la sidebar */}
        <div className="p-4 border-t border-emerald-500/30 mb-6">
          <div className="space-y-2">
     
            <button className="w-full flex items-center p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
            onClick={handleLogout}
            >
              <LogOut size={18} className="text-emerald-200 group-hover:text-red-300" />
              {(!isCollapsed || isMobile) && (
                <span className="ml-3 text-sm text-emerald-200 group-hover:text-red-300">
                  Déconnexion
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBar;