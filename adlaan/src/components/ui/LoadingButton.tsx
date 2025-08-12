import React from "react";

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export function LoadingButton({
  loading = false,
  loadingText = "جارٍ التحميل...",
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: LoadingButtonProps) {
  const baseClasses = `
    w-full flex justify-center py-3 px-4 border border-transparent 
    rounded-lg shadow-sm text-sm font-medium focus:outline-none 
    focus:ring-2 focus:ring-offset-2 transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center gap-2
  `;

  const variantClasses = {
    primary: `
      text-white bg-blue-600 hover:bg-blue-700 
      focus:ring-blue-500 focus:ring-offset-gray-800
    `,
    secondary: `
      text-gray-700 bg-white hover:bg-gray-50
      border-gray-300 focus:ring-blue-500
    `,
  };

  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {loading ? loadingText : children}
    </button>
  );
}
