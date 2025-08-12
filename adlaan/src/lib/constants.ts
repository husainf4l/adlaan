// Application constants and configuration

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4007',
  TIMEOUT: 30000, // 30 seconds
} as const;

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  SIGNUP: '/signup',
  
  // Protected routes
  DASHBOARD: '/dashboard',
  PROFILE_COMPLETE: '/profile/complete',
  COMPANY_SETUP: '/dashboard/setup-company',
} as const;

export const FORM_VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(\+966|0)?[5-9]\d{8}$/,
  PASSWORD_MIN_LENGTH: 8,
} as const;

export const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 موظف' },
  { value: '11-50', label: '11-50 موظف' },
  { value: '51-200', label: '51-200 موظف' },
  { value: '201-500', label: '201-500 موظف' },
  { value: '500+', label: 'أكثر من 500 موظف' },
] as const;

export const INDUSTRIES = [
  { value: 'technology', label: 'التكنولوجيا' },
  { value: 'finance', label: 'المالية' },
  { value: 'healthcare', label: 'الرعاية الصحية' },
  { value: 'education', label: 'التعليم' },
  { value: 'retail', label: 'التجارة' },
  { value: 'manufacturing', label: 'التصنيع' },
  { value: 'consulting', label: 'الاستشارات' },
  { value: 'construction', label: 'البناء والتشييد' },
  { value: 'other', label: 'أخرى' },
] as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'حدث خطأ في الاتصال بالخادم',
  INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
  PROFILE_LOAD_FAILED: 'فشل في تحميل الملف الشخصي',
  PROFILE_UPDATE_FAILED: 'فشل في تحديث الملف الشخصي',
  REQUIRED_FIELD: 'هذا الحقل مطلوب',
  INVALID_EMAIL: 'البريد الإلكتروني غير صحيح',
  INVALID_PHONE: 'رقم الهاتف غير صحيح',
  PASSWORD_TOO_SHORT: `كلمة المرور يجب أن تكون ${FORM_VALIDATION.PASSWORD_MIN_LENGTH} أحرف على الأقل`,
  PASSWORDS_DONT_MATCH: 'كلمات المرور غير متطابقة',
} as const;
