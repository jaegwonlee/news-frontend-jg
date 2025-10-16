"use client";

import FormField from "@/components/auth/FormField";
import RingLayout from "@/components/auth/RingLayout";
import { useRouter } from "next/navigation";
import { useState } from "react";

// 각 입력 필드의 유효성 검사 규칙을 정의합니다.
const VALIDATION_RULES: Record<string, { validate: (value: string, password?: string) => boolean; message: string }> = {
  name: {
    validate: (value) => value.trim().length >= 2 && /^[a-zA-Z가-힣]+$/.test(value),
    message: "이름은 2자 이상, 한글 또는 영문만 가능합니다.",
  },
  nickname: {
    validate: (value) => value.length >= 3 && value.length <= 10 && !/[^a-zA-Z0-9가-힣]/.test(value),
    message: "닉네임은 3~10자, 특수문자 없이 입력해주세요.",
  },
  email: {
    validate: (value) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value),
    message: "올바른 이메일 형식을 입력해주세요.",
  },
  password: {
    validate: (value) => /^(?=.*[a-zA-Z])(?=.*[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])(?=.{8,20}$).*$/.test(value),
    message: "영문/숫자/특수문자 조합해주세요. (10~26자)",
  },
  passwordConfirm: {
    validate: (value, password) => value === password && value.length > 0,
    message: "비밀번호가 일치하지 않습니다.",
  },
  phone: {
    validate: (value) => /^\d{10,11}$/.test(value),
    message: "휴대폰 번호는 숫자만 입력해주세요.",
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const [formState, setFormState] = useState({
    name: "",
    nickname: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 입력 값이 변경될 때 상태를 업데이트하는 함수
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    // 입력이 시작되면 에러 메시지를 지웁니다.
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // 입력 필드에서 포커스가 벗어날 때 유효성 검사를 실행하는 함수
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const rule = VALIDATION_RULES[name];
    if (rule) {
      const isValid = rule.validate(value, formState.password);
      if (!isValid) {
        setErrors((prev) => ({ ...prev, [name]: rule.message }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // 모든 필드에 대한 최종 유효성 검사
    const newErrors: Record<string, string> = {};
    let formIsValid = true;
    for (const key in formState) {
      const fieldName = key as keyof typeof formState;
      const rule = VALIDATION_RULES[fieldName];
      if (rule) {
        const isValid = rule.validate(formState[fieldName], formState.password);
        if (!isValid) {
          newErrors[fieldName] = rule.message;
          formIsValid = false;
        }
      }
    }
    setErrors(newErrors);
    setTouched({
      name: true,
      nickname: true,
      email: true,
      password: true,
      passwordConfirm: true,
      phone: true,
    });

    if (!formIsValid) {
      return;
    }

    setIsLoading(true);

    // ... (기존 백엔드 연동 로직)

    // 임시 성공 처리 (백엔드 연동 전 테스트용)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
    router.push("/login");

    setIsLoading(false);
  };

  return (
    <RingLayout title="회원가입">
      <form className="space-y-3" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormField
              id="name"
              label="이름"
              type="text"
              value={formState.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            />
            {touched.name && errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <FormField
              id="nickname"
              label="닉네임"
              type="text"
              value={formState.nickname}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            />
            {touched.nickname && errors.nickname && <p className="text-red-400 text-xs mt-1">{errors.nickname}</p>}
          </div>
        </div>
        <div>
          <FormField
            id="email"
            label="이메일 (ID)"
            type="email"
            value={formState.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            autoComplete="email"
            required
          />
          {touched.email && errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <FormField
            id="password"
            label="비밀번호"
            type="password"
            value={formState.password}
            onChange={handleInputChange}
            onBlur={handleBlur}
            autoComplete="new-password"
            required
          />
          {touched.password && errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
        </div>
        <div>
          <FormField
            id="passwordConfirm"
            label="비밀번호 확인"
            type="password"
            value={formState.passwordConfirm}
            onChange={handleInputChange}
            onBlur={handleBlur}
            autoComplete="new-password"
            required
          />
          {touched.passwordConfirm && errors.passwordConfirm && (
            <p className="text-red-400 text-xs mt-1">{errors.passwordConfirm}</p>
          )}
        </div>
        <div>
          <FormField
            id="phone"
            label="휴대폰 번호"
            type="tel"
            value={formState.phone}
            onChange={handleInputChange}
            onBlur={handleBlur}
            required
          />
          {touched.phone && errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>

        {serverError && (
          <div className="text-red-400 text-sm text-center p-2 bg-red-900/50 rounded-md">{serverError}</div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 px-4 py-3 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-neutral-600 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-red-500/50 transition-all duration-300 transform hover:scale-105"
          >
            {isLoading ? "가입하는 중..." : "가입하기"}
          </button>
        </div>
        <div className="text-center text-sm text-neutral-400 pt-2">
          이미 계정이 있으신가요?{" "}
          <a href="/login" className="font-medium text-red-500 hover:underline">
            로그인
          </a>
        </div>
      </form>
    </RingLayout>
  );
}
