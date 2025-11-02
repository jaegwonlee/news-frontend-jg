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