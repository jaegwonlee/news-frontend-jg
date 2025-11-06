import { fetchWrapper } from "./fetchWrapper";
import { BACKEND_BASE_URL } from "../constants";

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

export const downloadInquiryAttachment = async (
  token: string,
  filePath: string
): Promise<Blob> => {
  const fullUrl = `${BACKEND_BASE_URL}/api/inquiry/download?path=${encodeURIComponent(filePath)}`;
  
  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`,
  };

  const res = await fetch(fullUrl, {
    method: 'GET',
    headers: headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new Event('sessionExpired'));
    }
    throw new Error('파일 다운로드에 실패했습니다.');
  }

  return res.blob();
};
