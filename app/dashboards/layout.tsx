'use client';
import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_MAPPING, RoleKey, DEFAULT_ROUTES } from '@/constants/roles';
import SideBar from '@/components/navigation/SideBar';
import { Header } from '@/components/dashboard/Header';
import { toast, Toaster } from 'sonner';
import { useRouter } from 'next/navigation';
import DashboardSkeleton from '@/skeletons/DashboardSkeleton';


interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Redirection si non authentifié
  if (!isLoading && !isAuthenticated) {
    router.push('/auth/login');
  }

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div>
        <DashboardSkeleton />
      </div>
    );
  }
  const userType = localStorage.getItem('userType');
  const userRole = userType as RoleKey;
  const sidebarRole = ROLE_MAPPING[userRole];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);


  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-xs z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed lg:sticky top-0 left-0 h-screen z-30 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        <SideBar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          onCollapseChange={(collapsed: boolean) => setSidebarCollapsed(collapsed)}
          role={userRole}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <Header
            onMenuToggle={toggleSidebar}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-br from-emerald-50 via-white to-green-50">
          {children}
          <Toaster richColors position="top-right" />
        </main>
      </div>
    </div>
  );
}