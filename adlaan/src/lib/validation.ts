import { FORM_VALIDATION, ERROR_MESSAGES } from './constants';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates an email address
 */
export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }

  if (!FORM_VALIDATION.EMAIL_REGEX.test(email)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  }

  return { isValid: true };
}

/**
 * Validates a password
 */
export function validatePassword(password: string): ValidationResult {
  if (!password.trim()) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }

  if (password.length < FORM_VALIDATION.PASSWORD_MIN_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.PASSWORD_TOO_SHORT };
  }

  return { isValid: true };
}

/**
 * Validates password confirmation
 */
export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword.trim()) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: ERROR_MESSAGES.PASSWORDS_DONT_MATCH };
  }

  return { isValid: true };
}

/**
 * Validates a phone number (Saudi format)
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone.trim()) {
    return { isValid: true }; // Phone is optional in most cases
  }

  if (!FORM_VALIDATION.PHONE_REGEX.test(phone)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_PHONE };
  }

  return { isValid: true };
}

/**
 * Validates a required field
 */
export function validateRequired(value: string, fieldName?: string): ValidationResult {
  if (!value.trim()) {
    return { 
      isValid: false, 
      error: fieldName ? `${fieldName} ${ERROR_MESSAGES.REQUIRED_FIELD}` : ERROR_MESSAGES.REQUIRED_FIELD 
    };
  }

  return { isValid: true };
}

/**
 * Validates all login form fields
 */
export function validateLoginForm(email: string, password: string): ValidationResult {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) return emailValidation;

  const passwordValidation = validateRequired(password, 'كلمة المرور');
  if (!passwordValidation.isValid) return passwordValidation;

  return { isValid: true };
}

/**
 * Validates all registration form fields
 */
export function validateRegistrationForm(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
}): ValidationResult {
  const nameValidation = validateRequired(data.name, 'الاسم');
  if (!nameValidation.isValid) return nameValidation;

  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) return emailValidation;

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) return passwordValidation;

  const confirmPasswordValidation = validatePasswordConfirmation(
    data.password,
    data.confirmPassword
  );
  if (!confirmPasswordValidation.isValid) return confirmPasswordValidation;

  if (data.phoneNumber) {
    const phoneValidation = validatePhoneNumber(data.phoneNumber);
    if (!phoneValidation.isValid) return phoneValidation;
  }

  return { isValid: true };
}
