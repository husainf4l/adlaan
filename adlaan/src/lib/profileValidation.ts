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
  if (values.phoneNumber?.trim()) {
    const phoneRegex = /^(\+966|966|0)?[5][0-9]{8}$/;
    if (!phoneRegex.test(values.phoneNumber.replace(/\s/g, ''))) {
      errors.phoneNumber = 'رقم الهاتف غير صحيح (يجب أن يكون رقم سعودي صحيح)';
    }
  }

  return Object.keys(errors).length > 0 ? errors as Record<keyof ProfileFormData, string> : null;
}
