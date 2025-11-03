import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://news02.onrender.com';

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
  formData.append('privacy_agreement', String(privacy_agreement)); // API expects string "true" or "false"

  if (attachment) {
    formData.append('attachment', attachment);
  }

  const response = await axios.post(`${API_BASE_URL}/api/inquiry`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export interface InquiryReply {
  id: number;
  content: string;
  created_at: string;
}

export interface Inquiry {
  id: number;
  subject: string;
  content?: string; // Optional, only in detail
  status: 'SUBMITTED' | 'ANSWERED' | 'CLOSED'; // Updated based on API
  created_at: string;
  updated_at?: string; // Optional
  file_path?: string; // Optional, only in detail
  file_originalname?: string; // Optional, only in detail
  reply?: InquiryReply; // Optional, only in detail
}

/**
 * 로그인한 사용자의 문의 내역 목록을 조회합니다.
 */
export const getInquiries = async (token: string): Promise<Inquiry[]> => {
  const response = await axios.get(`${API_BASE_URL}/api/inquiry`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * 특정 문의 내역의 상세 정보를 조회합니다.
 */
export const getInquiryDetail = async (token: string, inquiryId: number): Promise<Inquiry> => {
  const response = await axios.get(`${API_BASE_URL}/api/inquiry/${inquiryId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const { inquiry, reply } = response.data;
  return { ...inquiry, reply: reply || undefined }; // Combine inquiry and reply into a single Inquiry object
};