/**
 * API에서 받아오는 기사(Article) 데이터 구조 정의
 */
export interface Article {
  id: number; // 기사 고유 ID
  source: string; // 언론사 이름
  source_domain: string; // 언론사 도메인
  title: string; // 기사 제목
  url: string; // 기사 원본 URL
  published_at: string; // 기사 발행 시간 (ISO 8601 형식 문자열)
  thumbnail_url: string; // 썸네일 이미지 URL
  favicon_url: string; // 언론사 파비콘 URL
}
