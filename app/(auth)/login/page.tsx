"use client";

// 'news' 프로젝트의 경로로 수정
import AuthLayout from "@/app/components/auth/AuthLayout";
import FormField from "@/app/components/auth/FormField"; 

// --- 아래 로직은 'news' 프로젝트에 맞게 수정이 필요합니다. ---
import { useAuth } from "@/app/context/AuthContext"; // 'news' 프로젝트에 AuthContext가 없다면 이 부분 수정 필요
import { loginUser } from "@/lib/api"; // 'news' 프로젝트의 lib/api.ts에 loginUser 함수 추가 필요
// --- ---

import { useRouter } from "next/navigation";
import { useState } from "react";

// 유효성 검사 규칙
const VALIDATION_RULES: Record<string, { validate: (value: string) => boolean; message: string }> = {
  email: {
    validate: (value) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value),
    message: "이메일 형식이 틀립니다.",
  },
  password: {
    validate: (value) => value.length > 0,
    message: "다시 입력해주세요.",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formState, setFormState] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    // Clear the error for the field being typed in
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocusedField(e.target.name);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFocusedField(null); // Clear focused field on blur

    const rule = VALIDATION_RULES[name];
    if (rule) {
      const isValid = rule.validate(value);
      if (!isValid) {
        setErrors((prev) => ({ ...prev, [name]: rule.message }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Final validation on all fields
    const newErrors: Record<string, string> = {};
    let formIsValid = true;
    for (const key in formState) {
      const fieldName = key as keyof typeof formState;
      const rule = VALIDATION_RULES[fieldName];
      if (rule) {
        const isValid = rule.validate(formState[fieldName]);
        if (!isValid) {
          newErrors[fieldName] = rule.message;
          formIsValid = false;
        }
      }
    }
    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (!formIsValid) {
      return;
    }

    setIsLoading(true);

    try {
      const data = await loginUser(formState); 
      if (data.token && data.user) {
        login(data.token, data.user);
        router.push("/");
      } else {
        throw new Error("로그인에 성공했지만 필수 정보(토큰 또는 사용자 정보)를 받지 못했습니다.");
      }
    } catch (err: unknown) {
      let errorMessage = "알 수 없는 에러가 발생했습니다.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setServerError(errorMessage);
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 'gloves' variant를 사용하여 애니메이션 적용
    <AuthLayout title="LOGIN" variant="gloves">
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div>
          <FormField
            id="email"
            label="이메일"
            type="email"
            name="email"
            value={formState.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            autoComplete="email"
            required
          />
          {errors.email && (focusedField === "email" || (touched.email && formState.email.length > 0)) && <p className="text-red-400 text-[10px] mt-1">{errors.email}</p>}
        </div>
        <div>
          <FormField
            id="password"
            label="비밀번호"
            type="password"
            name="password"
            value={formState.password}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            autoComplete="current-password"
            required
          />
          {errors.password && (focusedField === "password" || (touched.password && formState.password.length > 0)) && <p className="text-red-400 text-[10px] mt-1">{errors.password}</p>}
        </div>

        {serverError && (
          <div className="text-red-400 text-sm text-center p-2 bg-red-900/50 rounded-md">{serverError}</div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-neutral-600 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 transform hover:scale-105"
          >
            {isLoading ? "로그인 중..." : "입장하기"}
          </button>
        </div>
        <div className="text-center text-sm text-neutral-400">
          계정이 없으신가요?{" "}
          <a href="/register" className="font-medium text-red-500 hover:underline">
            회원가입
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}