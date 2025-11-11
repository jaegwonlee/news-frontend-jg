// src/components/auth/FormField.tsx
import React from "react";

interface FormFieldProps {
  id: string;
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

/**
 * A component for input fields used in login/registration forms.
 * - Includes a label and an input element.
 * - Styled with a dark theme.
 */
const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type,
  name,
  value,
  onChange,
  onBlur,
  required = false,
  autoComplete,
  disabled,
  icon,
}) => {
  const hasIcon = icon != null;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-zinc-400 mb-1">
        {label}
      </label>
      <div className="relative">
        {hasIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`w-full py-2 text-white bg-zinc-800 border-b-2 border-zinc-700 focus:border-blue-500 focus:ring-blue-500 focus:ring-opacity-50 rounded-t-md shadow-sm focus:outline-none sm:text-sm transition-all duration-300 ${
            hasIcon ? "pl-10 pr-3" : "px-3"
          }`}
        />
      </div>
    </div>
  );
};

export default FormField;
