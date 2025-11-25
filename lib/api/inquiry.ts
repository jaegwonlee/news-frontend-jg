import { fetchWrapper } from "./fetchWrapper";
import { BACKEND_BASE_URL } from "../constants";
import { mockInquiries, MockInquiry, MockInquiryReply } from "@/app/mocks/inquiry"; // Assuming you update Inquiry types to match mock
import { Inquiry as InquiryType } from "@/types"; // Use an alias to avoid conflict if mockInquiry also defines Inquiry

const USE_MOCKS = true; // Set to true to use mock data

// Extend Inquiry interface to include reply types for clarity in mock
export interface Inquiry extends InquiryType {
  replies?: MockInquiryReply[];
}


export const submitInquiry = async (
  token: string,
  subject: string,
  content: string,
  privacy_agreement: boolean,
  attachment: File | null = null
) => {
  if (USE_MOCKS) {
    console.log("Mock: Submitting inquiry");
    const newInquiry: MockInquiry = {
      id: Math.max(...mockInquiries.map(i => i.id)) + 1,
      user_id: 123, // Dummy user_id
      subject: subject, // Changed from title
      content: content,
      status: 'SUBMITTED', // Changed from PENDING
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      replies: []
    };
    mockInquiries.push(newInquiry); // Simulate adding inquiry
    return Promise.resolve({ message: "문의가 성공적으로 제출되었습니다. (목업)", inquiryId: newInquiry.id });
  }

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

// Re-using InquiryType from @/types but extending with mock-specific replies
export const getInquiries = async (token: string): Promise<Inquiry[]> => {
  if (USE_MOCKS) {
    console.log("Mock: Fetching inquiries");
    // Map mockInquiries to InquiryType for consistency
    return Promise.resolve(mockInquiries.map(inq => ({
      id: inq.id,
      subject: inq.subject, // Changed from title
      content: inq.content,
      user_id: inq.user_id, // Added user_id
      status: inq.status, // Simplified status mapping
      created_at: inq.created_at,
      updated_at: inq.updated_at,
      file_path: undefined,
      file_originalname: undefined,
      reply: inq.replies && inq.replies.length > 0 ? {
        content: inq.replies[0].content,
        created_at: inq.replies[0].created_at,
      } : undefined
    })));
  }

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
  if (USE_MOCKS) {
    console.log(`Mock: Fetching inquiry detail for ${inquiryId}`);
    const inquiry = mockInquiries.find(i => i.id === inquiryId);
    if (inquiry) {
        return Promise.resolve({
          id: inquiry.id,
          subject: inquiry.subject, // Changed from title
          content: inquiry.content,
          user_id: inquiry.user_id, // Added user_id
          status: inquiry.status, // Simplified status mapping
          created_at: inquiry.created_at,
          updated_at: inquiry.updated_at,
          file_path: undefined,
          file_originalname: undefined,
          reply: inquiry.replies && inquiry.replies.length > 0 ? {
            content: inquiry.replies[0].content,
            created_at: inquiry.replies[0].created_at,
          } : undefined
        });
    }
    return Promise.reject(new Error("Mock: Inquiry not found"));
  }

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
  if (USE_MOCKS) {
    console.log(`Mock: Downloading attachment from ${filePath}`);
    // Return a mock Blob. This might not be a real file, but fulfills the Promise.
    const mockBlob = new Blob(["Mock file content for " + filePath], { type: "text/plain" });
    return Promise.resolve(mockBlob);
  }
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
