/**
 * API에서 받아오는 문의(Inquiry) 데이터 구조 정의
 */
export interface Inquiry {
  id: number;
  subject: string;
  content: string;
  status: "SUBMITTED" | "ANSWERED" | "CLOSED";
  created_at: string;
  updated_at: string;
  user_id: number;
  file_path?: string;
  file_originalname?: string;
  reply?: InquiryReply;
}

/**
 * 문의 답변 데이터 구조 정의
 */
export interface InquiryReply {
  id: number;
  content: string;
  created_at: string;
}

/**
 * 페이지네이션된 문의 목록 데이터 구조
 */
export interface PaginatedInquiries {
  inquiries: Inquiry[];
  total: number;
}
