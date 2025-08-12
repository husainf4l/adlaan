import { useState, useCallback } from 'react';

interface ValidationRule<T = unknown> {
  validate: (value: T) => boolean;
  message: string;
}

type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

export function useFormValidation<T extends Record<string, unknown>>(
  schema: ValidationSchema<T>
) {
  const [errors, setErrors] = useState<ValidationErrors<T>>({});

  const validateField = useCallback(
    (fieldName: keyof T, value: T[keyof T]): boolean => {
      const rules = schema[fieldName];
      if (!rules) return true;

      for (const rule of rules) {
        if (!rule.validate(value)) {
          setErrors(prev => ({
            ...prev,
            [fieldName]: rule.message
          }));
          return false;
        }
      }

      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    },
    [schema]
  );

  const validateAll = useCallback(
    (data: T): boolean => {
      const newErrors: ValidationErrors<T> = {};
      let isValid = true;

      for (const fieldName in schema) {
        const rules = schema[fieldName];
        const value = data[fieldName];
        if (rules) {
          for (const rule of rules) {
            if (!rule.validate(value)) {
              newErrors[fieldName] = rule.message;
              isValid = false;
              break;
            }
          }
        }
      }

      setErrors(newErrors);
      return isValid;
    },
    [schema]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validateField,
    validateAll,
    clearErrors,
    clearFieldError,
    hasErrors: Object.keys(errors).length > 0
  };
}
