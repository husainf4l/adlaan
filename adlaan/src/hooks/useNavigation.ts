import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { ROUTES } from '@/lib/constants';

/**
 * Custom hook for programmatic navigation
 * Provides a clean interface for navigation with type safety
 */
export function useNavigation() {
  const router = useRouter();

  const navigateTo = useCallback((route: string) => {
    router.push(route);
  }, [router]);

  const goToDashboard = useCallback(() => {
    navigateTo(ROUTES.DASHBOARD);
  }, [navigateTo]);

  const goToLogin = useCallback(() => {
    navigateTo(ROUTES.LOGIN);
  }, [navigateTo]);

  const goToRegister = useCallback(() => {
    navigateTo(ROUTES.REGISTER);
  }, [navigateTo]);

  const goToProfileComplete = useCallback(() => {
    navigateTo(ROUTES.PROFILE_COMPLETE);
  }, [navigateTo]);

  const goToCompanySetup = useCallback(() => {
    navigateTo(ROUTES.COMPANY_SETUP);
  }, [navigateTo]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  return {
    navigateTo,
    goToDashboard,
    goToLogin,
    goToRegister,
    goToProfileComplete,
    goToCompanySetup,
    goBack,
    refresh,
  };
}
