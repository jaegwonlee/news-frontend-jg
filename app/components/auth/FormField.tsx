// src/components/auth/FormField.tsx
import React from "react";

interface FormFieldProps {
  id: string;
  label: string;
  type: string;
  name: string; // name 속성 추가
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean; // disabled 속성 추가
}

/**
 * 회원가입/로그인 폼에서 사용되는 입력 필드 컴포넌트
 * - label과 input 요소를 포함합니다.
 * - 다크 테마 스타일이 적용되어 있습니다.
 */
const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type,
  name, // name 속성 추가
  value,
  onChange,
  onBlur,
  required = false,
  autoComplete,
  disabled, // disabled 속성 추가
}) => {
  return (
    <div>
      {/* 입력 필드 라벨 */}
      <label htmlFor={id} className="block text-sm font-medium text-zinc-400 mb-1">
        {label}
      </label>
      {/* 입력 필드 */}
      <input
        id={id}
        name={name} // name 속성 사용
        type={type}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={onChange}
        onBlur={onBlur} // 유효성 검사를 위해 onBlur 이벤트 핸들러 추가
        disabled={disabled} // disabled 속성 적용
        // Tailwind CSS 클래스를 이용한 스타일링
        className="w-full px-3 py-2 text-white bg-zinc-900 border border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-300"
      />
    </div>
  );
};

export default FormField;
