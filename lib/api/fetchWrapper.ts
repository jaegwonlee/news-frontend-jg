import { BACKEND_BASE_URL } from "@/lib/constants";

// 1. 세션 만료 커스텀 이벤트 정의
const SESSION_EXPIRED_EVENT = 'sessionExpired';

// 2. API 호출을 위한 통합 fetch 래퍼 함수
export async function fetchWrapper(url: string, options: RequestInit & { skipAuthCheckFor401?: boolean } = {}): Promise<Response> {
  // 기본 헤더 설정
  const defaultHeaders: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 요청 URL 조합
  const fullUrl = url.startsWith('http') ? url : `${BACKEND_BASE_URL}${url}`;

  // fetch 요청
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: defaultHeaders,
    });
    // 401 Unauthorized 에러 처리
    if (response.status === 401) {
      // skipAuthCheckFor401 옵션이 true이면 세션 만료 처리를 건너뛰고 응답을 반환
      if (options.skipAuthCheckFor401) {
        return response; // 호출자(loginUser)가 401을 직접 처리하도록 함
      }

      // 커스텀 이벤트를 발생시켜 AuthContext가 처리하도록 함
      console.log("Fetch wrapper: 401 Unauthorized. Dispatching sessionExpired event.");
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
      
      // 에러를 throw하여 개별 API 호출의 .catch() 블록에서 추가 처리를 막음
      // 여기서 throw된 에러는 최종적으로 호출한 컴포넌트의 catch 블록으로 전파될 수 있음
      throw new Error('Session expired');
    }

    return response;
  } catch (error) {
    console.error("FetchWrapper Error:", error);
    console.error("Failed to fetch:", { fullUrl, options });
    throw error; // Re-throw the error so the calling function can handle it
  }
}

// 3. 이벤트 리스너를 등록하는 헬퍼 함수 (AuthContext에서 사용)
export function addSessionExpiredListener(callback: () => void) {
  const handleSessionExpired = () => {
    console.log("Event listener: sessionExpired event received.");
    callback();
  };
  window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  
  // 클린업 함수 반환
  return () => {
    window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  };
}