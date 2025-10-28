/**
 * 언론사 도메인별 파비콘 URL 매핑 객체
 * - 키(key): 언론사 도메인 (예: "khan.co.kr")
 * - 값(value): 해당 언론사의 파비콘 이미지 URL
 */
export const FAVICON_URLS: { [key: string]: string } = {
  "khan.co.kr": "https://www.google.com/s2/favicons?domain=khan.co.kr",
  "hani.co.kr": "https://www.google.com/s2/favicons?domain=hani.co.kr",
  "ohmynews.com": "https://media.livere.org/uploads/8tjwRfX43js4Y6D5pyIs_ohmy.png",
  "chosun.com": "https://www.google.com/s2/favicons?domain=chosun.com",
  "joongang.co.kr": "https://www.google.com/s2/favicons?domain=joongang.co.kr", // 중앙일보 추가 (예시)
  "donga.com": "https://www.google.com/s2/favicons?domain=donga.com",
  // 필요에 따라 다른 언론사 도메인과 파비콘 URL을 추가합니다.
};

/**
 * 기본 또는 대체 파비콘 URL (선택 사항)
 * - FAVICON_URLS 매핑에 없는 도메인일 경우 사용할 수 있는 기본 아이콘 URL입니다.
 * - 여기서는 구글 기본 파비콘 서비스를 예시로 사용합니다.
 */
export const DEFAULT_FAVICON_URL = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}`;

export const BACKEND_BASE_URL = "https://news02.onrender.com";
