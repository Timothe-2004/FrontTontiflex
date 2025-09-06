'use client';
import { usePathname } from 'next/navigation';
import { NavBar } from '@/components/navigation/NavBar';
import { Footer } from '@/components/footer/Footer';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavAndFooter = pathname?.startsWith('/auth') || pathname?.startsWith('/dashboard');

  return (
    <>
      {!hideNavAndFooter && <NavBar />}
      <main>{children}</main>
      {!hideNavAndFooter && <Footer />}
    </>
  );
}