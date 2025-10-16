// src/components/auth/FormField.tsx

import React from "react";

interface FormFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; // onBlur 타입을 추가합니다. (선택적)
  required?: boolean;
  autoComplete?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  onBlur, // onBlur를 props로 받습니다.
  required = false,
  autoComplete,
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={onChange}
        onBlur={onBlur} // input 요소에 onBlur 이벤트를 연결합니다.
        className="w-full px-4 py-2 text-white bg-neutral-800 border-2 border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
      />
    </div>
  );
};

export default FormField;
