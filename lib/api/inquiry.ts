import { fetchWrapper } from "./fetchWrapper";
import { BACKEND_BASE_URL } from "../constants";
import { Inquiry as InquiryType } from "@/lib/types/inquiry";

/**
 * Fetches a presigned URL from the backend for file uploads.
 */
export const getPresignedUrl = async (
  token: string,
  filename: string,
  contentType: string
): Promise<{ url: string; filePath: string }> => {
  const response = await fetchWrapper(`/api/inquiry/presigned-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ filename, contentType }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '파일 업로드 URL을 받아오는데 실패했습니다.' }));
    throw new Error(errorData.message || '파일 업로드 URL을 받아오는데 실패했습니다.');
  }

  return response.json();
};

/**
 * Uploads a file to a presigned S3 URL.
 * Note: This does not use fetchWrapper as it's not hitting our backend.
 */
export const uploadFileToS3 = async (url: string, file: File): Promise<Response> => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error('파일 업로드에 실패했습니다. (S3)');
  }

  return response;
};

/**
 * Submits a new inquiry to the backend.
 */
export const submitInquiry = async (
  token: string,
  subject: string,
  content: string,
  privacy_agreement: boolean,
  filePath: string | null = null
) => {
  const response = await fetchWrapper(`/api/inquiry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      subject,
      content,
      privacy_agreement,
      file_path: filePath,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '문의 제출에 실패했습니다.' }));
    throw new Error(errorData.message || '문의 제출에 실패했습니다.');
  }

  return response.json();
};

export interface InquiryReply {
  id: number;
  content: string;
  created_at: string;
}

export const getInquiries = async (token:string, page: number, limit: number): Promise<{inquiries: InquiryType[], total: number}> => {
  const response = await fetchWrapper(`/api/inquiry?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '문의 내역을 불러오는데 실패했습니다.' }));
    throw new Error(errorData.message || '문의 내역을 불러오는데 실패했습니다.');
  }

  return response.json();
};

export const getInquiryDetail = async (token: string, inquiryId: number): Promise<InquiryType> => {
  const response = await fetchWrapper(`/api/inquiry/${inquiryId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '문의 상세 정보를 불러오는데 실패했습니다.' }));
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
