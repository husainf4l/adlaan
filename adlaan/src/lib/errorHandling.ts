/**
 * Error handling utilities for the application
 * Provides consistent error formatting and logging
 */

export interface AppError {
  message: string;
  code?: string;
  field?: string;
  details?: unknown;
}

export class FormError extends Error {
  public field?: string;
  public code?: string;
  public details?: unknown;

  constructor(message: string, field?: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'FormError';
    this.field = field;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends Error {
  public errors: Record<string, string>;

  constructor(errors: Record<string, string>) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Formats error messages for display to users
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof FormError) {
    return error.message;
  }

  if (error instanceof ValidationError) {
    const firstError = Object.values(error.errors)[0];
    return firstError || 'حدث خطأ في التحقق من البيانات';
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'حدث خطأ غير متوقع';
}

/**
 * Extracts field-specific errors from a validation error
 */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof ValidationError) {
    return error.errors;
  }

  if (error instanceof FormError && error.field) {
    return { [error.field]: error.message };
  }

  return {};
}

/**
 * Logs errors for debugging and monitoring
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', {
      error,
      context,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    });
  }

  // In production, you might want to send to a logging service
  // Example: sendToLoggingService(error, context);
}

/**
 * Creates a standardized error response for API endpoints
 */
export function createErrorResponse(
  error: unknown
): {
  error: string;
  code?: string;
  field?: string;
  details?: unknown;
} {
  if (error instanceof FormError) {
    return {
      error: error.message,
      code: error.code,
      field: error.field,
      details: error.details
    };
  }

  if (error instanceof ValidationError) {
    return {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.errors
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      code: 'INTERNAL_ERROR'
    };
  }

  return {
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
}

/**
 * Handles async operations with proper error handling
 */
export async function handleAsync<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<[T | null, AppError | null]> {
  try {
    const result = await operation();
    return [result, null];
  } catch (error) {
    logError(error, context);
    
    const appError: AppError = {
      message: formatErrorMessage(error),
      code: error instanceof FormError ? error.code : undefined,
      field: error instanceof FormError ? error.field : undefined,
      details: error instanceof FormError ? error.details : undefined
    };

    return [null, appError];
  }
}

/**
 * Type guard to check if an error is a known application error
 */
export function isAppError(error: unknown): error is FormError | ValidationError {
  return error instanceof FormError || error instanceof ValidationError;
}
