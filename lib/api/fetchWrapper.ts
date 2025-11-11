/**
 * @file fetchWrapper.ts
 * @description 백엔드 API 통신을 위한 중앙 집중식 fetch 유틸리티 함수를 정의합니다.
 * 이 파일은 모든 HTTP 요청을 감싸서 공통 헤더 추가, URL 조합, 인증 에러(401) 처리 등
 * 반복적인 작업을 표준화하고 자동화하는 역할을 합니다.
 */

import { BACKEND_BASE_URL } from "@/lib/constants";

/**
 * @constant {string} SESSION_EXPIRED_EVENT
 * @description 세션 만료 시 발생하는 커스텀 이벤트의 이름입니다.
 * 401 Unauthorized 응답을 받으면 이 이벤트가 window 객체에서 발생하며,
 * AuthContext에서 이 이벤트를 수신하여 로그아웃 처리를 수행합니다.
 * 이를 통해 API 호출이 일어나는 모든 위치에서 개별적으로 401 에러를 처리할 필요가 없어집니다.
 */
const SESSION_EXPIRED_EVENT = 'sessionExpired';

/**
 * @function fetchWrapper
 * @description 백엔드 API 서버에 HTTP 요청을 보내기 위한 통합 fetch 래퍼 함수입니다.
 * @param {string} url - 요청할 API의 엔드포인트 경로 (예: '/api/articles').
 * @param {RequestInit & { skipAuthCheckFor401?: boolean }} [options={}] - fetch 함수에 전달될 옵션 객체.
 *   - `skipAuthCheckFor401`: true일 경우, 401 에러가 발생해도 세션 만료 이벤트를 발생시키지 않고,
 *     호출한 쪽에서 직접 에러를 처리하도록 응답을 그대로 반환합니다. (주로 로그인 페이지에서 사용)
 * @returns {Promise<Response>} - fetch API의 Response 객체를 반환하는 프로미스.
 * @throws {Error} - 네트워크 오류가 발생하거나 401 에러(세션 만료)가 발생했을 때 에러를 throw합니다.
 * 
 * @example
 * // GET 요청
 * const response = await fetchWrapper('/api/users/1');
 * 
 * // POST 요청
 * const response = await fetchWrapper('/api/users', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'John Doe' }),
 * });
 * 
 * // 로그인 요청 (401 에러를 직접 처리)
 * const response = await fetchWrapper('/api/auth/login', {
 *   method: 'POST',
 *   body: JSON.stringify({ email, password }),
 *   skipAuthCheckFor401: true,
 * });
 */
export async function fetchWrapper(url: string, options: RequestInit & { skipAuthCheckFor401?: boolean } = {}): Promise<Response> {
  // 1. 기본 헤더 설정: 모든 요청에 기본적으로 포함될 헤더를 정의합니다.
  const defaultHeaders: HeadersInit = {
    'Accept': 'application/json',       // 서버로부터 JSON 형식의 응답을 기대함
    'Content-Type': 'application/json', // 서버로 보내는 데이터 형식을 JSON으로 지정
    ...options.headers,                 // 호출 시점에 전달된 커스텀 헤더를 덮어쓰거나 추가
  };

  // 2. 요청 URL 조합: 상대 경로와 절대 경로를 모두 처리합니다.
  // URL이 'http'로 시작하면 절대 경로로 간주하고, 그렇지 않으면 BACKEND_BASE_URL을 앞에 붙여 전체 URL을 생성합니다.
  const fullUrl = url.startsWith('http') ? url : `${BACKEND_BASE_URL}${url}`;

  // 3. fetch 요청 실행 및 예외 처리
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: defaultHeaders,
    });

    // 4. 401 Unauthorized 에러(인증 실패/세션 만료) 중앙 처리
    if (response.status === 401) {
      // `skipAuthCheckFor401` 옵션이 true이면, 세션 만료 처리를 건너뛰고 응답을 그대로 반환합니다.
      // 이는 로그인 API처럼 401이 '잘못된 자격 증명'을 의미하여 특별한 처리가 필요한 경우에 사용됩니다.
      if (options.skipAuthCheckFor401) {
        return response;
      }

      // 세션 만료 커스텀 이벤트를 발생시켜 AuthContext가 전역적으로 로그아웃을 처리하도록 합니다.
      console.log("Fetch wrapper: 401 Unauthorized. Dispatching sessionExpired event.");
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
      
      // 에러를 throw하여 개별 API 호출의 .then() 또는 .catch() 블록에서 추가적인 로직이 실행되는 것을 방지합니다.
      // 이 에러는 API를 호출한 최상위 컴포넌트의 try-catch 블록에서 잡을 수 있습니다.
      throw new Error('Session expired');
    }

    // 5. 성공적인 응답 반환
    return response;
  } catch (error) {
    // 네트워크 문제나 위에서 throw한 에러 등 모든 종류의 에러를 콘솔에 기록합니다.
    console.error("FetchWrapper Error:", error);
    console.error("Failed to fetch:", { fullUrl, options }); // 디버깅을 위해 요청 정보도 함께 출력
    throw error; // 에러를 다시 throw하여, 이 함수를 호출한 곳에서 에러를 인지하고 처리할 수 있도록 합니다.
  }
}

/**
 * @function addSessionExpiredListener
 * @description 'sessionExpired' 커스텀 이벤트에 대한 리스너를 등록하는 헬퍼 함수입니다.
 * AuthContext에서 이 함수를 사용하여 세션 만료 시 수행할 콜백(예: 로그아웃)을 등록합니다.
 * @param {() => void} callback - 세션 만료 이벤트가 발생했을 때 실행될 콜백 함수.
 * @returns {() => void} - 등록된 이벤트 리스너를 제거하는 클린업(cleanup) 함수.
 *                         React의 useEffect 훅에서 반환값으로 사용하여 컴포넌트 언마운트 시 자동으로 리스너를 제거할 수 있습니다.
 * 
 * @example
 * // AuthContext.tsx 내에서 사용
 * useEffect(() => {
 *   const cleanup = addSessionExpiredListener(() => {
 *     // 로그아웃 처리 로직
 *     logout();
 *   });
 * 
 *   return cleanup; // 컴포넌트가 사라질 때 리스너 자동 제거
 * }, []);
 */
export function addSessionExpiredListener(callback: () => void) {
  // 이벤트 발생 시 실행될 핸들러 함수
  const handleSessionExpired = () => {
    console.log("Event listener: sessionExpired event received.");
    callback();
  };

  // window 객체에 이벤트 리스너 추가
  window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  
  // 클린업 함수를 반환하여 리스너를 제거할 수 있도록 함
  return () => {
    window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  };
}
