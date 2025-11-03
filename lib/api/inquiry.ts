import { fetchWrapper } from "./fetchWrapper";

export const submitInquiry = async (
  token: string,
  subject: string,
  content: string,
  privacy_agreement: boolean,
  attachment: File | null = null
) => {
  const formData = new FormData();
  formData.append('subject', subject);
  formData.append('content', content);
  formData.append('privacy_agreement', String(privacy_agreement));

  if (attachment) {
    formData.append('attachment', attachment);
  }

  const response = await fetchWrapper(`/api/inquiry`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // 'Content-Type': 'multipart/form-data' is set automatically by the browser for FormData
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '문의 제출에 실패했습니다.');
  }

  return response.json();
};

export interface InquiryReply {
  id: number;
  content: string;
  created_at: string;
}

export interface Inquiry {
  id: number;
  subject: string;
  content?: string;
  status: 'SUBMITTED' | 'ANSWERED' | 'CLOSED';
  created_at: string;
  updated_at?: string;
  file_path?: string;
  file_originalname?: string;
  reply?: InquiryReply;
}

/**
 * 로그인한 사용자의 문의 내역 목록을 조회합니다.
 */
export const getInquiries = async (token: string): Promise<Inquiry[]> => {
  const response = await fetchWrapper(`/api/inquiry`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '문의 내역을 불러오는데 실패했습니다.');
  }

  return response.json();
};

/**
 * 특정 문의 내역의 상세 정보를 조회합니다.
 */
export const getInquiryDetail = async (token: string, inquiryId: number): Promise<Inquiry> => {
  const response = await fetchWrapper(`/api/inquiry/${inquiryId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '문의 상세 정보를 불러오는데 실패했습니다.');
  }

  const { inquiry, reply } = await response.json();
  return { ...inquiry, reply: reply || undefined };
};