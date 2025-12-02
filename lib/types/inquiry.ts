/**
 * API에서 받아오는 문의(Inquiry) 데이터 구조 정의
 */
export interface Inquiry {
  id: number;
  subject: string;
  content: string;
  status: "SUBMITTED" | "ANSWERED" | "CLOSED"; // 예시 상태
  created_at: string;
  updated_at: string;
  user_id: number;
  file_path?: string; // 문의 관련 파일 경로 (옵션)
  file_originalname?: string; // 첨부 파일의 원본 이름 (옵션)
  reply?: InquiryReply; // 문의 답변 객체 (옵션)
}

/**
 * 문의 답변 데이터 구조 정의
 */
export interface InquiryReply {
  content: string;
  created_at: string;
}
