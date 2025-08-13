import { COMPANY_SIZES, INDUSTRIES } from '@/lib/constants';

export interface ProfileFormData {
  companyName: string;
  companySize: string;
  industry: string;
  phoneNumber: string;
  [key: string]: string;
}

export function validateProfileForm(values: ProfileFormData): Record<keyof ProfileFormData, string> | null {
  const errors: Partial<Record<keyof ProfileFormData, string>> = {};

  // Company name validation
  if (!values.companyName?.trim()) {
    errors.companyName = 'اسم الشركة مطلوب';
  } else if (values.companyName.trim().length < 2) {
    errors.companyName = 'اسم الشركة يجب أن يكون حرفين على الأقل';
  } else if (values.companyName.trim().length > 100) {
    errors.companyName = 'اسم الشركة يجب أن يكون أقل من 100 حرف';
  }

  // Company size validation
  if (!values.companySize) {
    errors.companySize = 'حجم الشركة مطلوب';
  } else if (!COMPANY_SIZES.some(size => size.value === values.companySize)) {
    errors.companySize = 'حجم الشركة غير صحيح';
  }

  // Industry validation
  if (!values.industry) {
    errors.industry = 'القطاع مطلوب';
  } else if (!INDUSTRIES.some(industry => industry.value === values.industry)) {
    errors.industry = 'القطاع غير صحيح';
  }

  // Phone number validation (optional but if provided must be valid)
  // Support for Middle East countries
  if (values.phoneNumber?.trim()) {
    // Remove all spaces, dashes, and parentheses for validation
    const cleanPhone = values.phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Middle East country codes and their mobile patterns
    const middleEastPatterns = [
      /^(\+966|966)[5][0-9]{8}$/,    // Saudi Arabia
      /^(\+971|971)[5][0-9]{8}$/,    // UAE
      /^(\+974|974)[3-9][0-9]{7}$/,  // Qatar
      /^(\+965|965)[2-9][0-9]{7}$/,  // Kuwait
      /^(\+973|973)[1-9][0-9]{7}$/,  // Bahrain
      /^(\+968|968)[79][0-9]{7}$/,   // Oman
      /^(\+962|962)[7][7-9][0-9]{7}$/, // Jordan
      /^(\+961|961)[0-9]{8}$/,       // Lebanon
      /^(\+20|20)[1][0-9]{9}$/,      // Egypt
      /^(\+90|90)[5][0-9]{9}$/,      // Turkey
      /^(\+98|98)[9][0-9]{9}$/,      // Iran
      /^(\+964|964)[7][0-9]{9}$/,    // Iraq
    ];
    
    // Also support local formats (without country code)
    const localPatterns = [
      /^05[0-9]{8}$/,    // Saudi local format
      /^05[0-9]{8}$/,    // UAE local format
      /^[3-9][0-9]{7}$/,  // Qatar local format
      /^[2-9][0-9]{7}$/,  // Kuwait local format
      /^[1-9][0-9]{7}$/,  // Bahrain local format
      /^[79][0-9]{7}$/,   // Oman local format
      /^07[7-9][0-9]{7}$/, // Jordan local format
      /^0[0-9]{7,8}$/,    // Lebanon local format
      /^01[0-9]{9}$/,     // Egypt local format
      /^05[0-9]{9}$/,     // Turkey local format
      /^09[0-9]{9}$/,     // Iran local format
      /^07[0-9]{9}$/,     // Iraq local format
    ];
    
    const isValidInternational = middleEastPatterns.some(pattern => pattern.test(cleanPhone));
    const isValidLocal = localPatterns.some(pattern => pattern.test(cleanPhone));
    
    if (!isValidInternational && !isValidLocal) {
      errors.phoneNumber = 'رقم الهاتف غير صحيح (مثال: +966501234567، +971501234567، +20101234567)';
    }
  }

  return Object.keys(errors).length > 0 ? errors as Record<keyof ProfileFormData, string> : null;
}
