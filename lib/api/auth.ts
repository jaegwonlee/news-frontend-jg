
import { BACKEND_BASE_URL } from "@/lib/constants";

export async function signUpUser(userData: any) {
  const response = await fetch(`${BACKEND_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '회원가입에 실패했습니다.');
  }

  return data;
}

export async function loginUser(credentials: any) {
  const response = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
    throw new Error(data.message || '로그인에 실패했습니다.');
  }

  return data;
}
