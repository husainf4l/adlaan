"use client";

import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export function CompanySetupGuard({ children }: { children: React.ReactNode }) {
  const { needsCompanySetup, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for authentication to load
    if (authLoading) return;

    // Don't redirect if user is already on company-setup page or auth pages
    const excludedPaths = ['/company-setup', '/signin', '/signup'];
    
    if (needsCompanySetup && !excludedPaths.includes(pathname)) {
      router.push('/company-setup');
    }
  }, [needsCompanySetup, pathname, router, authLoading]);

  return <>{children}</>;
}
