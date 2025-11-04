import { fetchWrapper } from "./fetchWrapper";

export async function signUpUser(userData: any) {
  const response = await fetchWrapper(`/api/auth/signup`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '회원가입에 실패했습니다.');
  }

  return data;
}

export async function loginUser(credentials: any) {
  const response = await fetchWrapper(`/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(credentials),
    skipAuthCheckFor401: true, // 401 에러 시 fetchWrapper의 세션 만료 처리를 건너뛰도록 설정
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      // 응답이 JSON 형태가 아닐 수도 있으므로 파싱 에러를 방지
      errorData = await response.json();
    } catch (e) {
      console.error("Error parsing login error response:", e);
    }

    if (response.status === 401) {
      // 로그인 시 401은 이메일 또는 비밀번호 불일치로 간주
      throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
    // 그 외의 에러는 백엔드 메시지를 사용하거나 일반적인 로그인 실패 메시지
    throw new Error(errorData.message || '로그인에 실패했습니다.');
  }

  // 응답이 OK일 경우에만 데이터 파싱
  const data = await response.json();
  return data;
}