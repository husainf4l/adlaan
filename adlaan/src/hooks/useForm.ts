import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  validate?: (values: T) => Record<keyof T, string> | null;
}

interface FormState {
  isSubmitting: boolean;
  isValidating: boolean;
  submitCount: number;
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  onSubmit,
  validate
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    isValidating: false,
    submitCount: 0
  });

  const setValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const setFieldTouched = useCallback((name: keyof T, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched
    }));
  }, []);

  const validateForm = useCallback(async () => {
    if (!validate) return true;

    setFormState(prev => ({ ...prev, isValidating: true }));
    
    try {
      const validationErrors = validate(values);
      if (validationErrors) {
        setErrors(validationErrors);
        return false;
      }
      setErrors({});
      return true;
    } finally {
      setFormState(prev => ({ ...prev, isValidating: false }));
    }
  }, [validate, values]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      submitCount: prev.submitCount + 1
    }));

    try {
      const isValid = await validateForm();
      if (!isValid) return;

      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [validateForm, onSubmit, values]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setFormState({
      isSubmitting: false,
      isValidating: false,
      submitCount: 0
    });
  }, [initialValues]);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  const getFieldProps = useCallback((name: keyof T) => ({
    name: String(name),
    value: values[name] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValue(name, e.target.value as T[keyof T]);
    },
    onBlur: () => setFieldTouched(name, true),
    error: errors[name],
    touched: touched[name]
  }), [values, errors, touched, setValue, setFieldTouched]);

  return {
    values,
    errors,
    touched,
    formState,
    setValue,
    setFieldTouched,
    setFieldError,
    validateForm,
    handleSubmit,
    resetForm,
    getFieldProps,
    isSubmitting: formState.isSubmitting,
    isValidating: formState.isValidating,
    isValid: Object.keys(errors).length === 0
  };
}
