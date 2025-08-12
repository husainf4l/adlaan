import React from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "password";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  placeholder,
  disabled = false,
  className = "",
}: FormFieldProps) {
  const hasError = touched && error;

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          appearance-none relative block w-full px-3 py-3 
          border placeholder-gray-400 text-white 
          bg-gray-800/50 rounded-lg 
          focus:outline-none focus:ring-2 focus:border-transparent 
          transition-colors
          ${
            hasError
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-600 focus:ring-blue-500"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      />
      {hasError && (
        <p className="text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  error?: string;
  touched?: boolean;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  touched,
  required = false,
  placeholder = "اختر...",
  disabled = false,
  className = "",
}: SelectFieldProps) {
  const hasError = touched && error;

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        className={`
          appearance-none relative block w-full px-3 py-3 
          border placeholder-gray-400 text-white 
          bg-gray-800/50 rounded-lg 
          focus:outline-none focus:ring-2 focus:border-transparent 
          transition-colors
          ${
            hasError
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-600 focus:ring-blue-500"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasError && (
        <p className="text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
