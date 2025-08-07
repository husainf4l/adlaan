/**
 * Application-wide constants
 */
export const APP_CONSTANTS = {
  APP_NAME: 'Adlaan',
  APP_DESCRIPTION: 'Legal AI Platform',
  STORAGE_KEYS: {
    THEME: 'adlaan_theme',
    LANGUAGE: 'adlaan_language'
  },
  TIMEOUTS: {
    AUTH_GUARD: 2000,
    HTTP_REQUEST: 30000
  },
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    NAME_MIN_LENGTH: 2,
    OTP_LENGTH: 6
  }
} as const;

/**
 * Route paths constants
 */
export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/',
  PROFILE: '/profile',
  SETTINGS: '/settings'
} as const;

/**
 * API endpoints constants
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    VERIFY_OTP: '/auth/verify-otp'
  }
} as const;